# Shared Database Migrations

The authoritative SQL Server/Azure SQL schema changes belong here and are maintained by the Database Developer.

Backend SQLAlchemy models in `app/db/models.py` must mirror the deployed schema. Alembic is retained only for local/bootstrap compatibility and must not become a second independent production schema history.

When a schema change is approved, add the authoritative SQL migration here first, then update the ORM mapping and tests.

## 001_initial_schema.sql

This directory previously had no actual SQL in it, which meant the declared
"source of truth" had nothing for the shared database to be checked against.
`001_initial_schema.sql` fills that gap: it's generated from the reviewed
ORM metadata and is a **proposal for Database Developer review**, not an
already-applied migration. It includes one additive column
(`notifications.related_request_id`) that is not in the original
`schema.pdf` - see the "FLAGGED" comment inside the file and
`docs/ERD_MAPPING.md` for why. Please review, adjust as needed, and only
then treat it as authoritative.

