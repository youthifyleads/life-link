from app.repositories.interfaces.caregiver_repository import CaregiverRepository
class InMemoryCaregiverRepository(CaregiverRepository):
    def __init__(self): self.items={}
    async def create(self,r): self.items[r.id]=r; return r
    async def get_by_id(self,i): return self.items.get(i)
    async def list_for_user(self,u): return [x for x in self.items.values() if x.caregiver_user_id==u]
    async def list_for_hospital(self,h): return [x for x in self.items.values() if x.hospital_id==h]
    async def update(self,r): self.items[r.id]=r; return r
