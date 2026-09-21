---
name: Life-Link Blood Bank Portal
description: Clinical blood supply chain and emergency transfusion operations design system
colors:
  primary: "#c92a2a"
  primary-hover: "#b02222"
  primary-active: "#8e1b1b"
  secondary: "#0e2430"
  secondary-hover: "#163647"
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
  button-primary-hover:
    backgroundColor: "{colors.primary-hover}"
  button-secondary:
    backgroundColor: "{colors.secondary}"
    textColor: "#ffffff"
    rounded: "{rounded.md}"
    padding: "8px 16px"
  button-ghost:
    backgroundColor: "transparent"
    textColor: "{colors.foreground}"
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

# Design System: Life-Link Blood Bank Portal

## Overview

**Creative North Star: "The Clinical Ledger"**

Life-Link is an operations-critical healthcare web portal designed for clinical transfusion officers, hospital physicians, lab technicians, and cold-chain dispatchers. The interface prioritizes life-safety speed, instant scanability under stress, uncompromising data fidelity, and seamless bilingual Arabic/English operation.

The visual language rejects whimsical tech-startup decoration, aggressive gradients, decorative shadows, and playful micro-interactions that slow down emergency workflows. Instead, it embodies authoritative clinical serenity: a clean, off-white sterile canvas (`#f7f9fa`), deep midnight navy governance surfaces (`#0e2430`), crisp 1px borders (`#dde4e8`), and high-contrast medical alerts. Every pixel serves to communicate bag availability, cold-chain handover integrity, and urgent transfusion dispatch.

**Key Characteristics:**
- **Calm, High-Contrast Palette:** Pure clinical white cards floating on crisp clinical canvas, anchored by deep midnight navy chrome and urgent medical crimson accents.
- **Bilingual Typographic Rigor:** Hand-crafted Arabic typography featuring Cairo for authoritative headings and IBM Plex Sans Arabic for body prose, paired with Plus Jakarta Sans for Latin characters.
- **Dense Operational Scanability:** High-information-density ledgers, sticky column headers, and tabular figures (`tabular-nums`) ensuring lab technicians can process hundreds of blood units without cognitive exhaustion.
- **Strict Bidi Isolation:** Zero Arabic/English layout corruption. DINs, tracking codes, phone numbers, and blood group symbols are isolated with `<bdi>` tags to guarantee flawless bidirectional rendering.

## Colors

The palette is rooted in medical authority, blood supply differentiation, and clinical urgency tiering.

### Primary
- **Medical Crimson** (`#c92a2a`): Used strictly for primary clinical actions, STAT emergency triage notices, active requisition alerts, and blood-related focal points.
- **Crimson Hover** (`#b02222`): Elevated interaction state for primary action buttons.
- **Crimson Active** (`#8e1b1b`): Pressed state indicating confirmed dispatch input.

### Secondary
- **Clinical Midnight Navy** (`#0e2430`): Represents clinical governance, authoritative containment, and institutional permanence. Deployed as the dominant chrome for sidebar navigation, header bars, and high-authority control panels.
- **Navy Surface Accent** (`#163647`): Hover state for navigation items and dark-themed interactive surfaces.
- **Navy Hairline Border** (`#1d3e50`): Subtle border separating dark navigation elements without stark contrast lines.

### Neutral
- **Clinical Canvas** (`#f7f9fa`): Soft, cool off-white background preventing eye strain during long hospital workstation shifts.
- **Pure Surface** (`#ffffff`): Foreground card surfaces, table records, and modal backdrops.
- **Subtle Surface** (`#f8fafb`): Table headers, alternating row bands, and recessed metadata containers.
- **Foreground Deep Slate** (`#0c1e28`): High-contrast ink for body text, clinical identifiers, and primary labels (WCAG AAA compliant).
- **Muted Slate Grey** (`#506471`): Secondary metadata, field hints, and timestamps.
- **Neutral Hairline Border** (`#dde4e8`): Standard 1px divider for table rows, cards, and input boundaries.
- **Input Border** (`#cbd5dc`): Resting boundary for form fields and search boxes.

