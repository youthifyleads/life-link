import uuid
from fastapi import APIRouter, Depends
from app.core.domain import Role
from app.core.security import require_roles
from app.repositories.institution_models import InstitutionRecord
from app.repositories.interfaces.institution_repository import InstitutionRepository
from app.schemas.institutions import InstitutionCreate, InstitutionPublic
from app.services.dependencies import get_institution_repository

router = APIRouter(tags=["Institutions"])

@router.get("/hospitals", response_model=list[InstitutionPublic], summary="List hospitals")
async def list_hospitals(repo: InstitutionRepository = Depends(get_institution_repository)):
    return [InstitutionPublic.model_validate(x) for x in await repo.list("hospital")]

@router.post("/hospitals", response_model=InstitutionPublic, status_code=201, dependencies=[Depends(require_roles(Role.ADMIN))], summary="Create a hospital")
async def create_hospital(payload: InstitutionCreate, repo: InstitutionRepository = Depends(get_institution_repository)):
    x = InstitutionRecord(f"hospital_{uuid.uuid4().hex[:12]}", payload.name, payload.governorate, payload.address, payload.status, payload.phones, "hospital")
    return InstitutionPublic.model_validate(await repo.create(x))

@router.get("/blood-banks", response_model=list[InstitutionPublic], summary="List blood banks")
async def list_blood_banks(repo: InstitutionRepository = Depends(get_institution_repository)):
    return [InstitutionPublic.model_validate(x) for x in await repo.list("blood_bank")]

@router.post("/blood-banks", response_model=InstitutionPublic, status_code=201, dependencies=[Depends(require_roles(Role.ADMIN))], summary="Create a blood bank")
async def create_blood_bank(payload: InstitutionCreate, repo: InstitutionRepository = Depends(get_institution_repository)):
    x = InstitutionRecord(f"bloodbank_{uuid.uuid4().hex[:12]}", payload.name, payload.governorate, payload.address, payload.status, payload.phones, "blood_bank")
    return InstitutionPublic.model_validate(await repo.create(x))
