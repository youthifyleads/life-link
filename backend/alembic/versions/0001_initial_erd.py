"""Initial Life Link ERD baseline (original 24-table schema)."""
from alembic import op
from sqlalchemy import MetaData
from sqlalchemy.schema import CreateTable,DropTable
from app.db.base import Base
import app.db.models  # noqa: F401
revision="0001_initial_erd"; down_revision=None; branch_labels=None; depends_on=None
ADDITIVE_TABLES={"refresh_tokens","password_reset_tokens","device_tokens","blood_bag_status_history"}
ADDITIVE_COLUMNS={"users":{"date_of_birth","email_verified"},"hospitals":{"latitude","longitude"},"donors":{"latitude","longitude","is_available"}}
def _baseline_metadata():
 m=MetaData()
 for t in Base.metadata.sorted_tables:
  if t.name in ADDITIVE_TABLES: continue
  t.to_metadata(m)
 for table,cols in ADDITIVE_COLUMNS.items():
  if table in m.tables:
   for c in list(m.tables[table].columns):
    if c.name in cols:
     m.tables[table]._columns._collection[:] = [item for item in m.tables[table]._columns._collection if item[1] is not c]
     m.tables[table]._columns._colset.discard(c)
 return m
def upgrade():
 m=_baseline_metadata()
 for table in m.sorted_tables:op.execute(CreateTable(table))
def downgrade():
 m=_baseline_metadata()
 for table in reversed(m.sorted_tables):op.execute(DropTable(table))
