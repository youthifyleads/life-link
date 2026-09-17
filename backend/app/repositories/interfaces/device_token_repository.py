from __future__ import annotations
from abc import ABC, abstractmethod

from app.repositories.models import DeviceTokenRecord


class DeviceTokenRepository(ABC):
    @abstractmethod
    async def upsert(self, record: DeviceTokenRecord) -> DeviceTokenRecord: ...

    @abstractmethod
    async def list_for_user(self, user_id: str) -> list[DeviceTokenRecord]: ...

    @abstractmethod
    async def deactivate(self, user_id: str, token: str) -> None: ...
