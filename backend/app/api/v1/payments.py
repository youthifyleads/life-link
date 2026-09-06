from fastapi import APIRouter, Depends
from app.core.domain import Role
from app.core.security import CurrentUser, require_roles
from app.schemas.payments import *
from app.services.dependencies import get_payment_service
from app.services.payment_service import PaymentService
router=APIRouter(prefix="/payments",tags=["Payments"])
@router.post("",response_model=PaymentPublic,status_code=201,dependencies=[Depends(require_roles(Role.HOSPITAL_USER,Role.ADMIN))])
async def create(data:PaymentCreate,current:CurrentUser,svc:PaymentService=Depends(get_payment_service)): return await svc.create(data,current)
@router.get("/{payment_id}",response_model=PaymentPublic)
async def get(payment_id:str,current:CurrentUser,svc:PaymentService=Depends(get_payment_service)): return await svc.get(payment_id,current)
@router.get("/request/{blood_request_id}",response_model=list[PaymentPublic])
async def list_request(blood_request_id:str,current:CurrentUser,svc:PaymentService=Depends(get_payment_service)): return await svc.list_for_request(blood_request_id,current)
@router.patch("/{payment_id}",response_model=PaymentPublic,dependencies=[Depends(require_roles(Role.ADMIN,Role.PLATFORM_SUPPORT))])
async def update(payment_id:str,data:PaymentUpdate,current:CurrentUser,svc:PaymentService=Depends(get_payment_service)): return await svc.update(payment_id,data,current)
