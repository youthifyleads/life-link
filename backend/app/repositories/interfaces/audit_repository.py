from abc import ABC, abstractmethod

from app.repositories.models import AuditLogRecord


class AuditRepository(ABC):
    @abstractmethod
    async def create(self, entry: AuditLogRecord) -> AuditLogRecord: ...

    @abstractmethod
    async def list_all(self) -> list[AuditLogRecord]: ...
