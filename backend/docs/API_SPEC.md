# API Specification — Life Link Backend

Base URL prefix: `/api/v1`
Interactive docs: `/docs` (Swagger UI), `/redoc`
Error envelope (all non-2xx responses): `{"error": {"code": "...", "message": "..."}}`

## Auth

| Method | Endpoint | Purpose | Auth | Role | Success | Errors |
|---|---|---|---|---|---|---|
| POST | `/auth/login` | Login, get bearer token | No | Any | 200 | 401 `INVALID_CREDENTIALS`, 422 `VALIDATION_ERROR` |
| GET | `/auth/me` | Get current user | Yes | Any | 200 | 401 `MISSING_TOKEN`/`INVALID_TOKEN` |

## Users

| Method | Endpoint | Purpose | Auth | Role | Success | Errors |
|---|---|---|---|---|---|---|
| GET | `/users` | List users | Yes | Admin | 200 | 403 `FORBIDDEN_ROLE` |
| POST | `/users` | Create user | Yes | Admin | 201 | 409 `EMAIL_ALREADY_EXISTS`, 422 |

There is intentionally no public registration endpoint in the current confirmed product contract; `/users` is administrative user creation. `POST /users` accepts an optional `phone` - set it for any account (e.g. a donor) that needs to sign in later via `POST /auth/otp/*`, since OTP looks the user up by phone and there is currently no other way to attach one to an account.

## Hospitals & Blood Banks

| Method | Endpoint | Purpose | Auth | Role | Success |
|---|---|---|---|---|---|
| GET | `/hospitals` | List hospitals | Yes | Any | 200 |
| POST | `/hospitals` | Create hospital | Yes | Admin | 201 |
| GET | `/blood-banks` | List blood banks | Yes | Any | 200 |
| POST | `/blood-banks` | Create blood bank | Yes | Admin | 201 |

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
medical detail — only `reference`, `status`, `blood_type`, and the API compatibility `component` value.

## Notifications

| Method | Endpoint | Purpose | Auth | Role | Success | Errors |
|---|---|---|---|---|---|---|
| GET | `/notifications` | List my notifications | Yes | Any | 200 | - |
| POST | `/notifications/{id}/read` | Mark as read | Yes | Any (own) | 200 | 404 `NOTIFICATION_NOT_FOUND` |

## Health

| Method | Endpoint | Purpose | Auth | Success (200) | Failure (503) |
|---|---|---|---|---|---|
| GET | `/health` | Liveness and persistence-backend health check | No | `{"status": "ok", "database": "memory"}` in demo/test mode, or `connected` for SQL | `{"status": "error", "database": "disconnected"}` for SQL failures |

## Donation vouchers

| Method | Endpoint | Purpose | Auth | Success | Errors |
|---|---|---|---|---|---|
| POST | `/vouchers/issue` | Issue the one configured-value voucher for a `CONFIRMED` donation | Admin or owning Blood Bank Operator | 201 | 403 `FORBIDDEN_VOUCHER_ISSUE`, 404 `DONATION_NOT_FOUND`, 409 `VOUCHER_ALREADY_ISSUED`, 422 `DONATION_NOT_CONFIRMED` |
| GET | `/vouchers/me` | List only the caller's donor vouchers | Donor account | 200 | 404 `DONOR_NOT_FOUND` |
| POST | `/partners/vouchers/validate` | Check a code before redemption | Hospital/Blood Bank partner, own `partner_id` | 200 | 403 `FORBIDDEN_PARTNER`, 404 `VOUCHER_NOT_FOUND`, 409 `VOUCHER_NOT_ACTIVE` |
| POST | `/partners/vouchers/redeem` | Atomically redeem an active validated voucher | Hospital/Blood Bank partner, own `partner_id` | 200 | 403 `FORBIDDEN_PARTNER`, 409 `VOUCHER_NOT_ACTIVE`, 422 `VOUCHER_VALUE_MISMATCH` |

