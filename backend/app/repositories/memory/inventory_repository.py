from app.repositories.interfaces.inventory_repository import InventoryRepository
from app.repositories.models import InventoryItemRecord


class InMemoryInventoryRepository(InventoryRepository):
    """Temporary in-memory implementation - see InMemoryUserRepository docstring."""

    def __init__(self) -> None:
        self._items: dict[str, InventoryItemRecord] = {}

    async def create(self, item: InventoryItemRecord) -> InventoryItemRecord:
        self._items[item.id] = item
        return item

    async def get_by_id(self, item_id: str) -> InventoryItemRecord | None:
        return self._items.get(item_id)

    async def list_all(self, blood_bank_id: str | None = None) -> list[InventoryItemRecord]:
        values = list(self._items.values())
        if blood_bank_id:
            values = [i for i in values if i.blood_bank_id == blood_bank_id]
        return values

    async def update(self, item: InventoryItemRecord) -> InventoryItemRecord:
        self._items[item.id] = item
        return item
