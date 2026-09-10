import uuid

from app.core.domain import AuditAction
from app.repositories.interfaces.audit_repository import AuditRepository
from app.repositories.models import AuditLogRecord


class AuditService:
    """
    Thin abstraction so callers don't touch the repository directly.
    Uses the AuditAction enum (not raw strings) so a typo in an action name
    fails at call time instead of silently writing an unrecognized value.
    entity_type/entity_id map 1:1 onto the supplied audit_logs schema
    columns - no free-text packing/unpacking.
    """

    def __init__(self, audit_repo: AuditRepository):
        self._audit_repo = audit_repo

    async def record(
        self,
        *,
        actor_user_id: str | None,
        action: AuditAction,
        entity_type: str,
        entity_id: str | None = None,
    ) -> AuditLogRecord:
        entry = AuditLogRecord(
            id=f"audit_{uuid.uuid4().hex[:12]}",
            actor_user_id=actor_user_id,
            action=action.value,
            entity_type=entity_type,
            entity_id=entity_id,
        )
        return await self._audit_repo.create(entry)
