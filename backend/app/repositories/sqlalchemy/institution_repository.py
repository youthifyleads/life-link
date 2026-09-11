from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.models import HospitalModel, HospitalPhoneModel, BloodBankModel, BloodBankPhoneModel
from app.repositories.institution_models import InstitutionRecord
from app.repositories.interfaces.institution_repository import InstitutionRepository

class SQLAlchemyInstitutionRepository(InstitutionRepository):
    def __init__(self, session: AsyncSession): self.session = session

    async def list(self, kind):
        if kind == "hospital":
            result = await self.session.execute(select(HospitalModel).order_by(HospitalModel.name))
            rows = result.scalars().all()
            return [InstitutionRecord(x.hospital_id,x.name,x.governorate,x.address,x.status or "active",[p.phone for p in x.phones],"hospital") for x in rows]
        result = await self.session.execute(select(BloodBankModel).order_by(BloodBankModel.name))
        rows = result.scalars().all()
        return [InstitutionRecord(x.blood_bank_id,x.name,x.governorate,x.address,x.status or "active",[p.phone for p in x.phones],"blood_bank") for x in rows]

    async def get(self, kind, institution_id):
        if kind == "hospital":
            x = (await self.session.execute(select(HospitalModel).where(HospitalModel.hospital_id==institution_id))).scalar_one_or_none()
            return InstitutionRecord(x.hospital_id,x.name,x.governorate,x.address,x.status or "active",[p.phone for p in x.phones],"hospital") if x else None
        x = (await self.session.execute(select(BloodBankModel).where(BloodBankModel.blood_bank_id==institution_id))).scalar_one_or_none()
        return InstitutionRecord(x.blood_bank_id,x.name,x.governorate,x.address,x.status or "active",[p.phone for p in x.phones],"blood_bank") if x else None

    async def create(self, record):
        if record.kind == "hospital":
            self.session.add(HospitalModel(hospital_id=record.id,name=record.name,governorate=record.governorate,address=record.address,status=record.status))
            self.session.add_all([HospitalPhoneModel(hospital_id=record.id,phone=p) for p in record.phones])
        else:
            self.session.add(BloodBankModel(blood_bank_id=record.id,name=record.name,governorate=record.governorate,address=record.address,status=record.status))
            self.session.add_all([BloodBankPhoneModel(blood_bank_id=record.id,phone=p) for p in record.phones])
        await self.session.commit(); return record
