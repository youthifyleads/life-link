from datetime import datetime
from pydantic import BaseModel, Field

class CaregiverAssignmentCreate(BaseModel):
    blood_bag_id: str
    caregiver_user_id: str
    hospital_id: str
    assignment_date: datetime | None = None
    status: str = Field(default="assigned", max_length=40)
    notes: str | None = Field(default=None, max_length=1000)

class CaregiverAssignmentUpdate(BaseModel):
    status: str | None = Field(default=None, max_length=40)
    notes: str | None = Field(default=None, max_length=1000)
    assignment_date: datetime | None = None

class CaregiverAssignmentPublic(CaregiverAssignmentCreate):
    id: str


class CaregiverBagScanRequest(BaseModel):
    qr_code: str = Field(..., description="QR code payload or blood bag ID")


class CaregiverBagScanPublic(BaseModel):
    blood_bag_id: str | None = None
    request_id: str | None = None
    blood_type: str
    component: str | None = None
    quantity: int = 1
    status: str
    bank_name: str
    bank_location: str
    qr_code: str | None = None
    unit_price: float | None = None
    total_price: float | None = None
    payment_status: str = "unpaid"
    payment_url: str | None = None
