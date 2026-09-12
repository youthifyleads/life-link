from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.models import PaymentModel
from app.repositories.interfaces.payment_repository import PaymentRepository
from app.repositories.models import PaymentRecord
class SQLAlchemyPaymentRepository(PaymentRepository):
    def __init__(self,s:AsyncSession): self.session=s
    def m(self,o): return PaymentRecord(o.payment_id,float(o.amount),o.payment_status,o.payment_method,o.paid_at,o.transaction_reference,o.created_at,o.blood_request_id,getattr(o,"currency","EGP"),getattr(o,"provider","paymob"),getattr(o,"provider_order_id",None))
    async def create(self,r): self.session.add(PaymentModel(payment_id=r.id,amount=r.amount,currency=getattr(r,"currency","EGP"),provider=getattr(r,"provider","paymob"),provider_order_id=getattr(r,"provider_order_id",None),payment_status=r.payment_status,payment_method=r.payment_method,paid_at=r.paid_at,transaction_reference=r.transaction_reference,created_at=r.created_at,blood_request_id=r.blood_request_id)); await self.session.commit(); return r
    async def get_by_id(self,i): o=(await self.session.execute(select(PaymentModel).where(PaymentModel.payment_id==i))).scalar_one_or_none(); return self.m(o) if o else None
    async def list_for_request(self,q): return [self.m(o) for o in (await self.session.execute(select(PaymentModel).where(PaymentModel.blood_request_id==q).order_by(PaymentModel.created_at.desc()))).scalars().all()]
    async def get_by_provider_order_id(self, order_id: str):
        o = (await self.session.execute(select(PaymentModel).where(PaymentModel.provider_order_id == order_id))).scalar_one_or_none()
        return self.m(o) if o else None
    async def update(self,r): o=(await self.session.execute(select(PaymentModel).where(PaymentModel.payment_id==r.id))).scalar_one(); o.payment_status=r.payment_status; o.transaction_reference=r.transaction_reference; o.paid_at=r.paid_at; o.provider_order_id=getattr(r,"provider_order_id",o.provider_order_id); await self.session.commit(); return r
