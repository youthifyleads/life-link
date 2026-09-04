import uuid
from datetime import datetime, timezone
from pathlib import Path

from app.core.config import get_settings
from app.core.domain import Role
from app.core.exceptions import ForbiddenError, NotFoundError, ValidationAppError
from app.repositories.interfaces.document_repository import DocumentRepository
from app.repositories.interfaces.request_repository import RequestRepository
from app.repositories.models import SupportingDocumentRecord, UserRecord


class DocumentService:
    ALLOWED_TYPES = {"application/pdf", "image/jpeg", "image/png"}

    def __init__(self, document_repo: DocumentRepository, request_repo: RequestRepository):
        self._repo = document_repo
        self._request_repo = request_repo

    async def ensure_request_access(self, request_id: str, user: UserRecord):
        req = await self._request_repo.get_by_id(request_id)
        if not req:
            raise NotFoundError("Blood request was not found", code="REQUEST_NOT_FOUND")
        if user.role == Role.HOSPITAL_USER and user.institution_id != req.hospital_id:
            raise ForbiddenError("Not authorized to access this request", code="FORBIDDEN_REQUEST_ACCESS")
        return req

    async def save_upload(self, request_id: str, user: UserRecord, filename: str, content_type: str | None, data: bytes):
        req = await self.ensure_request_access(request_id, user)
        if content_type not in self.ALLOWED_TYPES:
            raise ValidationAppError("Only PDF, JPEG and PNG documents are allowed", code="UNSUPPORTED_DOCUMENT_TYPE")
        if len(data) > get_settings().MAX_UPLOAD_MB * 1024 * 1024:
            raise ValidationAppError("Document exceeds the configured upload limit", code="DOCUMENT_TOO_LARGE")
        safe_name = Path(filename or "document").name
        root = Path(get_settings().FILE_STORAGE_ROOT) / request_id
        root.mkdir(parents=True, exist_ok=True)
        document_id = f"doc_{uuid.uuid4().hex[:12]}"
        stored = root / f"{document_id}_{safe_name}"
        stored.write_bytes(data)
        record = SupportingDocumentRecord(document_id, request_id, safe_name, "pending", datetime.now(timezone.utc), content_type, str(stored), uploaded_by_user_id=user.id)
        return await self._repo.create(record)

    async def list_for_request(self, request_id: str, user: UserRecord):
        await self.ensure_request_access(request_id, user)
        return await self._repo.list_for_request(request_id)

    async def review(self, document_id: str, user: UserRecord, approved: bool, reason: str | None = None):
        if user.role not in {Role.BLOOD_BANK_OPERATOR, Role.MEDICAL_LEAD, Role.ADMIN}:
            raise ForbiddenError("Only authorized reviewers can review documents", code="FORBIDDEN_DOCUMENT_REVIEW")
        doc = await self._repo.get_by_id(document_id)
        if not doc:
            raise NotFoundError("Supporting document was not found", code="DOCUMENT_NOT_FOUND")
        if not approved and not reason:
            raise ValidationAppError("A rejection reason is required", code="REJECTION_REASON_REQUIRED")
        doc.status = "approved" if approved else "rejected"
        doc.reviewed_at = datetime.now(timezone.utc)
        doc.rejection_reason = None if approved else reason
        doc.reviewed_by_user_id = user.id
        return await self._repo.update(doc)
