---
name: Life-Link Healthcare Ecosystem
description: Clinical blood supply chain, hospital requisition management, and emergency mobile donor ecosystem for Egypt
colors:
  primary: "#c92a2a"
  primary-hover: "#b02222"
  primary-active: "#8e1b1b"
  secondary: "#0e2430"
  secondary-hover: "#163647"
  clinical-blue: "#1e88e5"
  clinical-teal: "#10b981"
  clinical-amber: "#f59e0b"
  background: "#f7f9fa"
  surface: "#ffffff"
  surface-subtle: "#f8fafb"
  foreground: "#0c1e28"
  muted: "#edf2f5"
  muted-foreground: "#506471"
  border: "#dde4e8"
  emergency: "#c92a2a"
  emergency-subtle: "#fef2f2"
  success: "#16794a"
  success-subtle: "#e8f5ee"
  warning: "#8d5e00"
  warning-subtle: "#fff4d6"
typography:
  display:
    fontFamily: "Cairo, sans-serif"
    fontSize: "clamp(1.75rem, 3.5vw, 2.5rem)"
    fontWeight: 700
    lineHeight: 1.25
    letterSpacing: "-0.02em"
  headline:
    fontFamily: "Cairo, sans-serif"
    fontSize: "1.5rem"
    fontWeight: 600
    lineHeight: 1.3
    letterSpacing: "-0.015em"
  title:
    fontFamily: "Cairo, sans-serif"
    fontSize: "1.125rem"
    fontWeight: 600
    lineHeight: 1.4
    letterSpacing: "-0.01em"
  body:
    fontFamily: "IBM Plex Sans Arabic, Plus Jakarta Sans, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 400
    lineHeight: 1.65
    letterSpacing: "normal"
  label:
    fontFamily: "IBM Plex Sans Arabic, Plus Jakarta Sans, sans-serif"
    fontSize: "0.75rem"
    fontWeight: 500
    lineHeight: 1.4
    letterSpacing: "0.01em"
rounded:
  sm: "4px"
  md: "6px"
  lg: "8px"
  full: "9999px"
spacing:
  xs: "4px"
  sm: "8px"
  md: "16px"
  lg: "24px"
  xl: "32px"
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "#ffffff"
    rounded: "{rounded.md}"
    padding: "8px 16px"
  button-secondary:
    backgroundColor: "{colors.secondary}"
    textColor: "#ffffff"
    rounded: "{rounded.md}"
    padding: "8px 16px"
  input-field:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.foreground}"
    rounded: "{rounded.md}"
    padding: "8px 12px"
  card-container:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.foreground}"
    rounded: "{rounded.lg}"
    padding: "16px"
---

# Design System: Life-Link Healthcare Ecosystem

## 1. Web Portal: "The Clinical Ledger"

Life-Link is an operations-critical healthcare web portal designed for clinical transfusion officers, hospital physicians, lab technicians, and cold-chain dispatchers. The interface prioritizes life-safety speed, instant scanability under stress, uncompromising data fidelity, and seamless bilingual Arabic/English operation.

The visual language rejects whimsical tech-startup decoration, aggressive gradients, decorative shadows, and playful micro-interactions that slow down emergency workflows. Instead, it embodies authoritative clinical serenity: a clean, off-white sterile canvas (`#f7f9fa`), deep midnight navy governance surfaces (`#0e2430`), crisp 1px borders (`#dde4e8`), and high-contrast medical alerts. Every pixel serves to communicate bag availability, cold-chain handover integrity, and urgent transfusion dispatch.

### Key Characteristics
- **Calm, High-Contrast Palette:** Pure clinical white cards floating on crisp clinical canvas, anchored by deep midnight navy chrome and urgent medical crimson accents.
- **Bilingual Typographic Rigor:** Hand-crafted Arabic typography featuring Cairo for authoritative headings and IBM Plex Sans Arabic for body prose, paired with Plus Jakarta Sans for Latin characters.
- **Dense Operational Scanability:** High-information-density ledgers, sticky column headers, and tabular figures (`tabular-nums`) ensuring lab technicians can process hundreds of blood units without cognitive exhaustion.
- **Strict Bidi Isolation:** Zero Arabic/English layout corruption. DINs, tracking codes, phone numbers, and blood group symbols are isolated with `<bdi>` tags to guarantee flawless bidirectional rendering.

