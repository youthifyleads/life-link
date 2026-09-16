from __future__ import annotations

from datetime import date, datetime
from pydantic import BaseModel, ConfigDict, Field

from app.core.domain import BloodBagStatus


class BloodBagCreate(BaseModel):
    blood_type: str = Field(min_length=2, max_length=3)
    component: str = Field(default="whole_blood", max_length=50)
    quantity: int = Field(default=1, ge=1)
    collection_date: date
    expiry_date: date | None = None
    current_location: str | None = None
    current_blood_bank_id: str | None = None
    donation_id: str | None = None


class BloodBagStatusUpdate(BaseModel):
    status: BloodBagStatus
    location: str | None = None
    notes: str | None = Field(default=None, max_length=1000)


class BloodBagPublic(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    blood_type: str
    component: str = "whole_blood"
    quantity: int
    collection_date: date
    expiry_date: date | None
    qr_code: str
    status: BloodBagStatus
    current_location: str | None
    current_blood_bank_id: str | None
    donation_id: str | None
    allocated_request_id: str | None = None


class BloodBagHistoryPublic(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    blood_bag_id: str
    status: BloodBagStatus
    changed_at: datetime
    changed_by_user_id: str
    location: str | None
    notes: str | None


class BloodBagQRScan(BaseModel):
    qr_code: str = Field(min_length=1, max_length=255)


class BloodBagQRPublic(BaseModel):
    blood_bag_id: str
    qr_payload: str


class BloodBagQRScanResponse(BaseModel):
    blood_bag: BloodBagPublic
    movement_history: list[BloodBagHistoryPublic]
