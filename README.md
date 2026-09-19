<img width="1254" height="1254" alt="Life-link logo" src="https://github.com/user-attachments/assets/09e81cab-5c77-4fb3-8cb1-a037ae1563fe" />

# Life Link

> Connecting lives through reliable, scalable, and secure emergency and healthcare coordination.

---

## 🛠️ Technology Stack 

Life Link is engineered with modern, robust technologies tailored for high performance and cross-platform reliability:

| Area | Directory | Responsible Role | CODEOWNERS Handle |
| :--- | :--- | :--- | :--- |
| **Global / Architecture** | `/` | Technical Lead | `@Ahmed-Esso` |
| **Backend** | `/backend/` | Backend Lead | `@gholamseif` |
| **Database** | `/database/` | Database & Backend Developer | `` |
| **Web** | `/web/` | Web Frontend Developer | `@ZiadDev123` |
| **Mobile** | `/mobile/` | Mobile Developer | `@Toqa10` |
| **CI/CD & Security** | `/.github/` | Tech Lead + DevOps / Security Engineer | `@Ahmed-Esso` `@Mayar-hany-2005` |

---

## 📱 Platform Architecture & Target Roles

Life Link connects healthcare institutions and citizens through two synchronized client applications:

1. **Web Portal (`/web`)**:
   - **Target Roles**: `HospitalStaff`, `BloodBankStaff`, `MedicalLead`, `PlatformSupport`, `SystemAdmin`.
   - **Key Functions**: Emergency blood requests creation, inventory oversight, supporting document reviews, Paymob payment checkout, and finding/notifying nearest matching eligible donors.
2. **Mobile Application (`/mobile`)**:
   - **Target Role**: `NormalUser` (acting simultaneously as **Donor** and **Caregiver**).
   - **Donor Functions**: Profile management with home address/GPS coordinates, nearby matching blood requests feed, one-tap accept/decline responses, donation history, and urgent notifications.
   - **Caregiver Functions**: Scanning hospital-generated blood bag QR codes to verify bag authenticity, blood type, current status, and blood bank source details.

---

## ✨ Core System Capabilities

- **📍 Intelligent Donor Matching & Haversine Distance Sorting**:
  - Calculates real geographical distance in kilometers between donor home location and hospital/blood bank.
  - Automatic fallback to Egyptian governorates central coordinates when GPS is missing.
  - Enforces clinical blood compatibility (RBC rules) with optional exact-match filtering.
  - Enforces 6-month donation interval rule (≥ 180 days) and active eligibility verification.
  - Automatic quota management: When the required number of donors accept a request (`accepted_count == quantity_units`), the request is automatically fulfilled, hidden from other donors, and closed.
- **💳 Paymob Payment Integration & Flexible Pricing**:
  - Server-side price calculation with blood-bank configurable unit prices per bag.
  - Secure Paymob payment checkout flow (`POST /payments/initiate`).
  - HMAC-SHA512 authenticated webhook callback (`POST /payments/webhook`) ensuring idempotent payment status updates.
- **📦 QR Code Bag Tracking & Caregiver Verification**:
  - Encrypted tracking references for hospital blood bags.
  - Safe mobile view for caregivers (`POST /caregiver/scan-bag`) displaying blood bank name, address, bag status, and blood type.


---

## 📁 Repository Structure

```text
Life-Link/
├── .github/
│   ├── CODEOWNERS                 # Area-specific review assignments
│   ├── pull_request_template.md   # Standard PR checklist & metadata template
│   └── workflows/
│       └── ci.yml                 # Automated PR validation & test runner
├── backend/                       # Python + FastAPI backend service
├── web/                           # React + TypeScript web application
├── mobile/                        # Flutter + Dart mobile application
├── database/                      # MSSQL database scripts & migrations
│   └── migrations/                # Versioned SQL schema migration files
├── docs/                          # Architecture & technical documentation
├── .gitignore                     # Repository-wide ignore rules
├── LICENSE                        # Open-source license
└── README.md                      # Project documentation and developer guide
```

