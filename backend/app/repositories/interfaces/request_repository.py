from abc import ABC, abstractmethod

from app.repositories.models import BloodRequestRecord


class RequestRepository(ABC):
    """
    Contract for blood-request persistence. Kept independent of the
    final ERD's foreign keys (e.g. exact hospital table shape) - the
    SQL Server implementation adapts to this interface later.
    """

    @abstractmethod
    async def create(self, request: BloodRequestRecord) -> BloodRequestRecord: ...

    @abstractmethod
    async def get_by_id(self, request_id: str) -> BloodRequestRecord | None: ...

    @abstractmethod
    async def get_by_tracking_reference(self, reference: str) -> BloodRequestRecord | None: ...

    @abstractmethod
    async def list_all(self, hospital_id: str | None = None) -> list[BloodRequestRecord]: ...

    @abstractmethod
    async def update(self, request: BloodRequestRecord) -> BloodRequestRecord: ...
