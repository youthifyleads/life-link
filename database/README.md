# Database Guidelines & Migrations (MSSQL)

## Overview
Life Link uses **Microsoft SQL Server (MSSQL)** for its persistent relational database.

## Golden Rules
1. **Never make direct, manual schema changes** to shared development, staging, or production databases.
2. **Every schema change must be a migration**: All DDL changes (tables, columns, indexes, constraints, views, stored procedures) must be committed to the repository as a versioned migration script in `database/migrations/`.
3. **Commit migrations with related application code**: A pull request that changes code dependent on database changes must include the corresponding migration file in the same PR.
4. **Idempotency & Safety**: Migrations must be written defensively (check for table/column existence where appropriate) and avoid destructive data loss without prior backups or deprecation cycles.
5. **No Secrets**: Never commit database connection strings containing passwords or credentials into SQL files or repository code.

## Migration File Naming Convention
```
V<VERSION>__<DESCRIPTION>.sql
```
Examples:
- `V001__initial_schema.sql`
- `V002__create_users_table.sql`
- `V003__add_emergency_contact_columns.sql`

## Structure
```
database/
├── migrations/       # Versioned SQL migration scripts
└── README.md         # Database documentation and migration policy
```
