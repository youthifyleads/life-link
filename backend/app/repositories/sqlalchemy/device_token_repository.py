from datetime import datetime,timezone
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.models import DeviceTokenModel
from app.repositories.models import DeviceTokenRecord
from app.repositories.interfaces.device_token_repository import DeviceTokenRepository
class SQLAlchemyDeviceTokenRepository(DeviceTokenRepository):
 def __init__(self,session:AsyncSession):self.session=session
 def m(self,o):return DeviceTokenRecord(o.device_token_id,o.user_id,o.token,o.provider,o.active,o.created_at,o.updated_at)
 async def upsert(self,r):
  o=(await self.session.execute(select(DeviceTokenModel).where(DeviceTokenModel.token==r.token))).scalar_one_or_none();now=datetime.now(timezone.utc)
  if o:o.user_id=r.user_id;o.provider=r.provider;o.active=True;o.updated_at=now;r.id=o.device_token_id;r.created_at=o.created_at;r.updated_at=now
  else:self.session.add(DeviceTokenModel(device_token_id=r.id,user_id=r.user_id,token=r.token,provider=r.provider,active=True,created_at=r.created_at,updated_at=now))
  await self.session.commit();return r
 async def list_for_user(self,user_id):
  return [self.m(o) for o in (await self.session.execute(select(DeviceTokenModel).where(DeviceTokenModel.user_id==user_id,DeviceTokenModel.active==True))).scalars().all()]
 async def deactivate(self,user_id,token):
  o=(await self.session.execute(select(DeviceTokenModel).where(DeviceTokenModel.user_id==user_id,DeviceTokenModel.token==token))).scalar_one_or_none()
  if o:o.active=False;o.updated_at=datetime.now(timezone.utc);await self.session.commit()
