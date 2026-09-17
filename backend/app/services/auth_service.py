from __future__ import annotations

from datetime import date, datetime, timezone
import uuid

from app.core.domain import AuditAction, Role, VALID_BLOOD_TYPES
from app.core.exceptions import ConflictError, UnauthorizedError
from app.core.hashing import hash_password, verify_password
from app.core.security import create_access_token
from app.repositories.interfaces.user_repository import UserRepository
from app.repositories.models import DonorRecord, UserRecord
from app.services.audit_service import AuditService


class AuthService:
    def __init__(
        self,
        user_repo: UserRepository,
        audit_service: AuditService,
        donor_repo=None,
        otp_service=None,
        refresh_service=None,
    ) -> None:
        self._user_repo = user_repo
        self._audit_service = audit_service
        self._donor_repo = donor_repo
        self._otp = otp_service
        self._refresh = refresh_service

    async def authenticate(self, email: str, password: str) -> tuple[UserRecord, str, str]:
        try:
            user = await self._user_repo.get_by_email(email.lower())
        except ValueError:
            raise UnauthorizedError("User role configuration is invalid", code="INVALID_USER_ROLE")

        if user is None or not verify_password(password, user.hashed_password):
            raise UnauthorizedError("Invalid email or password", code="INVALID_CREDENTIALS")
        if user.status.lower() in ("banned", "suspended"):
            raise UnauthorizedError("This account has been banned.", code="ACCOUNT_BANNED")
        if not user.is_active:
            raise UnauthorizedError("This account is inactive.", code="ACCOUNT_INACTIVE")
        if not getattr(user, "email_verified", True):
            raise UnauthorizedError(
                "Please verify your email before signing in.", code="EMAIL_NOT_VERIFIED"
            )

        role_val = user.role.value if hasattr(user.role, "value") else str(user.role)
        access = create_access_token(subject=user.id, role=role_val)
        refresh = await self._refresh.issue(user) if self._refresh else ""
        await self._audit_service.record(
            actor_user_id=user.id,
            action=AuditAction.LOGIN,
            entity_type="user",
            entity_id=user.id,
        )
        return user, access, refresh

    async def signup(self, payload) -> UserRecord:
        if await self._user_repo.get_by_email(payload.email.lower()):
            raise ConflictError(
                "An account with this email already exists", code="EMAIL_ALREADY_EXISTS"
            )
        if await self._user_repo.get_by_phone(payload.phone):
            raise ConflictError(
                "An account with this phone already exists", code="PHONE_ALREADY_EXISTS"
            )

        dob = None
        if isinstance(payload.date_of_birth, date):
            dob = payload.date_of_birth
        else:
            val_str = str(payload.date_of_birth).strip()
            for fmt in ("%Y-%m-%d", "%d-%m-%Y", "%d/%m/%Y", "%Y/%m/%d"):
                try:
                    dob = datetime.strptime(val_str, fmt).date()
                    break
                except ValueError:
                    pass

        if dob is None:
            raise ConflictError(
                "date_of_birth must use YYYY-MM-DD",
                code="INVALID_DATE_OF_BIRTH",
                status_code=422,
            )

        if dob >= date.today():
            raise ConflictError(
                "date_of_birth must be in the past",
                code="INVALID_DATE_OF_BIRTH",
                status_code=422,
            )

        uid = str(uuid.uuid4())
        user = UserRecord(
            id=uid,
            email=payload.email.lower(),
            full_name=payload.name,
            hashed_password=hash_password(payload.password),
            role=Role.NORMAL_USER,
            status="unverified",
            is_active=False,
            phone=payload.phone,
            date_of_birth=dob,
            email_verified=False,
        )
        await self._user_repo.create(user)

        if self._donor_repo:
            bt = None
            raw_bt = getattr(payload, "blood_type", None)
            if raw_bt:
                val_bt = str(getattr(raw_bt, "value", raw_bt)).strip().upper()
                if val_bt in VALID_BLOOD_TYPES:
                    bt = val_bt

            gov = getattr(payload, "governorate", None)
            if gov and str(gov).strip().lower() in ("", "string", "null", "none"):
                gov = None

            await self._donor_repo.create(
                DonorRecord(
                    id=str(uuid.uuid4()),
                    user_id=uid,
                    blood_type=bt,
                    date_of_birth=dob,
                    governorate=gov,
                    eligibility_status="eligible",
                    last_donation_date=None,
                )
            )

        dev_otp = None
        if self._otp:
            otp_res = await self._otp.request_email(user.email, "signup")
            if otp_res and otp_res != "Verification code sent":
                dev_otp = otp_res

        return user, dev_otp

    async def verify_signup(self, email: str, otp: str) -> UserRecord:
        user = await self._user_repo.get_by_email(email.lower())
        if not user:
            raise UnauthorizedError("Invalid verification request", code="INVALID_VERIFICATION")

        await self._otp.verify_email(email, otp)
        user.email_verified = True
        user.is_active = True
        user.status = "active"
        await self._user_repo.update(user)
        return user
