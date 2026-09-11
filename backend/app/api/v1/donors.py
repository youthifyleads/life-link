from fastapi import APIRouter, Depends
from app.core.domain import Role
from app.core.security import CurrentUser, require_roles
from app.schemas.donors import *
from app.services.dependencies import get_donor_service
from app.services.donor_service import DonorService
router=APIRouter(prefix="/donors",tags=["Donors"])
@router.get("/me",response_model=DonorPublic)
async def me(current:CurrentUser,svc:DonorService=Depends(get_donor_service)): return await svc.get_me(current.id)
@router.post("/me",response_model=DonorPublic,status_code=201)
async def create(data:DonorCreate,current:CurrentUser,svc:DonorService=Depends(get_donor_service)): return await svc.create_for_user(current.id,data)
@router.patch("/me",response_model=DonorPublic)
async def update(data:DonorUpdate,current:CurrentUser,svc:DonorService=Depends(get_donor_service)): return await svc.update(current.id,data)
@router.get("/{donor_id}",response_model=DonorPublic,dependencies=[Depends(require_roles(Role.ADMIN,Role.MEDICAL_LEAD))])
async def get(donor_id:str,svc:DonorService=Depends(get_donor_service)): return await svc.get(donor_id)
@router.get("/me/donations",response_model=list[DonationPublic])
async def donations(current:CurrentUser,svc:DonorService=Depends(get_donor_service)): return await svc.donations(current.id)
@router.post("/me/donations",response_model=DonationPublic,status_code=201)
async def donate(data:DonationCreate,current:CurrentUser,svc:DonorService=Depends(get_donor_service)): return await svc.create_donation(current.id,data)
@router.get("/me/responses",response_model=list[DonationResponsePublic])
async def responses(current:CurrentUser,svc:DonorService=Depends(get_donor_service)): return await svc.responses(current.id)
@router.post("/me/responses",response_model=DonationResponsePublic,status_code=201)
async def respond(data:DonationResponseCreate,current:CurrentUser,svc:DonorService=Depends(get_donor_service)): return await svc.respond(current.id,data)
@router.get("/me/consents",response_model=list[ConsentPublic])
async def consents(current:CurrentUser,svc:DonorService=Depends(get_donor_service)): return await svc.consents(current.id)
@router.post("/me/consents",response_model=ConsentPublic,status_code=201)
async def consent(data:ConsentCreate,current:CurrentUser,svc:DonorService=Depends(get_donor_service)): return await svc.add_consent(current.id,data)
