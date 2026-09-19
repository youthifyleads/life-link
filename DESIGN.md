---
name: LifeLink Mobile
description: Clinical blood logistics and emergency donor ecosystem for Egypt
colors:
  primary: "#CC3D4A"
  primary-dark: "#9E2938"
  primary-light: "#FBE9EB"
  secondary: "#2F6F9F"
  secondary-light: "#EAF3F9"
  teal: "#2D8C87"
  teal-light: "#E5F3F1"
  navy: "#0E2438"
  background: "#F7F9FB"
  surface: "#FFFFFF"
  surface-variant: "#EAF0F2"
  text-primary: "#0E2438"
  text-secondary: "#5E7180"
  text-hint: "#93A1AA"
  border: "#DCE4EA"
  divider: "#EAF0F3"
  success: "#10B981"
  warning: "#F59E0B"
  error: "#EF4444"
typography:
  display:
    fontFamily: "Cairo, sans-serif"
    fontSize: "32px"
    fontWeight: 800
    lineHeight: 1.15
  headline:
    fontFamily: "Cairo, sans-serif"
    fontSize: "24px"
    fontWeight: 800
    lineHeight: 1.2
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
  xs: "4px"
  sm: "8px"
  md: "12px"
  lg: "16px"
  xl: "24px"
  full: "999px"
spacing:
  xs: "4px"
  sm: "8px"
  md: "16px"
  lg: "24px"
  xl: "32px"
  xxl: "40px"
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.surface}"
    rounded: "{rounded.md}"
    padding: "16px 24px"
  button-secondary:
    backgroundColor: "{colors.secondary-light}"
    textColor: "{colors.secondary}"
    rounded: "{rounded.md}"
    padding: "14px 20px"
---

# Design System: LifeLink Mobile

## Overview

**Creative North Star: "The Clinical Vanguard" (الطليعة الطبية الهادئة)**

LifeLink is designed for Egyptian emergency rooms, blood bank logistics, and generous voluntary donors. Its visual atmosphere balances clinical authority with human reassurance. In a crisis, caregivers are stressed and cognitively overloaded; donors want seamless gratitude and clear impact.

The visual language rejects loud alarms, excessive borders, and generic red-cross tropes. Instead, it pairs a noble Crimson primary (`#CC3D4A`) with soothing Deep Navy (`#0E2438`) and Clinical Blue (`#2F6F9F`). Surfaces are pristine and layered with soft, ambient depth rather than aggressive drop shadows.

**Key Characteristics:**
- **Calm Authority:** Clean white cards with whisper borders (`#DCE4EA`) and soft ambient shadows.
- **RTL-Native Ergonomics:** Built specifically for Arabic Cairo typography, right-to-left layout flows, and 48dp minimum touch targets.
- **Strict Clinical Contrast:** WCAG AA compliant text pairings ensuring high visibility under emergency room harsh fluorescent lighting.
- **Purposeful Color Coding:** Crimson is reserved strictly for primary brand actions and urgent shortages; Clinical Blue represents cold-chain courier logistics; Green signals confirmed safety.

## Colors

A clinical Egyptian healthcare palette rooted in urgent blood response, cold-chain assurance, and donor vitality.

### Primary
- **LifeLink Crimson** (`#CC3D4A`): High-vitality medical red used for primary hero actions, vital blood drop iconography, and urgent shortage calls.
- **Primary Dark** (`#9E2938`): Deep arterial red used for button active states and high-contrast badges.
- **Primary Light** (`#FBE9EB`): Gentle crimson wash used for alert backgrounds and subtle accents.

### Secondary
- **Clinical Blue** (`#2F6F9F`): Cool hospital logistics blue indicating verified cold-chain couriers, invoice scanning, and active transit milestones.
- **Secondary Light** (`#EAF3F9`): Soft logistics tint for secondary tags, chips, and helper containers.

### Tertiary
- **Medical Teal** (`#2D8C87`): Clean laboratory teal used for clinical records, test clearance confirmations, and donor health indicators.

### Neutral
- **Deep Navy** (`#0E2438`): Primary ink and text tone, commanding authority and deep contrast against bright backgrounds.
- **Text Secondary** (`#5E7180`): Slate grey for metadata, subtitles, timestamps, and secondary labels.
- **Text Hint** (`#93A1AA`): Subtle muted tint for placeholder values.
- **Background** (`#F7F9FB`): Ultra-clean clinical canvas preventing glare.
- **Surface** (`#FFFFFF`): Elevated card and bottom sheet background.
- **Border** (`#DCE4EA`): Single-pixel subtle definition for cards and unselected inputs.