---

## 👥 Team Responsibilities & Code Ownership

Our 7-person team is structured with designated area ownership configured in [`.github/CODEOWNERS`](.github/CODEOWNERS):

| Area | Directory | Responsible Role | CODEOWNERS Handle |
| :--- | :--- | :--- | :--- |
| **Global / Architecture** | `/` | Technical Lead | `@Ahmed-Esso` |
| **Backend** | `/backend/` | Backend Lead | `@Gholamself` |
| **Database** | `/database/` | Database & Backend Developer | `` |
| **Web** | `/web/` | Web Frontend Developer | `@ZiadDev123` |
| **Mobile** | `/mobile/` | Mobile Developer | `@Toqa10` |
| **CI/CD & Security** | `/.github/` | Tech Lead + DevOps / Security Engineer | `@Ahmed-Esso` `@Mayar-hany-2005` |

> *Note: Update placeholder handles in [`.github/CODEOWNERS`](.github/CODEOWNERS) to matching GitHub usernames/team handles.*

---

## 🌿 Branching Strategy & Workflow

We strictly follow a structured Git branching workflow based on **Git Flow** with clear rules:

```
main (Production/Stable) ───●─────────────────────────────────● (Release Merges Only)
                             ▲                                 ▲
                              \                               /
develop (Integration)  ───────●───────●─────────●─────────────● (Integration & Testing)
                               \     /           \           /
feature/*                       ●───●             \         /
                                                   ●───────●  (Feature & Bugfix branches)
```

### Branch Roles
- **`main`**: The stable, production-ready release branch. Only merged from `develop` or release candidates.
- **`develop`**: The primary integration branch where ongoing features are combined and tested.
- **`feature/*`**: Dedicated branches for new features and enhancements.
- **`bugfix/*`**: Dedicated branches for bug fixes and patches.
- **`release/*`**: Preparation branches for upcoming releases and stabilization.

### Branch Naming Conventions
- `feature/<ticket-id>-<short-description>` (e.g. `feature/LL-102-user-auth`, `feature/blood-request-map`)
- `bugfix/<ticket-id>-<short-description>` (e.g. `bugfix/LL-204-fix-mssql-connection-leak`)
- `release/v<major>.<minor>.<patch>` (e.g. `release/v1.0.0`)

---

## 🛡️ Repository Rules & Governance

1. **No Direct Pushes**: Pushing directly to `main` or `develop` is strictly prohibited. All changes must be made via Pull Requests.
2. **Mandatory Code Reviews**: Every Pull Request must receive **at least 1 approval** from the relevant CODEOWNER before it can be merged.
3. **Automated CI Status Checks**: All GitHub Actions workflow checks (`CI Status Check`) must pass successfully.
4. **Protection Against Overwrites**: Force pushes (`git push --force`) and branch deletions are disabled on protected branches (`main`, `develop`).
5. **No Secrets**: Never commit `.env` files, API keys, passwords, private certificates, or database connection strings.

---

## 🗄️ Database Management & Migration Policy

> ### ⚠️ Critical Database Rule
> **Every database schema change must be represented by a migration script committed to GitHub with the related application code.**
> Developers must **NEVER** make undocumented direct schema changes to the shared development, staging, or production databases.

### Migration Guidelines
1. **Versioned Scripts**: Store all SQL migration files in [`database/migrations/`](database/migrations/) following the naming convention:
   ```
   <NUMBER>_<descriptive_name>.sql    (e.g., 001_initial_schema.sql, 006_add_notifications_related_request_id.sql)
   V<NUMBER>__<descriptive_name>.sql  (e.g., V001__initial_schema.sql)
   ```
