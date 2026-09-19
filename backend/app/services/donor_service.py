from datetime import datetime, timezone
from uuid import uuid4
from app.core.domain import RequestStatus
from app.core.exceptions import ConflictError, NotFoundError, ForbiddenError, ValidationAppError
from app.repositories.interfaces.donor_repository import DonorRepository
from app.repositories.interfaces.request_repository import RequestRepository
from app.repositories.interfaces.user_repository import UserRepository
from app.repositories.models import *


class DonorService:
    def __init__(
        self,
        repo: DonorRepository,
        user_repo: UserRepository,
        request_repo: RequestRepository | None = None,
        matching_service=None,
        voucher_service=None,
    ):
        self.repo = repo
        self.user_repo = user_repo
        self.request_repo = request_repo
        self.matching_service = matching_service
        self.voucher_service = voucher_service

    async def get_me(self, user_id):
        return await self.repo.get_by_user_id(user_id)

    async def create_for_user(self, user_id, data):
        if await self.repo.get_by_user_id(user_id):
            raise ConflictError("Donor profile already exists", code="DONOR_ALREADY_EXISTS")
        return await self.repo.create(
            DonorRecord(
                str(uuid4()),
                user_id,
                data.blood_type,
                data.date_of_birth,
                data.governorate,
                "eligible",
                None,
                getattr(data, "latitude", None),
                getattr(data, "longitude", None),
            )
        )

    async def update(self, user_id, data):
        d = await self.repo.get_by_user_id(user_id)
        if not d:
            raise NotFoundError("Donor profile not found", code="DONOR_NOT_FOUND")
        for k, v in data.model_dump(exclude_unset=True).items():
            setattr(d, k, v)
        return await self.repo.update(d)

    async def get(self, i):
        d = await self.repo.get_by_id(i)
        if not d:
            raise NotFoundError("Donor not found", code="DONOR_NOT_FOUND")
        return d

    async def donations(self, user_id):
        d = await self.repo.get_by_user_id(user_id)
        if not d:
            raise NotFoundError("Donor profile not found", code="DONOR_NOT_FOUND")
        return await self.repo.list_donations(d.id)

    async def create_donation(self, user_id, data):
        donor = await self.repo.get_by_user_id(user_id)
        if not donor:
            raise NotFoundError("Donor profile not found", code="DONOR_NOT_FOUND")
        donor_id = donor.id
        r = DonationRecord(
            str(uuid4()),
            data.blood_type,
            data.quantity,
            data.donation_date,
            data.status,
            datetime.now(timezone.utc),
            donor_id,
            data.blood_bank_id,
        )
        donor.last_donation_date = data.donation_date
        donor.eligibility_status = "eligible"
        await self.repo.update(donor)
        donation = await self.repo.create_donation(r)
        # Confirmation is the issuance trigger. Voucher failures never undo a
        # confirmed donation; retrying POST /vouchers/issue is then safe.
        if (donation.status or "").upper() == "CONFIRMED" and self.voucher_service:
            try:
                await self.voucher_service.issue(donation.id)
            except ConflictError:
                pass
        return donation

    async def respond(self, user_id, data):
        donor = await self.repo.get_by_user_id(user_id)
        if not donor:
            raise NotFoundError("Donor profile not found", code="DONOR_NOT_FOUND")

        # Quota check when a donor accepts:
        if self.request_repo:
            req = await self.request_repo.get_by_id(data.blood_request_id)
            if not req:
                raise NotFoundError("Blood request not found", code="REQUEST_NOT_FOUND")

            if req.status in (RequestStatus.CANCELLED, RequestStatus.COMPLETED, RequestStatus.EXPIRED):
                raise ValidationAppError(
                    "This blood request is closed and no longer accepting donations.",
                    code="REQUEST_CLOSED",
                )

            if data.status == "accepted":
                existing = await self.repo.list_responses_for_request(data.blood_request_id)
                accepted_count = sum(1 for r in existing if r.status == "accepted")
                if accepted_count >= req.quantity_units:
                    raise ValidationAppError(
                        "تم اكتمال العدد المطلوب من المتبرعين لهذا الطلب بالفعل. شكراً لمبادرتك النبيلة!",
                        code="REQUEST_ALREADY_FULFILLED",
                    )

        return await self.repo.create_response(
            DonationResponseRecord(
                str(uuid4()),
                datetime.now(timezone.utc),
                data.status,
                data.notes,
                data.blood_request_id,
                donor.id,
            )
        )

    async def responses(self, user_id):
        d = await self.repo.get_by_user_id(user_id)
        if not d:
            raise NotFoundError("Donor profile not found", code="DONOR_NOT_FOUND")
        return await self.repo.list_responses(d.id)

    async def get_nearby_requests(self, user_id, limit: int = 20, max_distance_km: float | None = None):
        if not self.matching_service:
            return []
        return await self.matching_service.find_nearby_requests_for_donor(
            donor_user_id=user_id,
            limit=limit,
            max_distance_km=max_distance_km,
        )

    async def add_consent(self, user_id, data):
        d = await self.repo.get_by_user_id(user_id)
        if not d:
            raise NotFoundError("Donor profile not found", code="DONOR_NOT_FOUND")
        now = datetime.now(timezone.utc) if data.granted else None
        return await self.repo.create_consent(
            ConsentRecord(str(uuid4()), d.id, data.consent_type, data.granted, now, None)
        )

    async def consents(self, user_id):
        d = await self.repo.get_by_user_id(user_id)
        if not d:
            raise NotFoundError("Donor profile not found", code="DONOR_NOT_FOUND")
        return await self.repo.list_consents(d.id)
