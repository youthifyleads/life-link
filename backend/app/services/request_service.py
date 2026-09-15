import uuid
from datetime import datetime, timezone

from app.core.domain import (
    BLOOD_BAG_TRANSITIONS,
    VALID_TRANSITIONS,
    AuditAction,
    BloodBagStatus,
    NotificationTrigger,
    RequestStatus,
    Role,
)
from app.core.exceptions import ConflictError, ForbiddenError, InvalidStatusTransitionError, NotFoundError, ValidationAppError
from app.repositories.interfaces.request_repository import RequestRepository
from app.repositories.interfaces.status_history_repository import StatusHistoryRepository
from app.repositories.models import BloodBagHistoryRecord, BloodRequestRecord, RequestStatusHistoryRecord, UserRecord
from app.schemas.requests import BloodRequestCreate
from app.services.audit_service import AuditService
from app.services.notification_service import NotificationService
from app.services.qr_service import QRService


class RequestService:
    def __init__(
        self,
        request_repo: RequestRepository,
        qr_service: QRService,
        notification_service: NotificationService,
        audit_service: AuditService,
        status_history_repo: StatusHistoryRepository | None = None,
        blood_bag_repo=None,
    ):
        self._request_repo = request_repo
        self._qr_service = qr_service
        self._notification_service = notification_service
        self._audit_service = audit_service
        self._status_history_repo = status_history_repo
        self._blood_bag_repo = blood_bag_repo

    async def create_request(self, payload: BloodRequestCreate, current_user: UserRecord) -> BloodRequestRecord:
        if current_user.role != Role.HOSPITAL_USER:
            raise ForbiddenError("Only hospital users can create blood requests", code="FORBIDDEN_ROLE")
        if not current_user.institution_id:
            raise ForbiddenError("User is not associated with a hospital", code="MISSING_INSTITUTION_SCOPE")

        now = datetime.now(timezone.utc)
        if payload.required_by and payload.required_by <= now:
            raise ValidationAppError(
                "Field 'required_by' must be a future date/time, it cannot be in the past",
                code="INVALID_REQUIRED_BY",
            )

        record_id = str(uuid.uuid4())
        record = BloodRequestRecord(
            id=record_id,
            hospital_id=current_user.institution_id,
            blood_type=payload.blood_type,
            component=payload.component,
            quantity_units=payload.quantity_units,
            urgency=payload.urgency,
            notes=payload.reason or payload.notes,
            required_by=payload.required_by,
            status=RequestStatus.REQUESTED,
            tracking_reference=QRService.generate_reference(record_id),
            created_by=current_user.id,
        )
        created = await self._request_repo.create(record)
        if self._status_history_repo:
            await self._status_history_repo.create(RequestStatusHistoryRecord(
                id=str(uuid.uuid4()), blood_request_id=created.id,
                status=created.status, notes="Request created", changed_by_user_id=current_user.id,
            ))

        await self._audit_service.record(
            actor_user_id=current_user.id,
            action=AuditAction.REQUEST_CREATED,
            entity_type="blood_request",
            entity_id=created.id,
        )
        await self._notification_service.notify(
            user_id=current_user.id,
            trigger=NotificationTrigger.URGENT_REQUEST if payload.urgency else NotificationTrigger.REQUEST_CREATED,
            message=f"Blood request {created.id} ({created.blood_type}, {created.component}) was created",
            related_request_id=created.id,
        )
        return created

    async def get_request(self, request_id: str, current_user: UserRecord) -> BloodRequestRecord:
        request = await self._request_repo.get_by_id(request_id)
        if request is None:
            raise NotFoundError("Blood request was not found", code="REQUEST_NOT_FOUND")
        self._assert_can_view(request, current_user)
        return request

    async def list_requests(self, current_user: UserRecord) -> list[BloodRequestRecord]:
        if current_user.role == Role.HOSPITAL_USER:
            return await self._request_repo.list_all(hospital_id=current_user.institution_id)
        # Blood bank operators, admin, and platform support see all requests in the MVP.
        return await self._request_repo.list_all()

    def _assert_can_view(self, request: BloodRequestRecord, current_user: UserRecord) -> None:
        if current_user.role == Role.HOSPITAL_USER and current_user.institution_id != request.hospital_id:
            raise ForbiddenError("Not authorized to view this request", code="FORBIDDEN_REQUEST_ACCESS")

    async def _transition(
        self,
        request_id: str,
        new_status: RequestStatus,
        current_user: UserRecord,
        allowed_roles: set[Role],
        unit_price: float | None = None,
        notes: str | None = None,
    ) -> BloodRequestRecord:
        request = await self._request_repo.get_by_id(request_id)
        if request is None:
            raise NotFoundError("Blood request was not found", code="REQUEST_NOT_FOUND")

        if current_user.role not in allowed_roles:
            raise ForbiddenError(
                f"Role '{current_user.role.value}' cannot perform this transition", code="FORBIDDEN_TRANSITION"
            )
        self._assert_can_view(request, current_user)

        valid_next = VALID_TRANSITIONS.get(request.status, set())
        if new_status not in valid_next:
            raise InvalidStatusTransitionError(
                f"Cannot move request from '{request.status.value}' to '{new_status.value}'",
                code="INVALID_STATUS_TRANSITION",
            )

        request.status = new_status
        if unit_price is not None:
            request.unit_price = float(unit_price)
        if notes is not None:
            request.notes = notes
        request.updated_at = datetime.now(timezone.utc)
        updated = await self._request_repo.update(request)
        if self._status_history_repo:
            await self._status_history_repo.create(RequestStatusHistoryRecord(
                id=str(uuid.uuid4()), blood_request_id=updated.id,
                status=new_status, notes=notes, changed_by_user_id=current_user.id,
            ))

        await self._audit_service.record(
            actor_user_id=current_user.id,
            action=AuditAction.REQUEST_STATUS_CHANGED,
            entity_type="blood_request",
            entity_id=request.id,
        )
        await self._notification_service.notify(
            user_id=updated.created_by if updated.created_by else current_user.id,
            trigger=NotificationTrigger.REQUEST_STATUS_CHANGED,
            message=f"Blood request {updated.id} status changed to {new_status.value}",
            related_request_id=updated.id,
        )
        return updated

    async def acknowledge(
        self,
        request_id: str,
        current_user: UserRecord,
        unit_price: float | None = None,
        notes: str | None = None,
    ) -> BloodRequestRecord:
        return await self._transition(
            request_id,
            RequestStatus.ACKNOWLEDGED,
            current_user,
            {Role.BLOOD_BANK_OPERATOR, Role.ADMIN},
            unit_price=unit_price,
            notes=notes,
        )

    async def set_price(
        self,
        request_id: str,
        unit_price: float,
        current_user: UserRecord,
    ) -> BloodRequestRecord:
        request = await self._request_repo.get_by_id(request_id)
        if request is None:
            raise NotFoundError("Blood request was not found", code="REQUEST_NOT_FOUND")

        if current_user.role not in {Role.BLOOD_BANK_OPERATOR, Role.ADMIN}:
            raise ForbiddenError("Only blood bank operators or admins can set request pricing", code="FORBIDDEN")

        self._assert_can_view(request, current_user)

        if request.status in {RequestStatus.COMPLETED, RequestStatus.CANCELLED}:
            raise InvalidStatusTransitionError(
                f"Cannot update price for a request in '{request.status.value}' state",
                code="INVALID_STATE_FOR_PRICING",
            )

        request.unit_price = float(unit_price)
        request.updated_at = datetime.now(timezone.utc)
        updated = await self._request_repo.update(request)

        await self._audit_service.record(
            actor_user_id=current_user.id,
            action=AuditAction.REQUEST_STATUS_CHANGED,
            entity_type="blood_request",
            entity_id=request.id,
        )
        return updated

    async def confirm(self, request_id: str, current_user: UserRecord) -> BloodRequestRecord:
        return await self._transition(
            request_id, RequestStatus.CONFIRMED, current_user, {Role.BLOOD_BANK_OPERATOR, Role.ADMIN}
        )

    async def prepare(self, request_id: str, current_user: UserRecord) -> BloodRequestRecord:
        return await self._transition(
            request_id, RequestStatus.PREPARED, current_user, {Role.BLOOD_BANK_OPERATOR, Role.ADMIN}
        )

    async def complete(self, request_id: str, current_user: UserRecord) -> BloodRequestRecord:
        return await self._transition(
            request_id, RequestStatus.COMPLETED, current_user, {Role.BLOOD_BANK_OPERATOR, Role.ADMIN}
        )

    async def cancel(self, request_id: str, current_user: UserRecord) -> BloodRequestRecord:
        return await self._transition(
            request_id,
            RequestStatus.CANCELLED,
            current_user,
            {Role.HOSPITAL_USER, Role.BLOOD_BANK_OPERATOR, Role.ADMIN},
        )

    async def list_allocated_bags(self, request_id: str, current_user: UserRecord):
        request = await self._request_repo.get_by_id(request_id)
        if request is None:
            raise NotFoundError("Blood request was not found", code="REQUEST_NOT_FOUND")
        self._assert_can_view(request, current_user)
        if not self._blood_bag_repo:
            return []
        return await self._blood_bag_repo.list_by_request(request.id)

    async def allocate_bag(
        self, request_id: str, barcode: str, current_user: UserRecord
    ) -> dict:
        request = await self._request_repo.get_by_id(request_id)
        if request is None:
            raise NotFoundError("Blood request was not found", code="REQUEST_NOT_FOUND")

        if current_user.role not in {Role.BLOOD_BANK_OPERATOR, Role.ADMIN}:
            raise ForbiddenError(
                "Only blood bank operators or admins can allocate blood bags",
                code="FORBIDDEN",
            )
        self._assert_can_view(request, current_user)

        if not self._blood_bag_repo:
            raise ValidationAppError("Blood bag repository not configured", code="REPO_NOT_FOUND")

        code = (barcode or "").strip()
        if not code:
            raise ValidationAppError("Barcode is required", code="INVALID_BARCODE")

        bag = await self._blood_bag_repo.get_by_qr(code)
        if not bag:
            bag = await self._blood_bag_repo.get(code)
        if not bag:
            raise NotFoundError(f"Blood bag not found for barcode '{code}'", code="BLOOD_BAG_NOT_FOUND")

        # 1. Check blood bank ownership
        if current_user.role == Role.BLOOD_BANK_OPERATOR and current_user.institution_id:
            if bag.current_blood_bank_id and bag.current_blood_bank_id != current_user.institution_id:
                raise ForbiddenError("This blood bag does not belong to your blood bank", code="FORBIDDEN_BAG_ACCESS")

        # 2. Check availability
        if bag.status.lower() != "available":
            raise ConflictError(f"Blood bag is not available (current status: {bag.status})", code="BAG_NOT_AVAILABLE")

        # 3. Check expiration
        now = datetime.now(timezone.utc)
        if bag.expiry_date:
            exp = bag.expiry_date
            if isinstance(exp, str):
                from datetime import date
                exp = date.fromisoformat(exp)
            from datetime import date
            if isinstance(exp, date) and not isinstance(exp, datetime):
                exp = datetime.combine(exp, datetime.min.time(), tzinfo=timezone.utc)
            elif isinstance(exp, datetime) and exp.tzinfo is None:
                exp = exp.replace(tzinfo=timezone.utc)
            if exp <= now:
                raise ConflictError(f"Blood bag has expired on {bag.expiry_date}", code="BAG_EXPIRED")

        # 4. Check blood type and component match
        if bag.blood_type.strip().upper() != request.blood_type.strip().upper():
            raise ConflictError(
                f"Blood type mismatch: Request requires {request.blood_type}, but scanned bag is {bag.blood_type}",
                code="BLOOD_TYPE_MISMATCH",
            )

        bag_comp = getattr(bag, "component", "whole_blood") or "whole_blood"
        if request.component and bag_comp.lower() != request.component.lower():
            raise ConflictError(
                f"Component mismatch: Request requires {request.component}, but scanned bag is {bag_comp}",
                code="COMPONENT_MISMATCH",
            )

        # 5. Check if request quota is already fulfilled
        allocated_bags = await self._blood_bag_repo.list_by_request(request.id)
        if len(allocated_bags) >= request.quantity_units:
            raise ConflictError(
                f"Request quota already fulfilled ({len(allocated_bags)} of {request.quantity_units} bags allocated)",
                code="QUOTA_ALREADY_FULFILLED",
            )

        # Allocate bag
        bag.status = "allocated"
        bag.allocated_request_id = request.id
        await self._blood_bag_repo.update(bag)
        await self._blood_bag_repo.add_history(
            BloodBagHistoryRecord(
                id=str(uuid.uuid4()),
                blood_bag_id=bag.id,
                status="allocated",
                changed_at=now,
                changed_by_user_id=current_user.id,
                location=bag.current_location,
                notes=f"Allocated to request {request.id}",
            )
        )

        new_count = len(allocated_bags) + 1
        is_fulfilled = new_count >= request.quantity_units
        if is_fulfilled and request.status == RequestStatus.ACKNOWLEDGED:
            request.status = RequestStatus.CONFIRMED
            request.updated_at = now
            await self._request_repo.update(request)

        return {
            "message": "Blood bag allocated successfully",
            "request_id": request.id,
            "allocated_bag_id": bag.id,
            "blood_type": bag.blood_type,
            "component": bag_comp,
            "currently_allocated": new_count,
            "required_quantity": request.quantity_units,
            "is_fulfilled": is_fulfilled,
        }

    async def dispatch_request(
        self, request_id: str, current_user: UserRecord, notes: str | None = None
    ) -> BloodRequestRecord:
        request = await self._request_repo.get_by_id(request_id)
        if request is None:
            raise NotFoundError("Blood request was not found", code="REQUEST_NOT_FOUND")

        if current_user.role not in {Role.BLOOD_BANK_OPERATOR, Role.ADMIN}:
            raise ForbiddenError("Only blood bank operators or admins can dispatch requests", code="FORBIDDEN")
        self._assert_can_view(request, current_user)

        now = datetime.now(timezone.utc)
        if request.status in {RequestStatus.ACKNOWLEDGED, RequestStatus.CONFIRMED}:
            request.status = RequestStatus.PREPARED
            request.updated_at = now
            await self._request_repo.update(request)

        if self._blood_bag_repo:
            allocated_bags = await self._blood_bag_repo.list_by_request(request.id)
            for bag in allocated_bags:
                bag.status = "in_transit"
                await self._blood_bag_repo.update(bag)
                await self._blood_bag_repo.add_history(
                    BloodBagHistoryRecord(
                        id=str(uuid.uuid4()),
                        blood_bag_id=bag.id,
                        status="in_transit",
                        changed_at=now,
                        changed_by_user_id=current_user.id,
                        location=bag.current_location,
                        notes=notes or "Dispatched from blood bank to caregiver/transport",
                    )
                )

        if self._status_history_repo:
            await self._status_history_repo.create(
                RequestStatusHistoryRecord(
                    id=str(uuid.uuid4()),
                    blood_request_id=request.id,
                    status=request.status,
                    notes=notes or "Dispatched to caregiver",
                    changed_by_user_id=current_user.id,
                )
            )

        return request

    async def receive_request(
        self, request_id: str, current_user: UserRecord, notes: str | None = None
    ) -> BloodRequestRecord:
        request = await self._request_repo.get_by_id(request_id)
        if request is None:
            raise NotFoundError("Blood request was not found", code="REQUEST_NOT_FOUND")

        if current_user.role not in {Role.HOSPITAL_USER, Role.ADMIN}:
            raise ForbiddenError("Only hospital users or admins can confirm receiving requests", code="FORBIDDEN")
        self._assert_can_view(request, current_user)

        now = datetime.now(timezone.utc)
        request.status = RequestStatus.COMPLETED
        request.updated_at = now
        await self._request_repo.update(request)

        if self._blood_bag_repo:
            allocated_bags = await self._blood_bag_repo.list_by_request(request.id)
            for bag in allocated_bags:
                bag.status = "received"
                await self._blood_bag_repo.update(bag)
                await self._blood_bag_repo.add_history(
                    BloodBagHistoryRecord(
                        id=str(uuid.uuid4()),
                        blood_bag_id=bag.id,
                        status="received",
                        changed_at=now,
                        changed_by_user_id=current_user.id,
                        location=f"Hospital {request.hospital_id}",
                        notes=notes or "Received at hospital by staff",
                    )
                )

        if self._status_history_repo:
            await self._status_history_repo.create(
                RequestStatusHistoryRecord(
                    id=str(uuid.uuid4()),
                    blood_request_id=request.id,
                    status=RequestStatus.COMPLETED,
                    notes=notes or "Received at hospital",
                    changed_by_user_id=current_user.id,
                )
            )

        return request

    async def deallocate_bag(
        self,
        request_id: str,
        barcode: str,
        current_user: UserRecord,
        reason: str | None = None,
    ) -> dict[str, Any]:
        request = await self._request_repo.get_by_id(request_id)
        if request is None:
            raise NotFoundError("Blood request was not found", code="REQUEST_NOT_FOUND")

        if current_user.role not in {Role.BLOOD_BANK_OPERATOR, Role.ADMIN}:
            raise ForbiddenError("Only blood bank operators or admins can deallocate bags", code="FORBIDDEN")
        self._assert_can_view(request, current_user)

        if request.status in {RequestStatus.PREPARED, RequestStatus.COMPLETED, RequestStatus.CANCELLED}:
            raise ConflictError(
                f"Cannot deallocate bags from a request with status {request.status}",
                code="INVALID_REQUEST_STATE",
            )

        if not self._blood_bag_repo:
            raise ConflictError("Blood bag repository is not configured", code="NOT_SUPPORTED")

        code = (barcode or "").strip()
        bag = await self._blood_bag_repo.get_by_qr(code)
        if not bag:
            bag = await self._blood_bag_repo.get(code)
        if bag is None:
            raise NotFoundError(f"Blood bag with barcode '{barcode}' was not found", code="BAG_NOT_FOUND")

        if bag.allocated_request_id != request.id:
            raise ConflictError("Blood bag is not allocated to this request", code="BAG_NOT_ALLOCATED_TO_REQUEST")

        now = datetime.now(timezone.utc)
        bag.status = BloodBagStatus.QUARANTINE
        bag.allocated_request_id = None
        await self._blood_bag_repo.update(bag)

        await self._blood_bag_repo.add_history(
            BloodBagHistoryRecord(
                id=str(uuid.uuid4()),
                blood_bag_id=bag.id,
                status=BloodBagStatus.QUARANTINE,
                changed_at=now,
                changed_by_user_id=current_user.id,
                location=bag.current_location,
                notes=reason or f"Deallocated from request {request.id}. Moved to quarantine for safety inspection.",
            )
        )

        remaining_bags = await self._blood_bag_repo.list_by_request(request.id)
        new_count = len(remaining_bags)

        if request.status == RequestStatus.CONFIRMED and new_count < request.quantity_units:
            request.status = RequestStatus.ACKNOWLEDGED
            request.updated_at = now
            await self._request_repo.update(request)
            if self._status_history_repo:
                await self._status_history_repo.create(
                    RequestStatusHistoryRecord(
                        id=str(uuid.uuid4()),
                        blood_request_id=request.id,
                        status=RequestStatus.ACKNOWLEDGED,
                        notes=f"Bag {barcode} deallocated. Status reverted to acknowledged.",
                        changed_by_user_id=current_user.id,
                    )
                )

        return {
            "request_id": request.id,
            "deallocated_bag_id": bag.id,
            "barcode": bag.qr_code,
            "status": bag.status,
            "currently_allocated": new_count,
            "required_quantity": request.quantity_units,
            "is_fulfilled": new_count >= request.quantity_units,
        }

    async def cancel_request(
        self,
        request_id: str,
        current_user: UserRecord,
        reason: str | None = None,
    ) -> BloodRequestRecord:
        request = await self._request_repo.get_by_id(request_id)
        if request is None:
            raise NotFoundError("Blood request was not found", code="REQUEST_NOT_FOUND")

        if current_user.role not in {Role.HOSPITAL_USER, Role.BLOOD_BANK_OPERATOR, Role.ADMIN}:
            raise ForbiddenError("You are not authorized to cancel this request", code="FORBIDDEN")
        self._assert_can_view(request, current_user)

        if request.status in {RequestStatus.COMPLETED, RequestStatus.CANCELLED}:
            raise ConflictError(
                f"Cannot cancel a request that is already {request.status}",
                code="INVALID_STATUS_TRANSITION",
            )

        if request.status == RequestStatus.PREPARED:
            raise ConflictError(
                "Cannot cancel a request that has already been dispatched / in transit",
                code="REQUEST_IN_TRANSIT",
            )

        now = datetime.now(timezone.utc)
        request.status = RequestStatus.CANCELLED
        request.updated_at = now
        await self._request_repo.update(request)

        # Move any allocated bags to quarantine safety hold
        if self._blood_bag_repo:
            allocated_bags = await self._blood_bag_repo.list_by_request(request.id)
            for bag in allocated_bags:
                bag.status = BloodBagStatus.QUARANTINE
                bag.allocated_request_id = None
                await self._blood_bag_repo.update(bag)
                await self._blood_bag_repo.add_history(
                    BloodBagHistoryRecord(
                        id=str(uuid.uuid4()),
                        blood_bag_id=bag.id,
                        status=BloodBagStatus.QUARANTINE,
                        changed_at=now,
                        changed_by_user_id=current_user.id,
                        location=bag.current_location,
                        notes=f"Request {request.id} cancelled ({reason or 'No reason provided'}). Moved to quarantine for safety.",
                    )
                )

        if self._status_history_repo:
            await self._status_history_repo.create(
                RequestStatusHistoryRecord(
                    id=str(uuid.uuid4()),
                    blood_request_id=request.id,
                    status=RequestStatus.CANCELLED,
                    notes=reason or "Request cancelled",
                    changed_by_user_id=current_user.id,
                )
            )

        return request

    cancel = cancel_request


