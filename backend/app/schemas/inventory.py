from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field


class InventoryItemCreate(BaseModel):
    blood_bank_id: str
    blood_type: str = Field(..., min_length=2, max_length=3)
    component: str
    quantity_units: int = Field(..., ge=0, le=100000)
    expiry_date: datetime | None = Field(
        default=None, description="Used for FEFO ordering if/when enabled; optional in MVP."
    )


class InventoryItemUpdate(BaseModel):
    quantity_units: int | None = Field(default=None, ge=0, le=100000)
    is_available: bool | None = None


class InventoryItemPublic(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    blood_bank_id: str
    blood_type: str
    component: str
    quantity_units: int
    is_available: bool
    expiry_date: datetime | None
    last_updated: datetime
