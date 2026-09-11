from datetime import datetime

from pydantic import BaseModel, ConfigDict

from app.core.domain import NotificationTrigger


class NotificationPublic(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    user_id: str
    trigger: NotificationTrigger
    message: str
    is_read: bool
    related_request_id: str | None
    created_at: datetime
