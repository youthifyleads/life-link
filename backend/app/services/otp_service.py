from __future__ import annotations

from dataclasses import dataclass
from datetime import datetime, timedelta, timezone
import hashlib
import hmac
import secrets

from app.core.config import get_settings
from app.core.exceptions import ConflictError, ServiceUnavailableError, UnauthorizedError
from app.core.security import create_access_token
from app.services.email_service import AzureCommunicationEmailProvider, EmailProvider


@dataclass
class _OTPEntry:
    digest: str
    expires_at: datetime
    attempts: int
    last_sent_at: datetime


class OTPService:
    """OTP flow supporting both SMS phone verification and Email OTP verification."""

    DEV_OTP = "123456"
    EXPIRY_MINUTES = 5
    MAX_ATTEMPTS = 5
    RESEND_COOLDOWN_SECONDS = 60
    _issued_phone: dict[str, _OTPEntry] = {}
    _issued_email: dict[str, _OTPEntry] = {}

    def __init__(self, user_repo, email_provider: EmailProvider | None = None) -> None:
        self.user_repo = user_repo
        self.email_provider = email_provider or AzureCommunicationEmailProvider()

    @classmethod
    def reset_store(cls) -> None:
        cls._issued_phone.clear()
        cls._issued_email.clear()

    @staticmethod
    def _hash(otp: str) -> str:
        return hashlib.sha256(otp.encode("utf-8")).hexdigest()

    @staticmethod
    def _is_dev(settings) -> bool:
        return settings.ENVIRONMENT.lower() in {"dev", "development", "local", "test"}

    # ---------------- Phone OTP ----------------
    async def request(self, phone: str):
        user = await self.user_repo.get_by_phone(phone)
        if not user:
            raise UnauthorizedError(
                "No account is associated with this phone number",
                code="PHONE_NOT_FOUND",
            )

        settings = get_settings()
        if not self._is_dev(settings):
            raise ServiceUnavailableError(
                "OTP SMS delivery is not configured for this environment.",
                code="OTP_PROVIDER_NOT_CONFIGURED",
            )

        now = datetime.now(timezone.utc)
        previous = self._issued_phone.get(phone)
        if previous and (now - previous.last_sent_at).total_seconds() < self.RESEND_COOLDOWN_SECONDS:
            raise UnauthorizedError(
                "Please wait before requesting another OTP.",
                code="OTP_RATE_LIMITED",
                status_code=429,
            )

        self._issued_phone[phone] = _OTPEntry(
            digest=self._hash(self.DEV_OTP),
            expires_at=now + timedelta(minutes=self.EXPIRY_MINUTES),
            attempts=0,
            last_sent_at=now,
        )
        return ("OTP generated successfully", self.DEV_OTP)

    async def verify(self, phone: str, otp: str):
        user = await self.user_repo.get_by_phone(phone)
        if not user:
            raise UnauthorizedError(
                "No account is associated with this phone number",
                code="PHONE_NOT_FOUND",
            )

        settings = get_settings()
        now = datetime.now(timezone.utc)
        entry = self._issued_phone.get(phone)

        if self._is_dev(settings):
            if entry is None:
                raise UnauthorizedError("OTP has not been requested", code="OTP_NOT_REQUESTED")
            if now >= entry.expires_at:
                self._issued_phone.pop(phone, None)
                raise UnauthorizedError("OTP has expired", code="OTP_EXPIRED")
            if entry.attempts >= self.MAX_ATTEMPTS:
                self._issued_phone.pop(phone, None)
                raise UnauthorizedError("Too many OTP attempts", code="OTP_ATTEMPTS_EXCEEDED")
            entry.attempts += 1
            if not hmac.compare_digest(entry.digest, self._hash(otp)):
                if entry.attempts >= self.MAX_ATTEMPTS:
                    self._issued_phone.pop(phone, None)
                    raise UnauthorizedError("Too many OTP attempts", code="OTP_ATTEMPTS_EXCEEDED")
                raise UnauthorizedError("Invalid OTP", code="INVALID_OTP")
            self._issued_phone.pop(phone, None)
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

    # ---------------- Email OTP ----------------
    async def request_email(self, email: str, purpose: str = "signup") -> str:
        user = await self.user_repo.get_by_email(email.lower())
        if not user:
            raise UnauthorizedError("Unable to process this request", code="EMAIL_NOT_FOUND")

        now = datetime.now(timezone.utc)
        old = self._issued_email.get(email.lower())
        settings = get_settings()
        cooldown = getattr(settings, "OTP_RESEND_COOLDOWN_SECONDS", 60)
        if old and (now - old.last_sent_at).total_seconds() < cooldown:
            raise ConflictError(
                "Please wait before requesting another OTP.",
                code="OTP_RATE_LIMITED",
                status_code=429,
            )

        expire_seconds = getattr(settings, "OTP_EXPIRE_SECONDS", 300)
        code = f"{secrets.randbelow(1000000):06d}"
        self._issued_email[email.lower()] = _OTPEntry(
            digest=self._hash(code),
            expires_at=now + timedelta(seconds=expire_seconds),
            attempts=0,
            last_sent_at=now,
        )
        await self.email_provider.send_otp(to_email=email.lower(), code=code, purpose=purpose)
        return "Verification code sent"

    async def verify_email(self, email: str, code: str) -> bool:
        key = email.lower()
        entry = self._issued_email.get(key)
        now = datetime.now(timezone.utc)
        settings = get_settings()
        max_attempts = getattr(settings, "OTP_MAX_ATTEMPTS", 5)

        if not entry:
            raise UnauthorizedError("OTP has not been requested", code="OTP_NOT_REQUESTED")
        if now >= entry.expires_at:
            self._issued_email.pop(key, None)
            raise UnauthorizedError("OTP has expired", code="OTP_EXPIRED")
        if entry.attempts >= max_attempts:
            self._issued_email.pop(key, None)
            raise UnauthorizedError("Too many OTP attempts", code="OTP_ATTEMPTS_EXCEEDED")

        entry.attempts += 1
        if not hmac.compare_digest(entry.digest, self._hash(code)):
            if entry.attempts >= max_attempts:
                self._issued_email.pop(key, None)
            raise UnauthorizedError("Invalid OTP", code="INVALID_OTP")

        self._issued_email.pop(key, None)
        return True
