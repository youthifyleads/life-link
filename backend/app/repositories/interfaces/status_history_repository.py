from abc import ABC, abstractmethod
from app.repositories.models import RequestStatusHistoryRecord


class StatusHistoryRepository(ABC):
    @abstractmethod
    async def create(self, entry: RequestStatusHistoryRecord) -> RequestStatusHistoryRecord: ...

    @abstractmethod
    async def list_for_request(self, request_id: str) -> list[RequestStatusHistoryRecord]: ...