### Named Rules
- **The Clinical Priority Rule.** Crimson (`#c92a2a`) is strictly reserved for primary triage actions, STAT emergency indicators, and blood bag identification. Never use it as general decorative trim or arbitrary link styling.
- **The Status Tonal Pair Rule.** Every clinical status badge MUST pair an accessible foreground ink with its matching 8-10% tinted subtle background and soft border (e.g., `#16794a` text on `#e8f5ee` container). Never display bare uncontained text for medical status.
- **The Bidi Isolation Rule.** Any DIN (Donation Identification Number), unit tracking code, phone number, timestamp, or blood group symbol MUST be wrapped in `<bdi>` or assigned `dir="ltr"` / `unicode-bidi: isolate` to guarantee zero punctuation flipping in Arabic context.
- **The Tabular Precision Rule.** All quantities, timestamps, barcode digits, and blood bag volume counters must render with `font-variant-numeric: tabular-nums` to ensure scannable, rock-solid column alignment.
- **The Hairline Clarity Rule.** Boundaries between clinical cards and ledger columns are drawn with 1px hairline borders (`var(--border)`), never floating drop shadows. Shadows appear strictly on elevated interactive overlays (drawers, dialogs, popovers).

---

## 2. Mobile Application: "The Clinical Vanguard"

LifeLink Mobile is an Egyptian clinical blood logistics and emergency donor platform connecting hospitals, certified cold-chain couriers, caregivers, and voluntary donors. Its visual atmosphere balances institutional medical authority with reassuring human clarity.

### Key Pillars
- **Calm Clinical Authority:** Crisp white surfaces framed with whisper borders (`#E2E8F0`) and diffused ambient shadows (`0 4px 16px rgba(0,0,0,0.03)`).
- **RTL-Native Ergonomics:** Built specifically for Arabic Cairo typography, right-to-left natural visual hierarchy, and 48×48 dp touch target compliance.
- **Strict Clinical Contrast:** WCAG AA compliant text-background pairings engineered for visibility under harsh hospital fluorescent lighting and outdoor Egyptian sunlight.
- **Evidence-Based Medical Logistics:** Reflects authentic Egyptian Blood Bank standards (including sex-differentiated eligibility: males 18–60, females 18–40) and official hospital staff requisition data (room/bed, SICU ward, attending physician, hemoglobin levels, and cross-match compatibility).

### Named Rules
- **The Rarity of Red Rule.** Crimson red is strictly reserved for actionable primary buttons, emergency shortage badges, and critical lab values (e.g. Hb < 8 g/dL). Input focus must use Clinical Blue (`#1E88E5`) to avoid falsely mimicking a validation error.
- **The Native RTL Rule.** All screen typography and icon orientations must respect Arabic text direction. Directional icons (arrows, chevrons) must point along the reading line, never forcing hardcoded LTR glyphs.
- **The Surface Integrity Rule.** Cards sit directly on the `#F8F9FA` background with a crisp 1px border (`#E2E8F0`) and soft ambient blur; dark heavy shadows are banned.

---

## 3. Shared Do's and Don'ts

### Do:
- **Do** isolate every DIN, unit ID, and tracking code with `<bdi dir="ltr">` to prevent Arabic bidirectional number flipping.
- **Do** format all dates, timestamps, and numbers using `tabular-nums`.
- **Do** keep action buttons concise with explicit verbs (`Acknowledge request`, `Confirm allocation`, `Dispatch courier`).
- **Do** maintain a strict 4.5:1 text-to-background contrast ratio for all secondary clinical metadata.
- **Do** preserve 1px hairline borders on cards and table cells for clarity under harsh fluorescent hospital lighting.
- **Do** provide native RTL navigation arrows that flip automatically with locale.

### Don't:
- **Don't** use Medical Crimson (`#c92a2a` / `#E53935`) for decorative or neutral elements; its urgency value must never be diluted.
- **Don't** mix conflicting font families across RTL and LTR viewports.
- **Don't** use decorative drop shadows or soft-blur glow halos on static data tables.
- **Don't** allow blood bag component technical database keys (`blood_bag`) to leak to the UI; always format using clinical component nomenclature.
- **Don't** hide critical clinical status behind unrevealed tooltips or buried menus.
