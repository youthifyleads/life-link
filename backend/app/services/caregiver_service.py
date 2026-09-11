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
        # Admin/Medical Lead/Platform Support have oversight visibility and are
        # not necessarily scoped to one hospital (e.g. Admin usually has no
        # hospital_id at all) - filtering by current.hospital_id here used to
        # silently return an empty list for them instead of everything.
        if current.role.value in {"admin","medical_lead","platform_support"}: return await self.repo.list_all()
        return await self.repo.list_for_user(current.id)
    async def get(self,i,current):
        r=await self.repo.get_by_id(i)
        if not r: raise NotFoundError("Assignment not found",code="ASSIGNMENT_NOT_FOUND")
        # `current` is the UserPublic API schema, which exposes `institution_id`
        # (not `hospital_id`/`blood_bank_id`) - using the wrong attribute name
        # crashed with an unhandled 500 for any hospital/blood-bank/normal user
        # who was not themselves the assigned caregiver.
        if current.role.value not in {"admin","medical_lead","platform_support"} and r.caregiver_user_id!=current.id and r.hospital_id!=current.institution_id: raise ForbiddenError("You cannot access this assignment",code="FORBIDDEN_ASSIGNMENT_ACCESS")
        return r
    async def update(self,i,data,current):
        r=await self.get(i,current)
        for k,v in data.model_dump(exclude_unset=True).items(): setattr(r,k,v)
        return await self.repo.update(r)
