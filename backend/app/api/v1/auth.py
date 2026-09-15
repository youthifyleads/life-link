from __future__ import annotations

from fastapi import APIRouter, Depends

from app.core.security import CurrentUser
from app.schemas.auth import (
    EmailOTPRequest,
    EmailOTPVerify,
    LoginRequest,
    PasswordResetConfirm,
    PasswordResetRequest,
    RefreshTokenRequest,
    SignupRequest,
    SignupResponse,
    TokenResponse,
)
from app.schemas.users import UserPublic
from app.services.auth_service import AuthService
from app.services.dependencies import (
    get_auth_service,
    get_otp_service,
    get_password_reset_service,
    get_refresh_service,
)

router = APIRouter(prefix="/auth", tags=["Auth"])


@router.post("/signup", response_model=SignupResponse, status_code=201)
async def signup(payload: SignupRequest, svc: AuthService = Depends(get_auth_service)) -> SignupResponse:
    user = await svc.signup(payload)
    return SignupResponse(
        message="Account created. Verification code sent to email.",
        user_id=user.id,
        email=user.email,
    )


@router.post("/signup/verify", response_model=UserPublic)
async def verify_signup(payload: EmailOTPVerify, svc: AuthService = Depends(get_auth_service)) -> UserPublic:
    user = await svc.verify_signup(payload.email, payload.otp)
    return UserPublic.model_validate(user)


@router.post("/signup/resend-otp")
async def resend_signup_otp(payload: EmailOTPRequest, otp=Depends(get_otp_service)) -> dict[str, str]:
    msg = await otp.request_email(payload.email, "signup")
    return {"message": msg}


@router.post(
    "/login",
    response_model=TokenResponse,
    summary="Login with email and password",
    responses={401: {"description": "Invalid email or password"}},
)
async def login(payload: LoginRequest, svc: AuthService = Depends(get_auth_service)) -> TokenResponse:
    _, access_token, refresh_token = await svc.authenticate(payload.email, payload.password)
    return TokenResponse(access_token=access_token, refresh_token=refresh_token or None)


@router.post("/refresh", response_model=TokenResponse)
async def refresh(payload: RefreshTokenRequest, svc=Depends(get_refresh_service)) -> TokenResponse:
    _, access_token, new_refresh_token = await svc.rotate(payload.refresh_token)
    return TokenResponse(access_token=access_token, refresh_token=new_refresh_token)


@router.post("/logout", status_code=204)
async def logout(payload: RefreshTokenRequest, svc=Depends(get_refresh_service)) -> None:
    await svc.revoke(payload.refresh_token)
    return None


@router.post("/forgot-password")
async def forgot(payload: PasswordResetRequest, svc=Depends(get_password_reset_service)) -> dict[str, str]:
    msg = await svc.request(payload.email)
    return {"message": msg}


@router.post("/reset-password")
async def reset(payload: PasswordResetConfirm, svc=Depends(get_password_reset_service)) -> dict[str, str]:
    await svc.reset(payload.email, payload.code, payload.new_password)
    return {"message": "Password reset successfully"}


@router.get(
    "/me",
    response_model=UserPublic,
    summary="Get the current authenticated user",
    description="Requires a valid bearer token.",
    responses={401: {"description": "Missing or invalid token"}},
)
async def get_me(current_user: CurrentUser) -> UserPublic:
    return current_user
