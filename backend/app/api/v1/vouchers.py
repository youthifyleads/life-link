from fastapi import APIRouter, Depends, status

from app.core.domain import Role
from app.core.security import CurrentUser, require_roles
from app.schemas.vouchers import (PartnerVoucherRedemptionRequest, PartnerVoucherValidationRequest,
                                  VoucherIssueRequest, VoucherPublic, VoucherValidationPublic)
from app.services.dependencies import get_voucher_service
from app.services.voucher_service import VoucherService

router = APIRouter(prefix="/vouchers", tags=["Donation Vouchers"])
partner_router = APIRouter(prefix="/partners/vouchers", tags=["Partner Voucher Redemption"])

@router.post("/issue", response_model=VoucherPublic, status_code=status.HTTP_201_CREATED,
             summary="Issue the single voucher for a confirmed donation")
async def issue(payload: VoucherIssueRequest, current: CurrentUser = Depends(require_roles(Role.ADMIN, Role.BLOOD_BANK_OPERATOR)), svc: VoucherService = Depends(get_voucher_service)):
    return await svc.issue(payload.donation_id, current)

@router.get("/me", response_model=list[VoucherPublic], summary="List the authenticated donor's vouchers")
async def mine(current: CurrentUser, svc: VoucherService = Depends(get_voucher_service)):
    return await svc.list_mine(current.id)

@partner_router.post("/validate", response_model=VoucherValidationPublic, summary="Validate an active voucher before redemption")
async def validate(payload: PartnerVoucherValidationRequest, current: CurrentUser, svc: VoucherService = Depends(get_voucher_service)):
    return {"valid": True, "voucher": await svc.validate(payload.voucher_code, payload.donor_id, payload.partner_id, current)}

@partner_router.post("/redeem", response_model=VoucherPublic, summary="Atomically redeem an active validated voucher")
async def redeem(payload: PartnerVoucherRedemptionRequest, current: CurrentUser, svc: VoucherService = Depends(get_voucher_service)):
    return await svc.redeem(payload, current)
