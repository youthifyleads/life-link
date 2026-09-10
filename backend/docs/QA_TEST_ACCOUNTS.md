# Life Link QA Test Accounts

These accounts are for development/QA only. Do not use them in production.

| Account | Email | Password | Role | Status |
|---|---|---|---|---|
| Admin | admin@lifelink.dev | Admin@123 | admin | active |
| Blood Bank | bloodbank@lifelink.dev | BloodBank@123 | blood_bank_operator | active |
| Hospital Staff | hospital@lifelink.dev | Hospital@123 | hospital_user | active |
| Normal User | user@lifelink.dev | NormalUser@123 | normal_user | active |
| Banned User | banned@lifelink.dev | BannedUser@123 | normal_user | banned |

## Expected banned-login behavior

The banned account must not receive an access token. `POST /api/v1/auth/login` returns HTTP 401 with:

```json
{
  "error": {
    "code": "ACCOUNT_BANNED",
    "message": "This account has been banned."
  }
}
```

## Example API test values

### Hospital staff: create a blood request
`POST /api/v1/requests`

```json
{
  "blood_type": "O+",
  "component": "whole_blood",
  "quantity_units": 2,
  "urgency": true,
  "reason": "Emergency blood requirement",
  "required_by": "2026-09-06T18:00:00Z"
}
```

### Blood bank: add inventory
`POST /api/v1/inventory`

```json
{
  "blood_bank_id": "bloodbank_1",
  "blood_type": "O+",
  "component": "whole_blood",
  "quantity_units": 10,
  "expiry_date": "2026-10-01T00:00:00Z"
}
```

## Important current API boundary

The current backend has the donation-related database tables in the ERD, but it does not currently expose a dedicated `POST /donations` API. Do not test a donation endpoint as if it already exists. If the frontend needs a donor/donation flow, that endpoint must be agreed and implemented as a separate backend feature.

## How to run the seed

From the backend root:

```bash
python scripts/seed_dev.py
```

This creates the demo roles, permissions, demo hospital/blood bank, and the five QA users in SQL Server when `REPOSITORY_BACKEND=sqlserver` is configured.
