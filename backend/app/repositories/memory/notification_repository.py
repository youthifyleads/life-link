from app.repositories.interfaces.notification_repository import NotificationRepository
from app.repositories.models import NotificationRecord


class InMemoryNotificationRepository(NotificationRepository):
    """Temporary in-memory implementation - see InMemoryUserRepository docstring."""

    def __init__(self) -> None:
        self._notifications: dict[str, NotificationRecord] = {}

    async def create(self, notification: NotificationRecord) -> NotificationRecord:
        self._notifications[notification.id] = notification
        return notification

    async def list_for_user(self, user_id: str) -> list[NotificationRecord]:
        values = [n for n in self._notifications.values() if n.user_id == user_id]
        return sorted(values, key=lambda n: n.created_at, reverse=True)

    async def get_by_id(self, notification_id: str) -> NotificationRecord | None:
        return self._notifications.get(notification_id)

    async def update(self, notification: NotificationRecord) -> NotificationRecord:
        self._notifications[notification.id] = notification
        return notification
