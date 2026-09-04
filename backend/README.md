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
    → [in-memory today] → SQL Server implementation later
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
├── repositories/
│   ├── interfaces/          # abstract contracts
│   └── memory/              # PROVISIONAL in-memory implementations
└── tests/                   # pytest suite
docs/
├── API_SPEC.md
└── RBAC.md
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

32 tests covering auth, RBAC, request lifecycle/state machine, inventory,
QR/tracking, and notifications, all against the in-memory repositories
(no database dependency).

## 7. Swagger location

`/docs` (Swagger UI) and `/redoc` (ReDoc), auto-generated from the route
definitions with summaries, descriptions, auth requirements, and error
responses.

## 8. Environment variables

See `.env.example`: `ENVIRONMENT`, `DATABASE_URL` (unused until SQL
Server is wired in), `SECRET_KEY`, `ACCESS_TOKEN_EXPIRE_MINUTES`. Never
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

## 12. Current limitations due to missing final ERD

- All persistence is **in-memory** (`app/repositories/memory/`) and reset
  whenever the process restarts. This is intentional — it lets the whole
  API layer be built, tested, and demoed without the final SQL Server
  schema.
- `app/repositories/models.py` holds plain dataclasses standing in for
  what will eventually be ORM-backed rows. Field names were chosen to be
  reasonable, not final.
- No SQLAlchemy models, no Alembic/other migrations exist yet — none
  were created, per the constraint against inventing a schema.
- Auth uses a JWT/bearer scheme with no refresh tokens; this is flagged
  PROVISIONAL and awaits Technical Lead sign-off.

## 13. What needs to be replaced/connected when the final ERD arrives

1. Implement each interface in `app/repositories/interfaces/` with a real
   SQL Server (SQLAlchemy) repository — `UserRepository`,
   `RequestRepository`, `InventoryRepository`, `NotificationRepository`,
   `AuditRepository`.
2. Swap the constructors in `app/services/dependencies.py` to return the
   new SQL Server repositories (e.g. branch on `settings.ENVIRONMENT`).
   No router or service code should need to change.
3. Reconcile `app/repositories/models.py` dataclass fields against the
   final ERD's actual columns/foreign keys (e.g. hospital/blood bank
   institution ids, user table shape).
4. Revisit the auth/token strategy with the Technical Lead once the final
   user/session model is agreed.
5. Decide on a real notification delivery provider and add a `_deliver()`
   hook in `NotificationService` (currently in-app-record only).

---

### Provisional decisions (flagged for Technical Lead review)

- JWT bearer auth, HS256, no refresh token flow yet.
- Password hashing via `pbkdf2_sha256` (passlib) — chosen over bcrypt
  only to avoid a native-binding version conflict in this dev sandbox;
  either is fine for the MVP, but confirm before production.
- In-memory repositories as the only implementation so far.
- QR payload is currently just the plain secure reference string (`LL-...`);
  encoding it as an actual QR image is left to the client apps.

### Assumptions made

- `institution_id` on a user is a simple string scoping id (hospital or
  blood bank), matched against the same field on requests/inventory. The
  real ERD may model this as an FK to a proper Institution/Hospital/
  BloodBank table — the comparison logic won't need to change, just the
  type/source of the id.
- Cancellation is allowed from `requested`, `acknowledged`, `confirmed`,
  and `prepared`, but not from a terminal state (`completed`, `cancelled`,
  `expired`). `expired` is modeled as a possible transition from
  `requested`/`acknowledged` only (a system/timeout-triggered path is not
  implemented yet — no scheduler exists in the MVP).
- Duplicate requests are not blocked outright; QA test coverage confirms
  two identical requests simply produce two independent tracking
  references, since the team guide didn't specify hard deduplication
  rules.
