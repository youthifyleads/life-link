# Product

<!-- impeccable:product-schema 1 -->

## Platform

android

## Users

1. **Blood Donors (المتبرعون بالدم):** Healthy individuals in Egypt who want to donate blood to save lives, respond to urgent shortage alerts, track their donation history and eligibility windows, and redeem partner discount vouchers as recognition for their contributions.
2. **Patient Caregivers (مرافقو المرضى):** Family members or companions of hospitalized patients who need emergency or scheduled blood bags. They receive an authorized hospital blood requisition with a QR code or tracking reference, scan it to inspect the invoice and cold-chain courier journey, and pay the regulated fees online via Paymob.
3. **Single Identity:** Both personas exist within a unified account (`normal_user`), toggled seamlessly within the app via a prominent header Mode Switcher without re-authenticating.

## Product Purpose

LifeLink is an end-to-end medical blood supply chain and emergency donation ecosystem tailored for Egypt. It eliminates frantic manual searches for blood during medical emergencies by interconnecting hospital blood requests, authorized blood bank stocks, certified cold-chain medical couriers, and voluntary donors into one synchronized real-time platform.

Success means:
- Zero manual transport of fragile blood bags by distressed caregivers.
- 100% verified medical courier transport maintaining strict temperature and cold-chain integrity.
- Immediate transparency of bag pricing, test fees, and real-time delivery status for families.
- High donor retention through reliable shortage alerts, clear eligibility tracking, and partner reward vouchers.

## Positioning

Unlike informal social media donation appeals or static blood bank directories, LifeLink enforces strict clinical governance:
- **Clinical Exclusivity:** Only certified hospital physicians can issue blood requests; caregivers never order blood bags directly.
- **Dedicated Cold-Chain Logistics:** Blood is transported strictly between blood banks and hospitals via temperature-regulated medical couriers, removing the dangerous burden from patient families.
- **Transparent Official Financials:** Direct QR scan of hospital requisitions unlocks itemized costs and online payment, preventing emergency price gouging.

## Operating Context

- **Geographic & Regulatory:** Egypt (EGP currency, Arabic-first Cairo typography, Egyptian Ministry of Health blood banking protocols).
- **Physical Environment:** Hospital emergency rooms, intensive care waiting halls, donor clinics, and blood transfusion centers.
- **Hardware Affordances:** Mobile camera scanning of hospital printed requisitions or physician monitor screens, high-contrast readable screens for stressed families in hospital lighting.
- **Integrations:** FastAPI backend deployed on Azure, Paymob Egyptian payment gateway (cards & digital wallets), and real-time Courier GPS / cold-chain milestone dispatch.

## Capabilities and Constraints

### Core Capabilities
- Single account registration with instant in-app Mode Switching (Donor Mode ↔ Caregiver Mode).
- Caregiver scanning of hospital blood request QR codes (`/caregiver/scan-request`).
- Cold-chain courier journey stepper (Blood Bank Preparation → Courier Transit → Hospital Handover).
- Itemized payment breakdown and Paymob checkout integration.
- Patient profile and medical guidance management.
- Donor shortage broadcast alerts, proximity matching, and donation history tracking.
- Donor reward voucher system (`/donors/me/vouchers`) with QR display for partner cashier redemption.

### Technical & Business Constraints
- Caregivers **must never** create blood requests or pick up physical blood bags.
- Arabic RTL is primary; all clinical terms must be clear, calm, and reassuring in Arabic.
- Mobile client is built exclusively with Flutter for Android/iOS. Scope is focused strictly on the mobile application.

## Brand Commitments

- **Name:** LifeLink (شريان الحياة).
- **Visual Identity Palette:** LifeLink Crimson (`#C62828`), Deep Navy (`#0A192F`), Hospital Clinical Blue (`#1976D2`), and Verified Medical Green (`#2E7D32`).
- **Voice & Tone:** Authoritative, clinically calm, urgent without panic, transparent, and respectful of patient distress.
- **Typography:** Modern Arabic typography (Cairo / Inter) with native RTL support.

## Evidence on Hand

- Flutter mobile codebase in `mobile/` with passing unit and integration test suite (`flutter test`).
- Live Azure development API backend: `https://lifelink-backend-dev-g7cwf7gsf3cxdaba.centralus-01.azurewebsites.net/api/v1`.
- Live Android Emulator (`LifeLink_Test` / Pixel 6, Android 15 API 35) running `app-debug.apk`.
- Verified camera scanning functionality via `mobile_scanner`.

## Product Principles

1. **Patient Safety Above All:** Medical protocol dictates every step. Only doctors request blood; only certified couriers transport it.
2. **Reassurance in Crisis:** Every interface for caregivers must minimize cognitive load, communicate transparently about price and delivery status, and prevent panic.
3. **Gratitude and Retention:** Honor voluntary donors with clear health metrics, timely shortage notices, and tangible reward vouchers.
4. **Frictionless Dual Identity:** One human can be both a donor today and a caregiver tomorrow; switching must take a single tap without re-login.

## Accessibility & Inclusion

- Right-to-Left (RTL) Arabic layout with natural reading flow and culturally attuned iconography.
- High contrast color ratios meeting WCAG AA standards for readability in emergency room environments.
- Scalable Cairo font sizing and generous touch targets (minimum 48x48 dp) for one-handed emergency operation.
