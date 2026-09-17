from uuid import uuid4

from sqlalchemy import select, update
from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.models import DonationVoucherModel
from app.repositories.interfaces.voucher_repository import VoucherRepository
from app.repositories.models import DonationVoucherRecord


def _record(row: DonationVoucherModel) -> DonationVoucherRecord:
    return DonationVoucherRecord(row.id, row.code, row.donor_id, row.partner_id, row.value,
                                 row.status, row.issued_at, row.expires_at, row.redeemed_at,
                                 row.transaction_reference, row.donation_id)


class SQLAlchemyVoucherRepository(VoucherRepository):
    def __init__(self, session: AsyncSession): self.session = session

    async def create(self, voucher):
        self.session.add(DonationVoucherModel(**voucher.__dict__))
        try:
            await self.session.commit()
        except IntegrityError as exc:
            await self.session.rollback()
            raise ValueError("duplicate voucher") from exc
        return voucher

    async def get_by_donation(self, donation_id):
        row = (await self.session.execute(select(DonationVoucherModel).where(DonationVoucherModel.donation_id == donation_id))).scalar_one_or_none()
        return _record(row) if row else None

    async def get_by_code_and_donor(self, code, donor_id):
        row = (await self.session.execute(select(DonationVoucherModel).where(DonationVoucherModel.code == code, DonationVoucherModel.donor_id == donor_id))).scalar_one_or_none()
        return _record(row) if row else None

    async def list_for_donor(self, donor_id):
        rows = (await self.session.execute(select(DonationVoucherModel).where(DonationVoucherModel.donor_id == donor_id).order_by(DonationVoucherModel.issued_at.desc()))).scalars().all()
        return [_record(row) for row in rows]

    async def redeem_active(self, *, code, donor_id, partner_id, redeemed_at):
        # Atomic compare-and-set: competing redemptions can update at most one row.
        reference = f"VXR-{uuid4().hex.upper()}"
        result = await self.session.execute(update(DonationVoucherModel).where(
            DonationVoucherModel.code == code, DonationVoucherModel.donor_id == donor_id,
            DonationVoucherModel.status == "ACTIVE", DonationVoucherModel.expires_at > redeemed_at,
        ).values(status="REDEEMED", partner_id=partner_id, redeemed_at=redeemed_at,
                 transaction_reference=reference))
        if result.rowcount != 1:
            await self.session.rollback()
            return None
        await self.session.commit()
        return await self.get_by_code_and_donor(code, donor_id)
