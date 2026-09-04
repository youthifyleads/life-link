from fastapi import APIRouter, Depends

from app.core.security import CurrentUser
from app.repositories.interfaces.user_repository import UserRepository
from app.schemas.inventory import InventoryItemCreate, InventoryItemPublic, InventoryItemUpdate
from app.services.dependencies import get_inventory_service, get_user_repository
from app.services.inventory_service import InventoryService

router = APIRouter(prefix="/inventory", tags=["Inventory"])


async def _load_user_record(current_user: CurrentUser, user_repo: UserRepository = Depends(get_user_repository)):
    return await user_repo.get_by_id(current_user.id)


@router.get(
    "",
    response_model=list[InventoryItemPublic],
    summary="List reported inventory",
    description="Blood Bank Operators see only their own bank's inventory; others see all reported availability.",
)
async def list_inventory(
    current_user: CurrentUser,
    inventory_service: InventoryService = Depends(get_inventory_service),
    user_record=Depends(_load_user_record),
) -> list[InventoryItemPublic]:
    items = await inventory_service.list_items(user_record)
    return [InventoryItemPublic.model_validate(i) for i in items]


@router.get(
    "/{inventory_id}",
    response_model=InventoryItemPublic,
    summary="Get a single inventory item",
    responses={404: {"description": "Inventory item not found"}},
)
async def get_inventory_item(
    inventory_id: str, inventory_service: InventoryService = Depends(get_inventory_service)
) -> InventoryItemPublic:
    item = await inventory_service.get_item(inventory_id)
    return InventoryItemPublic.model_validate(item)


@router.post(
    "",
    response_model=InventoryItemPublic,
    status_code=201,
    summary="Report a new inventory item",
    description="Blood Bank Operator (own bank) / Admin only. Manual attestation, not sensor-based.",
    responses={403: {"description": "Not authorized for this blood bank"}},
)
async def create_inventory_item(
    payload: InventoryItemCreate,
    current_user: CurrentUser,
    inventory_service: InventoryService = Depends(get_inventory_service),
    user_record=Depends(_load_user_record),
) -> InventoryItemPublic:
    created = await inventory_service.create_item(payload, user_record)
    return InventoryItemPublic.model_validate(created)


@router.patch(
    "/{inventory_id}",
    response_model=InventoryItemPublic,
    summary="Update reported inventory quantity/availability",
    description="Blood Bank Operator (own bank) / Admin only.",
    responses={403: {"description": "Not authorized for this blood bank"}, 404: {"description": "Not found"}},
)
async def update_inventory_item(
    inventory_id: str,
    payload: InventoryItemUpdate,
    current_user: CurrentUser,
    inventory_service: InventoryService = Depends(get_inventory_service),
    user_record=Depends(_load_user_record),
) -> InventoryItemPublic:
    updated = await inventory_service.update_item(inventory_id, payload, user_record)
    return InventoryItemPublic.model_validate(updated)
