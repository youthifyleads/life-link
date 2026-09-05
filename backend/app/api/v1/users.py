from fastapi import APIRouter, Depends

from app.core.domain import Role
from app.core.exceptions import ConflictError
from app.core.security import require_roles
from app.repositories.interfaces.user_repository import UserRepository
from app.repositories.models import UserRecord
from app.schemas.users import UserCreate, UserPublic
from app.services.dependencies import get_user_repository

router = APIRouter(prefix="/users", tags=["Users"])


@router.get(
    "",
    response_model=list[UserPublic],
    summary="List users",
    description="Admin only. Minimal foundation pending final user/institution ERD.",
    dependencies=[Depends(require_roles(Role.ADMIN))],
)
async def list_users(user_repo: UserRepository = Depends(get_user_repository)) -> list[UserPublic]:
    users = await user_repo.list_all()
    return [UserPublic.model_validate(u) for u in users]


@router.post(
    "",
    response_model=UserPublic,
    status_code=201,
    summary="Create a user",
    description="Admin only. PROVISIONAL: password hashing/storage strategy pending Technical Lead review.",
    dependencies=[Depends(require_roles(Role.ADMIN))],
    responses={409: {"description": "Email already registered"}},
)
async def create_user(payload: UserCreate, user_repo: UserRepository = Depends(get_user_repository)) -> UserPublic:
    from app.core.hashing import hash_password
    import uuid

    existing = await user_repo.get_by_email(payload.email)
    if existing is not None:
        raise ConflictError("A user with this email already exists", code="EMAIL_ALREADY_EXISTS")

    record = UserRecord(
        id=f"usr_{uuid.uuid4().hex[:12]}",
        email=payload.email,
        full_name=payload.full_name,
        hashed_password=hash_password(payload.password),
        role=payload.role,
        institution_id=payload.institution_id,
    )
    created = await user_repo.create(record)
    return UserPublic.model_validate(created)
