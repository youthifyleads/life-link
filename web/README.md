# Life Link Web Portal

React web application for the Life Link blood coordination network, serving institutional staff: **Hospital Staff**, **Blood Bank Operators**, **Medical Leads**, **Platform Support**, and **System Admins**.

---

## 🏥 Roles & Permissions

The Web Portal provides role-scoped administrative and operational dashboards:

| Role | Default Email | Functions |
| :--- | :--- | :--- |
| **System Admin** | `admin@lifelink.dev` | Complete oversight, user management, audit logs, system configurations. |
| **Hospital Staff** | `hospital@lifelink.dev` | Create emergency blood requests, upload clinical documents, initiate Paymob payments. |
| **Blood Bank Operator** | `bloodbank@lifelink.dev` | Manage blood bag inventory, set flexible unit pricing, match & notify closest eligible donors. |
| **Medical Lead** | `medicallead@lifelink.dev` | Review clinical documents, approve/reject blood requests, medical oversight. |
| **Platform Support** | `support@lifelink.dev` | Operational tracking, transaction status verification, user assistance. |

*Default password for all QA test accounts: `Test@123`.*

---

## ✨ Key Features

- **Blood Request Management**: Hospital staff create requests with urgency flags, quantity units, and clinical notes.
- **Paymob Payment Checkout**: Seamless checkout flow for blood requests with flexible server-side pricing configured by the blood bank.
- **Donor Matching & Dispatch**: Find nearest eligible donors sorted by Haversine distance, with batch notification dispatch to top N closest donors.
- **Inventory & QR Tracking**: Track real-time blood bag stock and issue encrypted QR tracking references.
- **Bilingual UI**: Full Arabic & English support with RTL layout (`i18next`, `@fontsource-variable/noto-sans-arabic`, `@fontsource-variable/ibm-plex-sans`).

---

## 🚀 Getting Started

### Prerequisites
- Node.js (≥ 18.0.0)
- npm or yarn

### Installation & Development

1. **Navigate to the web directory**:
   ```bash
   cd web
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure Environment Variables**:
   Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```
   Ensure `VITE_API_BASE_URL` points to your backend:
   ```env
   VITE_API_BASE_URL=http://localhost:8000/api/v1
   ```

4. **Run the development server**:
   ```bash
   npm run dev
   ```
   Open `http://localhost:5173` in your browser.

### Available Scripts
- `npm run dev`: Start Vite development server with Hot Module Replacement.
- `npm run build`: Type-check with TypeScript and build production bundle.
- `npm run test`: Run unit tests with Vitest.
- `npm run test:e2e`: Run end-to-end tests with Playwright.
- `npm run lint`: Run ESLint checks.
