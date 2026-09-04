import uuid

from app.repositories.interfaces.audit_repository import AuditRepository
from app.repositories.models import AuditLogRecord


class AuditService:
    """
    Thin abstraction so callers don't touch the repository directly.
    Final audit-log schema (retention, indexing, structured fields) is
    intentionally left to the Database Developer's ERD - this only
    guarantees the integration points exist and are used consistently.
    """

    def __init__(self, audit_repo: AuditRepository):
        self._audit_repo = audit_repo

    async def record(self, *, actor_user_id: str | None, action: str, details: str) -> AuditLogRecord:
        entry = AuditLogRecord(
            id=f"audit_{uuid.uuid4().hex[:12]}",
            actor_user_id=actor_user_id,
            action=action,
            details=details,
        )
        return await self._audit_repo.create(entry)
