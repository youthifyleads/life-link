from app.repositories.interfaces.device_token_repository import DeviceTokenRepository
class InMemoryDeviceTokenRepository(DeviceTokenRepository):
 def __init__(self):self.items={}
 async def upsert(self,r):self.items[r.token]=r;return r
 async def list_for_user(self,u):return [x for x in self.items.values() if x.user_id==u and x.active]
 async def deactivate(self,u,t):
  if t in self.items and self.items[t].user_id==u:self.items[t].active=False
