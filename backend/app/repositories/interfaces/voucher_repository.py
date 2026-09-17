from abc import ABC, abstractmethod

from app.repositories.models import DonationVoucherRecord


class VoucherRepository(ABC):
    @abstractmethod
    async def create(self, voucher: DonationVoucherRecord) -> DonationVoucherRecord: ...

    @abstractmethod
    async def get_by_donation(self, donation_id: str) -> DonationVoucherRecord | None: ...

    @abstractmethod
    async def get_by_code_and_donor(self, code: str, donor_id: str) -> DonationVoucherRecord | None: ...

    @abstractmethod
    async def list_for_donor(self, donor_id: str) -> list[DonationVoucherRecord]: ...

    @abstractmethod
    async def redeem_active(self, *, code: str, donor_id: str, partner_id: str, redeemed_at) -> DonationVoucherRecord | None: ...
