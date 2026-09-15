from dataclasses import dataclass
from datetime import datetime,timedelta,timezone
import hashlib,hmac,secrets
from app.core.config import get_settings
from app.core.exceptions import ConflictError,ServiceUnavailableError,UnauthorizedError
from app.services.email_service import AzureCommunicationEmailProvider, EmailProvider
@dataclass
class OTPEntry: digest:str; expires_at:datetime; attempts:int; last_sent_at:datetime
class OTPService:
    _entries:dict[str,OTPEntry]={}
    def __init__(self,user_repo,email_provider:EmailProvider|None=None): self.user_repo=user_repo; self.email_provider=email_provider or AzureCommunicationEmailProvider()
    @classmethod
    def reset_store(cls): cls._entries.clear()
    @staticmethod
    def _hash(code): return hashlib.sha256(code.encode()).hexdigest()
    async def request_email(self,email,purpose="signup"):
        user=await self.user_repo.get_by_email(email.lower())
        if not user: raise UnauthorizedError("Unable to process this request",code="EMAIL_NOT_FOUND")
        now=datetime.now(timezone.utc); old=self._entries.get(email.lower()); settings=get_settings()
        if old and (now-old.last_sent_at).total_seconds()<settings.OTP_RESEND_COOLDOWN_SECONDS: raise ConflictError("Please wait before requesting another OTP.",code="OTP_RATE_LIMITED",status_code=429)
        code=f"{secrets.randbelow(1000000):06d}"; self._entries[email.lower()]=OTPEntry(self._hash(code),now+timedelta(seconds=settings.OTP_EXPIRE_SECONDS),0,now)
        await self.email_provider.send_otp(to_email=email.lower(),code=code,purpose=purpose)
        return "Verification code sent"
    async def verify_email(self,email,code):
        key=email.lower(); entry=self._entries.get(key); now=datetime.now(timezone.utc); settings=get_settings()
        if not entry: raise UnauthorizedError("OTP has not been requested",code="OTP_NOT_REQUESTED")
        if now>=entry.expires_at: self._entries.pop(key,None); raise UnauthorizedError("OTP has expired",code="OTP_EXPIRED")
        if entry.attempts>=settings.OTP_MAX_ATTEMPTS: self._entries.pop(key,None); raise UnauthorizedError("Too many OTP attempts",code="OTP_ATTEMPTS_EXCEEDED")
        entry.attempts+=1
        if not hmac.compare_digest(entry.digest,self._hash(code)):
            if entry.attempts>=settings.OTP_MAX_ATTEMPTS:self._entries.pop(key,None)
            raise UnauthorizedError("Invalid OTP",code="INVALID_OTP")
        self._entries.pop(key,None); return True
