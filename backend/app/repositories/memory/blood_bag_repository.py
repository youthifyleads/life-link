from __future__ import annotations

from app.repositories.interfaces.blood_bag_repository import BloodBagRepository
from app.repositories.models import BloodBagHistoryRecord, BloodBagRecord


class InMemoryBloodBagRepository(BloodBagRepository):
    def __init__(self) -> None:
        self.items: dict[str, BloodBagRecord] = {}
        self.hist: dict[str, list[BloodBagHistoryRecord]] = {}

    async def get(self, bag_id: str) -> BloodBagRecord | None:
        return self.items.get(bag_id)

    async def list(self, bank_id: str | None = None) -> list[BloodBagRecord]:
        return [
            b for b in self.items.values()
            if not bank_id or b.current_blood_bank_id == bank_id
        ]

    async def list_by_request(self, request_id: str) -> list[BloodBagRecord]:
        return [
            b for b in self.items.values()
            if getattr(b, "allocated_request_id", None) == request_id
        ]

    async def create(self, record: BloodBagRecord) -> BloodBagRecord:
        self.items[record.id] = record
        return record

    async def update(self, record: BloodBagRecord) -> BloodBagRecord:
        self.items[record.id] = record
        return record

    async def add_history(self, record: BloodBagHistoryRecord) -> BloodBagHistoryRecord:
        self.hist.setdefault(record.blood_bag_id, []).append(record)
        return record

    async def history(self, bag_id: str) -> list[BloodBagHistoryRecord]:
        return list(self.hist.get(bag_id, []))

    async def get_by_qr(self, qr_code: str) -> BloodBagRecord | None:
        return next((b for b in self.items.values() if b.qr_code == qr_code), None)
