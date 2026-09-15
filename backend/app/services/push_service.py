from __future__ import annotations

import uuid
from app.repositories.interfaces.device_token_repository import DeviceTokenRepository
from app.repositories.models import DeviceTokenRecord


class PushProvider:
    async def send(
        self, *, tokens: list[str], title: str, body: str, data: dict | None = None
    ) -> None:
        raise NotImplementedError


class FCMProvider(PushProvider):
    async def send(
        self, *, tokens: list[str], title: str, body: str, data: dict | None = None
    ) -> None:
        raise RuntimeError("FCM provider is not configured; no fake push was sent")


class OneSignalProvider(PushProvider):
    async def send(
        self, *, tokens: list[str], title: str, body: str, data: dict | None = None
    ) -> None:
        raise RuntimeError("OneSignal provider is not configured; no fake push was sent")


class DeviceTokenService:
    def __init__(self, repo: DeviceTokenRepository) -> None:
        self.repo = repo

    async def register(self, user_id: str, token: str, provider: str) -> DeviceTokenRecord:
        record = DeviceTokenRecord(
            id=str(uuid.uuid4()),
            user_id=user_id,
            token=token,
            provider=provider,
            active=True,
        )
        return await self.repo.upsert(record)

    async def remove(self, user_id: str, token: str) -> None:
        await self.repo.deactivate(user_id, token)

    async def list(self, user_id: str) -> list[DeviceTokenRecord]:
        return await self.repo.list_for_user(user_id)
