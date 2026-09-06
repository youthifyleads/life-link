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
