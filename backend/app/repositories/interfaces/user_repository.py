from abc import ABC, abstractmethod

from app.repositories.models import UserRecord


class UserRepository(ABC):
    """
    Contract for user persistence. The SQL Server implementation (to be
    added once the final ERD/user table exists) must implement this
    same interface so services/API code never changes.
    """

    @abstractmethod
    async def get_by_id(self, user_id: str) -> UserRecord | None: ...

    @abstractmethod
    async def get_by_email(self, email: str) -> UserRecord | None: ...

    @abstractmethod
    async def create(self, user: UserRecord) -> UserRecord: ...

    @abstractmethod
    async def list_all(self) -> list[UserRecord]: ...
