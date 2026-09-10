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
        pwd = hash_password("Test@123")
        seed = [
            UserRecord(
                id="usr_admin_1", email="admin@lifelink.dev", full_name="System Admin Demo",
                hashed_password=pwd, role=Role.ADMIN, status="active", is_active=True,
            ),
            UserRecord(
                id="usr_hospital_1", email="hospital@lifelink.dev", full_name="Hospital Staff Demo",
                hashed_password=pwd, role=Role.HOSPITAL_USER, institution_id="hospital_1",
                hospital_id="hospital_1", status="active", is_active=True,
            ),
            UserRecord(
                id="usr_bloodbank_1", email="bloodbank@lifelink.dev", full_name="Blood Bank Demo",
                hashed_password=pwd, role=Role.BLOOD_BANK_OPERATOR, institution_id="bloodbank_1",
                blood_bank_id="bloodbank_1", status="active", is_active=True,
            ),
            UserRecord(
                id="usr_medical_1", email="medicallead@lifelink.dev", full_name="Medical Lead Demo",
                hashed_password=pwd, role=Role.MEDICAL_LEAD, institution_id="hospital_1",
                hospital_id="hospital_1", status="active", is_active=True,
            ),
            UserRecord(
                id="usr_support_1", email="support@lifelink.dev", full_name="Platform Support Demo",
                hashed_password=pwd, role=Role.PLATFORM_SUPPORT, status="active", is_active=True,
            ),
            UserRecord(
                id="usr_donor_1", email="donor@lifelink.dev", full_name="Donor & Caregiver Demo",
                hashed_password=pwd, role=Role.NORMAL_USER, status="active", is_active=True, phone="01000000003",
            ),
            UserRecord(
                id="usr_normal_1", email="user@lifelink.dev", full_name="Normal User Demo",
                hashed_password=pwd, role=Role.NORMAL_USER, status="active", is_active=True, phone="01000000005",
            ),
            UserRecord(
                id="usr_banned_1", email="banned@lifelink.dev", full_name="Banned User Demo",
                hashed_password=pwd, role=Role.NORMAL_USER, status="banned", is_active=False, phone="01000000004",
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

    async def get_by_phone(self, phone: str) -> UserRecord | None:
        for user in self._users.values():
            if user.phone == phone:
                return user
        return None

    async def create(self, user: UserRecord) -> UserRecord:
        self._users[user.id] = user
        return user

    async def list_all(self) -> list[UserRecord]:
        return list(self._users.values())
