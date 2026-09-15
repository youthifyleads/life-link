from datetime import date,datetime,timezone
import uuid
from app.core.domain import AuditAction,Role
from app.core.exceptions import ConflictError,UnauthorizedError
from app.core.hashing import hash_password,verify_password
from app.core.security import create_access_token
from app.repositories.models import UserRecord,DonorRecord
class AuthService:
    def __init__(self,user_repo,audit_service,donor_repo=None,otp_service=None,refresh_service=None): self._user_repo=user_repo; self._audit_service=audit_service; self._donor_repo=donor_repo; self._otp=otp_service; self._refresh=refresh_service
    async def authenticate(self,email,password):
        user=await self._user_repo.get_by_email(email.lower())
        if user is None or not verify_password(password,user.hashed_password): raise UnauthorizedError("Invalid email or password",code="INVALID_CREDENTIALS")
        if user.status.lower() in ("banned","suspended"): raise UnauthorizedError("This account has been banned.",code="ACCOUNT_BANNED")
        if not user.is_active: raise UnauthorizedError("This account is inactive.",code="ACCOUNT_INACTIVE")
        if not getattr(user,'email_verified',True): raise UnauthorizedError("Please verify your email before signing in.",code="EMAIL_NOT_VERIFIED")
        access=create_access_token(subject=user.id,role=user.role.value); refresh=await self._refresh.issue(user) if self._refresh else ""
        await self._audit_service.record(actor_user_id=user.id,action=AuditAction.LOGIN,entity_type="user",entity_id=user.id)
        return user,access,refresh
    async def signup(self,payload):
        if await self._user_repo.get_by_email(payload.email.lower()): raise ConflictError("An account with this email already exists",code="EMAIL_ALREADY_EXISTS")
        if await self._user_repo.get_by_phone(payload.phone): raise ConflictError("An account with this phone already exists",code="PHONE_ALREADY_EXISTS")
        try: dob=date.fromisoformat(payload.date_of_birth)
        except ValueError: raise ConflictError("date_of_birth must use YYYY-MM-DD",code="INVALID_DATE_OF_BIRTH",status_code=422)
        if dob>=date.today(): raise ConflictError("date_of_birth must be in the past",code="INVALID_DATE_OF_BIRTH",status_code=422)
        uid=str(uuid.uuid4()); user=UserRecord(uid,payload.email.lower(),payload.name,hash_password(payload.password),Role.NORMAL_USER,status="unverified",is_active=False,phone=payload.phone,date_of_birth=dob,email_verified=False)
        await self._user_repo.create(user)
        if self._donor_repo:
            await self._donor_repo.create(DonorRecord(str(uuid.uuid4()),uid,payload.blood_type,dob,payload.governorate,"pending",None))
        if self._otp: await self._otp.request_email(user.email,"signup")
        return user
    async def verify_signup(self,email,otp):
        user=await self._user_repo.get_by_email(email.lower())
        if not user: raise UnauthorizedError("Invalid verification request",code="INVALID_VERIFICATION")
        await self._otp.verify_email(email,otp); user.email_verified=True; user.is_active=True; user.status="active"; await self._user_repo.update(user); return user
