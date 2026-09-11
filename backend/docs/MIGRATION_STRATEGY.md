# Database Migration Strategy

## Decision
`database/migrations` is the intended shared-database schema source of truth.

`backend/alembic` is retained only as a development/bootstrap compatibility mechanism. It must not independently evolve the shared/staging/production database.

## Rule
For a schema change:
1. Database Developer updates the authoritative SQL migration.
2. Backend updates SQLAlchemy ORM models to match the resulting schema.
3. Backend tests/metadata checks are run.
4. The same SQL migration is applied to the target SQL Server/Azure SQL environment.

Do not create an independent Alembic migration for the same production schema change.
