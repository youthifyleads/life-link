from __future__ import annotations

from datetime import datetime, timedelta, timezone
import hashlib
import secrets
import uuid

from app.core.config import get_settings
from app.core.exceptions import UnauthorizedError
from app.core.security import create_access_token
from app.repositories.models import RefreshTokenRecord, UserRecord


class RefreshTokenStore:
    def __init__(self) -> None:
        self.items: dict[str, RefreshTokenRecord] = {}

    async def create(self, r: RefreshTokenRecord) -> RefreshTokenRecord:
        self.items[r.id] = r
        return r

    async def get_by_hash(self, h: str) -> RefreshTokenRecord | None:
        return next((x for x in self.items.values() if x.token_hash == h), None)

    async def revoke(
        self, r: RefreshTokenRecord, replacement: str | None = None
    ) -> RefreshTokenRecord:
        r.revoked_at = datetime.now(timezone.utc)
        r.replaced_by_token_id = replacement
        self.items[r.id] = r
        return r

    async def revoke_user(self, user_id: str) -> None:
        now = datetime.now(timezone.utc)
        for r in self.items.values():
            if r.user_id == user_id and not r.revoked_at:
                r.revoked_at = now


class RefreshTokenService:
    def __init__(self, user_repo, store) -> None:
        self.user_repo = user_repo
        self.store = store

    @staticmethod
    def _hash(t: str) -> str:
        return hashlib.sha256(t.encode()).hexdigest()

    async def issue(self, user: UserRecord) -> str:
        raw = secrets.token_urlsafe(48)
        now = datetime.now(timezone.utc)
        rid = str(uuid.uuid4())
        expire_days = getattr(get_settings(), "REFRESH_TOKEN_EXPIRE_DAYS", 7)
        exp = now + timedelta(days=expire_days)
        await self.store.create(
            RefreshTokenRecord(rid, user.id, self._hash(raw), exp, now)
        )
        return raw

    async def rotate(self, raw: str) -> tuple[UserRecord, str, str]:
        rec = await self.store.get_by_hash(self._hash(raw))
        now = datetime.now(timezone.utc)
        if not rec or rec.expires_at <= now:
            raise UnauthorizedError(
                "Invalid or expired refresh token", code="INVALID_REFRESH_TOKEN"
            )
        if rec.revoked_at:
            await self.store.revoke_user(rec.user_id)
            raise UnauthorizedError(
                "Refresh token reuse detected", code="REFRESH_TOKEN_REUSE"
            )
        user = await self.user_repo.get_by_id(rec.user_id)
        if not user or not user.is_active or not getattr(user, "email_verified", True):
            raise UnauthorizedError(
                "Invalid refresh token", code="INVALID_REFRESH_TOKEN"
            )
        new = await self.issue(user)
        nr = await self.store.get_by_hash(self._hash(new))
        await self.store.revoke(rec, nr.id if nr else None)
        role_val = user.role.value if hasattr(user.role, "value") else str(user.role)
        return user, create_access_token(subject=user.id, role=role_val), new

    async def revoke(self, raw: str) -> None:
        rec = await self.store.get_by_hash(self._hash(raw))
        if rec:
            await self.store.revoke(rec)
