"""
Authentication & authorization foundation.

PROVISIONAL: token strategy (plain JWT bearer, HS256, in-memory user store)
is a placeholder so the API layer and RBAC can be developed and tested
now. This is explicitly flagged for Technical Lead review before it is
treated as final - see docs/API_SPEC.md and the README "Provisional
decisions" section.
"""
from datetime import datetime, timedelta, timezone
from typing import Annotated

from fastapi import Depends
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
try:
    from jose import JWTError, jwt
except ImportError:  # local test fallback; production uses python-jose from requirements.txt
    import jwt
    JWTError = (jwt.InvalidTokenError, jwt.PyJWTError)

from app.core.config import get_settings
from app.core.domain import Role
from app.core.exceptions import ForbiddenError, UnauthorizedError
from app.core.hashing import hash_password, verify_password  # re-exported for convenience
from app.repositories.interfaces.user_repository import UserRepository
from app.schemas.users import UserPublic

__all__ = [
    "hash_password",
    "verify_password",
    "create_access_token",
    "decode_access_token",
    "get_current_user",
    "CurrentUser",
    "require_roles",
    "create_tracking_reference",
    "decode_tracking_reference",
]


def create_access_token(*, subject: str, role: str) -> str:
    settings = get_settings()
    expire = datetime.now(timezone.utc) + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode = {"sub": subject, "role": role, "exp": expire}
    return jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)


def decode_access_token(token: str) -> dict:
    settings = get_settings()
    try:
        return jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
    except JWTError:
        raise UnauthorizedError("Invalid or expired access token", code="INVALID_TOKEN")


def create_tracking_reference(request_id: str) -> str:
    """Create a signed opaque tracking token without adding a column to the supplied schema."""
    settings = get_settings()
    return jwt.encode({"sub": request_id, "typ": "tracking"}, settings.SECRET_KEY, algorithm=settings.ALGORITHM)


def decode_tracking_reference(reference: str) -> str | None:
    settings = get_settings()
    try:
        payload = jwt.decode(reference, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        if payload.get("typ") != "tracking" or not payload.get("sub"):
            return None
        return str(payload["sub"])
    except JWTError:
        return None


async def _get_user_repo_dep():
    # Imported lazily to avoid a module-level circular import:
    # core.security <-> services.dependencies <-> services.auth_service <-> core.security
    from app.services.dependencies import get_user_repository

    async for repo in get_user_repository():
        yield repo


bearer_scheme = HTTPBearer(auto_error=False)


async def get_current_user(
    credentials: HTTPAuthorizationCredentials | None = Depends(bearer_scheme),
    user_repo: UserRepository = Depends(_get_user_repo_dep),
) -> UserPublic:
    """Validate a bearer JWT and load the current user from the repository."""
    if credentials is None or credentials.scheme.lower() != "bearer":
        raise UnauthorizedError("Missing bearer token", code="MISSING_TOKEN")

    payload = decode_access_token(credentials.credentials)
    user_id = payload.get("sub")
    if user_id is None:
        raise UnauthorizedError("Invalid token payload", code="INVALID_TOKEN")

    try:
        user = await user_repo.get_by_id(user_id)
    except ValueError:
        raise UnauthorizedError("User role configuration is invalid", code="INVALID_USER_ROLE")
    if user is None:
        raise UnauthorizedError("User no longer exists", code="INVALID_TOKEN")

    if user.status.lower() in ("banned", "suspended"):
        raise UnauthorizedError("This account has been banned.", code="ACCOUNT_BANNED")
    if not user.is_active:
        raise UnauthorizedError("This account is inactive.", code="ACCOUNT_INACTIVE")

    return UserPublic.model_validate(user)

CurrentUser = Annotated[UserPublic, Depends(get_current_user)]


def require_roles(*allowed_roles: Role):
    """
    RBAC dependency factory.

    Usage: Depends(require_roles(Role.ADMIN, Role.PLATFORM_SUPPORT))

    Authorization is enforced here on the backend - the frontend/mobile
    apps must never be trusted to hide unauthorized actions instead.
    """

    async def _check(current_user: CurrentUser) -> UserPublic:
        if current_user.role not in allowed_roles:
            raise ForbiddenError(
                f"Role '{current_user.role.value}' is not permitted to perform this action",
                code="FORBIDDEN_ROLE",
            )
        return current_user

    return _check
