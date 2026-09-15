# Life Link Mobile API Contract — Dev/MVP

Base prefix: `/api/v1`
Swagger: `/docs`
Auth: `Authorization: Bearer <access_token>`
Time: ISO 8601, UTC (`Z`).

## OTP (Dev)
`POST /auth/otp/request`
```json
{"phone":"01000000003"}
```
Current OTP is email-based for signup/password reset. No development OTP is returned by the API.

## Donor
- `GET /donors/me`
- `POST /donors/me`
- `PATCH /donors/me`
- `GET /donors/{donor_id}` (Admin/Medical Lead)
- `GET /donors/me/donations`
- `POST /donors/me/donations`
- `GET /donors/me/responses`
- `POST /donors/me/responses`
- `GET /donors/me/consents`
- `POST /donors/me/consents`

Donation request:
```json
{"blood_type":"O+","quantity":1,"donation_date":"2026-09-06","blood_bank_id":"bloodbank_1","status":"completed"}
```

## Caregiver
- `POST /caregiver/assignments`
- `GET /caregiver/assignments`
- `GET /caregiver/assignments/{assignment_id}`
- `PATCH /caregiver/assignments/{assignment_id}`
- `POST /caregiver/scan-bag` (Body: `{"qr_code": "..."}`)
- `GET /caregiver/bag/{qr_code}`

### Caregiver Blood Bag QR Scan Response
Returns strictly the essential blood bag and bank details for mobile caregiver view:
```json
{
  "blood_bag_id": "bag_123",
  "qr_code": "LL-BAG-abc123",
  "bank_name": "Central Blood Bank",
  "bank_location": "15 Tahrir Square, Cairo",
  "status": "available",
  "blood_type": "A+"
}
```
*(Also accessible via alias endpoints `POST /qr/bag-scan` and `GET /qr/bag/{qr_code}`)*.

## Payments (MVP record only)
- `POST /payments`
- `GET /payments/{payment_id}`
- `GET /payments/request/{blood_request_id}`
- `PATCH /payments/{payment_id}` (Admin/Platform Support)

No external payment gateway is connected.

## Tracking
Existing endpoints remain:
- `POST /requests/{id}/qr`
- `POST /qr/scan`
- `GET /tracking/{reference}`

Tracking intentionally excludes patient identity.

## Notifications
Existing endpoints:
- `GET /notifications`
- `POST /notifications/{id}/read`

## Errors
All handled errors use:
```json
{"error":{"code":"ERROR_CODE","message":"Human readable message"}}
```
Common statuses: 401 auth, 403 permission, 404 not found, 409 conflict, 422 validation, 500 server error.

## Important MVP boundary
OTP is development-only. Payment is a database record only. Clinical suitability/cross-match/release remains a clinical decision, not automated by these APIs.


## Current MVP additions
- `POST /auth/signup` creates a Normal User and starts email verification.
- `POST /auth/signup/verify` verifies the random 6-digit email OTP (60 seconds).
- `POST /auth/refresh` rotates refresh tokens; `POST /auth/logout` revokes them.
- `POST /auth/forgot-password` and `POST /auth/reset-password` implement password reset by email.
- Blood Bag lifecycle: Available -> Reserved -> Allocated -> In Transit -> Delivered -> Received.
- Blood Bag QR is tied to the real bag record; scan resolves server-side data and history.
- SMS/TextBee is not part of the current scope.

### Official Blood Bag QR flow
- `GET /blood-bags/{blood_bag_id}/qr` returns `blood_bag_id` and `qr_payload`.
- `POST /blood-bags/scan` with `{ "qr_code": "..." }` returns the real `blood_bag` plus `movement_history`.
- The scan response includes the current status and the complete server-side status/movement history; clients must not trust data embedded in the QR itself.
- The Blood Bag lifecycle is `available -> reserved -> allocated -> in_transit -> delivered -> received`.