2. **Co-located with Code**: Submit the database migration script in the exact same Pull Request that introduces the backend/web/mobile changes requiring it.
3. **Idempotent & Safe**: Write SQL scripts with defensive checks (e.g., `IF NOT EXISTS ...`) to avoid accidental failure on re-runs.
4. **MSSQL Specifics**: Use standard T-SQL DDL syntax. Do not store sensitive database credentials or production connection strings inside migration files.


---

## 🚀 Developer Guide: Step-by-Step

### 1. How to Create a Feature Branch

Always branch off the latest `develop` branch:

```bash
# 1. Switch to develop and pull the latest changes
git checkout develop
git pull origin develop

# 2. Create and switch to your feature branch
git checkout -b feature/your-feature-name

# 3. Work on your changes, write tests, and verify locally
git status
```

### 2. How to Commit Your Changes

Follow clear and conventional commit messages:

```bash
git add .
git commit -m "feat(backend): add emergency request dispatch endpoint"
```

### 3. How to Submit a Pull Request

1. **Push your branch to GitHub**:
   ```bash
   git push -u origin feature/your-feature-name
   ```
2. **Open a Pull Request**:
   - Set the **Base branch** to `develop` (or `main` for release branches).
   - Set the **Compare branch** to `feature/your-feature-name`.
3. **Fill out the Pull Request Template**:
   - Describe the changes clearly.
   - Check off all relevant boxes (Area affected, Quality checklist, Database migration status).
   - Attach UI screenshots or CLI test outputs if applicable.
4. **Assign Reviewers**:
   - The CODEOWNERS file will automatically assign relevant leads.
   - Ensure you receive at least 1 approval.
5. **Verify CI Checks**:
   - Confirm all GitHub Actions CI checks are green (`CI Status Check`).
6. **Merge**:
   - Once approved and green, merge using **Squash and Merge** or **Rebase and Merge** as per project guidelines.

---

## 🔒 Security & Environment Variables

- Create a `.env.example` file in component directories with placeholder variable names (e.g., `DB_HOST=`, `DB_PORT=`, `API_KEY=`).
- Store your local values in `.env` (which is ignored by Git).
- Secrets for CI/CD must be stored in **GitHub Repository Secrets** (`Settings > Secrets and variables > Actions`).

---

## 🧪 Development & QA Test Accounts

For testing across Web, Mobile, and Backend, 8 standardized QA accounts are seeded with password `Test@123`:

| Account | Email | Password | Role |
|---|---|---|---|
| System Admin | `admin@lifelink.dev` | `Test@123` | `admin` |
| Hospital Staff | `hospital@lifelink.dev` | `Test@123` | `hospital_user` |
| Blood Bank Staff | `bloodbank@lifelink.dev` | `Test@123` | `blood_bank_operator` |
| Medical Lead | `medicallead@lifelink.dev` | `Test@123` | `medical_lead` |
| Platform Support | `support@lifelink.dev` | `Test@123` | `platform_support` |
| Donor & Caregiver | `donor@lifelink.dev` | `Test@123` | `normal_user` |
| Normal User | `user@lifelink.dev` | `Test@123` | `normal_user` |
| Banned User | `banned@lifelink.dev` | `Test@123` | `normal_user` (status: `suspended`) |

See [`backend/docs/QA_TEST_ACCOUNTS.md`](backend/docs/QA_TEST_ACCOUNTS.md) for full credentials, role mappings, and sample API requests.

---

## 🧪 Automated Testing

The backend includes **81 automated unit and integration tests** validating:
- Authentication & JWT issuance
- RBAC authorization across all 6 roles
- Role mapping (database PascalCase & backend snake_case)
- Emergency blood request lifecycle & state machine
- Inventory management & QR generation
- Caregiver blood bag QR lookup
- Paymob server-side pricing calculation, payment initiation, and HMAC webhook verification
- Haversine distance sorting, donor blood compatibility, 6-month rule, and automatic quota fulfillment

Run all tests with:
```bash
cd backend
python -m pytest app/tests -v
```

---

## 📄 License

This project is licensed under the terms specified in the [LICENSE](LICENSE) file.

