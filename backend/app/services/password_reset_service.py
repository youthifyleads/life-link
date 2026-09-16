from __future__ import annotations

from datetime import datetime, timedelta, timezone
import hashlib
import hmac
import secrets
import uuid

from app.core.config import get_settings
from app.core.exceptions import UnauthorizedError
from app.core.hashing import hash_password
from app.repositories.models import PasswordResetTokenRecord


class MemoryPasswordResetStore:
    def __init__(self) -> None:
        self.items: dict[str, PasswordResetTokenRecord] = {}

    async def create(self, r: PasswordResetTokenRecord) -> PasswordResetTokenRecord:
        self.items[r.id] = r
        return r

    async def get(self, h: str) -> PasswordResetTokenRecord | None:
        return next((x for x in self.items.values() if x.token_hash == h), None)

    async def update(self, r: PasswordResetTokenRecord) -> PasswordResetTokenRecord:
        self.items[r.id] = r
        return r

    async def invalidate_user(self, user_id: str) -> None:
        now = datetime.now(timezone.utc)
        for r in self.items.values():
            if r.user_id == user_id and not r.used_at:
                r.used_at = now


class PasswordResetService:
    def __init__(self, user_repo, email_provider, refresh_service, store) -> None:
        self.user_repo = user_repo
        self.email = email_provider
        self.refresh = refresh_service
        self.store = store

    @staticmethod
    def _hash(x: str) -> str:
        return hashlib.sha256(x.encode()).hexdigest()

    async def request(self, email: str) -> str:
        user = await self.user_repo.get_by_email(email.lower())
        now = datetime.now(timezone.utc)
        expire_minutes = getattr(get_settings(), "PASSWORD_RESET_EXPIRE_MINUTES", 15)
        if user:
            code = f"{secrets.randbelow(1000000):06d}"
            r = PasswordResetTokenRecord(
                str(uuid.uuid4()),
                user.id,
                self._hash(code),
                now + timedelta(minutes=expire_minutes),
                now,
            )
            await self.store.invalidate_user(user.id)
            await self.store.create(r)
            await self.email.send_otp(
                to_email=user.email, code=code, purpose="password reset"
            )
        return "If the account exists, a password reset code has been sent."

    async def reset(self, email: str, code: str, new_password: str) -> None:
        user = await self.user_repo.get_by_email(email.lower())
        r = await self.store.get(self._hash(code))
        now = datetime.now(timezone.utc)
        if not user or not r or r.user_id != user.id or r.used_at or now >= r.expires_at:
            raise UnauthorizedError(
                "Invalid or expired reset code", code="INVALID_RESET_CODE"
            )
        if r.attempts >= 5:
            raise UnauthorizedError(
                "Too many reset attempts", code="RESET_ATTEMPTS_EXCEEDED"
            )
        r.attempts += 1
        if not hmac.compare_digest(r.token_hash, self._hash(code)):
            await self.store.update(r)
            raise UnauthorizedError(
                "Invalid reset code", code="INVALID_RESET_CODE"
            )
        r.used_at = now
        await self.store.update(r)
        user.hashed_password = hash_password(new_password)
        await self.user_repo.update(user)
        await self.refresh.store.revoke_user(user.id)
