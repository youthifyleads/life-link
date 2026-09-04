import uuid
from datetime import datetime, timezone

from app.core.domain import VALID_TRANSITIONS, NotificationTrigger, Role, RequestStatus
from app.core.exceptions import ForbiddenError, InvalidStatusTransitionError, NotFoundError
from app.repositories.interfaces.request_repository import RequestRepository
from app.repositories.models import BloodRequestRecord, UserRecord
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
    ):
        self._request_repo = request_repo
        self._qr_service = qr_service
        self._notification_service = notification_service
        self._audit_service = audit_service

    async def create_request(self, payload: BloodRequestCreate, current_user: UserRecord) -> BloodRequestRecord:
        if current_user.role != Role.HOSPITAL_USER:
            raise ForbiddenError("Only hospital users can create blood requests", code="FORBIDDEN_ROLE")
        if not current_user.institution_id:
            raise ForbiddenError("User is not associated with a hospital", code="MISSING_INSTITUTION_SCOPE")

        record = BloodRequestRecord(
            id=f"req_{uuid.uuid4().hex[:12]}",
            hospital_id=current_user.institution_id,
            blood_type=payload.blood_type,
            component=payload.component,
            quantity_units=payload.quantity_units,
            urgency=payload.urgency,
            notes=payload.notes,
            status=RequestStatus.REQUESTED,
            tracking_reference=QRService.generate_reference(),
            created_by=current_user.id,
        )
        created = await self._request_repo.create(record)

        await self._audit_service.record(
            actor_user_id=current_user.id,
            action="REQUEST_CREATED",
            details=f"request {created.id} created by {current_user.id}",
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
        request.updated_at = datetime.now(timezone.utc)
        updated = await self._request_repo.update(request)

        await self._audit_service.record(
            actor_user_id=current_user.id,
            action="REQUEST_STATUS_CHANGED",
            details=f"request {request.id} -> {new_status.value}",
        )
        await self._notification_service.notify(
            user_id=updated.created_by if updated.created_by else current_user.id,
            trigger=NotificationTrigger.REQUEST_STATUS_CHANGED,
            message=f"Blood request {updated.id} status changed to {new_status.value}",
            related_request_id=updated.id,
        )
        return updated

    async def acknowledge(self, request_id: str, current_user: UserRecord) -> BloodRequestRecord:
        return await self._transition(
            request_id, RequestStatus.ACKNOWLEDGED, current_user, {Role.BLOOD_BANK_OPERATOR, Role.ADMIN}
        )

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
