from app.repositories.interfaces.audit_repository import AuditRepository
from app.repositories.models import AuditLogRecord


class InMemoryAuditRepository(AuditRepository):
    """Temporary in-memory implementation - see InMemoryUserRepository docstring."""

    def __init__(self) -> None:
        self._entries: list[AuditLogRecord] = []

    async def create(self, entry: AuditLogRecord) -> AuditLogRecord:
        self._entries.append(entry)
        return entry

    async def list_all(self) -> list[AuditLogRecord]:
        return list(self._entries)
