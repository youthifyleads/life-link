from app.repositories.models import DeviceTokenRecord
import uuid
class PushProvider:
 async def send(self,*,tokens,title,body,data=None):raise NotImplementedError
class FCMProvider(PushProvider):
 async def send(self,*,tokens,title,body,data=None):
  raise RuntimeError('FCM provider is not configured; no fake push was sent')
class OneSignalProvider(PushProvider):
 async def send(self,*,tokens,title,body,data=None):
  raise RuntimeError('OneSignal provider is not configured; no fake push was sent')
class DeviceTokenService:
 def __init__(self,repo):self.repo=repo
 async def register(self,user_id,token,provider):return await self.repo.upsert(DeviceTokenRecord(str(uuid.uuid4()),user_id,token,provider,True))
 async def remove(self,user_id,token):await self.repo.deactivate(user_id,token)
 async def list(self,user_id):return await self.repo.list_for_user(user_id)
