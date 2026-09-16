from __future__ import annotations

from datetime import datetime, timezone
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.models import DeviceTokenModel
from app.repositories.interfaces.device_token_repository import DeviceTokenRepository
from app.repositories.models import DeviceTokenRecord


class SQLAlchemyDeviceTokenRepository(DeviceTokenRepository):
    def __init__(self, session: AsyncSession) -> None:
        self.session = session

    def _to_record(self, obj: DeviceTokenModel) -> DeviceTokenRecord:
        return DeviceTokenRecord(
            id=obj.device_token_id,
            user_id=obj.user_id,
            token=obj.token,
            provider=obj.provider,
            active=obj.active,
            created_at=obj.created_at,
            updated_at=obj.updated_at,
        )

    async def upsert(self, record: DeviceTokenRecord) -> DeviceTokenRecord:
        now = datetime.now(timezone.utc)
        obj = (
            await self.session.execute(
                select(DeviceTokenModel).where(DeviceTokenModel.token == record.token)
            )
        ).scalar_one_or_none()

        if obj:
            obj.user_id = record.user_id
            obj.provider = record.provider
            obj.active = True
            obj.updated_at = now
            record.id = obj.device_token_id
            record.created_at = obj.created_at
            record.updated_at = now
        else:
            new_obj = DeviceTokenModel(
                device_token_id=record.id,
                user_id=record.user_id,
                token=record.token,
                provider=record.provider,
                active=True,
                created_at=record.created_at,
                updated_at=now,
            )
            self.session.add(new_obj)

        await self.session.commit()
        return record

    async def list_for_user(self, user_id: str) -> list[DeviceTokenRecord]:
        query = (
            select(DeviceTokenModel)
            .where(
                DeviceTokenModel.user_id == user_id,
                DeviceTokenModel.active == True,
            )
        )
        result = (await self.session.execute(query)).scalars().all()
        return [self._to_record(obj) for obj in result]

    async def deactivate(self, user_id: str, token: str) -> None:
        obj = (
            await self.session.execute(
                select(DeviceTokenModel).where(
                    DeviceTokenModel.user_id == user_id,
                    DeviceTokenModel.token == token,
                )
            )
        ).scalar_one_or_none()
        if obj:
            obj.active = False
            obj.updated_at = datetime.now(timezone.utc)
            await self.session.commit()
