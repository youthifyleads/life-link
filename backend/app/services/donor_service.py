from datetime import datetime, timezone
from uuid import uuid4
from app.core.exceptions import ConflictError, NotFoundError, ForbiddenError
from app.repositories.interfaces.donor_repository import DonorRepository
from app.repositories.interfaces.user_repository import UserRepository
from app.repositories.models import *
class DonorService:
    def __init__(self,repo:DonorRepository,user_repo:UserRepository): self.repo=repo; self.user_repo=user_repo
    async def get_me(self,user_id): return await self.repo.get_by_user_id(user_id)
    async def create_for_user(self,user_id,data):
        if await self.repo.get_by_user_id(user_id): raise ConflictError("Donor profile already exists",code="DONOR_ALREADY_EXISTS")
        return await self.repo.create(DonorRecord(str(uuid4()),user_id,data.blood_type,data.date_of_birth,data.governorate,"pending",None))
    async def update(self,user_id,data):
        d=await self.repo.get_by_user_id(user_id)
        if not d: raise NotFoundError("Donor profile not found",code="DONOR_NOT_FOUND")
        for k,v in data.model_dump(exclude_unset=True).items(): setattr(d,k,v)
        return await self.repo.update(d)
    async def get(self,i):
        d=await self.repo.get_by_id(i)
        if not d: raise NotFoundError("Donor not found",code="DONOR_NOT_FOUND")
        return d
    async def donations(self,user_id):
        d=await self.repo.get_by_user_id(user_id)
        if not d: raise NotFoundError("Donor profile not found",code="DONOR_NOT_FOUND")
        return await self.repo.list_donations(d.id)
    async def create_donation(self,user_id,data):
        donor=await self.repo.get_by_user_id(user_id)
        if not donor: raise NotFoundError("Donor profile not found",code="DONOR_NOT_FOUND")
        donor_id=donor.id
        r=DonationRecord(str(uuid4()),data.blood_type,data.quantity,data.donation_date,data.status,datetime.now(timezone.utc),donor_id,data.blood_bank_id)
        donor.last_donation_date=data.donation_date; donor.eligibility_status="eligible"
        await self.repo.update(donor); return await self.repo.create_donation(r)
    async def respond(self,user_id,data):
        donor=await self.repo.get_by_user_id(user_id)
        if not donor: raise NotFoundError("Donor profile not found",code="DONOR_NOT_FOUND")
        return await self.repo.create_response(DonationResponseRecord(str(uuid4()),datetime.now(timezone.utc),data.status,data.notes,data.blood_request_id,donor.id))
    async def responses(self,user_id):
        d=await self.repo.get_by_user_id(user_id)
        if not d: raise NotFoundError("Donor profile not found",code="DONOR_NOT_FOUND")
        return await self.repo.list_responses(d.id)
    async def add_consent(self,user_id,data):
        d=await self.repo.get_by_user_id(user_id)
        if not d: raise NotFoundError("Donor profile not found",code="DONOR_NOT_FOUND")
        now=datetime.now(timezone.utc) if data.granted else None
        return await self.repo.create_consent(ConsentRecord(str(uuid4()),d.id,data.consent_type,data.granted,now,None))
    async def consents(self,user_id):
        d=await self.repo.get_by_user_id(user_id)
        if not d: raise NotFoundError("Donor profile not found",code="DONOR_NOT_FOUND")
        return await self.repo.list_consents(d.id)
