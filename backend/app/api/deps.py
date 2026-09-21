"""
Shared FastAPI dependencies used across multiple API route modules.
"""
from fastapi import Depends

from app.core.security import CurrentUser, OptionalCurrentUser
from app.repositories.interfaces.user_repository import UserRepository
from app.services.dependencies import get_user_repository


async def load_user_record(
    current_user: CurrentUser,
    user_repo: UserRepository = Depends(get_user_repository),
):
    """Resolve the authenticated user's full internal record from the repository."""
    return await user_repo.get_by_id(current_user.id)


async def load_optional_user_record(
    current_user: OptionalCurrentUser = None,
    user_repo: UserRepository = Depends(get_user_repository),
):
    """Resolve the authenticated user's record if a token was provided, else None."""
    if current_user:
        return await user_repo.get_by_id(current_user.id)
    return None
