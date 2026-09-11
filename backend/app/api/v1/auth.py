from fastapi import APIRouter, Depends

from app.core.security import CurrentUser
from app.schemas.auth import LoginRequest, TokenResponse
from app.schemas.users import UserPublic
from app.services.auth_service import AuthService
from app.services.dependencies import get_auth_service

router = APIRouter(prefix="/auth", tags=["Auth"])


@router.post(
    "/login",
    response_model=TokenResponse,
    summary="Login with email and password",
    description="PROVISIONAL: issues a bearer JWT. Token strategy pending Technical Lead review.",
    responses={401: {"description": "Invalid email or password"}},
)
async def login(payload: LoginRequest, auth_service: AuthService = Depends(get_auth_service)) -> TokenResponse:
    _, token = await auth_service.authenticate(payload.email, payload.password)
    return TokenResponse(access_token=token)


@router.get(
    "/me",
    response_model=UserPublic,
    summary="Get the current authenticated user",
    description="Requires a valid bearer token.",
    responses={401: {"description": "Missing or invalid token"}},
)
async def get_me(current_user: CurrentUser) -> UserPublic:
    return current_user
