from __future__ import annotations

from datetime import datetime, timezone
from sqlalchemy import select, update
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.models import PasswordResetTokenModel, RefreshTokenModel
from app.repositories.models import PasswordResetTokenRecord, RefreshTokenRecord


class SQLRefreshTokenStore:
    def __init__(self, session: AsyncSession) -> None:
        self.session = session

    async def create(self, r: RefreshTokenRecord) -> RefreshTokenRecord:
        obj = RefreshTokenModel(
            token_id=r.id,
            user_id=r.user_id,
            token_hash=r.token_hash,
            expires_at=r.expires_at,
            created_at=r.created_at,
            revoked_at=r.revoked_at,
            replaced_by_token_id=r.replaced_by_token_id,
        )
        self.session.add(obj)
        await self.session.commit()
        return r

    async def get_by_hash(self, token_hash: str) -> RefreshTokenRecord | None:
        obj = (
            await self.session.execute(
                select(RefreshTokenModel).where(RefreshTokenModel.token_hash == token_hash)
            )
        ).scalar_one_or_none()
        if not obj:
            return None
        return RefreshTokenRecord(
            id=obj.token_id,
            user_id=obj.user_id,
            token_hash=obj.token_hash,
            expires_at=obj.expires_at,
            created_at=obj.created_at,
            revoked_at=obj.revoked_at,
            replaced_by_token_id=obj.replaced_by_token_id,
        )

    async def revoke(
        self, r: RefreshTokenRecord, replacement: str | None = None
    ) -> RefreshTokenRecord:
        r.revoked_at = datetime.now(timezone.utc)
        r.replaced_by_token_id = replacement
        await self.session.execute(
            update(RefreshTokenModel)
            .where(RefreshTokenModel.token_id == r.id)
            .values(revoked_at=r.revoked_at, replaced_by_token_id=replacement)
        )
        await self.session.commit()
        return r

    async def revoke_user(self, user_id: str) -> None:
        await self.session.execute(
            update(RefreshTokenModel)
            .where(
                RefreshTokenModel.user_id == user_id,
                RefreshTokenModel.revoked_at.is_(None),
            )
            .values(revoked_at=datetime.now(timezone.utc))
        )
        await self.session.commit()


class SQLPasswordResetStore:
    def __init__(self, session: AsyncSession) -> None:
        self.session = session

    async def create(self, r: PasswordResetTokenRecord) -> PasswordResetTokenRecord:
        obj = PasswordResetTokenModel(
            token_id=r.id,
            user_id=r.user_id,
            token_hash=r.token_hash,
            expires_at=r.expires_at,
            created_at=r.created_at,
            used_at=r.used_at,
            attempts=r.attempts,
        )
        self.session.add(obj)
        await self.session.commit()
        return r

    async def get(self, token_hash: str) -> PasswordResetTokenRecord | None:
        obj = (
            await self.session.execute(
                select(PasswordResetTokenModel).where(PasswordResetTokenModel.token_hash == token_hash)
            )
        ).scalar_one_or_none()
        if not obj:
            return None
        return PasswordResetTokenRecord(
            id=obj.token_id,
            user_id=obj.user_id,
            token_hash=obj.token_hash,
            expires_at=obj.expires_at,
            created_at=obj.created_at,
            used_at=obj.used_at,
            attempts=obj.attempts,
        )

    async def update(self, r: PasswordResetTokenRecord) -> PasswordResetTokenRecord:
        await self.session.execute(
            update(PasswordResetTokenModel)
            .where(PasswordResetTokenModel.token_id == r.id)
            .values(used_at=r.used_at, attempts=r.attempts)
        )
        await self.session.commit()
        return r

    async def invalidate_user(self, user_id: str) -> None:
        await self.session.execute(
            update(PasswordResetTokenModel)
            .where(
                PasswordResetTokenModel.user_id == user_id,
                PasswordResetTokenModel.used_at.is_(None),
            )
            .values(used_at=datetime.now(timezone.utc))
        )
        await self.session.commit()
