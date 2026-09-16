# Database Setup — Life Link

## Target

Microsoft SQL Server / Azure SQL, accessed through SQLAlchemy 2.x and `aioodbc`.

## Configuration

Set:

```env
REPOSITORY_BACKEND=sqlserver
DATABASE_URL=mssql+aioodbc://USER:PASSWORD@HOST:1433/DATABASE?driver=ODBC+Driver+18+for+SQL+Server&TrustServerCertificate=no&Encrypt=yes
```

For local API demos/tests, keep `REPOSITORY_BACKEND=memory`.

## Migration

The shared SQL Server/Azure SQL schema source of truth is `database/migrations/`, maintained by the Database Developer.

`backend/alembic/` is retained for local/bootstrap compatibility only. Do not use Alembic as a second independent production schema history. See `docs/MIGRATION_STRATEGY.md`.

For local/bootstrap environments where Alembic is intentionally used:

```bash
alembic upgrade head
```

After an authoritative SQL migration is approved, update the SQLAlchemy models and tests to match it.

## SQL Server driver

The Dockerfile installs Microsoft ODBC Driver 18. On a local machine, install the matching Microsoft SQL Server ODBC driver before using the SQL repository mode.

## What cannot be verified in this package

A real SQL Server/Azure SQL connection requires the team's actual host, database, credentials/secrets, network access, and shared development environment. Those values are intentionally not included in source control.
