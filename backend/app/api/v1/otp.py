from fastapi import APIRouter, Depends
from app.schemas.otp import *
from app.services.dependencies import get_otp_service
from app.services.otp_service import OTPService
from app.schemas.auth import TokenResponse
router=APIRouter(prefix="/auth/otp",tags=["OTP"])
@router.post("/request",response_model=OTPResponse)
async def request_otp(data:OTPRequest,svc:OTPService=Depends(get_otp_service)):
    msg,dev=await svc.request(data.phone); return OTPResponse(message=msg,dev_otp=dev)
@router.post("/verify",response_model=TokenResponse)
async def verify_otp(data:OTPVerify,svc:OTPService=Depends(get_otp_service)):
    token=await svc.verify(data.phone,data.otp); return TokenResponse(access_token=token)
