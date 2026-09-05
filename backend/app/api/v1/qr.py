from fastapi import APIRouter, Depends

from app.core.security import CurrentUser
from app.repositories.interfaces.user_repository import UserRepository
from app.schemas.qr import QRIssueResponse, QRScanRequest, TrackingPublic
from app.services.dependencies import get_qr_service, get_user_repository
from app.services.qr_service import QRService

router = APIRouter(tags=["QR / Tracking"])


async def _load_user_record(current_user: CurrentUser, user_repo: UserRepository = Depends(get_user_repository)):
    return await user_repo.get_by_id(current_user.id)


@router.post(
    "/requests/{request_id}/qr",
    response_model=QRIssueResponse,
    summary="Issue/retrieve the QR payload for a request",
    description="Returns the opaque tracking reference to be encoded as a QR image by the client.",
    responses={404: {"description": "Request not found"}},
)
async def issue_qr(request_id: str, current_user: CurrentUser, qr_service: QRService = Depends(get_qr_service), user_record=Depends(_load_user_record)) -> QRIssueResponse:
    return await qr_service.issue_for_request(request_id, user_record)


@router.post(
    "/qr/scan",
    response_model=TrackingPublic,
    summary="Scan a QR reference",
    description="Validates authorization and returns only permitted tracking information - no patient identity.",
    responses={403: {"description": "Not authorized"}, 404: {"description": "Reference not found"}},
)
async def scan_qr(
    payload: QRScanRequest,
    current_user: CurrentUser,
    qr_service: QRService = Depends(get_qr_service),
    user_record=Depends(_load_user_record),
) -> TrackingPublic:
    return await qr_service.resolve_reference(payload.reference, user_record)


@router.get(
    "/tracking/{reference}",
    response_model=TrackingPublic,
    summary="Get tracking info by reference",
    description="Equivalent to scanning the QR; useful for direct-link tracking flows.",
    responses={403: {"description": "Not authorized"}, 404: {"description": "Reference not found"}},
)
async def get_tracking(
    reference: str,
    current_user: CurrentUser,
    qr_service: QRService = Depends(get_qr_service),
    user_record=Depends(_load_user_record),
) -> TrackingPublic:
    return await qr_service.resolve_reference(reference, user_record)
