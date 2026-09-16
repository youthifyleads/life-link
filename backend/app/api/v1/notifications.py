from fastapi import APIRouter, Depends

from app.core.exceptions import NotFoundError
from app.core.security import CurrentUser
from app.schemas.notifications import NotificationPublic
from app.services.dependencies import get_notification_service
from app.services.notification_service import NotificationService

router = APIRouter(prefix="/notifications", tags=["Notifications"])


@router.get(
    "",
    response_model=list[NotificationPublic],
    summary="List my notifications",
)
async def list_notifications(
    current_user: CurrentUser,
    notification_service: NotificationService = Depends(get_notification_service),
) -> list[NotificationPublic]:
    notifications = await notification_service.list_for_user(current_user.id)
    return [NotificationPublic.model_validate(n) for n in notifications]


@router.post(
    "/{notification_id}/read",
    response_model=NotificationPublic,
    summary="Mark a notification as read",
    responses={404: {"description": "Notification not found"}},
)
async def mark_notification_read(
    notification_id: str,
    current_user: CurrentUser,
    notification_service: NotificationService = Depends(get_notification_service),
) -> NotificationPublic:
    updated = await notification_service.mark_read(notification_id, current_user.id)
    if updated is None:
        raise NotFoundError("Notification was not found", code="NOTIFICATION_NOT_FOUND")
    return NotificationPublic.model_validate(updated)
