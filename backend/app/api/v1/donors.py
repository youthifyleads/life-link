from fastapi import APIRouter, Depends
from app.core.domain import Role
from app.core.security import CurrentUser, require_roles
from app.schemas.donors import *
from app.services.dependencies import get_donor_service, get_matching_service
from app.services.donor_service import DonorService
from app.services.matching_service import MatchingService
router=APIRouter(prefix="/donors",tags=["Donors"])
@router.get("/me",response_model=DonorPublic)
async def me(current:CurrentUser,svc:DonorService=Depends(get_donor_service)): return await svc.get_me(current.id)
@router.post("/me",response_model=DonorPublic,status_code=201)
async def create(data:DonorCreate,current:CurrentUser,svc:DonorService=Depends(get_donor_service)): return await svc.create_for_user(current.id,data)
@router.patch("/me",response_model=DonorPublic)
async def update(data:DonorUpdate,current:CurrentUser,svc:DonorService=Depends(get_donor_service)): return await svc.update(current.id,data)
@router.get("/matches",response_model=list[MatchingDonorPublic],summary="Find matching eligible donors sorted by distance")
async def find_matches(
    blood_type: str,
    exact_match: bool = False,
    latitude: float | None = None,
    longitude: float | None = None,
    max_distance_km: float | None = None,
    limit: int = 50,
    current: CurrentUser = None,
    matching_svc: MatchingService = Depends(get_matching_service),
):
    return await matching_svc.find_matching_donors(
        blood_type=blood_type,
        target_lat=latitude,
        target_lng=longitude,
        max_distance_km=max_distance_km,
        exact_match=exact_match,
        limit=limit,
    )
@router.get("/me/nearby-requests",response_model=list[NearbyBloodRequestPublic],summary="Get nearby blood requests matching donor blood type")
async def nearby_requests(
    current: CurrentUser,
    limit: int = 20,
    max_distance_km: float | None = None,
    svc: DonorService = Depends(get_donor_service),
):
    return await svc.get_nearby_requests(current.id, limit=limit, max_distance_km=max_distance_km)
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
