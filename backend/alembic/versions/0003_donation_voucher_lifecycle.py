"""replace the legacy voucher number with the secure voucher lifecycle

Revision ID: 0003_donation_voucher_lifecycle
Revises: 0002_mvp_security_bags
"""
from alembic import op
import sqlalchemy as sa

revision = "0003_donation_voucher_lifecycle"
down_revision = "0002_mvp_security_bags"
branch_labels = None
depends_on = None


def upgrade() -> None:
    # 0001 historically builds from metadata. A new installation therefore
    # already has the current table shape; an upgraded installation has the
    # legacy columns and takes the data-preserving path below.
    columns = {column["name"] for column in sa.inspect(op.get_bind()).get_columns("donation_vouchers")}
    if "voucher_id" not in columns:
        return
    # Preserve legacy voucher rows and their one-per-donation unique constraint.
    op.alter_column("donation_vouchers", "voucher_id", new_column_name="id", existing_type=sa.String(50))
    op.alter_column("donation_vouchers", "voucher_number", new_column_name="code", existing_type=sa.String(100))
    op.add_column("donation_vouchers", sa.Column("donor_id", sa.String(50), nullable=True))
    op.execute("UPDATE donation_vouchers SET donor_id = donations.donor_id FROM donation_vouchers JOIN donations ON donations.donation_id = donation_vouchers.donation_id")
    op.alter_column("donation_vouchers", "donor_id", nullable=False, existing_type=sa.String(50))
    op.create_foreign_key("fk_donation_vouchers_donor_id", "donation_vouchers", "donors", ["donor_id"], ["donor_id"])
    op.add_column("donation_vouchers", sa.Column("partner_id", sa.String(50), nullable=True))
    op.create_foreign_key("fk_donation_vouchers_partner_id", "donation_vouchers", "users", ["partner_id"], ["user_id"])
    op.add_column("donation_vouchers", sa.Column("value", sa.Numeric(12, 2), nullable=False, server_default="0"))
    op.add_column("donation_vouchers", sa.Column("expires_at", sa.DateTime(timezone=True), nullable=True))
    op.execute("UPDATE donation_vouchers SET status = CASE WHEN UPPER(status) IN ('ISSUED', 'ACTIVE') THEN 'ACTIVE' ELSE UPPER(status) END")
    op.execute("UPDATE donation_vouchers SET expires_at = DATEADD(day, 90, issued_at)")
    op.alter_column("donation_vouchers", "expires_at", nullable=False, existing_type=sa.DateTime(timezone=True))
    op.add_column("donation_vouchers", sa.Column("redeemed_at", sa.DateTime(timezone=True), nullable=True))
    op.add_column("donation_vouchers", sa.Column("transaction_reference", sa.String(100), nullable=True))
    op.create_unique_constraint("uq_donation_vouchers_transaction_reference", "donation_vouchers", ["transaction_reference"])
    op.create_index("ix_donation_vouchers_code", "donation_vouchers", ["code"], unique=True)
    op.create_index("ix_donation_vouchers_donor_id", "donation_vouchers", ["donor_id"])
    op.create_index("ix_donation_vouchers_status", "donation_vouchers", ["status"])
    op.create_index("ix_donation_vouchers_expires_at", "donation_vouchers", ["expires_at"])


def downgrade() -> None:
    columns = {column["name"] for column in sa.inspect(op.get_bind()).get_columns("donation_vouchers")}
    if "voucher_id" in columns:
        return
    op.drop_index("ix_donation_vouchers_expires_at", table_name="donation_vouchers")
    op.drop_index("ix_donation_vouchers_status", table_name="donation_vouchers")
    op.drop_index("ix_donation_vouchers_donor_id", table_name="donation_vouchers")
    op.drop_index("ix_donation_vouchers_code", table_name="donation_vouchers")
    op.drop_constraint("uq_donation_vouchers_transaction_reference", "donation_vouchers", type_="unique")
    op.drop_column("donation_vouchers", "transaction_reference")
    op.drop_column("donation_vouchers", "redeemed_at")
    op.drop_column("donation_vouchers", "expires_at")
    op.drop_column("donation_vouchers", "value")
    op.drop_constraint("fk_donation_vouchers_partner_id", "donation_vouchers", type_="foreignkey")
    op.drop_column("donation_vouchers", "partner_id")
    op.drop_constraint("fk_donation_vouchers_donor_id", "donation_vouchers", type_="foreignkey")
    op.drop_column("donation_vouchers", "donor_id")
    op.alter_column("donation_vouchers", "code", new_column_name="voucher_number", existing_type=sa.String(100))
    op.alter_column("donation_vouchers", "id", new_column_name="voucher_id", existing_type=sa.String(50))
