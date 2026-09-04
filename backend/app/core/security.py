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

from fastapi import Depends, Header
from jose import JWTError, jwt

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


def _get_user_repo_dep() -> UserRepository:
    # Imported lazily to avoid a module-level circular import:
    # core.security <-> services.dependencies <-> services.auth_service <-> core.security
    from app.services.dependencies import get_user_repository

    return get_user_repository()


async def get_current_user(
    authorization: Annotated[str | None, Header()] = None,
    user_repo: UserRepository = Depends(_get_user_repo_dep),
) -> UserPublic:
    """
    Reusable dependency: extracts and validates the bearer token, then
    loads the current user. Use this instead of duplicating auth logic
    in every endpoint.
    """
    if not authorization or not authorization.lower().startswith("bearer "):
        raise UnauthorizedError("Missing bearer token", code="MISSING_TOKEN")

    token = authorization.split(" ", 1)[1]
    payload = decode_access_token(token)
    user_id = payload.get("sub")
    if user_id is None:
        raise UnauthorizedError("Invalid token payload", code="INVALID_TOKEN")

    user = await user_repo.get_by_id(user_id)
    if user is None:
        raise UnauthorizedError("User no longer exists", code="INVALID_TOKEN")

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
