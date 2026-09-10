from sqlalchemy import select
from sqlalchemy.orm import joinedload
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.domain import Role
from app.db.models import RoleModel, UserModel, UserPhoneModel
from app.repositories.interfaces.user_repository import UserRepository
from app.repositories.models import UserRecord
from app.repositories.sqlalchemy._mappers import role_to_db_aliases, user_to_record


class SQLAlchemyUserRepository(UserRepository):
    def __init__(self, session: AsyncSession):
        self.session = session

    async def get_by_id(self, user_id: str) -> UserRecord | None:
        result = await self.session.execute(
            select(UserModel)
            .options(joinedload(UserModel.role), joinedload(UserModel.phones))
            .where(UserModel.user_id == user_id)
        )
        obj = result.unique().scalar_one_or_none()  
        return user_to_record(obj) if obj else None

    async def get_by_email(self, email: str) -> UserRecord | None:
        result = await self.session.execute(select(UserModel).options(joinedload(UserModel.role), joinedload(UserModel.phones)).where(UserModel.email == email.lower()))
        obj = result.unique().scalar_one_or_none()
        return user_to_record(obj) if obj else None

    async def get_by_phone(self, phone: str) -> UserRecord | None:
        result = await self.session.execute(select(UserModel).options(joinedload(UserModel.role), joinedload(UserModel.phones)).join(UserPhoneModel).where(UserPhoneModel.phone == phone))
        obj = result.unique().scalar_one_or_none()
        return user_to_record(obj) if obj else None

    async def create(self, user: UserRecord):
        aliases = role_to_db_aliases(user.role)
        role_result = await self.session.execute(select(RoleModel).where(RoleModel.name.in_(aliases)))
        role = role_result.scalars().first()
        import uuid
        if role is None:
            db_name = aliases[0]
            role = RoleModel(role_id=str(uuid.uuid4()), name=db_name, description=db_name.replace("_", " ").title())
            self.session.add(role)
            await self.session.flush()

        try:
            uid = str(uuid.UUID(user.id))
        except (ValueError, TypeError):
            uid = str(uuid.uuid4())
            user.id = uid

        obj = UserModel(
            user_id=uid, email=user.email.lower(), password_hash=user.hashed_password,
            name=user.full_name, status="active" if user.is_active else "inactive",
            created_at=user.created_at if hasattr(user, "created_at") else __import__('datetime').datetime.now(__import__('datetime').timezone.utc),
            role_id=role.role_id,
            hospital_id=user.hospital_id or (user.institution_id if user.role == Role.HOSPITAL_USER else None),
            blood_bank_id=user.blood_bank_id or (user.institution_id if user.role == Role.BLOOD_BANK_OPERATOR else None),
        )
        self.session.add(obj)
        if user.phone:
            self.session.add(UserPhoneModel(user_id=user.id, phone=user.phone))
        await self.session.commit()
        return user

    async def list_all(self) -> list[UserRecord]:
        result = await self.session.execute(select(UserModel).options(joinedload(UserModel.role), joinedload(UserModel.phones)).order_by(UserModel.created_at.desc()))
        return [user_to_record(o) for o in result.scalars().all()]
