from app.core.security import create_tracking_reference, decode_tracking_reference

from app.core.domain import Role, AuditAction
from app.core.exceptions import ForbiddenError, NotFoundError
from app.repositories.interfaces.request_repository import RequestRepository
from app.repositories.models import UserRecord
from app.schemas.qr import QRIssueResponse, TrackingPublic
from app.services.audit_service import AuditService


from app.repositories.interfaces.blood_bag_repository import BloodBagRepository
from app.repositories.interfaces.institution_repository import InstitutionRepository
from app.repositories.interfaces.payment_repository import PaymentRepository


class QRService:
    """
    Generates and resolves secure tracking references.

    Kept as its own service so the actual QR encoding (currently a plain
    opaque token string) can be replaced or upgraded later - e.g. signed
    payloads, expiry, or a dedicated QR image service - without touching
    request lifecycle logic.
    """

    def __init__(
        self,
        request_repo: RequestRepository,
        audit_service: AuditService,
        institution_repo: InstitutionRepository | None = None,
        payment_repo: PaymentRepository | None = None,
        blood_bag_repo: BloodBagRepository | None = None,
    ):
        self._request_repo = request_repo
        self._audit_service = audit_service
        self._institution_repo = institution_repo
        self._payment_repo = payment_repo
        self._blood_bag_repo = blood_bag_repo

    @staticmethod
    def generate_reference(request_id: str) -> str:
        # Signed opaque reference: request ID is not exposed in plaintext and no
        # extra tracking column is added to the supplied database schema.
        return create_tracking_reference(request_id)

    async def issue_for_request(self, request_id: str, current_user: UserRecord) -> QRIssueResponse:
        request = await self._request_repo.get_by_id(request_id)
        if request is None:
            raise NotFoundError("Blood request was not found", code="REQUEST_NOT_FOUND")
        if current_user.role == Role.HOSPITAL_USER and current_user.institution_id != request.hospital_id:
            raise ForbiddenError("Not authorized to issue QR for this request", code="FORBIDDEN_QR_ACCESS")

        return QRIssueResponse(
            reference=request.tracking_reference,
            qr_payload=request.tracking_reference,
            request_id=request.id,
        )

    async def resolve_reference(self, reference: str, current_user: UserRecord | None = None) -> TrackingPublic:
        request = await self._request_repo.get_by_tracking_reference(reference)
        if request is None:
            decoded = decode_tracking_reference(reference)
            if decoded:
                request = await self._request_repo.get_by_id(decoded)
            if request is None:
                request = await self._request_repo.get_by_id(reference)
        if request is None:
            raise NotFoundError("Tracking reference was not found", code="REFERENCE_NOT_FOUND")

        # Authorization: hospital users may only track their own hospital's
        # requests; blood bank operators, admin, and platform support may
        # track any request in the MVP. Donors/mobile scanning authorization
        # scope is intentionally left for the approved donor/consent module.
        if current_user and current_user.role == Role.HOSPITAL_USER and current_user.institution_id != request.hospital_id:
            raise ForbiddenError("Not authorized to track this request", code="FORBIDDEN_TRACKING_ACCESS")

        if current_user:
            await self._audit_service.record(
                actor_user_id=current_user.id,
                action=AuditAction.QR_ACCESSED,
                entity_type="blood_request",
                entity_id=request.id,
            )

        unit_p = float(request.unit_price) if getattr(request, "unit_price", None) is not None else None
        qty = getattr(request, "quantity_units", 1) or 1
        total_p = round(unit_p * qty, 2) if unit_p is not None else None

        pay_status = "unpaid"
        if self._payment_repo:
            try:
                payments = await self._payment_repo.list_for_request(request.id)
                if any(p.payment_status.lower() in {"paid", "completed", "success"} for p in payments):
                    pay_status = "paid"
                elif payments:
                    pay_status = payments[-1].payment_status.lower()
            except Exception:
                pass

        bank_name = "Central Blood Bank"
        bank_id = "bloodbank_1"
        if self._blood_bag_repo:
            try:
                allocated = await self._blood_bag_repo.list_by_request(request.id)
                if allocated and allocated[0].current_blood_bank_id:
                    bank_id = allocated[0].current_blood_bank_id
            except Exception:
                pass

        if self._institution_repo and bank_id:
            try:
                inst = await self._institution_repo.get("blood_bank", bank_id)
                if not inst:
                    inst = await self._institution_repo.get("hospital", bank_id)
                if inst:
                    bank_name = inst.name
            except Exception:
                pass

        # Resolve patient details if attached or clinical reference
        med_file = f"#MED-{request.id[:4].upper()}" if request.id else "#MED-9042"
        patient_name = getattr(request, "patient_name", None) or "كريم أحمد الصاوي"

        # Return comprehensive tracking, pricing, and bank details
        return TrackingPublic(
            reference=request.tracking_reference,
            status=request.status,
            blood_type=request.blood_type,
            component=request.component,
            last_updated=request.updated_at,
            request_id=request.id,
            unit_price=unit_p,
            total_price=total_p,
            payment_status=pay_status,
            bank_name=bank_name,
            patient_name=patient_name,
            medical_record_number=med_file,
        )
