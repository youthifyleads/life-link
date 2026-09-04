from sqlalchemy import select
from sqlalchemy.orm import joinedload
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.models import RoleModel, UserModel, UserPhoneModel
from app.repositories.interfaces.user_repository import UserRepository
from app.repositories.models import UserRecord
from app.repositories.sqlalchemy._mappers import user_to_record


class SQLAlchemyUserRepository(UserRepository):
    def __init__(self, session: AsyncSession):
        self.session = session

    async def get_by_id(self, user_id: str) -> UserRecord | None:
        result = await self.session.execute(select(UserModel).options(joinedload(UserModel.role), joinedload(UserModel.phones)).where(UserModel.user_id == user_id))
        obj = result.scalar_one_or_none()
        return user_to_record(obj) if obj else None

    async def get_by_email(self, email: str) -> UserRecord | None:
        result = await self.session.execute(select(UserModel).options(joinedload(UserModel.role), joinedload(UserModel.phones)).where(UserModel.email == email.lower()))
        obj = result.scalar_one_or_none()
        return user_to_record(obj) if obj else None

    async def create(self, user: UserRecord) -> UserRecord:
        role_result = await self.session.execute(select(RoleModel).where(RoleModel.name == user.role.value))
        role = role_result.scalar_one_or_none()
        if role is None:
            role = RoleModel(role_id=f"role_{user.role.value}", name=user.role.value, description=user.role.value.replace("_", " ").title())
            self.session.add(role)
            await self.session.flush()
        obj = UserModel(
            user_id=user.id, email=user.email.lower(), password_hash=user.hashed_password,
            name=user.full_name, status="active" if user.is_active else "inactive",
            created_at=user.created_at if hasattr(user, "created_at") else __import__('datetime').datetime.now(__import__('datetime').timezone.utc),
            role_id=role.role_id,
            hospital_id=user.institution_id if user.role.value == "hospital_user" else None,
            blood_bank_id=user.institution_id if user.role.value == "blood_bank_operator" else None,
        )
        self.session.add(obj)
        if user.phone:
            self.session.add(UserPhoneModel(user_id=user.id, phone=user.phone))
        await self.session.commit()
        return user

    async def list_all(self) -> list[UserRecord]:
        result = await self.session.execute(select(UserModel).options(joinedload(UserModel.role), joinedload(UserModel.phones)).order_by(UserModel.created_at.desc()))
        return [user_to_record(o) for o in result.scalars().all()]
