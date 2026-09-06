from datetime import datetime, timezone
from uuid import uuid4
from app.core.exceptions import NotFoundError, ForbiddenError
from app.repositories.interfaces.caregiver_repository import CaregiverRepository
from app.repositories.interfaces.user_repository import UserRepository
from app.repositories.models import CaregiverAssignmentRecord
class CaregiverService:
    def __init__(self,repo,user_repo): self.repo=repo; self.user_repo=user_repo
    async def create(self,data,current):
        user=await self.user_repo.get_by_id(data.caregiver_user_id)
        if not user: raise NotFoundError("Caregiver user not found",code="CAREGIVER_NOT_FOUND")
        return await self.repo.create(CaregiverAssignmentRecord(str(uuid4()),data.assignment_date or datetime.now(timezone.utc),data.status,data.notes,data.blood_bag_id,data.caregiver_user_id,data.hospital_id))
    async def list(self,current):
        if current.role.value in {"admin","medical_lead","platform_support"}: return await self.repo.list_for_hospital(current.hospital_id) if current.hospital_id else []
        return await self.repo.list_for_user(current.id)
    async def get(self,i,current):
        r=await self.repo.get_by_id(i)
        if not r: raise NotFoundError("Assignment not found",code="ASSIGNMENT_NOT_FOUND")
        if current.role.value not in {"admin","medical_lead","platform_support"} and r.caregiver_user_id!=current.id and r.hospital_id!=current.hospital_id: raise ForbiddenError("You cannot access this assignment",code="FORBIDDEN_ASSIGNMENT_ACCESS")
        return r
    async def update(self,i,data,current):
        r=await self.get(i,current)
        for k,v in data.model_dump(exclude_unset=True).items(): setattr(r,k,v)
        return await self.repo.update(r)
