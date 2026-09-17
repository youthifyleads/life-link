from __future__ import annotations
from abc import ABC, abstractmethod

from app.repositories.models import BloodBagHistoryRecord, BloodBagRecord


class BloodBagRepository(ABC):
    @abstractmethod
    async def get(self, bag_id: str) -> BloodBagRecord | None: ...

    @abstractmethod
    async def list(self, bank_id: str | None = None) -> list[BloodBagRecord]: ...

    @abstractmethod
    async def list_by_request(self, request_id: str) -> list[BloodBagRecord]: ...

    @abstractmethod
    async def create(self, record: BloodBagRecord) -> BloodBagRecord: ...

    @abstractmethod
    async def update(self, record: BloodBagRecord) -> BloodBagRecord: ...

    @abstractmethod
    async def add_history(self, record: BloodBagHistoryRecord) -> BloodBagHistoryRecord: ...

    @abstractmethod
    async def history(self, bag_id: str) -> list[BloodBagHistoryRecord]: ...

    @abstractmethod
    async def get_by_qr(self, qr_code: str) -> BloodBagRecord | None: ...
