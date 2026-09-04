from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field

from app.core.domain import RequestStatus


class BloodRequestCreate(BaseModel):
    blood_type: str = Field(..., examples=["O+", "A-", "AB+"], min_length=2, max_length=3)
    component: str = Field(..., examples=["whole_blood", "plasma", "platelets", "red_cells"])
    quantity_units: int = Field(..., gt=0, le=100)
    urgency: bool = Field(default=False, description="Marks the request as urgent for escalation/notification purposes")
    notes: str | None = Field(default=None, max_length=1000)


class BloodRequestPublic(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    hospital_id: str
    blood_type: str
    component: str
    quantity_units: int
    urgency: bool
    notes: str | None
    status: RequestStatus
    tracking_reference: str
    created_by: str
    created_at: datetime
    updated_at: datetime


class RequestActionPayload(BaseModel):
    """Optional free-text reason for a lifecycle action (acknowledge/cancel/etc)."""

    reason: str | None = Field(default=None, max_length=500)
