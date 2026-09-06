from datetime import datetime, timezone
from uuid import uuid4
from app.core.exceptions import NotFoundError, ForbiddenError
from app.repositories.interfaces.payment_repository import PaymentRepository
from app.repositories.interfaces.request_repository import RequestRepository
from app.repositories.models import PaymentRecord
class PaymentService:
    def __init__(self,repo,request_repo): self.repo=repo; self.request_repo=request_repo
    async def create(self,data,current):
        req=await self.request_repo.get_by_id(data.blood_request_id)
        if not req: raise NotFoundError("Blood request not found",code="REQUEST_NOT_FOUND")
        if current.role.value=="hospital_user" and req.hospital_id!=current.hospital_id: raise ForbiddenError("You cannot create a payment for this request",code="FORBIDDEN_REQUEST_ACCESS")
        return await self.repo.create(PaymentRecord(str(uuid4()),float(data.amount),"pending",data.payment_method,None,None,datetime.now(timezone.utc),data.blood_request_id))
    async def get(self,i,current):
        p=await self.repo.get_by_id(i)
        if not p: raise NotFoundError("Payment not found",code="PAYMENT_NOT_FOUND")
        req=await self.request_repo.get_by_id(p.blood_request_id)
        if current.role.value=="hospital_user" and (not req or req.hospital_id!=current.hospital_id): raise ForbiddenError("You cannot access this payment",code="FORBIDDEN_PAYMENT_ACCESS")
        return p
    async def list_for_request(self,q,current):
        req=await self.request_repo.get_by_id(q)
        if not req: raise NotFoundError("Blood request not found",code="REQUEST_NOT_FOUND")
        if current.role.value=="hospital_user" and req.hospital_id!=current.hospital_id: raise ForbiddenError("You cannot access this request",code="FORBIDDEN_REQUEST_ACCESS")
        return await self.repo.list_for_request(q)
    async def update(self,i,data,current):
        p=await self.get(i,current); p.payment_status=data.payment_status; p.transaction_reference=data.transaction_reference; p.paid_at=datetime.now(timezone.utc) if data.payment_status.lower() in {"paid","completed","success"} else p.paid_at; return await self.repo.update(p)
