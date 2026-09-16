from __future__ import annotations

from app.repositories.interfaces.device_token_repository import DeviceTokenRepository
from app.repositories.models import DeviceTokenRecord


class InMemoryDeviceTokenRepository(DeviceTokenRepository):
    def __init__(self) -> None:
        self.items: dict[str, DeviceTokenRecord] = {}

    async def upsert(self, record: DeviceTokenRecord) -> DeviceTokenRecord:
        self.items[record.token] = record
        return record

    async def list_for_user(self, user_id: str) -> list[DeviceTokenRecord]:
        return [
            x for x in self.items.values()
            if x.user_id == user_id and x.active
        ]

    async def deactivate(self, user_id: str, token: str) -> None:
        if token in self.items and self.items[token].user_id == user_id:
            self.items[token].active = False
