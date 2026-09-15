# Life Link Backend — Final Build Review

## Implemented

- FastAPI application with `/api/v1` routing, validation, centralized errors and OpenAPI.
- JWT authentication and role-based authorization.
- Hospital/Blood Bank/Admin user and institution APIs.
- Hospital request lifecycle: Requested → Acknowledged → Confirmed → Prepared → Completed, with Cancelled/Expired paths.
- Request status-history persistence.
- Reported blood-bag inventory APIs with blood-bank scoping.
- Secure signed QR/tracking references without adding a non-schema tracking column.
- QR access authorization and audit logging.
- Notification API and request-status notification triggers.
- Supporting-document upload/review with uploader/reviewer fields.
- SQLAlchemy ORM matching all 24 tables in the supplied `schema.pdf`.
- Separate `user_phones`, `hospital_phones`, and `blood_bank_phones` tables.
- SQL Server/Azure SQL async repository layer using `aioodbc`.
- In-memory repository mode for tests/demo.
- Alembic initial migration generated from the final ORM metadata.
- Development seed script for roles, permissions, institutions and users.
- Docker setup and environment-based configuration.
- API, database and ERD documentation plus Postman collection.

## Deliberately not invented

The supplied schema alone does not define complete business workflows for
payment providers, clinical cross-match/release, advanced donor rewards,
AI forecasting, IoT telemetry, or advanced geolocation. Those remain outside
this backend's MVP logic unless the Technical Lead/Product owner supplies
approved acceptance criteria.

## Verification completed here

- `compileall` for application, migration and seed code: PASS.
- SQLAlchemy mapper configuration: PASS.
- ORM metadata table count: 24, matching the supplied schema table set: PASS.
- Alembic offline SQL generation for SQL Server: PASS; 24 application tables are emitted.
- Postman JSON validation: PASS.

A live SQL Server connection and full pytest run cannot be claimed from this
environment because the required runtime packages/ODBC driver and the team's
shared database credentials/network are not available here. Run those checks
in the team environment before release.

## Follow-up review pass — bugs found and fixed

A second review against the team's own bug list (audit log fields, OTP/login
422s, duplicate routers, Bearer security, seed/test mismatch, ORM/schema
mismatches) was done directly against this code, with `pytest` actually run
(47 passed) rather than assumed. Findings:

**Confirmed already correct, no change needed:** no duplicate routers; Swagger
Bearer security is per-route, not global; OTP has expiry/rate-limit/attempt
limits and a clear `OTP_PROVIDER_NOT_CONFIGURED` production boundary; 422s
return the failing field instead of a generic message; the ORM
Numeric/nullable fixes the team asked about were already applied and are
covered by `docs/ERD_MAPPING.md`; `/users` is correctly admin-only, not a
public registration endpoint (documented deliberately in `docs/API_SPEC.md`).

**Real bugs found in this pass and fixed:**

1. **Audit log data loss.** `AuditService.record()` took a free-text
   `details` string (e.g. `"request req_123 -> confirmed"`) and the SQL
   repository tried to split it on `:` into `entity_type`/`entity_id`. None
   of the actual call sites contained a `:`, so every audit row got the
   entire sentence in `entity_type` and `entity_id` was always `NULL`. Fixed
   by making `entity_type`/`entity_id` structured, required inputs
   (`app/repositories/models.py`, `app/services/audit_service.py`, all 4 call
   sites, `app/repositories/sqlalchemy/audit_repository.py`, `_mappers.py`),
   and wired `action` through the existing (previously unused) `AuditAction`
   enum for type safety.
2. **Notifications silently lost `related_request_id` on SQL Server.** The
   field is in the public API response (`NotificationPublic`) and documented
   in `docs/MOBILE_API_CONTRACT.md`, but the SQL repository never persisted
   it (no column) and always returned `None` on read. Added a flagged,
   additive nullable FK column (`notifications.related_request_id`) — **this
   needs Database Developer review/sign-off**, see
   `docs/ERD_MAPPING.md` → "Flagged additions pending Database Developer
   sign-off" and the same marker in `app/db/models.py`.
3. **`database/migrations/` had no actual SQL**, only a README, despite
   `docs/MIGRATION_STRATEGY.md` naming it the schema source of truth. Added
   `001_initial_schema.sql`, generated from the reviewed ORM metadata via
   `alembic upgrade head --sql`, explicitly labeled as a proposal for the
   Database Developer to review, not an already-applied migration.
4. **`scripts/seed_dev.py` (the real SQL Server seed) never created an admin
   account**, while `docs/QA_TEST_ACCOUNTS.md` and every test assumed
   `admin@lifelink.dev` existed. This is exactly the "tests and seed data
   don't match" bug the team flagged. Fixed by adding the admin row to the
   seed script and the docs, refactoring the seed list into a module-level
   `SEED_USERS` constant, and adding
   `app/tests/test_seed_data_consistency.py` so the seed script, the
   in-memory repo, and the docs can never silently drift apart again.
5. **No way for any account other than the two hardcoded dev users to ever
   get a phone number**, which meant the entire mobile OTP flow was
   unusable for anyone an admin created. `POST /users` (`UserCreate`) had no
   `phone` field even though the repository layer already fully supported
   it. Added `phone` to `UserCreate`/`UserPublic` and wired it through;
   added an end-to-end test
   (`test_admin_can_create_donor_with_phone_and_then_otp_login`) that
   creates a user via the API and completes a real OTP login with it.
6. **Caregiver assignment listing silently returned an empty list for
   Admin/Medical Lead/Platform Support** whenever they had no `hospital_id`
   (the normal case for Admin), instead of showing all assignments. Added a
   proper `list_all()` across the repository interface/memory/SQL
   implementations and fixed `CaregiverService.list()` to use it.
7. **`GET /caregiver/assignments/{id}` crashed with an unhandled 500** for
   any hospital/blood-bank/normal user who was not themselves the assigned
   caregiver: the service read `current.hospital_id`, but `current` there is
   the `UserPublic` API schema, which only has `institution_id`. This whole
   endpoint had zero test coverage before this pass, which is how it went
   unnoticed. Fixed the attribute name and added
   `app/tests/test_caregiver.py` (6 tests) covering create/list/get/
   forbidden/not-found for this module for the first time.

`pytest` was run after every change in this pass: 47 passed, 0 failed.

## Still open / needs a team decision, not invented here

- **Donations/Donors/Caregiver MVP scope**: the schema has the tables and
  the backend has basic CRUD, but end-to-end business workflows (e.g. a
  public `POST /donations` flow) are intentionally not built without
  approved acceptance criteria — unchanged from before this pass, see
  `docs/QA_TEST_ACCOUNTS.md` "Important current API boundary".
- **`notifications.related_request_id`** needs the Database Developer to
  actually add the column to the shared database (see item 2 above) before
  it works against a real deployment; the code is ready.
- Whether a public self-registration endpoint should exist for donors at
  all (vs. admin-created + OTP, which is what works today) is a product
  decision, not re-opened here.

## Final team handoff

1. Database Developer: confirm the shared SQL Server schema is the supplied schema and apply the migration.
2. DevOps: provide development/staging environment, Azure SQL, secrets and deployment.
3. Web + Mobile: integrate their apps against `/api/v1`.
4. QA: execute API, integration, system, security and regression tests.
5. Technical Lead: perform code/architecture/integration review and approve release.
