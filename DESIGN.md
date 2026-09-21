---
name: LifeLink Mobile
description: Clinical blood logistics and emergency donor ecosystem for Egypt
colors:
  primary: "#E53935"
  primary-dark: "#C62828"
  primary-light: "#FFECEE"
  primary-muted: "#FFCDD2"
  secondary: "#1E88E5"
  secondary-light: "#E8F3FF"
  teal: "#10B981"
  teal-light: "#EAF7EE"
  amber: "#F59E0B"
  amber-light: "#FFFBEB"
  purple: "#8B5CF6"
  purple-light: "#F3E8FF"
  navy: "#1E293B"
  dark-slate: "#0F172A"
  background: "#F8F9FA"
  surface: "#FFFFFF"
  surface-variant: "#F1F5F9"
  text-primary: "#1E293B"
  text-secondary: "#64748B"
  text-hint: "#94A3B8"
  border: "#E2E8F0"
  divider: "#F1F5F9"
  success: "#10B981"
  success-light: "#EAF7EE"
  warning: "#F59E0B"
  error: "#EF4444"
  error-light: "#FFECEE"
  info: "#3B82F6"
typography:
  display:
    fontFamily: "Cairo, sans-serif"
    fontSize: "30px"
    fontWeight: 800
    lineHeight: 1.2
  headline:
    fontFamily: "Cairo, sans-serif"
    fontSize: "24px"
    fontWeight: 800
    lineHeight: 1.25
  title:
    fontFamily: "Cairo, sans-serif"
    fontSize: "18px"
    fontWeight: 700
    lineHeight: 1.3
  body:
    fontFamily: "Cairo, sans-serif"
    fontSize: "14px"
    fontWeight: 400
    lineHeight: 1.5
  label:
    fontFamily: "Cairo, sans-serif"
    fontSize: "14px"
    fontWeight: 700
    lineHeight: 1.2
rounded:
  xs: "6px"
  sm: "10px"
  md: "14px"
  lg: "18px"
  xl: "24px"
  full: "999px"
spacing:
  xs: "4px"
  sm: "8px"
  md: "16px"
  lg: "20px"
  xl: "28px"
  xxl: "36px"
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.surface}"
    rounded: "{rounded.md}"
    padding: "14px 24px"
  button-secondary:
    backgroundColor: "{colors.secondary-light}"
    textColor: "{colors.secondary}"
    rounded: "{rounded.md}"
    padding: "14px 20px"
---

# Design System: LifeLink Mobile

## Overview

**Creative North Star: "The Clinical Vanguard" (الطليعة الطبية الهادئة)**

LifeLink Mobile is an Egyptian clinical blood logistics and emergency donor platform connecting hospitals, certified cold-chain couriers, caregivers, and voluntary donors. Its visual atmosphere balances institutional medical authority with reassuring human clarity. During emergency transfusions, caregivers are cognitively overwhelmed; donors seek transparent gratitude and frictionless impact.

The interface rejects panic-inducing sirens, noisy high-contrast banners, and generic red-cross clichés. Instead, it pairs vibrant Egyptian Medical Red (`#E53935`) with deep Slate Navy (`#1E293B`) and Clinical Logistics Blue (`#1E88E5`). Surfaces are pristine and layered with soft, ambient depth rather than aggressive drop shadows.

**Key Pillars:**
- **Calm Clinical Authority:** Crisp white surfaces framed with whisper borders (`#E2E8F0`) and diffused ambient shadows (`0 4px 16px rgba(0,0,0,0.03)`).
- **RTL-Native Ergonomics:** Built specifically for Arabic Cairo typography, right-to-left natural visual hierarchy, and 48×48 dp touch target compliance.
- **Strict Clinical Contrast:** WCAG AA compliant text-background pairings engineered for visibility under harsh hospital fluorescent lighting and outdoor Egyptian sunlight.
- **Evidence-Based Medical Logistics:** Reflects authentic Egyptian Blood Bank standards (including sex-differentiated eligibility: males 18–60, females 18–40) and official hospital staff requisition data (room/bed, SICU ward, attending physician, hemoglobin levels, and cross-match compatibility).

