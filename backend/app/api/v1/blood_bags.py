from fastapi import APIRouter, Depends

from app.core.security import CurrentUser
from app.schemas.blood_bags import (
    BloodBagCreate,
    BloodBagHistoryPublic,
    BloodBagPublic,
    BloodBagQRPublic,
    BloodBagQRScan,
    BloodBagQRScanResponse,
    BloodBagStatusUpdate,
)
from app.services.dependencies import get_blood_bag_service

router = APIRouter(prefix="/blood-bags", tags=["Blood Bags"])


@router.post("", response_model=BloodBagPublic, status_code=201)
async def create(payload: BloodBagCreate, current_user: CurrentUser, svc=Depends(get_blood_bag_service)):
    return await svc.create(payload, current_user)


@router.get("", response_model=list[BloodBagPublic])
async def list_bags(current_user: CurrentUser, svc=Depends(get_blood_bag_service)):
    return await svc.list(current_user)


@router.patch("/{bag_id}/status", response_model=BloodBagPublic)
async def status(
    bag_id: str,
    payload: BloodBagStatusUpdate,
    current_user: CurrentUser,
    svc=Depends(get_blood_bag_service),
):
    return await svc.update_status(bag_id, payload, current_user)


@router.get("/{bag_id}/history", response_model=list[BloodBagHistoryPublic])
async def history(bag_id: str, current_user: CurrentUser, svc=Depends(get_blood_bag_service)):
    return await svc.history(bag_id, current_user)


@router.get("/{bag_id}/qr", response_model=BloodBagQRPublic)
async def qr(bag_id: str, current_user: CurrentUser, svc=Depends(get_blood_bag_service)):
    bag, payload = await svc.issue_qr(bag_id, current_user)
    return BloodBagQRPublic(blood_bag_id=bag.id, qr_payload=payload)


@router.post("/scan", response_model=BloodBagQRScanResponse)
async def scan(
    payload: BloodBagQRScan,
    current_user: CurrentUser,
    svc=Depends(get_blood_bag_service),
):
    bag, history = await svc.scan(payload.qr_code, current_user)
    return BloodBagQRScanResponse(
        blood_bag=BloodBagPublic.model_validate(bag),
        movement_history=[BloodBagHistoryPublic.model_validate(item) for item in history],
    )


@router.get("/scan/{qr_code}/history", response_model=list[BloodBagHistoryPublic])
async def scan_history(
    qr_code: str,
    current_user: CurrentUser,
    svc=Depends(get_blood_bag_service),
):
    _, history = await svc.scan(qr_code, current_user)
    return [BloodBagHistoryPublic.model_validate(item) for item in history]
