from fastapi import APIRouter,Depends
from app.core.security import CurrentUser
from app.schemas.auth import LoginRequest,TokenResponse,RefreshTokenRequest,SignupRequest,SignupResponse,EmailOTPRequest,EmailOTPVerify,PasswordResetRequest,PasswordResetConfirm
from app.schemas.users import UserPublic
from app.services.auth_service import AuthService
from app.services.dependencies import get_auth_service,get_refresh_service,get_otp_service,get_password_reset_service
router=APIRouter(prefix="/auth",tags=["Auth"])
@router.post('/signup',response_model=SignupResponse,status_code=201)
async def signup(payload:SignupRequest,svc:AuthService=Depends(get_auth_service)):
    u=await svc.signup(payload); return SignupResponse(message='Account created. Verification code sent to email.',user_id=u.id,email=u.email)
@router.post('/signup/verify',response_model=UserPublic)
async def verify_signup(payload:EmailOTPVerify,svc:AuthService=Depends(get_auth_service)): return UserPublic.model_validate(await svc.verify_signup(payload.email,payload.otp))
@router.post('/login',response_model=TokenResponse)
async def login(payload:LoginRequest,svc:AuthService=Depends(get_auth_service)):
    _,a,r=await svc.authenticate(payload.email,payload.password); return TokenResponse(access_token=a,refresh_token=r)
@router.post('/refresh',response_model=TokenResponse)
async def refresh(payload:RefreshTokenRequest,svc=Depends(get_refresh_service)):
    _,a,r=await svc.rotate(payload.refresh_token); return TokenResponse(access_token=a,refresh_token=r)
@router.post('/logout',status_code=204)
async def logout(payload:RefreshTokenRequest,svc=Depends(get_refresh_service)): await svc.revoke(payload.refresh_token); return None
@router.post('/signup/resend-otp')
async def resend_signup_otp(payload:EmailOTPRequest,otp=Depends(get_otp_service)): return {'message':await otp.request_email(payload.email,'signup')}
@router.get('/me',response_model=UserPublic)
async def get_me(current_user:CurrentUser)->UserPublic:return current_user
@router.post('/forgot-password')
async def forgot(payload:PasswordResetRequest,svc=Depends(get_password_reset_service)): return {'message':await svc.request(payload.email)}
@router.post('/reset-password')
async def reset(payload:PasswordResetConfirm,svc=Depends(get_password_reset_service)): await svc.reset(payload.email,payload.code,payload.new_password); return {'message':'Password reset successfully'}
