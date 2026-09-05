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
