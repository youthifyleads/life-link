from dataclasses import dataclass
from datetime import datetime, timedelta, timezone
import hashlib
import hmac

from app.core.config import get_settings
from app.core.exceptions import ServiceUnavailableError, UnauthorizedError
from app.core.security import create_access_token


@dataclass
class _OTPEntry:
    digest: str
    expires_at: datetime
    attempts: int
    last_sent_at: datetime


class OTPService:
    """OTP flow with safe development mode and an explicit production boundary.

    OTPs are kept in process memory for the current MVP. They are short-lived,
    single-use, attempt-limited and never stored in plaintext. Production SMS
    delivery is intentionally blocked until a real provider is configured.
    """

    DEV_OTP = "123456"
    EXPIRY_MINUTES = 5
    MAX_ATTEMPTS = 5
    RESEND_COOLDOWN_SECONDS = 60
    _issued: dict[str, _OTPEntry] = {}

    def __init__(self, user_repo):
        self.user_repo = user_repo

    @classmethod
    def reset_store(cls) -> None:
        cls._issued.clear()

    @staticmethod
    def _hash(otp: str) -> str:
        return hashlib.sha256(otp.encode("utf-8")).hexdigest()

    @staticmethod
    def _is_dev(settings) -> bool:
        return settings.ENVIRONMENT.lower() in {"dev", "development", "local", "test"}

    async def request(self, phone: str):
        user = await self.user_repo.get_by_phone(phone)
        if not user:
            raise UnauthorizedError("No account is associated with this phone number", code="PHONE_NOT_FOUND")

        settings = get_settings()
        if not self._is_dev(settings):
            raise ServiceUnavailableError(
                "OTP SMS delivery is not configured for this environment.",
                code="OTP_PROVIDER_NOT_CONFIGURED",
            )

        now = datetime.now(timezone.utc)
        previous = self._issued.get(phone)
        if previous and (now - previous.last_sent_at).total_seconds() < self.RESEND_COOLDOWN_SECONDS:
            raise UnauthorizedError(
                "Please wait before requesting another OTP.",
                code="OTP_RATE_LIMITED",
                status_code=429,
            )

        self._issued[phone] = _OTPEntry(
            digest=self._hash(self.DEV_OTP),
            expires_at=now + timedelta(minutes=self.EXPIRY_MINUTES),
            attempts=0,
            last_sent_at=now,
        )
        return ("OTP generated successfully", self.DEV_OTP)

    async def verify(self, phone: str, otp: str):
        user = await self.user_repo.get_by_phone(phone)
        if not user:
            raise UnauthorizedError("No account is associated with this phone number", code="PHONE_NOT_FOUND")

        settings = get_settings()
        now = datetime.now(timezone.utc)
        entry = self._issued.get(phone)

        if self._is_dev(settings):
            if entry is None:
                # Keep development OTP predictable for QA while still requiring
                # an explicit request first in normal operation.
                raise UnauthorizedError("OTP has not been requested", code="OTP_NOT_REQUESTED")
            if now >= entry.expires_at:
                self._issued.pop(phone, None)
                raise UnauthorizedError("OTP has expired", code="OTP_EXPIRED")
            if entry.attempts >= self.MAX_ATTEMPTS:
                self._issued.pop(phone, None)
                raise UnauthorizedError("Too many OTP attempts", code="OTP_ATTEMPTS_EXCEEDED")
            entry.attempts += 1
            if not hmac.compare_digest(entry.digest, self._hash(otp)):
                if entry.attempts >= self.MAX_ATTEMPTS:
                    self._issued.pop(phone, None)
                    raise UnauthorizedError("Too many OTP attempts", code="OTP_ATTEMPTS_EXCEEDED")
                raise UnauthorizedError("Invalid OTP", code="INVALID_OTP")
            self._issued.pop(phone, None)
        else:
            raise ServiceUnavailableError(
                "OTP SMS delivery is not configured for this environment.",
                code="OTP_PROVIDER_NOT_CONFIGURED",
            )

        if user.status.lower() in ("banned", "suspended"):
            raise UnauthorizedError("This account has been banned.", code="ACCOUNT_BANNED")
        if not user.is_active:
            raise UnauthorizedError("This account is inactive.", code="ACCOUNT_INACTIVE")
        return create_access_token(subject=user.id, role=user.role.value)