## Colors

A clinical Egyptian healthcare palette rooted in urgent blood delivery, cold-chain temperature preservation, and donor vitality.

### Primary
- **Medical Red** (`#E53935`): High-vitality clinical red used for primary hero actions, urgent shortage calls, blood group badges, and vital indicators.
- **Primary Dark** (`#C62828`): Deep arterial red used for button active states, pressed chips, and high-contrast badges.
- **Primary Light** (`#FFECEE`): Gentle crimson wash used for urgent shortage containers and badge backgrounds.
- **Primary Muted** (`#FFCDD2`): Soft tint for progress tracks and delicate dividers.

### Secondary
- **Clinical Blue** (`#1E88E5`): Hospital logistics blue indicating cold-chain couriers, QR scan confirmations, and courier transit milestones.
- **Secondary Light** (`#E8F3FF`): Logistics tint for secondary buttons, information banners, and unselected status chips.

### Tertiary & Accents
- **Clinical Teal** (`#10B981`): Laboratory teal used for test clearances, compatible cross-match chips, and safe eligibility confirmations.
- **Amber Warning** (`#F59E0B`): Used for pending cross-matches, donor eligibility countdowns, and non-blocking deferrals.
- **Purple Accent** (`#8B5CF6`): Donor achievement vouchers and reward loyalty tiers.

### Neutral
- **Slate Navy Ink** (`#1E293B`): Primary text and glyph color, commanding deep contrast against bright backgrounds.
- **Dark Slate** (`#0F172A`): Deepest header tone for high-emphasis titles.
- **Text Secondary** (`#64748B`): Slate grey for clinical metadata, room/bed numbers, subtitles, and timestamps.
- **Text Hint** (`#94A3B8`): Muted grey for search placeholders and unselected nav labels.
- **Background** (`#F8F9FA`): Ultra-clean clinical canvas preventing screen glare.
- **Surface** (`#FFFFFF`): Elevated card and bottom sheet background.
- **Border** (`#E2E8F0`): Single-pixel subtle definition for cards, dividers, and unselected inputs.

### Named Rules
**The Rarity of Red Rule.** Crimson red is strictly reserved for actionable primary buttons, emergency shortage badges, and critical lab values (e.g. Hb < 8 g/dL). It is never used for input focus outlines or decorative borders; input focus must use Clinical Blue (`#1E88E5`) to avoid falsely mimicking a validation error.
**The No-Panic Rule.** Emergency alerts must pair crimson accents with calming, readable navy typography and clear step-by-step guidance.

## Typography

**Display & Body Font:** Cairo (Modern Arabic typography with Latin glyph support)
**Character:** Clean, humanist Arabic lettering engineered for rapid comprehension during clinical emergencies.

### Hierarchy
- **Display** (800 weight, 30px, line-height 1.2): Splash and hero counters.
- **Headline** (800 weight, 24px, line-height 1.25): Screen anchors and section titles.
- **Title** (700 weight, 18px, line-height 1.3): Card titles, dialog headings, and modal headers.
- **Body** (400 weight, 14px, line-height 1.5): Instructions, guidance copy, and clinical nursing notes.
- **Label** (700 weight, 14px, line-height 1.2): Form labels, button text, and status chips.

### Named Rules
**The Native RTL Rule.** All screen typography and icon orientations must respect Arabic text direction. Directional icons (arrows, chevrons) must point along the reading line, never forcing hardcoded LTR glyphs.

## Layout

- **Spatial Rhythm:** Multiples of 4/8dp (`xs: 4`, `sm: 8`, `md: 16`, `lg: 20`, `xl: 28`, `xxl: 36`).
- **Screen Margins:** 20dp horizontal padding on mobile screens (`AppSpacing.lg`), expanding with responsive content constraints on tablets.
- **Touch Target Floor:** 48×48 dp minimum for every interactive target, with at least 8dp separation.

