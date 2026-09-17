from __future__ import annotations

from pydantic import BaseModel, Field


class DeviceTokenCreate(BaseModel):
    token: str = Field(min_length=10, max_length=500)
    provider: str = Field(default="fcm", pattern="^(fcm|onesignal|apns)$")