### Clinical Status Indicators
- **Emergency Crimson** (`#c92a2a` ink on `#fef2f2` subtle background): STAT emergency requests and expired/quarantined blood units.
- **Verified Green** (`#16794a` ink on `#e8f5ee` subtle background): Completed transfers, available inventory, and valid cold-chain signatures.
- **Clinical Amber** (`#8d5e00` ink on `#fff4d6` subtle background): Urgent triage, expiring units (< 24h/48h), and pending authorizations.

### Named Rules
**The Clinical Priority Rule.** Crimson (`#c92a2a`) is strictly reserved for primary triage actions, STAT emergency indicators, and blood bag identification. Never use it as general decorative trim or arbitrary link styling.

**The Status Tonal Pair Rule.** Every clinical status badge MUST pair an accessible foreground ink with its matching 8-10% tinted subtle background and soft border (e.g., `#16794a` text on `#e8f5ee` container). Never display bare uncontained text for medical status.

## Typography

**Display & Heading Font:** Cairo (Google Fonts, weights: 500, 600, 700, 800)
**Arabic Body Font:** IBM Plex Sans Arabic (Google Fonts, weights: 400, 500, 600)
**Latin & Numerical Font:** Plus Jakarta Sans (Google Fonts, weights: 400, 500, 600, 700)
**Code & Monospace Font:** ui-monospace, "Cascadia Code", Consolas, monospace

**Character:** Cairo provides authoritative, balanced Egyptian medical headline presence with geometric legibility. IBM Plex Sans Arabic delivers clean, rhythmic legibility for high-density clinical data, preventing fatigue across dense data tables.

### Hierarchy
- **Display** (Bold 700, `clamp(1.75rem, 3.5vw, 2.5rem)`, line-height: 1.25, tracking: -0.02em): Top-level dashboard headers and portal welcome screens.
- **Headline** (SemiBold 600, `1.5rem` / 24px, line-height: 1.3, tracking: -0.015em): Section titles, page banners, and modal headings.
- **Title** (SemiBold 600, `1.125rem` / 18px, line-height: 1.4, tracking: -0.01em): Card titles, drawer headers, and table category labels.
- **Body** (Regular 400 / Medium 500, `0.875rem` / 14px, line-height: 1.65): Standard clinical notes, hospital requisitions, descriptions, and table records. Max line length: 65–75ch.
- **Label & Data** (Medium 500 / SemiBold 600, `0.75rem` / 12px, line-height: 1.4, tracking: 0.01em): Badges, table column headers, timestamps, and DIN identifiers.

### Named Rules
**The Bidi Isolation Rule.** Any DIN (Donation Identification Number), unit tracking code, phone number, timestamp, or blood group symbol MUST be wrapped in `<bdi>` or assigned `dir="ltr"` / `unicode-bidi: isolate` to guarantee zero punctuation flipping in Arabic context.

**The Tabular Precision Rule.** All quantities, timestamps, barcode digits, and blood bag volume counters must render with `font-variant-numeric: tabular-nums` to ensure scannable, rock-solid column alignment.

## Layout

The portal utilizes a persistent clinical application shell designed for modern hospital monitors (1080p, 1440p) while remaining responsive on tablets and emergency mobile views.

- **Navigation Shell:** Sticky dark navy header (`h-16`) paired with a desktop sidebar navigation rail (`4.5rem` collapsed icon rail, expanding to `16rem` overlay on command, folding into a touch-friendly drawer on mobile).
- **Content Canvas:** Contained fluid canvas (`max-w-[100rem]` / 1600px) centered with responsive padding (`px-4 sm:px-6 xl:px-8` and `py-5 sm:py-7`).
- **Telemetry Tile Grid:** Top-of-page quick triage ribbon with 5 contiguous status cards (`grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-px bg-border`).
- **Data Table Layout:** `border-collapse: separate; border-spacing: 0;` with sticky header support and horizontal scrolling wrappers for narrow viewports.

