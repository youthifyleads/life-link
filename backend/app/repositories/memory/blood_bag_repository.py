from app.repositories.interfaces.blood_bag_repository import BloodBagRepository
class InMemoryBloodBagRepository(BloodBagRepository):
 def __init__(self):self.items={};self.hist={}
 async def get(self,id):return self.items.get(id)
 async def list(self,bank_id=None):return [x for x in self.items.values() if not bank_id or x.current_blood_bank_id==bank_id]
 async def create(self,r):self.items[r.id]=r;return r
 async def update(self,r):self.items[r.id]=r;return r
 async def add_history(self,r):self.hist.setdefault(r.blood_bag_id,[]).append(r);return r
 async def history(self,id):return self.hist.get(id,[])
 async def get_by_qr(self,qr):return next((x for x in self.items.values() if x.qr_code==qr),None)
