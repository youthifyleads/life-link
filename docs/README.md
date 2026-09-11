# Life Link Documentation

Welcome to the Life Link project documentation directory.

## System Architecture & Diagrams
- [`Life link Diagrams.pdf`](Life%20link%20Diagrams.pdf): Visual system architecture, data flow diagrams, and service boundaries.

## Technical Specifications & Guides

### Backend & API
- [API Specification](../backend/docs/API_SPEC.md): Complete OpenAPI endpoint table, request payloads, and status codes.
- [RBAC & Permissions](../backend/docs/RBAC.md): Role-based access control rules, scopes, and endpoint authorization matrix.
- [Role Matrix](../backend/docs/ROLE_MATRIX.md): Detailed mapping between database role names (PascalCase & snake_case) and backend domain roles.
- [QA Test Accounts](../backend/docs/QA_TEST_ACCOUNTS.md): Standardized development/QA credentials (`Test@123`), roles, and test requests.
- [ERD Mapping](../backend/docs/ERD_MAPPING.md): Mapping between the physical 24-table database schema and SQLAlchemy ORM models.
- [Database Strategy](../backend/docs/MIGRATION_STRATEGY.md): Rules for maintaining the single source of truth for database migrations.

### Database & Migrations
- [Database Guidelines & Migrations](../database/README.md): MSSQL setup, migration naming conventions, and inventory of migrations (`000` through `006`).
- [Consolidated Database Script](../database/LifeLink_Full_Database.sql): All-in-one T-SQL script for fresh Azure SQL / SSMS database deployment.

### Onboarding & Deployment
- **Web & Mobile**: Setup instructions for React (web) and Flutter (mobile).
- **Deployment & DevOps**: CI/CD workflows, environment configuration, and release procedures.
