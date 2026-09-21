from fastapi import APIRouter, Depends

from app.api.deps import load_user_record
from app.core.security import CurrentUser
from app.repositories.interfaces.user_repository import UserRepository
from app.schemas.donors import (
    MatchingDonorPublic,
    NotifyMatchingDonorsRequest,
    NotifyMatchingDonorsResponse,
)
from app.schemas.requests import (
    BloodRequestCreate,
    BloodRequestPublic,
    RequestAcknowledgePayload,
    RequestAllocateBagPayload,
    RequestAllocateBagResponse,
    RequestCancelPayload,
    RequestDeallocateBagPayload,
    RequestDeallocateBagResponse,
    RequestDispatchPayload,
    RequestReceivePayload,
    RequestSetPricePayload,
)
from app.schemas.blood_bags import BloodBagPublic
from app.services.dependencies import (
    get_matching_service,
    get_notification_service,
    get_request_service,
    get_user_repository,
)
from app.services.matching_service import MatchingService
from app.services.notification_service import NotificationService
from app.services.request_service import RequestService

router = APIRouter(prefix="/requests", tags=["Blood Requests"])


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
    user_record=Depends(load_user_record),
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
    user_record=Depends(load_user_record),
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
    user_record=Depends(load_user_record),
) -> BloodRequestPublic:
    request = await request_service.get_request(request_id, user_record)
    return BloodRequestPublic.model_validate(request)


@router.post(
    "/{request_id}/acknowledge",
    response_model=BloodRequestPublic,
    summary="Acknowledge a request",
    description="Blood Bank Operator / Admin only. Requested -> Acknowledged. Optionally sets unit price.",
    responses={409: {"description": "INVALID_STATUS_TRANSITION"}},
)
async def acknowledge_request(
    request_id: str,
    current_user: CurrentUser,
    payload: RequestAcknowledgePayload | None = None,
    request_service: RequestService = Depends(get_request_service),
    user_record=Depends(load_user_record),
) -> BloodRequestPublic:
    unit_price = payload.unit_price if payload else None
    notes = (payload.notes or payload.reason) if payload else None
    updated = await request_service.acknowledge(request_id, user_record, unit_price=unit_price, notes=notes)
    return BloodRequestPublic.model_validate(updated)


@router.patch(
    "/{request_id}/price",
    response_model=BloodRequestPublic,
    summary="Set or update blood bag unit price",
    description="Blood Bank Operator / Admin only. Sets unit price for a blood request.",
    responses={403: {"description": "FORBIDDEN"}, 404: {"description": "REQUEST_NOT_FOUND"}},
)
async def set_request_price(
    request_id: str,
    payload: RequestSetPricePayload,
    current_user: CurrentUser,
    request_service: RequestService = Depends(get_request_service),
    user_record=Depends(load_user_record),
) -> BloodRequestPublic:
    updated = await request_service.set_price(request_id, payload.unit_price, user_record)
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
    user_record=Depends(load_user_record),
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
    user_record=Depends(load_user_record),
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
    user_record=Depends(load_user_record),
) -> BloodRequestPublic:
    updated = await request_service.complete(request_id, user_record)
    return BloodRequestPublic.model_validate(updated)


@router.post(
    "/{request_id}/cancel",
    response_model=BloodRequestPublic,
    summary="Cancel a request",
    description="Hospital User (own request) / Blood Bank Operator / Admin. Any non-terminal state -> Cancelled. Any allocated bags are moved to quarantine for safety.",
    responses={409: {"description": "INVALID_STATUS_TRANSITION"}},
)
async def cancel_request(
    request_id: str,
    current_user: CurrentUser,
    payload: RequestCancelPayload | None = None,
    request_service: RequestService = Depends(get_request_service),
    user_record=Depends(load_user_record),
) -> BloodRequestPublic:
    reason = payload.reason if payload else None
    updated = await request_service.cancel(request_id, user_record, reason=reason)
    return BloodRequestPublic.model_validate(updated)


@router.post(
    "/{request_id}/reject",
    response_model=BloodRequestPublic,
    summary="Reject a blood request",
    description="Blood Bank Operator / Admin only. Marks request as cancelled/rejected with clinical justification.",
    responses={409: {"description": "INVALID_STATUS_TRANSITION"}},
)
async def reject_request(
    request_id: str,
    current_user: CurrentUser,
    payload: RequestCancelPayload | None = None,
    request_service: RequestService = Depends(get_request_service),
    user_record=Depends(load_user_record),
) -> BloodRequestPublic:
    reason = payload.reason if payload else "Request rejected by blood bank"
    updated = await request_service.cancel(request_id, user_record, reason=reason)
    return BloodRequestPublic.model_validate(updated)


@router.post(
    "/{request_id}/accept",
    response_model=BloodRequestPublic,
    summary="Accept / acknowledge a blood request",
    description="Blood Bank Operator / Admin only. Alias for acknowledging the request and optionally locking in unit price.",
    responses={409: {"description": "INVALID_STATUS_TRANSITION"}},
)
async def accept_request(
    request_id: str,
    current_user: CurrentUser,
    payload: RequestAcknowledgePayload | None = None,
    request_service: RequestService = Depends(get_request_service),
    user_record=Depends(load_user_record),
) -> BloodRequestPublic:
    unit_price = payload.unit_price if payload else None
    notes = (payload.notes or payload.reason) if payload else None
    updated = await request_service.acknowledge(request_id, user_record, unit_price=unit_price, notes=notes)
    return BloodRequestPublic.model_validate(updated)



