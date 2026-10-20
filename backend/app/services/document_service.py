import uuid
from datetime import datetime, timezone, timedelta
from pathlib import Path
from urllib.parse import urlparse

from app.core.config import get_settings
from app.core.domain import Role
from app.core.exceptions import ForbiddenError, NotFoundError, ValidationAppError
from app.repositories.interfaces.document_repository import DocumentRepository
from app.repositories.interfaces.request_repository import RequestRepository
from app.repositories.models import SupportingDocumentRecord, UserRecord
from app.schemas.documents import DocumentPublic


class DocumentService:
    ALLOWED_TYPES = {"application/pdf", "image/jpeg", "image/png"}

    def __init__(self, document_repo: DocumentRepository, request_repo: RequestRepository):
        self._repo = document_repo
        self._request_repo = request_repo

    def _generate_sas_url(self, doc: SupportingDocumentRecord) -> str | None:
        settings = get_settings()
        if not settings.AZURE_STORAGE_CONNECTION_STRING:
            return None
        try:
            from azure.storage.blob import generate_blob_sas, BlobSasPermissions

            conn_dict = dict(item.split("=", 1) for item in settings.AZURE_STORAGE_CONNECTION_STRING.split(";") if "=" in item)
            account_name = conn_dict.get("AccountName")
            account_key = conn_dict.get("AccountKey")
            if not account_name or not account_key:
                return None

            container_name = settings.AZURE_STORAGE_CONTAINER_NAME
            parsed = urlparse(doc.file_path)
            path_parts = parsed.path.lstrip("/").split("/", 1)
            blob_name = path_parts[1] if len(path_parts) > 1 else doc.file_path

            sas_token = generate_blob_sas(
                account_name=account_name,
                container_name=container_name,
                blob_name=blob_name,
                account_key=account_key,
                permission=BlobSasPermissions(read=True),
                expiry=datetime.now(timezone.utc) + timedelta(days=7),
            )
            return f"{doc.file_path}?{sas_token}"
        except Exception:
            return None

    def to_public_dto(self, doc: SupportingDocumentRecord) -> DocumentPublic:
        sas_url = self._generate_sas_url(doc)
        download_url = sas_url or f"/api/v1/documents/{doc.document_id}/content"
        return DocumentPublic(
            id=doc.document_id,
            blood_request_id=doc.blood_request_id,
            file_name=doc.file_name,
            status=doc.status,
            uploaded_at=doc.uploaded_at,
            file_type=doc.file_type,
            file_path=sas_url or doc.file_path,
            download_url=download_url,
            reviewed_at=doc.reviewed_at,
            rejection_reason=doc.rejection_reason,
        )

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
        document_id = str(uuid.uuid4())
        settings = get_settings()

        file_path: str
        if settings.AZURE_STORAGE_CONNECTION_STRING:
            try:
                from azure.storage.blob import BlobServiceClient, ContentSettings

                blob_service = BlobServiceClient.from_connection_string(settings.AZURE_STORAGE_CONNECTION_STRING)
                container_client = blob_service.get_container_client(settings.AZURE_STORAGE_CONTAINER_NAME)
                try:
                    container_client.create_container()
                except Exception:
                    pass

                blob_name = f"{request_id}/{document_id}_{safe_name}"
                blob_client = container_client.get_blob_client(blob_name)
                content_settings = ContentSettings(content_type=content_type) if content_type else None
                blob_client.upload_blob(data, overwrite=True, content_settings=content_settings)
                file_path = blob_client.url
            except Exception:
                # If Azure upload fails, fallback to local storage
                root = Path(settings.FILE_STORAGE_ROOT) / request_id
                root.mkdir(parents=True, exist_ok=True)
                stored = root / f"{document_id}_{safe_name}"
                stored.write_bytes(data)
                file_path = str(stored)
        else:
            root = Path(settings.FILE_STORAGE_ROOT) / request_id
            root.mkdir(parents=True, exist_ok=True)
            stored = root / f"{document_id}_{safe_name}"
            stored.write_bytes(data)
            file_path = str(stored)

        record = SupportingDocumentRecord(
            document_id, request_id, safe_name, "pending", datetime.now(timezone.utc),
            content_type, file_path, uploaded_by_user_id=user.id
        )
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

    async def get_document(self, document_id: str, user: UserRecord):
        doc = await self._repo.get_by_id(document_id)
        if not doc:
            raise NotFoundError("Supporting document was not found", code="DOCUMENT_NOT_FOUND")
        await self.ensure_request_access(doc.blood_request_id, user)
        return doc

    async def get_document_by_id_internal(self, document_id: str):
        return await self._repo.get_by_id(document_id)

    async def get_document_bytes(self, doc: SupportingDocumentRecord) -> bytes:
        settings = get_settings()
        if doc.file_path.startswith("http://") or doc.file_path.startswith("https://"):
            if settings.AZURE_STORAGE_CONNECTION_STRING:
                try:
                    from azure.storage.blob import BlobServiceClient
                    blob_service = BlobServiceClient.from_connection_string(settings.AZURE_STORAGE_CONNECTION_STRING)
                    container_client = blob_service.get_container_client(settings.AZURE_STORAGE_CONTAINER_NAME)
                    parsed = urlparse(doc.file_path)
                    path_parts = parsed.path.lstrip("/").split("/", 1)
                    blob_name = path_parts[1] if len(path_parts) > 1 else doc.file_path
                    blob_client = container_client.get_blob_client(blob_name)
                    return blob_client.download_blob().readall()
                except Exception as exc:
                    pass

        # Local storage fallback
        p = Path(doc.file_path)
        if p.exists():
            return p.read_bytes()
        alt = Path(settings.FILE_STORAGE_ROOT) / doc.blood_request_id / f"{doc.document_id}_{doc.file_name}"
        if alt.exists():
            return alt.read_bytes()
        raise NotFoundError("Document file content not found on storage", code="DOCUMENT_FILE_NOT_FOUND")

    async def delete(self, document_id: str, user: UserRecord):
        doc = await self._repo.get_by_id(document_id)
        if not doc:
            raise NotFoundError("Supporting document was not found", code="DOCUMENT_NOT_FOUND")
        if doc.status == "approved":
            raise ValidationAppError("Cannot delete an already approved clinical document", code="DOCUMENT_ALREADY_APPROVED")
        await self.ensure_request_access(doc.blood_request_id, user)

        # Also delete blob from Azure if applicable
        settings = get_settings()
        if settings.AZURE_STORAGE_CONNECTION_STRING and (doc.file_path.startswith("http://") or doc.file_path.startswith("https://")):
            try:
                from azure.storage.blob import BlobServiceClient
                blob_service = BlobServiceClient.from_connection_string(settings.AZURE_STORAGE_CONNECTION_STRING)
                container_client = blob_service.get_container_client(settings.AZURE_STORAGE_CONTAINER_NAME)
                parsed = urlparse(doc.file_path)
                path_parts = parsed.path.lstrip("/").split("/", 1)
                blob_name = path_parts[1] if len(path_parts) > 1 else doc.file_path
                blob_client = container_client.get_blob_client(blob_name)
                blob_client.delete_blob()
            except Exception:
                pass

        return await self._repo.delete(document_id)
