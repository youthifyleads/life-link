from datetime import datetime
from pydantic import BaseModel, ConfigDict, Field


class DocumentPublic(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: str
    blood_request_id: str
    file_name: str
    status: str
    uploaded_at: datetime
    file_type: str | None
    file_path: str
    reviewed_at: datetime | None
    rejection_reason: str | None


class DocumentReview(BaseModel):
    approved: bool
    reason: str | None = Field(default=None, max_length=1000)
