from pydantic import BaseModel, ConfigDict, EmailStr, Field

from app.core.domain import Role


class UserPublic(BaseModel):
    """Safe representation of a user returned by the API. Never includes password hash."""

    model_config = ConfigDict(from_attributes=True)

    id: str
    email: EmailStr
    full_name: str
    role: Role
    institution_id: str | None = Field(
        default=None,
        description="Scoping id for the user's hospital/blood bank. Final shape depends on the ERD.",
    )
    is_active: bool = True


class UserCreate(BaseModel):
    email: EmailStr
    full_name: str = Field(min_length=1, max_length=200)
    password: str = Field(min_length=8, max_length=128)
    role: Role
    institution_id: str | None = None
