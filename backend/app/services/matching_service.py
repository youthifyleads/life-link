import math
from datetime import date, datetime, timezone
from app.core.domain import NotificationTrigger, RequestStatus
from app.core.exceptions import NotFoundError, ValidationAppError
from app.repositories.interfaces.donor_repository import DonorRepository
from app.repositories.interfaces.institution_repository import InstitutionRepository
from app.repositories.interfaces.request_repository import RequestRepository
from app.repositories.interfaces.user_repository import UserRepository
from app.schemas.donors import MatchingDonorPublic, NearbyBloodRequestPublic

# Clinical Red Blood Cell (RBC) & Whole Blood compatibility:
# Maps recipient blood type to the set of compatible donor blood types.
COMPATIBLE_DONORS_FOR_RECIPIENT: dict[str, set[str]] = {
    "O-": {"O-"},
    "O+": {"O-", "O+"},
    "A-": {"O-", "A-"},
    "A+": {"O-", "O+", "A-", "A+"},
    "B-": {"O-", "B-"},
    "B+": {"O-", "O+", "B-", "B+"},
    "AB-": {"O-", "A-", "B-", "AB-"},
    "AB+": {"O-", "O+", "A-", "A+", "B-", "B+", "AB-", "AB+"},
}

# Reverse compatibility:
# Maps donor blood type to recipient blood types who can safely receive it.
RECIPIENTS_FOR_DONOR: dict[str, set[str]] = {
    "O-": {"O-", "O+", "A-", "A+", "B-", "B+", "AB-", "AB+"},
    "O+": {"O+", "A+", "B+", "AB+"},
    "A-": {"A-", "A+", "AB-", "AB+"},
    "A+": {"A+", "AB+"},
    "B-": {"B-", "B+", "AB-", "AB+"},
    "B+": {"B+", "AB+"},
    "AB-": {"AB-", "AB+"},
    "AB+": {"AB+"},
}

# Approximate central coordinates for Egyptian governorates as fallback
EGYPT_GOVERNORATE_COORDINATES: dict[str, tuple[float, float]] = {
    "cairo": (30.0444, 31.2357),
    "giza": (30.0131, 31.2089),
    "alexandria": (31.2001, 29.9187),
    "dakahlia": (31.0379, 31.3815),
    "sharqia": (30.5877, 31.5020),
    "qalyubia": (30.4591, 31.1786),
    "gharbia": (30.7865, 31.0004),
    "monufia": (30.5583, 30.9933),
    "beheira": (31.0364, 30.4699),
    "ismailia": (30.6043, 32.2723),
    "suez": (29.9668, 32.5498),
    "port said": (31.2653, 32.3019),
    "damietta": (31.4175, 31.8144),
    "fayoum": (29.3084, 30.8428),
    "beni suef": (29.0661, 31.0994),
    "minya": (28.1099, 30.7503),
    "assiut": (27.1783, 31.1859),
    "sohag": (26.5569, 31.6948),
    "qena": (26.1551, 32.7160),
    "luxor": (25.6872, 32.6396),
    "aswan": (24.0889, 32.8998),
    "red sea": (27.2579, 33.8116),
    "new valley": (25.4514, 30.5472),
    "matrouh": (31.3543, 27.2373),
    "north sinai": (31.1316, 33.7984),
    "south sinai": (28.9702, 33.6192),
}


def normalize_blood_type(bt: str | None) -> str:
    """Normalize blood type, fixing URL query parameter '+' decoded to space ' '."""
    if not bt:
        return ""
    cleaned = bt.replace(" ", "+").strip().upper()
    return cleaned


