from datetime import date, datetime
from decimal import Decimal
from pydantic import BaseModel, Field, field_validator
from app.core.domain import BloodType, VALID_BLOOD_TYPES

VALID_ELIGIBILITY_STATUSES = {"eligible", "ineligible", "unknown"}

class DonorCreate(BaseModel):
    blood_type: BloodType | None = Field(default=None, description="Blood type", examples=[BloodType.O_POS])
    date_of_birth: date | None = None
    governorate: str | None = Field(default=None, max_length=100, examples=["Cairo"])
    latitude: float | None = Field(default=None, ge=-90.0, le=90.0)
    longitude: float | None = Field(default=None, ge=-180.0, le=180.0)

    @field_validator("governorate", mode="before")
    @classmethod
    def clean_governorate(cls, value: object) -> object:
        if isinstance(value, str):
            val = value.strip()
            if val.lower() in ("", "string", "null", "none"):
                return None
            return val
        return value

    @field_validator("blood_type", mode="before")
    @classmethod
    def validate_blood_type(cls, value: object) -> object:
        if value is None or value == "":
            return None
        if isinstance(value, str):
            clean = value.strip().upper()
            if clean in ("", "STRING", "STR", "NULL", "NONE"):
                return None
            if clean not in VALID_BLOOD_TYPES:
                raise ValueError(f"blood_type must be one of: {', '.join(sorted(VALID_BLOOD_TYPES))}")
            return clean
        return value

class DonorUpdate(BaseModel):
    blood_type: BloodType | None = Field(default=None, description="Blood type", examples=[BloodType.O_POS])
    date_of_birth: date | None = None
    governorate: str | None = Field(default=None, max_length=100, examples=["Cairo"])
    eligibility_status: str | None = Field(default=None, max_length=60)
    latitude: float | None = Field(default=None, ge=-90.0, le=90.0)
    longitude: float | None = Field(default=None, ge=-180.0, le=180.0)

    @field_validator("governorate", mode="before")
    @classmethod
    def clean_governorate(cls, value: object) -> object:
        if isinstance(value, str):
            val = value.strip()
            if val.lower() in ("", "string", "null", "none"):
                return None
            return val
        return value

    @field_validator("blood_type", mode="before")
    @classmethod
    def validate_blood_type(cls, value: object) -> object:
        if value is None or value == "":
            return None
        if isinstance(value, str):
            clean = value.strip().upper()
            if clean in ("", "STRING", "STR", "NULL", "NONE"):
                return None
            if clean not in VALID_BLOOD_TYPES:
                raise ValueError(f"blood_type must be one of: {', '.join(sorted(VALID_BLOOD_TYPES))}")
            return clean
        return value

    @field_validator("eligibility_status", mode="before")
    @classmethod
    def validate_eligibility_status(cls, value: object) -> object:
        if value is None:
            return None
        if isinstance(value, str):
            clean = value.strip().lower()
            if clean in ("pending", "active"):
                return "eligible"
            if clean not in VALID_ELIGIBILITY_STATUSES:
                raise ValueError(f"eligibility_status must be one of: {', '.join(sorted(VALID_ELIGIBILITY_STATUSES))}")
            return clean
        return value

class DonorPublic(BaseModel):
    id: str
    user_id: str
    blood_type: str | None
    date_of_birth: date | None
    governorate: str | None
    eligibility_status: str
    last_donation_date: date | None
    latitude: float | None = None
    longitude: float | None = None

class MatchingDonorPublic(BaseModel):
    donor_id: str
    user_id: str
    full_name: str
    phone: str | None = None
    blood_type: str
    governorate: str | None = None
    distance_km: float | None = None
    eligibility_status: str
    last_donation_date: date | None = None
    days_since_last_donation: int | None = None


class NearbyBloodRequestPublic(BaseModel):
    request_id: str
    hospital_name: str
    governorate: str | None = None
    blood_type: str
    component: str
    quantity_units: int
    urgency: bool
    distance_km: float | None = None
    notes: str | None = None
    created_at: datetime


class NotifyMatchingDonorsRequest(BaseModel):
    count: int = Field(default=5, ge=1, le=50, description="Number of closest matching donors to notify")
    exact_match: bool = Field(default=False, description="If True, only exact blood type matches; if False, clinical compatibility")
    max_distance_km: float | None = Field(default=None, description="Optional maximum distance filter in km")


class NotifyMatchingDonorsResponse(BaseModel):
    request_id: str
    total_notified: int
    notified_donors: list[MatchingDonorPublic]

class DonationCreate(BaseModel):
    blood_type: str = Field(min_length=2, max_length=3)
    quantity: Decimal = Field(gt=0, le=1000)
    donation_date: date
    donor_id: str | None = None
    blood_bank_id: str
    status: str = Field(default="completed", max_length=40)

class DonationPublic(BaseModel):
    id: str
    blood_type: str
    quantity: Decimal
    donation_date: date
    status: str
    created_at: datetime
    donor_id: str
    blood_bank_id: str

class DonationResponseCreate(BaseModel):
    blood_request_id: str
    status: str = Field(default="accepted", max_length=40)
    notes: str | None = Field(default=None, max_length=1000)

class DonationResponsePublic(BaseModel):
    id: str
    response_date: datetime
    status: str
    notes: str | None
    blood_request_id: str
    donor_id: str

class ConsentCreate(BaseModel):
    consent_type: str = Field(min_length=1, max_length=100)
    granted: bool

class ConsentPublic(BaseModel):
    id: str
    donor_id: str
    consent_type: str
    granted: bool
    granted_at: datetime | None
    revoked_at: datetime | None
