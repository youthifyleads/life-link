from app.core.domain import Role
from app.core.hashing import hash_password
from app.repositories.interfaces.user_repository import UserRepository
from app.repositories.models import UserRecord


class InMemoryUserRepository(UserRepository):
    """
    Temporary in-memory implementation so the API layer can be built and
    tested without the final SQL Server schema. Replace with a real
    SQL Server-backed repository once the ERD/user table is finalized -
    no service or route code should need to change.
    """

    def __init__(self) -> None:
        self._users: dict[str, UserRecord] = {}
        self._seed_dev_users()

    def _seed_dev_users(self) -> None:
        seed = [
            UserRecord(
                id="usr_hospital_1",
                email="hospital@lifelink.dev",
                full_name="Hospital Staff Demo",
                hashed_password=hash_password("password123"),
                role=Role.HOSPITAL_USER,
                institution_id="hospital_1",
            ),
            UserRecord(
                id="usr_bloodbank_1",
                email="bloodbank@lifelink.dev",
                full_name="Blood Bank Operator Demo",
                hashed_password=hash_password("password123"),
                role=Role.BLOOD_BANK_OPERATOR,
                institution_id="bloodbank_1",
            ),
            UserRecord(
                id="usr_admin_1",
                email="admin@lifelink.dev",
                full_name="Admin Demo",
                hashed_password=hash_password("password123"),
                role=Role.ADMIN,
            ),
        ]
        for user in seed:
            self._users[user.id] = user

    async def get_by_id(self, user_id: str) -> UserRecord | None:
        return self._users.get(user_id)

    async def get_by_email(self, email: str) -> UserRecord | None:
        for user in self._users.values():
            if user.email.lower() == email.lower():
                return user
        return None

    async def create(self, user: UserRecord) -> UserRecord:
        self._users[user.id] = user
        return user

    async def list_all(self) -> list[UserRecord]:
        return list(self._users.values())