### Named Rules
**The Rarity of Red Rule.** Crimson red is never used for input focus outlines or decorative borders; input focus must use Clinical Blue (`#2F6F9F`) to avoid falsely mimicking an error state.
**The No-Panic Rule.** Emergency alerts must pair crimson accents with calming, readable navy typography and clear step-by-step guidance.

## Typography

**Display & Body Font:** Cairo (Modern Arabic typography with Latin glyph support)
**Character:** Legible, open Arabic lettering engineered for rapid comprehension during clinical emergencies.

### Hierarchy
- **Display** (800 weight, 32px, line-height 1.15): Splash and hero counters.
- **Headline** (800 weight, 24px, line-height 1.2): Section anchors and screen titles.
- **Title** (700 weight, 18px, line-height 1.3): Card headers, dialog titles, and modal headers.
- **Body** (400 weight, 14px, line-height 1.5): Instructions, guidance copy, and clinical notes.
- **Label** (700 weight, 14px, line-height 1.2): Form labels, button text, and status chips.

### Named Rules
**The Native RTL Rule.** All screen typography and icon orientations must respect Arabic text direction. Directional icons (arrows, chevrons) must point along the reading line, never forcing hardcoded LTR glyphs.

## Layout

- **Spatial Rhythm:** Multiples of 8dp (`xs: 4`, `sm: 8`, `md: 16`, `lg: 24`, `xl: 32`, `xxl: 40`).
- **Screen Margins:** 16dp horizontal padding on compact mobile screens, expanding to 24dp on larger devices.
- **Max Width:** 480dp max content constraint on wide tablets or folded devices to preserve line measure.
- **Touch Target Floor:** 48×48 dp minimum for every interactive target, with at least 8dp separation.

## Elevation & Depth

Surfaces rely on subtle tonal contrast and diffuse ambient shadows rather than heavy drop shadows or hard borders.

### Shadow Vocabulary
- **Soft Ambient** (`0 4px 10px rgba(0, 0, 0, 0.06)`): Default card elevation and floating search headers.
- **Elevated Hero** (`0 6px 16px rgba(204, 61, 74, 0.22)`): Primary crimson action button glow, signaling tapability.

### Named Rules
**The Surface Integrity Rule.** Cards sit directly on the `#F7F9FB` background with a crisp 1px border (`#DCE4EA`) and soft ambient blur; dark heavy shadows are banned.

## Shapes

- **Corners:** Consistent 12px radius (`AppRadii.md`) for cards, text fields, and primary buttons; 16px radius (`AppRadii.lg`) for modal sheets and hero feature boxes; 999px (`AppRadii.full`) for status chips and pill badges.
- **Form Language:** Confident, rounded rectangles with gentle curves that convey modern medical safety.

## Components

### Buttons
- **Shape:** Rounded rectangle with 12px radius (`AppRadii.md`).
- **Primary:** Full Crimson (`#CC3D4A`) background with white typography, minimum 52dp height, and subtle crimson glow.
- **Secondary / Outlined:** Clinical Blue (`#2F6F9F`) 1.5px border or soft tint background (`#EAF3F9`).

### Inputs / Fields
- **Shape:** 12px radius (`AppRadii.md`) with 16dp internal padding.
- **Rest State:** `#FBFCFD` background with 1px `#DCE4EA` border.
- **Focus State:** 1.5px `#2F6F9F` (Clinical Blue) border with crisp caret.
- **Error State:** 1.5px `#EF4444` border with clear Arabic error message below.

### Cards & Steppers
- **Logistics Card:** Clean white container with `#DCE4EA` border, housing cold-chain temperature badges, courier milestones, and hospital receipts.
- **Shortage Alert:** `#FBE9EB` tint container with a vibrant Crimson badge and unambiguous action button.

## Do's and Don'ts

### Do:
- **Do** provide native RTL navigation arrows (`Icons.arrow_back_rounded` or `Icons.adaptive.arrow_back`) that flip automatically.
- **Do** maintain a minimum 48×48 dp touch target for all buttons and interactive chips.
- **Do** use Clinical Blue (`#2F6F9F`) for input focus indicators to avoid confusion with validation errors.
- **Do** format all financial figures in Egyptian Pounds (`EGP` / `ج.م`) with transparent itemization.

### Don't:
- **Don't** hardcode `Icons.arrow_back_ios_rounded` which points the wrong way in Arabic RTL.
- **Don't** use Crimson red for input focus borders or neutral outlines.
- **Don't** allow caregivers to manually initiate blood bag requests or transport fragile blood products.
- **Don't** stack arbitrary gradient overlays or hard 0-blur block shadows.
