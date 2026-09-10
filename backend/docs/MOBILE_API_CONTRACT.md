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
Development response includes `dev_otp: "123456"`.
`POST /auth/otp/verify` accepts `123456` in development and returns the normal bearer JWT. Production OTP delivery/provider is intentionally blocked until an SMS provider is configured; the API returns `OTP_PROVIDER_NOT_CONFIGURED` instead of pretending that production OTP is delivered.

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