`POST /partners/vouchers/redeem` body:

```json
{
  "voucher_code": "LLV-EXAMPLECODE",
  "donor_id": "donor-id",
  "partner_id": "authenticated-partner-user-id",
  "value": "75.00",
  "status": "REDEEMED",
  "redeemed_at": "2026-09-17T12:00:00+00:00"
}
```

The service treats code/value/status as authoritative checks, requires `partner_id` to equal the authenticated user, and performs redemption using a conditional update. A repeated or racing request cannot redeem twice.

## Standard error codes

| HTTP | Code | Meaning |
|---|---|---|
| 401 | `MISSING_TOKEN` / `INVALID_TOKEN` / `INVALID_CREDENTIALS` | Auth failures |
| 403 | `FORBIDDEN_ROLE` / `FORBIDDEN_REQUEST_ACCESS` / `FORBIDDEN_TRACKING_ACCESS` / `FORBIDDEN_INVENTORY_ACCESS` | Authorization failures |
| 404 | `REQUEST_NOT_FOUND` / `INVENTORY_ITEM_NOT_FOUND` / `REFERENCE_NOT_FOUND` / `NOTIFICATION_NOT_FOUND` | Resource not found |
| 409 | `INVALID_STATUS_TRANSITION` / `EMAIL_ALREADY_EXISTS` | Conflicts |
| 422 | `VALIDATION_ERROR` | Request validation failure; message includes safe field-level details |
| 500 | `INTERNAL_SERVER_ERROR` | Unhandled error (no internal details leaked) |

## Supporting Documents

| Method | Endpoint | Purpose | Auth | Role | Success |
|---|---|---|---|---|---|
| POST | `/requests/{id}/documents` | Upload supporting PDF/JPEG/PNG | Yes | Request-access users | 201 |
| GET | `/requests/{id}/documents` | List supporting documents | Yes | Request-access users | 200 |
| POST | `/documents/{id}/review` | Approve/reject document | Yes | Blood Bank / Medical Lead / Admin | 200 |

Uploads are size-limited by `MAX_UPLOAD_MB`. Rejection requires a reason. File storage is abstracted by the service boundary and defaults to local development storage.

## Database mode

Set `REPOSITORY_BACKEND=sqlserver` to use the SQLAlchemy/Azure SQL repositories. Set `REPOSITORY_BACKEND=memory` for deterministic local demos and unit tests. The SQL models and initial migration are derived from the supplied Chen ERD; see `docs/ERD_MAPPING.md`.


## Mobile additions (Dev/MVP)
OTP: POST /api/v1/auth/otp/request, POST /api/v1/auth/otp/verify. Development fixed OTP: 123456.
Donor: /api/v1/donors/me, /api/v1/donors/me/donations, /api/v1/donors/me/responses, /api/v1/donors/me/consents plus admin/medical donor lookup.
Caregiver:
- `/api/v1/caregiver/assignments` CRUD/update endpoints.
- `POST /api/v1/caregiver/scan-bag` & `GET /api/v1/caregiver/bag/{qr_code}`: Scan blood bag QR and return `bank_name`, `bank_location`, `status`, `blood_type`.
Payments:
- POST /api/v1/payments/initiate (Hospital User / Admin: Initiates Paymob payment session and returns checkout_url)
- POST /api/v1/payments/webhook (Public Paymob callback endpoint verified by HMAC-SHA512)
- POST /api/v1/payments (Manual record creation)
- GET /api/v1/payments/{id}
- GET /api/v1/payments/request/{request_id}
- PATCH /api/v1/payments/{id}
Full examples are in docs/MOBILE_API_CONTRACT.md.


## Distance & Donor Matching (Web Portal & Mobile)

