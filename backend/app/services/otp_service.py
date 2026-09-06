from app.core.config import get_settings
from app.core.exceptions import UnauthorizedError
from app.core.security import create_access_token
class OTPService:
    DEV_OTP="123456"
    def __init__(self,user_repo): self.user_repo=user_repo; self._issued={}
    async def request(self,phone):
        user=await self.user_repo.get_by_phone(phone)
        if not user: raise UnauthorizedError("No account is associated with this phone number",code="PHONE_NOT_FOUND")
        self._issued[phone]=self.DEV_OTP
        settings=get_settings()
        return ("OTP generated successfully", self.DEV_OTP if settings.ENVIRONMENT.lower() in {"dev","development","local","test"} else None)
    async def verify(self,phone,otp):
        user=await self.user_repo.get_by_phone(phone)
        if not user: raise UnauthorizedError("No account is associated with this phone number",code="PHONE_NOT_FOUND")
        settings=get_settings(); valid=(otp==self.DEV_OTP if settings.ENVIRONMENT.lower() in {"dev","development","local","test"} else otp==self._issued.get(phone))
        if not valid: raise UnauthorizedError("Invalid OTP",code="INVALID_OTP")
        if user.status.lower()=="banned": raise UnauthorizedError("This account has been banned.",code="ACCOUNT_BANNED")
        if not user.is_active: raise UnauthorizedError("This account is inactive.",code="ACCOUNT_INACTIVE")
        return create_access_token(subject=user.id,role=user.role.value)
