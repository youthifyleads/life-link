# Life Link Role Matrix

This matrix is the single backend reference for role mapping. DB role names must be finalized by the Database/Tech Lead team before production data is seeded.

| Role | DB Name | Backend Role | Responsibilities |
|---|---|---|---|
| Admin | `admin` | `ADMIN` | Manage users, hospitals, blood banks, roles/permissions, system configuration, audit. |
| Hospital Staff | `hospital_user` / `hospital_staff` | `HOSPITAL_USER` | Create/view own-hospital requests, tracking, upload supporting documents, cancel own requests, notifications. |
| Blood Bank Staff | `blood_bank_operator` / `blood_bank_staff` | `BLOOD_BANK_OPERATOR` | Manage requests, inventory, supporting-document review, QR/tracking. |
| Donor | Not a separate RBAC role | Donor profile linked to User | Donation profile, donation responses, donations, consents; access remains user-scoped. |
| Caregiver | Not an RBAC role — `Role.CAREGIVER` does not exist; a caregiver is a normal authenticated user referenced by `caregiver_assignments.caregiver_user_id` | Effectively `NORMAL_USER` (or any role not in `{admin, medical_lead, platform_support}`) | Views/updates only assignments where they are the named caregiver (`GET/PATCH /caregiver/assignments/*`); scan/track workflow via the assignment. Assignments themselves are created by Hospital Staff, Blood Bank Staff, Admin, or Medical Lead — a caregiver cannot create their own assignment. |
| Medical Lead | `medical_lead` | `MEDICAL_LEAD` | Clinical review/decisions such as suitability, cross-match and release. |
| Platform Support | `platform_support` | `PLATFORM_SUPPORT` | Technical support/restoration; no clinical priority or blood-availability decisions. |
| Normal User | `normal_user` | `NORMAL_USER` | Current backend compatibility role; final product status must be confirmed before using it as the public registration role. |

Unknown DB role names are rejected by the mapper; the backend never guesses a role from institution IDs or partial text.

Admin/Medical Lead/Platform Support now see all caregiver assignments (`CaregiverService.list_all`), not just ones tied to a hospital they personally belong to — see FINAL_REVIEW.md changelog.
