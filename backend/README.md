# Life Link — Backend API

FastAPI backend for the Life Link blood donation / blood request
management system. Serves the React web app (Hospital/Blood Bank/Admin)
and the Flutter mobile app (Donors) — both talk to SQL Server **only**
through this API.

## 1. Project purpose

Central business logic and API layer for:
authentication/RBAC, hospital & blood bank workflows, blood request
lifecycle, reported inventory, QR/tracking, notifications, and audit
logging — for the Life Link MVP.

## 2. Architecture

```
Router (app/api/v1) → Schema (app/schemas) → Service (app/services)
    → Repository Interface (app/repositories/interfaces)
    → memory OR SQL Server (select with REPOSITORY_BACKEND)
```

Business logic lives in services; routes stay thin; validation lives in
Pydantic schemas; database access is hidden behind repository interfaces
so the real SQL Server implementation can be swapped in later (see
`app/services/dependencies.py`) without touching routers or services.

## 3. Folder structure

```
app/
├── main.py                  # FastAPI app, router wiring, CORS, error handlers
├── core/                    # config, security/JWT, RBAC, exceptions, logging, domain enums
├── api/v1/                  # route handlers (thin)
├── schemas/                 # Pydantic input/output models
├── services/                # business logic + dependency wiring
├── db/                     # SQLAlchemy engine/session + ERD ORM models
├── repositories/
│   ├── interfaces/          # abstract contracts
│   ├── memory/              # deterministic test/demo implementations
│   └── sqlalchemy/          # SQL Server/Azure SQL implementations
└── tests/                   # pytest suite
docs/
├── API_SPEC.md
├── RBAC.md
├── ERD_MAPPING.md
└── DATABASE.md
alembic/
alembic.ini
scripts/seed_dev.py
postman/LifeLink_API.json
.env.example
requirements.txt
Dockerfile
```

## 4. Install

```bash
cd backend
python3 -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
```

## 5. Run locally

```bash
uvicorn app.main:app --reload
```

API base: `http://localhost:8000/api/v1`
Swagger UI: `http://localhost:8000/docs`
Health check: `http://localhost:8000/health`

Seeded dev users (password `password123` for all):

| Email | Role |
|---|---|
| hospital@lifelink.dev | hospital_user |
| bloodbank@lifelink.dev | blood_bank_operator |
| admin@lifelink.dev | admin |

## 6. Run tests

```bash
python3 -m pytest app/tests -v
```

The repository contains the original 32 in-memory unit tests covering auth, RBAC, request lifecycle/state machine, inventory, QR/tracking, and notifications. Run them after installing the current requirements; a full post-change pytest run was not available in this sandbox because `jose`, `passlib`, and `aioodbc` were not installed here.

## 7. Swagger location

`/docs` (Swagger UI) and `/redoc` (ReDoc), auto-generated from the route
definitions with summaries, descriptions, auth requirements, and error
responses.

## 8. Environment variables

See `.env.example`: `ENVIRONMENT`, `DATABASE_URL`, `SECRET_KEY`, `ACCESS_TOKEN_EXPIRE_MINUTES`. Never
commit real secrets — use a secret manager for anything beyond local dev.

## 9. API versioning

All routes are under `/api/v1`. See `docs/API_SPEC.md` for the full
endpoint table.

## 10. Authentication

PROVISIONAL bearer JWT (HS256). `POST /api/v1/auth/login` returns an
access token; send it as `Authorization: Bearer <token>`.
`get_current_user()` (in `app/core/security.py`) is the single reusable
dependency — no endpoint duplicates auth logic.

## 11. RBAC

See `docs/RBAC.md` for the full role/permission matrix. Enforced via the
`require_roles()` dependency plus per-service scoping checks (e.g.
hospital users only see their own hospital's requests).

## 12. Persistence modes

The supplied `schema.pdf` is mapped by SQLAlchemy ORM models under `app/db/models.py`; table and column names follow the supplied physical schema.
The application supports two modes:

- `REPOSITORY_BACKEND=memory`: fast local demo and unit-test mode.
- `REPOSITORY_BACKEND=sqlserver`: real SQL Server/Azure SQL persistence through the repository interfaces.

The repository interfaces keep services and routes independent from the storage implementation. See `docs/ERD_MAPPING.md` and `docs/DATABASE.md`.

## 13. Database setup

```bash
# configure DATABASE_URL and REPOSITORY_BACKEND=sqlserver
alembic upgrade head
python scripts/seed_dev.py
uvicorn app.main:app --reload
```

A real SQL Server/Azure SQL connection cannot be verified from this package without the team's shared database host, credentials/secrets and network access. No secrets are included.

## 14. Supporting documents

The request workflow now includes secure local development storage and document review endpoints. Production deployments should replace the storage implementation with the team's approved object/file storage provider without exposing raw file paths to clients.

## 15. Final schema mapping

See `docs/ERD_MAPPING.md` for the exact 24-table mapping from `schema.pdf`. The only non-persisted compatibility concern is the API-level `tracking_reference`/`component` behavior documented there.

### Operational decisions

- JWT bearer auth, HS256, with secret and expiry controlled by environment variables.
- Password hashing via `pbkdf2_sha256` (passlib).
- SQL Server is the real persistence mode; in-memory mode remains for tests/demo.
- QR clients encode the signed tracking payload returned by the API.

### Assumptions made

- Cancellation is allowed from `requested`, `acknowledged`, `confirmed`,
  and `prepared`, but not from a terminal state (`completed`, `cancelled`,
  `expired`). `expired` is modeled as a possible transition from
  `requested`/`acknowledged` only (a system/timeout-triggered path is not
  implemented yet — no scheduler exists in the MVP).
- Duplicate requests are not blocked outright; QA test coverage confirms
  two identical requests simply produce two independent tracking
  references, since the team guide didn't specify hard deduplication
  rules.