@router.get(
    "/{request_id}/matching-donors",
    response_model=list[MatchingDonorPublic],
    summary="Find matching eligible donors for a blood request sorted by distance",
    description="Finds eligible donors matching the blood request's blood type (using clinical compatibility), who haven't donated in the last 6 months, sorted from closest to farthest.",
)
async def get_matching_donors_for_request(
    request_id: str,
    current_user: CurrentUser,
    exact_match: bool = False,
    max_distance_km: float | None = None,
    limit: int = 50,
    matching_service: MatchingService = Depends(get_matching_service),
) -> list[MatchingDonorPublic]:
    return await matching_service.find_matches_for_request(
        request_id=request_id,
        exact_match=exact_match,
        max_distance_km=max_distance_km,
        limit=limit,
    )


@router.post(
    "/{request_id}/notify-matching-donors",
    response_model=NotifyMatchingDonorsResponse,
    summary="Notify top N closest matching donors for a blood request",
    description="Finds the closest matching eligible donors and dispatches urgent notifications to them automatically.",
)
async def notify_matching_donors_for_request(
    request_id: str,
    payload: NotifyMatchingDonorsRequest,
    current_user: CurrentUser,
    matching_service: MatchingService = Depends(get_matching_service),
    notification_service: NotificationService = Depends(get_notification_service),
) -> NotifyMatchingDonorsResponse:
    count, donors = await matching_service.notify_top_matching_donors(
        request_id=request_id,
        count=payload.count,
        exact_match=payload.exact_match,
        max_distance_km=payload.max_distance_km,
        notification_service=notification_service,
    )
    return NotifyMatchingDonorsResponse(
        request_id=request_id,
        total_notified=count,
        notified_donors=donors,
    )


@router.post(
    "/{request_id}/allocate-bag",
    response_model=RequestAllocateBagResponse,
    summary="Allocate an individual blood bag to request using barcode scan",
    description="Blood Bank Operator / Admin only. Scans a blood bag barcode/QR and validates blood type, component, and expiration before assigning it to the request.",
)
async def allocate_bag_to_request(
    request_id: str,
    payload: RequestAllocateBagPayload,
    current_user: CurrentUser,
    request_service: RequestService = Depends(get_request_service),
    user_record=Depends(load_user_record),
) -> RequestAllocateBagResponse:
    res = await request_service.allocate_bag(request_id, payload.barcode, user_record)
    return RequestAllocateBagResponse.model_validate(res)


@router.post(
    "/{request_id}/deallocate-bag",
    response_model=RequestDeallocateBagResponse,
    summary="Deallocate an individual blood bag from request",
    description="Blood Bank Operator / Admin only. Removes blood bag from request and moves it to quarantine for safety inspection.",
)
async def deallocate_bag_from_request(
    request_id: str,
    payload: RequestDeallocateBagPayload,
    current_user: CurrentUser,
    request_service: RequestService = Depends(get_request_service),
    user_record=Depends(load_user_record),
) -> RequestDeallocateBagResponse:
    res = await request_service.deallocate_bag(request_id, payload.barcode, user_record, reason=payload.reason)
    return RequestDeallocateBagResponse.model_validate(res)



@router.get(
    "/{request_id}/allocated-bags",
    response_model=list[BloodBagPublic],
    summary="List all blood bags allocated to this request",
    description="Returns individual blood bags allocated to this blood request.",
)
async def get_allocated_bags(
    request_id: str,
    current_user: CurrentUser,
    request_service: RequestService = Depends(get_request_service),
    user_record=Depends(load_user_record),
) -> list[BloodBagPublic]:
    bags = await request_service.list_allocated_bags(request_id, user_record)
    return [BloodBagPublic.model_validate(b) for b in bags]


@router.post(
    "/{request_id}/dispatch",
    response_model=BloodRequestPublic,
    summary="Dispatch blood bags to caregiver / ambulance",
    description="Blood Bank Operator / Admin only. Marks request and its allocated bags as in-transit to the hospital/caregiver.",
)
async def dispatch_blood_request(
    request_id: str,
    current_user: CurrentUser,
    payload: RequestDispatchPayload | None = None,
    request_service: RequestService = Depends(get_request_service),
    user_record=Depends(load_user_record),
) -> BloodRequestPublic:
    notes = payload.notes if payload else None
    updated = await request_service.dispatch_request(request_id, user_record, notes=notes)
    return BloodRequestPublic.model_validate(updated)


@router.post(
    "/{request_id}/receive",
    response_model=BloodRequestPublic,
    summary="Confirm receipt of blood bags at hospital",
    description="Hospital User / Admin only. Confirms blood bags arrived at the hospital, completing the request and marking bags as received.",
)
async def receive_blood_request(
    request_id: str,
    current_user: CurrentUser,
    payload: RequestReceivePayload | None = None,
    request_service: RequestService = Depends(get_request_service),
    user_record=Depends(load_user_record),
) -> BloodRequestPublic:
    notes = payload.notes if payload else None
    updated = await request_service.receive_request(request_id, user_record, notes=notes)
    return BloodRequestPublic.model_validate(updated)
