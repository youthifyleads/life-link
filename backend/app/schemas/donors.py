from datetime import date, datetime
from decimal import Decimal
from pydantic import BaseModel, Field

class DonorCreate(BaseModel):
    blood_type: str | None = Field(default=None, min_length=2, max_length=3)
    date_of_birth: date | None = None
    governorate: str | None = Field(default=None, max_length=100)

class DonorUpdate(BaseModel):
    blood_type: str | None = Field(default=None, min_length=2, max_length=3)
    date_of_birth: date | None = None
    governorate: str | None = Field(default=None, max_length=100)
    eligibility_status: str | None = Field(default=None, max_length=60)

class DonorPublic(BaseModel):
    id: str
    user_id: str
    blood_type: str | None
    date_of_birth: date | None
    governorate: str | None
    eligibility_status: str
    last_donation_date: date | None

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

class VoucherCreate(BaseModel):
    donation_id: str
    voucher_number: str = Field(min_length=1, max_length=100)
    status: str = Field(default="issued", max_length=40)

class VoucherPublic(BaseModel):
    id: str
    voucher_number: str
    issued_at: datetime
    status: str
    donation_id: str
