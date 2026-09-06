from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.models import DonorModel, DonationModel, DonationResponseModel, ConsentModel, DonationVoucherModel
from app.repositories.interfaces.donor_repository import DonorRepository
from app.repositories.models import DonorRecord, DonationRecord, DonationResponseRecord, ConsentRecord, DonationVoucherRecord

class SQLAlchemyDonorRepository(DonorRepository):
    def __init__(self, session: AsyncSession): self.session=session
    def dm(self,o): return DonorRecord(o.donor_id,o.user_id,o.blood_type,o.date_of_birth,o.governorate,o.eligibility_status or "pending",o.last_donation_date)
    def dnm(self,o): return DonationRecord(o.donation_id,o.blood_type,o.quantity,o.donation_date,o.status or "completed",o.created_at,o.donor_id,o.blood_bank_id)
    async def get_by_id(self,i): return (lambda o:self.dm(o) if o else None)((await self.session.execute(select(DonorModel).where(DonorModel.donor_id==i))).scalar_one_or_none())
    async def get_by_user_id(self,u): return (lambda o:self.dm(o) if o else None)((await self.session.execute(select(DonorModel).where(DonorModel.user_id==u))).scalar_one_or_none())
    async def create(self,r): self.session.add(DonorModel(donor_id=r.id,user_id=r.user_id,blood_type=r.blood_type,date_of_birth=r.date_of_birth,governorate=r.governorate,eligibility_status=r.eligibility_status,last_donation_date=r.last_donation_date)); await self.session.commit(); return r
    async def update(self,r):
        o=(await self.session.execute(select(DonorModel).where(DonorModel.donor_id==r.id))).scalar_one(); o.blood_type=r.blood_type; o.date_of_birth=r.date_of_birth; o.governorate=r.governorate; o.eligibility_status=r.eligibility_status; o.last_donation_date=r.last_donation_date; await self.session.commit(); return r
    async def list_all(self): return [self.dm(o) for o in (await self.session.execute(select(DonorModel))).scalars().all()]
    async def list_donations(self,i): return [self.dnm(o) for o in (await self.session.execute(select(DonationModel).where(DonationModel.donor_id==i).order_by(DonationModel.donation_date.desc()))).scalars().all()]
    async def create_donation(self,r): self.session.add(DonationModel(donation_id=r.id,blood_type=r.blood_type,quantity=r.quantity,donation_date=r.donation_date,status=r.status,created_at=r.created_at,donor_id=r.donor_id,blood_bank_id=r.blood_bank_id)); await self.session.commit(); return r
    async def get_donation(self,i):
        o=(await self.session.execute(select(DonationModel).where(DonationModel.donation_id==i))).scalar_one_or_none(); return self.dnm(o) if o else None
    async def list_responses(self,i): return [DonationResponseRecord(o.response_id,o.response_date,o.status,o.notes,o.blood_request_id,o.donor_id) for o in (await self.session.execute(select(DonationResponseModel).where(DonationResponseModel.donor_id==i).order_by(DonationResponseModel.response_date.desc()))).scalars().all()]
    async def create_response(self,r): self.session.add(DonationResponseModel(response_id=r.id,response_date=r.response_date,status=r.status,notes=r.notes,blood_request_id=r.blood_request_id,donor_id=r.donor_id)); await self.session.commit(); return r
    async def create_consent(self,r): self.session.add(ConsentModel(consent_id=r.id,donor_id=r.donor_id,consent_type=r.consent_type,granted=r.granted,granted_at=r.granted_at,revoked_at=r.revoked_at)); await self.session.commit(); return r
    async def list_consents(self,i): return [ConsentRecord(o.consent_id,o.donor_id,o.consent_type,o.granted,o.granted_at,o.revoked_at) for o in (await self.session.execute(select(ConsentModel).where(ConsentModel.donor_id==i))).scalars().all()]
    async def create_voucher(self,r): self.session.add(DonationVoucherModel(voucher_id=r.id,voucher_number=r.voucher_number,issued_at=r.issued_at,status=r.status,donation_id=r.donation_id)); await self.session.commit(); return r
    async def get_voucher_by_donation(self,i):
        o=(await self.session.execute(select(DonationVoucherModel).where(DonationVoucherModel.donation_id==i))).scalar_one_or_none(); return DonationVoucherRecord(o.voucher_id,o.voucher_number,o.issued_at,o.status,o.donation_id) if o else None
