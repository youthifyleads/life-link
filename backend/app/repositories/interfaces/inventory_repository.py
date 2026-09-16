from abc import ABC, abstractmethod

from app.repositories.models import InventoryItemRecord


class InventoryRepository(ABC):
    """Contract for reported-inventory persistence (manual attestation, MVP scope only)."""

    @abstractmethod
    async def create(self, item: InventoryItemRecord) -> InventoryItemRecord: ...

    @abstractmethod
    async def get_by_id(self, item_id: str) -> InventoryItemRecord | None: ...

    @abstractmethod
    async def get_by_qr_code(self, qr_code: str) -> InventoryItemRecord | None: ...

    @abstractmethod
    async def get_by_id_or_qr(self, identifier: str) -> InventoryItemRecord | None: ...

    @abstractmethod
    async def list_all(self, blood_bank_id: str | None = None) -> list[InventoryItemRecord]: ...

    @abstractmethod
    async def update(self, item: InventoryItemRecord) -> InventoryItemRecord: ...
