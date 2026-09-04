from fastapi import APIRouter, Depends

from app.core.security import CurrentUser
from app.repositories.interfaces.user_repository import UserRepository
from app.schemas.requests import BloodRequestCreate, BloodRequestPublic
from app.services.dependencies import get_request_service, get_user_repository
from app.services.request_service import RequestService

router = APIRouter(prefix="/requests", tags=["Blood Requests"])


async def _load_user_record(current_user: CurrentUser, user_repo: UserRepository = Depends(get_user_repository)):
    # Services operate on the internal UserRecord (has hashed_password etc
    # trimmed by callers); we only need identity/role/institution here.
    return await user_repo.get_by_id(current_user.id)


@router.post(
    "",
    response_model=BloodRequestPublic,
    status_code=201,
    summary="Create a blood request",
    description="Hospital User only. Generates a secure tracking reference for QR use.",
    responses={403: {"description": "Only hospital users may create requests"}},
)
async def create_request(
    payload: BloodRequestCreate,
    current_user: CurrentUser,
    request_service: RequestService = Depends(get_request_service),
    user_record=Depends(_load_user_record),
) -> BloodRequestPublic:
    created = await request_service.create_request(payload, user_record)
    return BloodRequestPublic.model_validate(created)


@router.get(
    "",
    response_model=list[BloodRequestPublic],
    summary="List blood requests",
    description="Hospital Users see only their own hospital's requests; Blood Bank/Admin/Support see all.",
)
async def list_requests(
    current_user: CurrentUser,
    request_service: RequestService = Depends(get_request_service),
    user_record=Depends(_load_user_record),
) -> list[BloodRequestPublic]:
    requests = await request_service.list_requests(user_record)
    return [BloodRequestPublic.model_validate(r) for r in requests]


@router.get(
    "/{request_id}",
    response_model=BloodRequestPublic,
    summary="Get a single blood request",
    responses={404: {"description": "Request not found"}, 403: {"description": "Not authorized"}},
)
async def get_request(
    request_id: str,
    current_user: CurrentUser,
    request_service: RequestService = Depends(get_request_service),
    user_record=Depends(_load_user_record),
) -> BloodRequestPublic:
    request = await request_service.get_request(request_id, user_record)
    return BloodRequestPublic.model_validate(request)


@router.post(
    "/{request_id}/acknowledge",
    response_model=BloodRequestPublic,
    summary="Acknowledge a request",
    description="Blood Bank Operator / Admin only. Requested -> Acknowledged.",
    responses={409: {"description": "INVALID_STATUS_TRANSITION"}},
)
async def acknowledge_request(
    request_id: str,
    current_user: CurrentUser,
    request_service: RequestService = Depends(get_request_service),
    user_record=Depends(_load_user_record),
) -> BloodRequestPublic:
    updated = await request_service.acknowledge(request_id, user_record)
    return BloodRequestPublic.model_validate(updated)


@router.post(
    "/{request_id}/confirm",
    response_model=BloodRequestPublic,
    summary="Confirm a request",
    description="Blood Bank Operator / Admin only. Acknowledged -> Confirmed.",
    responses={409: {"description": "INVALID_STATUS_TRANSITION"}},
)
async def confirm_request(
    request_id: str,
    current_user: CurrentUser,
    request_service: RequestService = Depends(get_request_service),
    user_record=Depends(_load_user_record),
) -> BloodRequestPublic:
    updated = await request_service.confirm(request_id, user_record)
    return BloodRequestPublic.model_validate(updated)


@router.post(
    "/{request_id}/prepare",
    response_model=BloodRequestPublic,
    summary="Mark a request as prepared",
    description="Blood Bank Operator / Admin only. Confirmed -> Prepared.",
    responses={409: {"description": "INVALID_STATUS_TRANSITION"}},
)
async def prepare_request(
    request_id: str,
    current_user: CurrentUser,
    request_service: RequestService = Depends(get_request_service),
    user_record=Depends(_load_user_record),
) -> BloodRequestPublic:
    updated = await request_service.prepare(request_id, user_record)
    return BloodRequestPublic.model_validate(updated)


@router.post(
    "/{request_id}/complete",
    response_model=BloodRequestPublic,
    summary="Complete a request",
    description="Blood Bank Operator / Admin only. Prepared -> Completed.",
    responses={409: {"description": "INVALID_STATUS_TRANSITION"}},
)
async def complete_request(
    request_id: str,
    current_user: CurrentUser,
    request_service: RequestService = Depends(get_request_service),
    user_record=Depends(_load_user_record),
) -> BloodRequestPublic:
    updated = await request_service.complete(request_id, user_record)
    return BloodRequestPublic.model_validate(updated)


@router.post(
    "/{request_id}/cancel",
    response_model=BloodRequestPublic,
    summary="Cancel a request",
    description="Hospital User (own request) / Blood Bank Operator / Admin. Any non-terminal state -> Cancelled.",
    responses={409: {"description": "INVALID_STATUS_TRANSITION"}},
)
async def cancel_request(
    request_id: str,
    current_user: CurrentUser,
    request_service: RequestService = Depends(get_request_service),
    user_record=Depends(_load_user_record),
) -> BloodRequestPublic:
    updated = await request_service.cancel(request_id, user_record)
    return BloodRequestPublic.model_validate(updated)
