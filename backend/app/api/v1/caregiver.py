from fastapi import APIRouter, Depends
from app.core.domain import Role
from app.core.security import CurrentUser, require_roles
from app.schemas.caregiver import *
from app.services.dependencies import get_caregiver_service
from app.services.caregiver_service import CaregiverService
router=APIRouter(prefix="/caregiver",tags=["Caregiver"])
@router.post("/assignments",response_model=CaregiverAssignmentPublic,status_code=201,dependencies=[Depends(require_roles(Role.HOSPITAL_USER,Role.BLOOD_BANK_OPERATOR,Role.ADMIN,Role.MEDICAL_LEAD))])
async def create(data:CaregiverAssignmentCreate,current:CurrentUser,svc:CaregiverService=Depends(get_caregiver_service)): return await svc.create(data,current)
@router.get("/assignments",response_model=list[CaregiverAssignmentPublic])
async def list_items(current:CurrentUser,svc:CaregiverService=Depends(get_caregiver_service)): return await svc.list(current)
@router.get("/assignments/{assignment_id}",response_model=CaregiverAssignmentPublic)
async def get(assignment_id:str,current:CurrentUser,svc:CaregiverService=Depends(get_caregiver_service)): return await svc.get(assignment_id,current)
@router.patch("/assignments/{assignment_id}",response_model=CaregiverAssignmentPublic)
async def update(assignment_id:str,data:CaregiverAssignmentUpdate,current:CurrentUser,svc:CaregiverService=Depends(get_caregiver_service)): return await svc.update(assignment_id,data,current)
