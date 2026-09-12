from app.repositories.interfaces.payment_repository import PaymentRepository
class InMemoryPaymentRepository(PaymentRepository):
    def __init__(self): self.items={}
    async def create(self,r): self.items[r.id]=r; return r
    async def get_by_id(self,i): return self.items.get(i)
    async def list_for_request(self,q): return [x for x in self.items.values() if x.blood_request_id==q]
    async def get_by_provider_order_id(self, order_id: str): return next((x for x in self.items.values() if getattr(x, "provider_order_id", None) == order_id), None)
    async def update(self,r): self.items[r.id]=r; return r
