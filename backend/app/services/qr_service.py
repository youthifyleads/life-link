from app.core.security import create_tracking_reference, decode_tracking_reference

from app.core.domain import Role
from app.core.exceptions import ForbiddenError, NotFoundError
from app.repositories.interfaces.request_repository import RequestRepository
from app.repositories.models import UserRecord
from app.schemas.qr import QRIssueResponse, TrackingPublic
from app.services.audit_service import AuditService


class QRService:
    """
    Generates and resolves secure tracking references.

    Kept as its own service so the actual QR encoding (currently a plain
    opaque token string) can be replaced or upgraded later - e.g. signed
    payloads, expiry, or a dedicated QR image service - without touching
    request lifecycle logic.
    """

    def __init__(self, request_repo: RequestRepository, audit_service: AuditService):
        self._request_repo = request_repo
        self._audit_service = audit_service

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

    async def resolve_reference(self, reference: str, current_user: UserRecord) -> TrackingPublic:
        request = await self._request_repo.get_by_tracking_reference(reference)
        if request is None:
            raise NotFoundError("Tracking reference was not found", code="REFERENCE_NOT_FOUND")

        # Authorization: hospital users may only track their own hospital's
        # requests; blood bank operators, admin, and platform support may
        # track any request in the MVP. Donors/mobile scanning authorization
        # scope is intentionally left for the approved donor/consent module.
        if current_user.role == Role.HOSPITAL_USER and current_user.institution_id != request.hospital_id:
            raise ForbiddenError("Not authorized to track this request", code="FORBIDDEN_TRACKING_ACCESS")

        await self._audit_service.record(
            actor_user_id=current_user.id,
            action="QR_ACCESSED",
            details=f"reference {reference} scanned",
        )

        # Only permitted tracking/status information - no patient identity.
        return TrackingPublic(
            reference=request.tracking_reference,
            status=request.status,
            blood_type=request.blood_type,
            component=request.component,
            last_updated=request.updated_at,
        )
