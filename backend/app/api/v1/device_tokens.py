from __future__ import annotations

from fastapi import APIRouter, Depends

from app.core.security import CurrentUser
from app.schemas.device_tokens import DeviceTokenCreate
from app.services.dependencies import get_device_token_service

router = APIRouter(prefix="/notifications/devices", tags=["Notifications"])


@router.post("", status_code=201)
async def register(
    payload: DeviceTokenCreate,
    current_user: CurrentUser,
    svc=Depends(get_device_token_service),
) -> dict[str, str]:
    await svc.register(current_user.id, payload.token, payload.provider)
    return {"message": "Device token registered", "provider": payload.provider}


@router.delete("")
async def remove(
    payload: DeviceTokenCreate,
    current_user: CurrentUser,
    svc=Depends(get_device_token_service),
) -> dict[str, str]:
    await svc.remove(current_user.id, payload.token)
    return {"message": "Device token deactivated"}


@router.get("")
async def list_devices(
    current_user: CurrentUser,
    svc=Depends(get_device_token_service),
):
    return await svc.list(current_user.id)
