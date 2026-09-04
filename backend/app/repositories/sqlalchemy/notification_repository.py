from datetime import datetime, timezone
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.models import NotificationModel
from app.repositories.interfaces.notification_repository import NotificationRepository
from app.repositories.models import NotificationRecord
from app.repositories.sqlalchemy._mappers import notification_to_record


class SQLAlchemyNotificationRepository(NotificationRepository):
    def __init__(self, session: AsyncSession):
        self.session = session

    async def create(self, notification: NotificationRecord) -> NotificationRecord:
        obj = NotificationModel(
            notification_id=notification.id, user_id=notification.user_id,
            title=notification.trigger.value.replace("_", " ").title(),
            type=notification.trigger.value, message=notification.message,
            status="read" if notification.is_read else "unread",
            read_at=None, created_at=notification.created_at,
        )
        self.session.add(obj)
        await self.session.commit()
        return notification

    async def list_for_user(self, user_id: str) -> list[NotificationRecord]:
        result = await self.session.execute(select(NotificationModel).where(NotificationModel.user_id == user_id).order_by(NotificationModel.created_at.desc()))
        return [notification_to_record(o) for o in result.scalars().all()]

    async def get_by_id(self, notification_id: str) -> NotificationRecord | None:
        result = await self.session.execute(select(NotificationModel).where(NotificationModel.notification_id == notification_id))
        obj = result.scalar_one_or_none()
        return notification_to_record(obj) if obj else None

    async def update(self, notification: NotificationRecord) -> NotificationRecord:
        result = await self.session.execute(select(NotificationModel).where(NotificationModel.notification_id == notification.id))
        obj = result.scalar_one_or_none()
        if obj is None:
            return notification
        obj.status = "read" if notification.is_read else "unread"
        obj.read_at = datetime.now(timezone.utc) if notification.is_read else None
        await self.session.commit()
        return notification
