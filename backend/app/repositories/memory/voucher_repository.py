import asyncio
from datetime import datetime, timezone
from dataclasses import replace
from uuid import uuid4

from app.repositories.interfaces.voucher_repository import VoucherRepository


class InMemoryVoucherRepository(VoucherRepository):
    def __init__(self):
        self.items = {}
        self._lock = asyncio.Lock()

    async def create(self, voucher):
        async with self._lock:
            if any(v.donation_id == voucher.donation_id for v in self.items.values()):
                raise ValueError("duplicate donation voucher")
            if any(v.code == voucher.code for v in self.items.values()):
                raise ValueError("duplicate voucher code")
            self.items[voucher.id] = voucher
            return voucher

    async def get_by_donation(self, donation_id):
        return next((v for v in self.items.values() if v.donation_id == donation_id), None)

    async def get_by_code_and_donor(self, code, donor_id):
        return next((v for v in self.items.values() if v.code == code and v.donor_id == donor_id), None)

    async def list_for_donor(self, donor_id):
        return sorted((v for v in self.items.values() if v.donor_id == donor_id), key=lambda v: v.issued_at, reverse=True)

    async def redeem_active(self, *, code, donor_id, partner_id, redeemed_at):
        async with self._lock:
            voucher = await self.get_by_code_and_donor(code, donor_id)
            if voucher is None or voucher.status != "ACTIVE" or voucher.expires_at <= datetime.now(timezone.utc):
                return None
            voucher = replace(voucher, status="REDEEMED", partner_id=partner_id,
                              redeemed_at=redeemed_at, transaction_reference=f"VXR-{uuid4().hex.upper()}")
            self.items[voucher.id] = voucher
            return voucher
