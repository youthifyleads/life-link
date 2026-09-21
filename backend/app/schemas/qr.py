from datetime import datetime

from pydantic import BaseModel

from app.core.domain import RequestStatus


class QRIssueResponse(BaseModel):
    reference: str
    qr_payload: str  # opaque string the client encodes into a QR image; never a raw DB id
    request_id: str


class QRScanRequest(BaseModel):
    reference: str


class TrackingPublic(BaseModel):
    """
    Deliberately minimal: no patient identity, no unnecessary medical
    information. Only what an authorized scanner needs to see.
    """

    reference: str
    status: RequestStatus
    blood_type: str
    component: str
    last_updated: datetime
    request_id: str | None = None
    unit_price: float | None = None
    total_price: float | None = None
    payment_status: str | None = "unpaid"
    bank_name: str | None = None
    patient_name: str | None = None
    medical_record_number: str | None = None
