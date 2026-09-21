from fastapi import APIRouter, Depends
from app.core.domain import Role
from app.core.security import CurrentUser, require_roles
from app.schemas.caregiver import (
    CaregiverAssignmentCreate,
    CaregiverAssignmentPublic,
    CaregiverAssignmentUpdate,
    CaregiverBagScanPublic,
    CaregiverBagScanRequest,
    CaregiverPaymentInitiateRequest,
    CaregiverRequestScanPublic,
    CaregiverRequestScanRequest,
    PatientCreate,
    PatientPublic,
)
from app.schemas.payments import PaymentInitiateRequest, PaymentInitiateResponse, PaymentPublic
from app.services.caregiver_service import CaregiverService
from app.repositories.interfaces.user_repository import UserRepository
from app.services.dependencies import get_caregiver_service, get_payment_service, get_user_repository
from app.services.payment_service import PaymentService

router = APIRouter(prefix="/caregiver", tags=["Caregiver"])


async def _load_user_record(current_user: CurrentUser, user_repo: UserRepository = Depends(get_user_repository)):
    return await user_repo.get_by_id(current_user.id)


@router.post("/assignments", response_model=CaregiverAssignmentPublic, status_code=201, dependencies=[Depends(require_roles(Role.HOSPITAL_USER, Role.BLOOD_BANK_OPERATOR, Role.ADMIN, Role.MEDICAL_LEAD))])
async def create(data: CaregiverAssignmentCreate, current: CurrentUser, svc: CaregiverService = Depends(get_caregiver_service)):
    return await svc.create(data, current)


@router.get("/assignments", response_model=list[CaregiverAssignmentPublic])
async def list_items(current: CurrentUser, svc: CaregiverService = Depends(get_caregiver_service)):
    return await svc.list(current)


@router.get("/assignments/{assignment_id}", response_model=CaregiverAssignmentPublic)
async def get(assignment_id: str, current: CurrentUser, svc: CaregiverService = Depends(get_caregiver_service)):
    return await svc.get(assignment_id, current)


@router.patch("/assignments/{assignment_id}", response_model=CaregiverAssignmentPublic)
async def update(assignment_id: str, data: CaregiverAssignmentUpdate, current: CurrentUser, svc: CaregiverService = Depends(get_caregiver_service)):
    return await svc.update(assignment_id, data, current)


@router.post("/scan-request", response_model=CaregiverRequestScanPublic, summary="Scan hospital-issued blood request QR for caregiver")
async def scan_request(data: CaregiverRequestScanRequest, current: CurrentUser, svc: CaregiverService = Depends(get_caregiver_service)):
    res = await svc.scan_bag(data.qr_code, current)
    return CaregiverRequestScanPublic(
        request_id=res.request_id or res.blood_bag_id or "",
        tracking_reference=res.qr_code or data.qr_code,
        status=res.status,
        blood_type=res.blood_type,
        component=res.component,
        quantity=res.quantity,
        bank_name=res.bank_name,
        bank_location=res.bank_location,
        unit_price=res.unit_price,
        total_price=res.total_price,
        payment_status=res.payment_status,
        payment_url=res.payment_url,
        patient_name=res.patient_name,
        medical_record_number=res.medical_record_number,
    )


@router.post("/scan-bag", response_model=CaregiverBagScanPublic, summary="Scan blood bag QR for caregiver")
async def scan_bag(data: CaregiverBagScanRequest, current: CurrentUser, svc: CaregiverService = Depends(get_caregiver_service)):
    return await svc.scan_bag(data.qr_code, current)


@router.get("/bag/{qr_code}", response_model=CaregiverBagScanPublic, summary="Get blood bag details by QR for caregiver")
async def get_bag_by_qr(qr_code: str, current: CurrentUser, svc: CaregiverService = Depends(get_caregiver_service)):
    return await svc.scan_bag(qr_code, current)


# ── Caregiver Patients & Tracking (Flutter Mobile Compatibility) ──────────────
@router.get("/patients", response_model=list[PatientPublic], summary="List patients managed by caregiver")
async def list_patients(current: CurrentUser, svc: CaregiverService = Depends(get_caregiver_service)):
    return await svc.list_patients(current)


@router.post("/patients", response_model=PatientPublic, status_code=201, summary="Create patient profile")
async def create_patient(data: PatientCreate, current: CurrentUser, svc: CaregiverService = Depends(get_caregiver_service)):
    return await svc.create_patient(data, current)


@router.get("/allocations", response_model=list[CaregiverAssignmentPublic], summary="List allocations assigned to caregiver")
async def list_allocations(current: CurrentUser, svc: CaregiverService = Depends(get_caregiver_service)):
    return await svc.list(current)


@router.post("/payments/initiate", response_model=PaymentInitiateResponse, status_code=201, summary="Initiate payment for allocation or blood request")
async def initiate_caregiver_payment(
    data: CaregiverPaymentInitiateRequest,
    current: CurrentUser,
    payment_svc: PaymentService = Depends(get_payment_service),
    caregiver_svc: CaregiverService = Depends(get_caregiver_service),
):
    req_id = data.blood_request_id
    if not req_id and data.allocation_id:
        assignment = await caregiver_svc.repo.get_by_id(data.allocation_id)
        if assignment and caregiver_svc.blood_bag_repo:
            bag = await caregiver_svc.blood_bag_repo.get_by_id(assignment.blood_bag_id)
            if bag and getattr(bag, "allocated_request_id", None):
                req_id = bag.allocated_request_id
        if not req_id:
            req_id = data.allocation_id

    pay_payload = PaymentInitiateRequest(blood_request_id=req_id or "", payment_method="card")
    return await payment_svc.initiate_payment(pay_payload, current)


@router.get("/payments/history", response_model=list[PaymentPublic], summary="List payment history for caregiver")
async def caregiver_payment_history(
    current: CurrentUser,
    payment_svc: PaymentService = Depends(get_payment_service),
):
    return await payment_svc.list_history(current)
