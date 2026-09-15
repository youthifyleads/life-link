"""initial Life Link ERD schema

Revision ID: 0001_initial_erd
"""
from alembic import op
from sqlalchemy.schema import CreateTable, DropTable

from app.db.base import Base
import app.db.models  # noqa: F401

revision = "0001_initial_erd"
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    for table in Base.metadata.sorted_tables:
        op.execute(CreateTable(table))


def downgrade() -> None:
    for table in reversed(Base.metadata.sorted_tables):
        op.execute(DropTable(table))