## Elevation & Depth

Surfaces rely on subtle tonal contrast and diffuse ambient shadows rather than heavy drop shadows or hard borders.

### Shadow Vocabulary
- **Soft Ambient** (`0 4px 16px rgba(0, 0, 0, 0.03)`): Default card elevation and floating search headers (`AppShadows.soft`).
- **Card Depth** (`0 6px 20px rgba(0, 0, 0, 0.05)`): Prominent feature cards and patient clinical status blocks (`AppShadows.card`).
- **Elevated Hero** (`0 6px 16px rgba(229, 57, 53, 0.16)`): Primary crimson action button glow (`AppShadows.elevated`).
- **Bottom Navigation** (`0 -4px 24px rgba(0, 0, 0, 0.05)`): Persistent dock bar shadow (`AppShadows.bottomNav`).

### Named Rules
**The Surface Integrity Rule.** Cards sit directly on the `#F8F9FA` background with a crisp 1px border (`#E2E8F0`) and soft ambient blur; dark heavy shadows are banned.

## Shapes

- **Corners:** Consistent 14px radius (`AppRadii.md`) for cards, text fields, and primary buttons; 18px radius (`AppRadii.lg`) for modal sheets and hero feature boxes; 999px (`AppRadii.full`) for status chips and pill badges.
- **Form Language:** Confident, rounded rectangles with gentle curves that convey modern medical safety.

## Components

### Buttons
- **Shape:** Rounded rectangle with 14px radius (`AppRadii.md`).
- **Primary:** Full Medical Red (`#E53935`) background with white typography, minimum 50dp height, and subtle crimson glow.
- **Secondary / Outlined:** Clinical Blue (`#1E88E5`) 1.5px border or soft tint background (`#E8F3FF`).

### Inputs / Fields
- **Shape:** 14px radius (`AppRadii.md`) with 16dp internal padding.
- **Rest State:** `#FBFBFB` background with 1px `#E2E8F0` border.
- **Focus State:** 1.5px `#1E88E5` (Clinical Blue) border with crisp caret.
- **Error State:** 1.5px `#EF4444` border with clear Arabic error message below.

### Cards & Clinical Sheets
- **Hospital Requisition Card:** Pristine white container housing hospital name, SICU department, room/bed, attending doctor, current hemoglobin, and urgency badge.
- **Logistics & Route Card:** Clean container with `#E2E8F0` border, housing cold-chain temperature badges, courier milestones, and hospital receipts.
- **Shortage Alert:** `#FFECEE` tint container with a vibrant Medical Red badge and unambiguous action button.

### Motion Primitives
- **LifeLinkFadeSlide:** Gentle 200ms entrance with 3px micro-offset and cubic deceleration; sheds GPU layers upon completion.
- **LifeLinkHeartbeat:** Biological 3.8s pulse with 80% resting phase, isolated inside `RepaintBoundary`.
- **LifeLinkPressable:** Tactile 0.99 micro-scale with 80ms recovery, isolated inside `RepaintBoundary`.

## Do's and Don'ts

### Do:
- **Do** provide native RTL navigation arrows (`Icons.arrow_back_rounded` or `Icons.adaptive.arrow_back`) that flip automatically.
- **Do** maintain a minimum 48×48 dp touch target for all buttons and interactive chips.
- **Do** use Clinical Blue (`#1E88E5`) for input focus indicators to avoid confusion with validation errors.
- **Do** format all financial figures in Egyptian Pounds (`EGP` / `ج.م`) with transparent itemization.
- **Do** respect Egyptian Blood Bank regulations: age eligibility is 18–60 for males and 18–40 for females.

### Don't:
- **Don't** hardcode `Icons.arrow_back_ios_rounded` which points the wrong way in Arabic RTL.
- **Don't** use Medical Red for input focus borders or neutral outlines.
- **Don't** allow caregivers to manually initiate blood bag requests or transport fragile blood products.
- **Don't** stack arbitrary gradient overlays or hard 0-blur block shadows.
