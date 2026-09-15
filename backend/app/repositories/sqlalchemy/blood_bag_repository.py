from datetime import datetime,timezone
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.models import BloodBagModel,BloodBagStatusHistoryModel
from app.repositories.interfaces.blood_bag_repository import BloodBagRepository
from app.repositories.models import BloodBagRecord,BloodBagHistoryRecord
class SQLAlchemyBloodBagRepository(BloodBagRepository):
 def __init__(self,session:AsyncSession):self.session=session
 def m(self,o):return BloodBagRecord(o.blood_bag_id,o.blood_type,o.quantity,o.collection_date,o.expiry_date,o.qr_code,o.status,o.current_location,o.created_at,o.donation_id,o.current_blood_bank_id)
 async def get(self,id):
  o=(await self.session.execute(select(BloodBagModel).where(BloodBagModel.blood_bag_id==id))).scalar_one_or_none();return self.m(o) if o else None
 async def list(self,bank_id=None):
  q=select(BloodBagModel).order_by(BloodBagModel.created_at.desc())
  if bank_id:q=q.where(BloodBagModel.current_blood_bank_id==bank_id)
  return [self.m(o) for o in (await self.session.execute(q)).scalars().all()]
 async def create(self,r):
  o=BloodBagModel(blood_bag_id=r.id,blood_type=r.blood_type,quantity=r.quantity,collection_date=r.collection_date,expiry_date=r.expiry_date,qr_code=r.qr_code,status=r.status,current_location=r.current_location,created_at=r.created_at,donation_id=r.donation_id,current_blood_bank_id=r.current_blood_bank_id);self.session.add(o);await self.session.commit();return r
 async def update(self,r):
  o=(await self.session.execute(select(BloodBagModel).where(BloodBagModel.blood_bag_id==r.id))).scalar_one_or_none()
  if o:o.status=r.status;o.current_location=r.current_location;await self.session.commit()
  return r
 async def add_history(self,r):
  self.session.add(BloodBagStatusHistoryModel(history_id=r.id,blood_bag_id=r.blood_bag_id,status=r.status,changed_at=r.changed_at,changed_by_user_id=r.changed_by_user_id,location=r.location,notes=r.notes));await self.session.commit();return r
 async def history(self,id):
  q=select(BloodBagStatusHistoryModel).where(BloodBagStatusHistoryModel.blood_bag_id==id).order_by(BloodBagStatusHistoryModel.changed_at.asc());return [BloodBagHistoryRecord(o.history_id,o.blood_bag_id,o.status,o.changed_at,o.changed_by_user_id,o.location,o.notes) for o in (await self.session.execute(q)).scalars().all()]
 async def get_by_qr(self,qr):
  o=(await self.session.execute(select(BloodBagModel).where(BloodBagModel.qr_code==qr))).scalar_one_or_none();return self.m(o) if o else None
