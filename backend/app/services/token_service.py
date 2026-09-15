from datetime import datetime,timedelta,timezone
import hashlib,secrets,uuid
from app.core.config import get_settings
from app.core.exceptions import UnauthorizedError
from app.core.security import create_access_token
from app.repositories.models import RefreshTokenRecord
class RefreshTokenStore:
 def __init__(self):self.items={}
 async def create(self,r):self.items[r.id]=r;return r
 async def get_by_hash(self,h):return next((x for x in self.items.values() if x.token_hash==h),None)
 async def revoke(self,r,replacement=None):r.revoked_at=datetime.now(timezone.utc);r.replaced_by_token_id=replacement;self.items[r.id]=r;return r
 async def revoke_user(self,user_id):
  now=datetime.now(timezone.utc)
  for r in self.items.values():
   if r.user_id==user_id and not r.revoked_at:r.revoked_at=now
class RefreshTokenService:
 def __init__(self,user_repo,store):self.user_repo=user_repo;self.store=store
 @staticmethod
 def _hash(t):return hashlib.sha256(t.encode()).hexdigest()
 async def issue(self,user):
  raw=secrets.token_urlsafe(48);now=datetime.now(timezone.utc);rid=str(uuid.uuid4());exp=now+timedelta(days=get_settings().REFRESH_TOKEN_EXPIRE_DAYS);await self.store.create(RefreshTokenRecord(rid,user.id,self._hash(raw),exp,now));return raw
 async def rotate(self,raw):
  rec=await self.store.get_by_hash(self._hash(raw));now=datetime.now(timezone.utc)
  if not rec or rec.expires_at<=now:raise UnauthorizedError('Invalid or expired refresh token',code='INVALID_REFRESH_TOKEN')
  if rec.revoked_at:
   await self.store.revoke_user(rec.user_id);raise UnauthorizedError('Refresh token reuse detected',code='REFRESH_TOKEN_REUSE')
  user=await self.user_repo.get_by_id(rec.user_id)
  if not user or not user.is_active or not getattr(user,'email_verified',True):raise UnauthorizedError('Invalid refresh token',code='INVALID_REFRESH_TOKEN')
  new=await self.issue(user);nr=await self.store.get_by_hash(self._hash(new));await self.store.revoke(rec,nr.id);return user,create_access_token(subject=user.id,role=user.role.value),new
 async def revoke(self,raw):
  rec=await self.store.get_by_hash(self._hash(raw))
  if rec:await self.store.revoke(rec)
