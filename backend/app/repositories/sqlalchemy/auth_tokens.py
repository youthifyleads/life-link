from datetime import datetime,timezone
from sqlalchemy import select,update
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.models import RefreshTokenModel,PasswordResetTokenModel
from app.repositories.models import RefreshTokenRecord,PasswordResetTokenRecord
class SQLRefreshTokenStore:
 def __init__(self,session:AsyncSession):self.session=session
 async def create(self,r):self.session.add(RefreshTokenModel(token_id=r.id,user_id=r.user_id,token_hash=r.token_hash,expires_at=r.expires_at,created_at=r.created_at,revoked_at=r.revoked_at,replaced_by_token_id=r.replaced_by_token_id));await self.session.commit();return r
 async def get_by_hash(self,h):
  o=(await self.session.execute(select(RefreshTokenModel).where(RefreshTokenModel.token_hash==h))).scalar_one_or_none()
  return RefreshTokenRecord(o.token_id,o.user_id,o.token_hash,o.expires_at,o.created_at,o.revoked_at,o.replaced_by_token_id) if o else None
 async def revoke(self,r,replacement=None):
  r.revoked_at=datetime.now(timezone.utc);r.replaced_by_token_id=replacement
  await self.session.execute(update(RefreshTokenModel).where(RefreshTokenModel.token_id==r.id).values(revoked_at=r.revoked_at,replaced_by_token_id=replacement));await self.session.commit();return r
 async def revoke_user(self,user_id):await self.session.execute(update(RefreshTokenModel).where(RefreshTokenModel.user_id==user_id,RefreshTokenModel.revoked_at.is_(None)).values(revoked_at=datetime.now(timezone.utc)));await self.session.commit()
class SQLPasswordResetStore:
 def __init__(self,session:AsyncSession):self.session=session
 async def create(self,r):self.session.add(PasswordResetTokenModel(token_id=r.id,user_id=r.user_id,token_hash=r.token_hash,expires_at=r.expires_at,created_at=r.created_at,used_at=r.used_at,attempts=r.attempts));await self.session.commit();return r
 async def get(self,h):
  o=(await self.session.execute(select(PasswordResetTokenModel).where(PasswordResetTokenModel.token_hash==h))).scalar_one_or_none()
  return PasswordResetTokenRecord(o.token_id,o.user_id,o.token_hash,o.expires_at,o.created_at,o.used_at,o.attempts) if o else None
 async def update(self,r):
  await self.session.execute(update(PasswordResetTokenModel).where(PasswordResetTokenModel.token_id==r.id).values(used_at=r.used_at,attempts=r.attempts));await self.session.commit();return r
 async def invalidate_user(self,user_id):await self.session.execute(update(PasswordResetTokenModel).where(PasswordResetTokenModel.user_id==user_id,PasswordResetTokenModel.used_at.is_(None)).values(used_at=datetime.now(timezone.utc)));await self.session.commit()