Matching algorithm criteria:
1. **Blood Compatibility**: Clinical compatibility (e.g. A+ receives from A+, A-, O+, O-), or `exact_match=True` for single blood type only.
2. **Donor Eligibility**: Defaults to `eligible` on registration; excluded only if medically `ineligible`.
3. **6-Month Rule**: Must not have donated within the last 180 days (`last_donation_date >= 180 days ago` or never donated).
4. **Donor Active**: User status must be `active` and `is_active=True`.
5. **Distance Calculation**: Haversine distance formula using exact GPS coordinates (latitude/longitude), with Egyptian governorates central coordinates as automatic fallback. Sorted ascending by distance (`distance_km`).
6. **Quota Cancellation**: When accepted responses count reaches `quantity_units`, the request is closed for new acceptances (returns `422 REQUEST_ALREADY_FULFILLED`) and automatically removed from other donors' nearby feeds.

### Endpoints:
- `GET /api/v1/requests/{id}/matching-donors?exact_match=false&max_distance_km=50&limit=50`: (Web Portal) View eligible matching donors ordered by distance from the requesting hospital/blood bank.
- `POST /api/v1/requests/{id}/notify-matching-donors`: (Web Portal) Notify closest N donors automatically (`{"count": 5, "exact_match": false}`).
- `GET /api/v1/donors/matches?blood_type=A+&exact_match=false&latitude=30.0444&longitude=31.2357`: Standalone donor search by blood type and GPS/governorate.
- `GET /api/v1/donors/me/nearby-requests?limit=20&max_distance_km=50`: (Mobile App) Feed of open blood requests matching the donor's blood type, sorted by distance from the donor's home location. Requests that have reached their donor quota are automatically hidden.
- `POST /api/v1/donors/me/responses`: (Mobile App) Donor accepts or declines request (`{"blood_request_id": "...", "status": "accepted"}`).


## Request-Centric Multi-Bag Allocation & Bag History (Blood Bank & Caregiver)

1. **Multi-Bag Quota**: A single hospital blood request specifies `quantity_units` (e.g. 2 or 3 bags).
2. **Barcode Scanning Allocation**: Blood bank staff scans barcodes one-by-one to allocate available units:
   - Validates bank ownership, availability (`status == 'available'`), expiration, blood type, and component.
   - Automatically advances request status to `confirmed` when full quota is fulfilled.
3. **Consolidated Request QR**: Caregiver scans one Request QR to view bank location, units requested, unit price, total price, and Paymob checkout.
4. **Dispatch & Cascading**: Blood bank dispatches the request -> all allocated bags automatically cascade to `in_transit` with individual bag history entries.
5. **Hospital Receive**: Hospital confirms receipt -> all allocated bags cascade to `received` with history entries.
6. **Safety Quarantine**: If an allocated bag is deallocated or the request is cancelled before dispatch, bags automatically move to `quarantine` for safety inspection before they can be re-used.

### Endpoints:
- `POST /api/v1/requests/{id}/allocate-bag`: Blood Bank Operator scans barcode to allocate unit.
- `POST /api/v1/requests/{id}/deallocate-bag`: Blood Bank Operator removes a unit and moves it to quarantine.
- `POST /api/v1/requests/{id}/cancel`: Cancels request and safely moves all allocated units to quarantine.
- `GET /api/v1/requests/{id}/allocated-bags`: Lists all blood bags currently assigned to the request.
- `POST /api/v1/requests/{id}/dispatch`: Dispatches request and transitions all assigned bags to `in_transit`.
- `POST /api/v1/requests/{id}/receive`: Confirms receipt at hospital and marks bags `received`.
- `POST /api/v1/blood-bags`: Add a blood unit to bank inventory (generates QR code).
- `GET /api/v1/blood-bags`: List blood bags.
- `GET /api/v1/blood-bags/{id}/history`: View full chain of custody and movements for an individual unit.
- `PATCH /api/v1/blood-bags/{id}/status`: Transition bag status (available, reserved, allocated, in_transit, received, quarantine, disposed).
- `POST /api/v1/notifications/devices`: Register mobile device token (FCM).
- `DELETE /api/v1/notifications/devices/{token}`: Unregister mobile device token.
