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

```bash
alembic upgrade head
python scripts/seed_dev.py
```

The initial migration creates the tables represented by the supplied ERD. Future schema changes must be added as new Alembic revisions rather than editing an already-applied revision.

## SQL Server driver

The Dockerfile installs Microsoft ODBC Driver 18. On a local machine, install the matching Microsoft SQL Server ODBC driver before using the SQL repository mode.

## What cannot be verified in this package

A real SQL Server/Azure SQL connection requires the team's actual host, database, credentials/secrets, network access, and shared development environment. Those values are intentionally not included in source control.
