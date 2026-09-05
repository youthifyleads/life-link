# RBAC Matrix — Life Link Backend

Authorization is enforced **only** on the backend (`app/core/security.py`
`require_roles()` + per-service checks). The React and Flutter clients
must never be trusted to hide unauthorized actions — they may hide UI
for convenience, but the API re-checks every time.

## Roles

| Role | Enum value |
|---|---|
| Hospital User | `hospital_user` |
| Blood Bank Operator | `blood_bank_operator` |
| Medical Lead | `medical_lead` |
| Admin | `admin` |
| Platform Support | `platform_support` |

## Permission matrix

| Action | Hospital User | Blood Bank Operator | Medical Lead | Admin | Platform Support |
|---|---|---|---|---|---|
| Login / view own profile | ✅ | ✅ | ✅ | ✅ | ✅ |
| Create blood request | ✅ (own hospital) | ❌ | ❌ | ❌ | ❌ |
| View blood requests | ✅ (own hospital only) | ✅ (all) | — (not modeled in MVP) | ✅ (all) | — (not modeled in MVP) |
| Acknowledge / confirm / prepare / complete request | ❌ | ✅ | ❌ | ✅ | ❌ |
| Cancel request | ✅ (own hospital) | ✅ | ❌ | ✅ | ❌ |
| Report / update inventory | ❌ | ✅ (own blood bank only) | ❌ | ✅ (any) | ❌ |
| View reported inventory | ✅ (all, read-only) | ✅ (own blood bank) | — | ✅ (all) | — |
| Issue / scan QR / view tracking | ✅ (own hospital's requests) | ✅ (all) | — | ✅ (all) | — |
| Manage users / roles / institutions | ❌ | ❌ | ❌ | ✅ | ❌ |
| System/technical support actions | ❌ | ❌ | ❌ | ❌ | ✅ (not yet implemented as endpoints) |

Notes:

- **Medical Lead**: per the team guide, clinical decisions (suitability,
  cross-matching, release/reservation) remain the Medical Lead's authority
  **outside this platform**. No clinical-decision endpoints exist in the
  MVP, so this role currently has no dedicated write actions modeled here.
- **Platform Support**: scoped to technical/system support, not clinical
  or blood-availability decisions. No support-specific endpoints exist yet
  in the MVP; add them (e.g. system diagnostics) under this role only.
- Scoping ("own hospital", "own blood bank") is enforced by comparing the
  authenticated user's `institution_id` against the resource's owning
  institution id. The exact shape of `institution_id` may change once the
  final ERD defines the Hospital/BloodBank tables — the enforcement logic
  itself (compare ids, reject on mismatch) will not need to change.

## Adding a new protected endpoint

Use the reusable dependency:

```python
from app.core.security import require_roles
from app.core.domain import Role

@router.post("/some-admin-action", dependencies=[Depends(require_roles(Role.ADMIN))])
async def some_admin_action(...):
    ...
```

For resource-level scoping (e.g. "hospital users can only see their own
hospital's data"), add the check inside the relevant service method, the
same way `RequestService._assert_can_view` and
`InventoryService._assert_can_manage` do it — do not duplicate scoping
logic inline in routers.