def haversine_distance(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """Calculate the great-circle distance between two points on Earth in km using Haversine formula."""
    R = 6371.0  # Earth's mean radius in kilometers
    dlat = math.radians(lat2 - lat1)
    dlon = math.radians(lon2 - lon1)
    a = (
        math.sin(dlat / 2.0) ** 2
        + math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * math.sin(dlon / 2.0) ** 2
    )
    c = 2.0 * math.atan2(math.sqrt(a), math.sqrt(1.0 - a))
    return round(R * c, 2)


class MatchingService:
    def __init__(
        self,
        donor_repo: DonorRepository,
        user_repo: UserRepository,
        request_repo: RequestRepository | None = None,
        institution_repo: InstitutionRepository | None = None,
    ):
        self.donor_repo = donor_repo
        self.user_repo = user_repo
        self.request_repo = request_repo
        self.institution_repo = institution_repo

    async def find_matching_donors(
        self,
        blood_type: str,
        target_lat: float | None = None,
        target_lng: float | None = None,
        max_distance_km: float | None = None,
        exact_match: bool = False,
        limit: int = 50,
    ) -> list[MatchingDonorPublic]:
        bt = normalize_blood_type(blood_type)
        if bt not in COMPATIBLE_DONORS_FOR_RECIPIENT:
            raise ValidationAppError(f"Invalid blood type '{blood_type}'", code="INVALID_BLOOD_TYPE")

        compatible_types = {bt} if exact_match else COMPATIBLE_DONORS_FOR_RECIPIENT[bt]
        all_donors = await self.donor_repo.list_all()
        today = date.today()

        matches: list[MatchingDonorPublic] = []

        for donor in all_donors:
            # 1. Compatibility check
            donor_bt = normalize_blood_type(donor.blood_type)
            if donor_bt not in compatible_types:
                continue

            # 2. Eligibility status check ("مؤهل")
            # Donors start as "eligible" (or "pending" healthy). Only exclude explicitly "ineligible".
            status = (donor.eligibility_status or "eligible").strip().lower()
            if status == "ineligible":
                continue

            # 3. 6-Month Rule ("آخر تبرع مؤكد من >= 6 شهور")
            days_since = None
            if donor.last_donation_date:
                ld_date = donor.last_donation_date
                if isinstance(ld_date, datetime):
                    ld_date = ld_date.date()
                elif isinstance(ld_date, str):
                    try:
                        ld_date = date.fromisoformat(ld_date[:10])
                    except ValueError:
                        ld_date = None

                if ld_date:
                    days_since = (today - ld_date).days
                    if days_since < 180:
                        # Excluded: donated less than 6 months (180 days) ago
                        continue

            # 4. User availability & active check ("Donor متاح")
            user = await self.user_repo.get_by_id(donor.user_id)
            if not user or not user.is_active or user.status != "active":
                continue

            # 5. Distance calculation (using GPS or fallback to governorate center)
            donor_lat = donor.latitude
            donor_lng = donor.longitude

            if (donor_lat is None or donor_lng is None) and donor.governorate:
                gov_key = donor.governorate.strip().lower()
                if gov_key in EGYPT_GOVERNORATE_COORDINATES:
                    donor_lat, donor_lng = EGYPT_GOVERNORATE_COORDINATES[gov_key]

            dist_km = None
            if target_lat is not None and target_lng is not None and donor_lat is not None and donor_lng is not None:
                dist_km = haversine_distance(target_lat, target_lng, float(donor_lat), float(donor_lng))
                if max_distance_km is not None and dist_km > max_distance_km:
                    continue

            phone = None
            if hasattr(user, "phones") and user.phones:
                phone = user.phones[0]
            elif hasattr(user, "phone"):
                phone = user.phone

            matches.append(
                MatchingDonorPublic(
                    donor_id=donor.id,
                    user_id=donor.user_id,
                    full_name=user.full_name or "Anonymous Donor",
                    phone=phone,
                    blood_type=donor_bt,
                    governorate=donor.governorate,
                    distance_km=dist_km,
                    eligibility_status=donor.eligibility_status or "eligible",
                    last_donation_date=donor.last_donation_date if isinstance(donor.last_donation_date, date) else None,
                    days_since_last_donation=days_since,
                )
            )

        # Sort: Closest first (donors with calculated distance first, sorted by dist_km ascending)
        matches.sort(
            key=lambda d: (d.distance_km is None, d.distance_km if d.distance_km is not None else float("inf"))
        )

        return matches[:limit]

    async def find_matches_for_request(
        self,
        request_id: str,
        exact_match: bool = False,
        max_distance_km: float | None = None,
        limit: int = 50,
    ) -> list[MatchingDonorPublic]:
        if not self.request_repo:
            raise NotFoundError("Request repository not configured", code="INTERNAL_ERROR")

        req = await self.request_repo.get_by_id(request_id)
        if not req:
            raise NotFoundError("Blood request not found", code="REQUEST_NOT_FOUND")

        target_lat = None
        target_lng = None
        if self.institution_repo and req.hospital_id:
            hosp = await self.institution_repo.get("hospital", req.hospital_id)
            if hosp and hosp.governorate:
                gov_key = hosp.governorate.strip().lower()
                if gov_key in EGYPT_GOVERNORATE_COORDINATES:
                    target_lat, target_lng = EGYPT_GOVERNORATE_COORDINATES[gov_key]

        if target_lat is None or target_lng is None:
            target_lat, target_lng = EGYPT_GOVERNORATE_COORDINATES["cairo"]

        return await self.find_matching_donors(
            blood_type=req.blood_type,
            target_lat=target_lat,
            target_lng=target_lng,
            max_distance_km=max_distance_km,
            exact_match=exact_match,
            limit=limit,
        )

    async def notify_top_matching_donors(
        self,
        request_id: str,
        count: int = 5,
        exact_match: bool = False,
        max_distance_km: float | None = None,
        notification_service=None,
    ) -> tuple[int, list[MatchingDonorPublic]]:
        """Notify top N closest matching donors for a blood request."""
        matches = await self.find_matches_for_request(
            request_id=request_id,
            exact_match=exact_match,
            max_distance_km=max_distance_km,
            limit=count,
        )

        top_donors = matches[:count]

        if notification_service and top_donors:
            req = await self.request_repo.get_by_id(request_id)
            hosp_name = "Life Link Hospital / Blood Bank"
            if self.institution_repo and req and req.hospital_id:
                hosp = await self.institution_repo.get("hospital", req.hospital_id)
                if hosp:
                    hosp_name = hosp.name

            for donor in top_donors:
                await notification_service.notify(
                    user_id=donor.user_id,
                    trigger=NotificationTrigger.URGENT_REQUEST,
                    message=(
                        f"طلب تبرع بالدم عاجل: {hosp_name} بحاجة لفصيلة دمك ({donor.blood_type}). "
                        f"يمكنك فتح التطبيق لتأكيد التبرع والمساعدة في إنقاذ حياة."
                    ),
                    related_request_id=request_id,
                )

        return len(top_donors), top_donors

    async def find_nearby_requests_for_donor(
        self,
        donor_user_id: str,
        limit: int = 20,
        max_distance_km: float | None = None,
    ) -> list[NearbyBloodRequestPublic]:
        """Find open blood requests that match the donor's blood type, sorted by distance from the donor."""
        donor = await self.donor_repo.get_by_user_id(donor_user_id)
        if not donor:
            raise NotFoundError("Donor profile not found", code="DONOR_NOT_FOUND")

        # Eligibility check
        if (donor.eligibility_status or "eligible").lower() == "ineligible":
            return []

        # 6-Month check
        if donor.last_donation_date:
            ld_date = donor.last_donation_date
            if isinstance(ld_date, datetime):
                ld_date = ld_date.date()
            elif isinstance(ld_date, str):
                try:
                    ld_date = date.fromisoformat(ld_date[:10])
                except ValueError:
                    ld_date = None
            if ld_date and (date.today() - ld_date).days < 180:
                # Still in recovery period (less than 6 months), no nearby requests shown
                return []

        donor_bt = normalize_blood_type(donor.blood_type)
        if not donor_bt or donor_bt not in RECIPIENTS_FOR_DONOR:
            return []

        compatible_recipient_types = RECIPIENTS_FOR_DONOR[donor_bt]

        # Donor location
        donor_lat = donor.latitude
        donor_lng = donor.longitude
        if (donor_lat is None or donor_lng is None) and donor.governorate:
            gov_key = donor.governorate.strip().lower()
            if gov_key in EGYPT_GOVERNORATE_COORDINATES:
                donor_lat, donor_lng = EGYPT_GOVERNORATE_COORDINATES[gov_key]

        if not self.request_repo:
            return []

        all_requests = await self.request_repo.list_all()
        nearby: list[NearbyBloodRequestPublic] = []

        for req in all_requests:
            # Only open requests
            if req.status not in (RequestStatus.REQUESTED, RequestStatus.ACKNOWLEDGED, RequestStatus.CONFIRMED):
                continue

            req_bt = normalize_blood_type(req.blood_type)
            if req_bt not in compatible_recipient_types:
                continue

            # USER REQUIREMENT:
            # Check if this request has already reached its required accepted donors count (quantity_units)
            responses = await self.donor_repo.list_responses_for_request(req.id)
            accepted_count = sum(1 for r in responses if r.status == "accepted")
            if accepted_count >= req.quantity_units:
                # Quota reached: Cancelled/Hidden from remaining donors
                continue

            # Resolve hospital details & distance
            hosp_name = "Hospital / Blood Bank"
            hosp_gov = None
            hosp_lat, hosp_lng = None, None
            if self.institution_repo and req.hospital_id:
                hosp = await self.institution_repo.get("hospital", req.hospital_id)
                if hosp:
                    hosp_name = hosp.name
                    hosp_gov = hosp.governorate
                    if hosp.governorate:
                        gkey = hosp.governorate.strip().lower()
                        if gkey in EGYPT_GOVERNORATE_COORDINATES:
                            hosp_lat, hosp_lng = EGYPT_GOVERNORATE_COORDINATES[gkey]

            dist_km = None
            if donor_lat is not None and donor_lng is not None and hosp_lat is not None and hosp_lng is not None:
                dist_km = haversine_distance(float(donor_lat), float(donor_lng), float(hosp_lat), float(hosp_lng))
                if max_distance_km is not None and dist_km > max_distance_km:
                    continue

            nearby.append(
                NearbyBloodRequestPublic(
                    request_id=req.id,
                    hospital_name=hosp_name,
                    governorate=hosp_gov,
                    blood_type=req_bt,
                    component=req.component,
                    quantity_units=req.quantity_units,
                    urgency=req.urgency,
                    distance_km=dist_km,
                    notes=req.notes,
                    created_at=req.created_at,
                )
            )

        # Sort closest first
        nearby.sort(
            key=lambda r: (r.distance_km is None, r.distance_km if r.distance_km is not None else float("inf"))
        )

        return nearby[:limit]
