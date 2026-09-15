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
Migrations use standard sequential numbering or Flyway versioning:
```
<NUMBER>_<description>.sql   (e.g., 001_initial_schema.sql)
V<VERSION>__<DESCRIPTION>.sql (e.g., V001__initial_schema.sql)
```

## Structure & Existing Migrations
```
database/
├── migrations/                                     # Versioned SQL migration scripts
│   ├── 000_create_schema_migrations.sql            # Schema migration tracking table
│   ├── 001_initial_schema.sql                      # Complete 24-table DDL schema
│   ├── 002_indexes.sql                             # Performance & FK indexes
│   ├── 003_views.sql                               # Reporting & inventory views
│   ├── 004_procedures_and_triggers.sql             # Stored procedures & audit triggers
│   ├── 005_seed_data.sql                           # Seed roles, permissions & QA users
│   ├── 006_add_notifications_related_request_id.sql # Notification FK to blood_requests
│   ├── 007_update_payments_and_allocations_pricing.sql # Unit pricing & payment uniqueness
│   └── 008_add_payment_gateway_fields.sql          # Paymob currency, provider & provider_order_id
├── LifeLink_Full_Database.sql                      # Consolidated all-in-one database script
└── README.md                                       # Database documentation & migration policy
```

### Migrations Inventory
1. **`000_create_schema_migrations.sql`**: Creates `dbo.schema_migrations` table for idempotency tracking.
2. **`001_initial_schema.sql`**: Full physical schema covering all core tables: `roles`, `permissions`, `role_permissions`, `users`, `hospitals`, `blood_banks`, `blood_requests`, `blood_bags`, `caregiver_assignments`, `notifications`, `audit_logs`, etc.
3. **`002_indexes.sql`**: Indexes for high-frequency queries and foreign key constraints.
4. **`003_views.sql`**: SQL views for quick inventory querying and reporting.
5. **`004_procedures_and_triggers.sql`**: Stored procedures and automatic audit trail triggers.
6. **`005_seed_data.sql`**: Default system roles (`SystemAdmin`, `HospitalStaff`, `BloodBankStaff`, `MedicalLead`, `PlatformSupport`, `NormalUser`), sample institutions, and QA test accounts with password `Test@123`.
7. **`006_add_notifications_related_request_id.sql`**: Adds nullable `related_request_id UNIQUEIDENTIFIER NULL` to `dbo.notifications` referencing `dbo.blood_requests(blood_request_id) ON DELETE SET NULL` with index `ix_notifications_related_request_id`.
8. **`007_update_payments_and_allocations_pricing.sql`**: Adds `unit_price NUMERIC(10,2)` to `dbo.request_allocations`, drops 1:1 unique constraint on `dbo.payments(blood_request_id)` for payment retries, adds `ix_payments_blood_request_id`, and adds filtered unique index `ux_payments_single_paid_per_request` to ensure at most one successful payment per request.
9. **`008_add_payment_gateway_fields.sql`**: Adds `currency VARCHAR(3)`, `provider VARCHAR(50)`, and `provider_order_id NVARCHAR(100)` with index `ix_payments_provider_order_id` to `dbo.payments` for Paymob integration.

## QA Test Accounts
All seed accounts configured in `005_seed_data.sql` use the standardized password `Test@123`. See [`backend/docs/QA_TEST_ACCOUNTS.md`](../backend/docs/QA_TEST_ACCOUNTS.md) for full credentials, role mappings, and login test cases.
