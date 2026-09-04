# API Specification — Life Link Backend

Base URL prefix: `/api/v1`
Interactive docs: `/docs` (Swagger UI), `/redoc`
Error envelope (all non-2xx responses): `{"error": {"code": "...", "message": "..."}}`

## Auth

| Method | Endpoint | Purpose | Auth | Role | Success | Errors |
|---|---|---|---|---|---|---|
| POST | `/auth/login` | Login, get bearer token | No | Any | 200 | 401 `INVALID_CREDENTIALS` |
| GET | `/auth/me` | Get current user | Yes | Any | 200 | 401 `MISSING_TOKEN`/`INVALID_TOKEN` |

## Users

| Method | Endpoint | Purpose | Auth | Role | Success | Errors |
|---|---|---|---|---|---|---|
| GET | `/users` | List users | Yes | Admin | 200 | 403 `FORBIDDEN_ROLE` |
| POST | `/users` | Create user | Yes | Admin | 201 | 409 `EMAIL_ALREADY_EXISTS`, 422 |

## Blood Requests

| Method | Endpoint | Purpose | Auth | Role | Success | Errors |
|---|---|---|---|---|---|---|
| POST | `/requests` | Create request | Yes | Hospital User | 201 | 403 `FORBIDDEN_ROLE`, 422 |
| GET | `/requests` | List requests (scoped) | Yes | Any | 200 | - |
| GET | `/requests/{id}` | Get one request | Yes | Any (scoped) | 200 | 404 `REQUEST_NOT_FOUND`, 403 `FORBIDDEN_REQUEST_ACCESS` |
| POST | `/requests/{id}/acknowledge` | Requested→Acknowledged | Yes | Blood Bank Operator, Admin | 200 | 409 `INVALID_STATUS_TRANSITION`, 403 |
| POST | `/requests/{id}/confirm` | Acknowledged→Confirmed | Yes | Blood Bank Operator, Admin | 200 | 409, 403 |
| POST | `/requests/{id}/prepare` | Confirmed→Prepared | Yes | Blood Bank Operator, Admin | 200 | 409, 403 |
| POST | `/requests/{id}/complete` | Prepared→Completed | Yes | Blood Bank Operator, Admin | 200 | 409, 403 |
| POST | `/requests/{id}/cancel` | Any non-terminal→Cancelled | Yes | Hospital User (own), Blood Bank Operator, Admin | 200 | 409, 403 |

Arbitrary status writes (e.g. `PATCH /requests/{id} {"status": "..."}`) are
intentionally **not** exposed — all transitions go through the explicit
action endpoints above and are validated against the state machine in
`app/core/domain.py::VALID_TRANSITIONS`.

## Inventory

| Method | Endpoint | Purpose | Auth | Role | Success | Errors |
|---|---|---|---|---|---|---|
| GET | `/inventory` | List reported inventory (scoped) | Yes | Any | 200 | - |
| GET | `/inventory/{id}` | Get one item | Yes | Any | 200 | 404 `INVENTORY_ITEM_NOT_FOUND` |
| POST | `/inventory` | Report new item | Yes | Blood Bank Operator (own bank), Admin | 201 | 403 `FORBIDDEN_INVENTORY_ACCESS`, 422 |
| PATCH | `/inventory/{id}` | Update quantity/availability | Yes | Blood Bank Operator (own bank), Admin | 200 | 403, 404 |

## QR / Tracking

| Method | Endpoint | Purpose | Auth | Role | Success | Errors |
|---|---|---|---|---|---|---|
| POST | `/requests/{id}/qr` | Issue QR payload for a request | Yes | Any | 200 | 404 `REQUEST_NOT_FOUND` |
| POST | `/qr/scan` | Scan a reference | Yes | Any (scoped) | 200 | 404 `REFERENCE_NOT_FOUND`, 403 `FORBIDDEN_TRACKING_ACCESS` |
| GET | `/tracking/{reference}` | Direct-link tracking lookup | Yes | Any (scoped) | 200 | 404, 403 |

QR/tracking responses never include patient identity or unnecessary
medical detail — only `reference`, `status`, `blood_type`, `component`,
`last_updated`.

## Notifications

| Method | Endpoint | Purpose | Auth | Role | Success | Errors |
|---|---|---|---|---|---|---|
| GET | `/notifications` | List my notifications | Yes | Any | 200 | - |
| POST | `/notifications/{id}/read` | Mark as read | Yes | Any (own) | 200 | 404 `NOTIFICATION_NOT_FOUND` |

## Health

| Method | Endpoint | Purpose | Auth |
|---|---|---|---|
| GET | `/health` | Liveness check | No |

## Standard error codes

| HTTP | Code | Meaning |
|---|---|---|
| 401 | `MISSING_TOKEN` / `INVALID_TOKEN` / `INVALID_CREDENTIALS` | Auth failures |
| 403 | `FORBIDDEN_ROLE` / `FORBIDDEN_REQUEST_ACCESS` / `FORBIDDEN_TRACKING_ACCESS` / `FORBIDDEN_INVENTORY_ACCESS` | Authorization failures |
| 404 | `REQUEST_NOT_FOUND` / `INVENTORY_ITEM_NOT_FOUND` / `REFERENCE_NOT_FOUND` / `NOTIFICATION_NOT_FOUND` | Resource not found |
| 409 | `INVALID_STATUS_TRANSITION` / `EMAIL_ALREADY_EXISTS` | Conflicts |
| 422 | `VALIDATION_ERROR` | Pydantic validation failure |
| 500 | `INTERNAL_SERVER_ERROR` | Unhandled error (no internal details leaked) |