## Elevation & Depth

The design system is fundamentally flat and layered. Depth is expressed through crisp 1px borders and distinct surface tones rather than heavy drop shadows.

### Shadow Vocabulary
- **Rest Surface (`shadow-2xs`):** `0 1px 2px 0 rgb(0 0 0 / 0.03)` — Default soft containment for cards, search bars, and table containers.
- **Floating Overlay (`var(--shadow-overlay)`):** `0 18px 44px -18px rgb(10 31 40 / 0.30)` — Modal dialogs, custody history drawers, and print preview overlays.

### Named Rules
**The Hairline Clarity Rule.** Boundaries between clinical cards and ledger columns are drawn with 1px hairline borders (`var(--border)`), never floating drop shadows. Shadows appear strictly on elevated interactive overlays (drawers, dialogs, popovers).

## Shapes

- **Badges & Micro Indicators:** `rounded-sm` (4px radius) or `rounded-full` for status dots and blood group badges.
- **Buttons, Form Inputs & Selects:** `rounded-md` (6px radius).
- **Cards, Containers & Modals:** `rounded-lg` (8px radius).
- **Strict Prohibition:** Rounded corners exceeding 8px are banned for structural elements. Neomorphic soft-blur blobs or brutalist 0px harsh squares are forbidden.

## Components

### Buttons
- **Shape:** Compact 6px radius (`rounded-md`), height 36px (`sm`) or 40px (`default`).
- **Primary:** Medical Crimson background (`#c92a2a`), white text, crisp 150ms transition to hover (`#b02222`).
- **Secondary:** Dark Navy background (`#0e2430`), white text, hover (`#163647`).
- **Outline:** Surface background, 1px border (`#dde4e8`), dark slate text (`#0c1e28`), hover (`#edf2f5`).
- **Ghost:** Transparent background, dark text, hover subtle grey (`#edf2f5`).

### Clinical Badges
- **BloodGroupBadge:** Distinctive blood unit badge pairing prominent ABO group with Rh factor, styled with high contrast for emergency glanceability.
- **UrgencyBadge:** Triage indicator for `routine` (muted), `urgent` (amber warning), and `emergency` (crimson alert with pulsating beacon).
- **RequestStatusBadge:** Tonal container badge reflecting official state machine lifecycle: `submitted`, `acknowledged`, `confirmed`, `preparing`, `ready`, `completed`, `rejected`.

### Data Tables
- **Clinical Dispatch Ledger:** High-density data grid featuring sticky column headers, tabular figures, hover row highlights (`rgba(0,0,0,0.02)`), and inline action shortcuts.

### Medical Barcode & QR Code
- **MedicalBarcode:** SVG Code 128 / ISBT 128 compliant linear barcode with eye-readable monospace human text underneath.
- **MedicalQrCode:** High-density SVG QR code with level M error correction for mobile scanner verification and cold-chain handover.

## Do's and Don'ts

### Do:
- **Do** isolate every DIN, unit ID, and tracking code with `<bdi dir="ltr">` to prevent Arabic bidirectional number flipping.
- **Do** format all dates, timestamps, and numbers using `tabular-nums`.
- **Do** keep action buttons concise with explicit verbs (`Acknowledge request`, `Confirm allocation`, `Dispatch courier`).
- **Do** maintain a strict 4.5:1 text-to-background contrast ratio for all secondary clinical metadata.
- **Do** preserve 1px hairline borders on cards and table cells for clarity under harsh fluorescent hospital lighting.

### Don't:
- **Don't** use Medical Crimson (`#c92a2a`) for decorative or neutral elements; its urgency value must never be diluted.
- **Don't** mix conflicting font families across RTL and LTR viewports.
- **Don't** use decorative drop shadows or soft-blur glow halos on static data tables.
- **Don't** allow blood bag component technical database keys (`blood_bag`) to leak to the UI; always format using clinical component nomenclature.
- **Don't** hide critical clinical status behind unrevealed tooltips or buried menus.
