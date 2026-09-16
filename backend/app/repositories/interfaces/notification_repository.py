from abc import ABC, abstractmethod

from app.repositories.models import NotificationRecord


class NotificationRepository(ABC):
    @abstractmethod
    async def create(self, notification: NotificationRecord) -> NotificationRecord: ...

    @abstractmethod
    async def list_for_user(self, user_id: str) -> list[NotificationRecord]: ...

    @abstractmethod
    async def get_by_id(self, notification_id: str) -> NotificationRecord | None: ...

    @abstractmethod
    async def update(self, notification: NotificationRecord) -> NotificationRecord: ...
