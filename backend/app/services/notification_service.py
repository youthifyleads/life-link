import uuid

from app.core.domain import NotificationTrigger
from app.repositories.interfaces.notification_repository import NotificationRepository
from app.repositories.models import NotificationRecord


class NotificationService:
    """
    Generates in-app notification records for known triggers.

    PROVISIONAL: delivery is limited to storing a record the user can
    fetch via GET /api/v1/notifications. Push/SMS/email provider
    integration is intentionally NOT wired in here yet so the backend
    isn't tightly coupled to a specific vendor - add a `_deliver()` hook
    when that decision is made, without touching call sites below.
    """

    def __init__(self, notification_repo: NotificationRepository):
        self._notification_repo = notification_repo

    async def notify(
        self,
        *,
        user_id: str,
        trigger: NotificationTrigger,
        message: str,
        related_request_id: str | None = None,
    ) -> NotificationRecord:
        record = NotificationRecord(
            id=f"notif_{uuid.uuid4().hex[:12]}",
            user_id=user_id,
            trigger=trigger,
            message=message,
            is_read=False,
            related_request_id=related_request_id,
        )
        return await self._notification_repo.create(record)

    async def list_for_user(self, user_id: str) -> list[NotificationRecord]:
        return await self._notification_repo.list_for_user(user_id)

    async def mark_read(self, notification_id: str, user_id: str) -> NotificationRecord | None:
        record = await self._notification_repo.get_by_id(notification_id)
        if record is None or record.user_id != user_id:
            return None
        record.is_read = True
        return await self._notification_repo.update(record)
