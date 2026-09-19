from datetime import datetime
from typing import Any

from pydantic import BaseModel, ConfigDict, Field, computed_field, field_validator

from app.core.domain import BloodType, RequestStatus, VALID_BLOOD_TYPES


class BloodRequestCreate(BaseModel):
    blood_type: str = Field(..., examples=["O+", "A-", "AB+"], min_length=2, max_length=3)
    component: str = Field(default="whole_blood", examples=["whole_blood", "plasma", "platelets", "red_cells"])
    quantity_units: int = Field(..., gt=0, le=100)
    urgency: bool = Field(default=False, description="Marks the request as urgent for escalation/notification purposes")
    notes: str | None = Field(default=None, max_length=1000)
    reason: str | None = Field(default=None, max_length=1000)
    required_by: datetime | None = Field(default=None, examples=["2026-12-31T23:59:59Z"])

    @field_validator("blood_type", mode="before")
    @classmethod
    def parse_blood_type(cls, value: object) -> str:
        if isinstance(value, str):
            clean = value.strip().upper()
            return clean
        return str(value)

    @field_validator("urgency", mode="before")
    @classmethod
    def parse_urgency(cls, value: object) -> bool:
        if isinstance(value, bool):
            return value
        if isinstance(value, str):
            return value.strip().lower() in ("true", "1", "urgent", "emergency", "critical", "yes")
        return bool(value)

    @field_validator("component", mode="before")
    @classmethod
    def parse_component(cls, value: object) -> str:
        if not value or str(value).strip().lower() in ("", "none", "null", "undefined"):
            return "whole_blood"
        val = str(value).strip().lower()
        mapping = {
            "red blood cells": "red_cells",
            "red_blood_cells": "red_cells",
            "rbc": "red_cells",
            "whole blood": "whole_blood",
            "fresh frozen plasma": "plasma",
        }
        return mapping.get(val, val)


class BloodRequestPublic(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    hospital_id: str
    blood_type: str
    component: str
    quantity_units: int
    urgency: bool
    notes: str | None
    reason: str | None = None
    unit_price: float | None = None
    required_by: datetime | None = None
    status: RequestStatus
    tracking_reference: str
    created_by: str
    created_at: datetime
    updated_at: datetime

    @computed_field
    @property
    def total_amount(self) -> float | None:
        if self.unit_price is not None and self.quantity_units is not None:
            return round(float(self.quantity_units) * float(self.unit_price), 2)
        return None


class RequestActionPayload(BaseModel):
    """Optional free-text reason for a lifecycle action (cancel/etc)."""

    reason: str | None = Field(default=None, max_length=500)


class RequestAcknowledgePayload(BaseModel):
    """Payload for Blood Bank Operator acknowledging a request, including unit price."""

    unit_price: float | None = Field(
        default=None, gt=0, description="Price per blood bag/unit determined by blood bank"
    )
    notes: str | None = Field(default=None, max_length=1000)
    reason: str | None = Field(default=None, max_length=500)


class RequestSetPricePayload(BaseModel):
    """Payload for Blood Bank Operator setting or updating unit price."""

    unit_price: float = Field(..., gt=0, description="Price per blood bag/unit determined by blood bank")


class RequestAllocateBagPayload(BaseModel):
    barcode: str = Field(..., min_length=1, max_length=255, description="Scanned barcode or QR code of the blood bag")


class RequestDispatchPayload(BaseModel):
    notes: str | None = Field(default=None, max_length=1000)


class RequestReceivePayload(BaseModel):
    notes: str | None = Field(default=None, max_length=1000)


class RequestAllocateBagResponse(BaseModel):
    message: str
    request_id: str
    allocated_bag_id: str
    blood_type: str
    component: str
    currently_allocated: int
    required_quantity: int
    is_fulfilled: bool


class RequestDeallocateBagPayload(BaseModel):
    barcode: str = Field(..., min_length=1, max_length=255, description="Barcode or QR of the blood bag to deallocate")
    reason: str | None = Field(default=None, max_length=500, description="Reason for deallocation")


class RequestDeallocateBagResponse(BaseModel):
    request_id: str
    deallocated_bag_id: str
    barcode: str
    status: str
    currently_allocated: int
    required_quantity: int
    is_fulfilled: bool


class RequestCancelPayload(BaseModel):
    reason: str | None = Field(default=None, max_length=500, description="Reason for cancellation")

