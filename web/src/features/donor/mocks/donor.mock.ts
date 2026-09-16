import type {
  DonationRecord,
  DonationRequest,
  DonationResponseStatus,
  DonationVoucher,
  DonorConsent,
  DonorNotification,
  DonorProfile,
} from "@/features/donor/types/donor.types";

const defaultProfile: DonorProfile = {
  id: "donor-omar-001",
  name: "Omar Donor",
  email: "omar.donor@example.test",
  phone: "+20 10 2345 6789",
  bloodGroup: "O+",
  eligibilityStatus: "eligible",
  eligibilityMessage:
    "Eligible to donate today. The minimum recommended 56-day rest period since your last whole blood donation has elapsed.",
  lastDonationDate: "2026-06-14",
  nextEligibleDate: "2026-08-09",
  metrics: {
    totalDonations: 6,
    unitsContributed: 6,
    livesImpacted: 18,
    activeVouchers: 1,
  },
};

const defaultRequests: DonationRequest[] = [
  {
    id: "dr-0811",
    reference: "DR-2026-0811",
    requestingOrg: {
      id: "hosp-cairo-univ",
      name: "Cairo University Specialized Hospital",
      type: "hospital",
      governorate: "Cairo",
      address: "1 El-Sarayah St, Al-Manial",
      phone: "+20 2 2365 4000",
    },
    bloodGroup: "O+",
    component: "whole_blood",
    quantityRequested: 2,
    urgency: "emergency",
    requestDate: "2026-09-08",
    requiredByDate: "2026-09-10 18:00",
    status: "open",
    myResponse: "pending",
    clinicalContextSafe: "Maternity & Emergency Trauma Reserve",
    specialInstructions:
      "Arrive 15 minutes prior for rapid hemoglobin verification. Ensure adequate hydration with 500 mL water before arrival.",
    location: "Cairo University Hospital - Blood Donation Pavilion, Gate 3",
  },
  {
    id: "dr-0824",
    reference: "DR-2026-0824",
    requestingOrg: {
      id: "bb-central-cairo",
      name: "Central Blood Bank - Downtown Center",
      type: "blood_bank",
      governorate: "Cairo",
      address: "19 Ramses St, Downtown",
      phone: "+20 2 2575 1234",
    },
    bloodGroup: "O+",
    component: "red_cells",
    quantityRequested: 3,
    urgency: "urgent",
    requestDate: "2026-09-07",
    requiredByDate: "2026-09-11 14:00",
    status: "open",
    myResponse: "interested",
    clinicalContextSafe: "Regional Surgical Critical Reserve Replenishment",
    specialInstructions:
      "Standard red blood cell collection. Fasting is not required; a light, low-fat meal is recommended.",
    location: "Central Blood Bank Main Station, Transfusion Suite Room 102",
  },
  {
    id: "dr-0799",
    reference: "DR-2026-0799",
    requestingOrg: {
      id: "hosp-al-galaa",
      name: "Al-Galaa Military Hospital",
      type: "hospital",
      governorate: "Cairo",
      address: "Salah Salem St, Heliopolis",
      phone: "+20 2 2268 9000",
    },
    bloodGroup: "O+",
    component: "platelets",
    quantityRequested: 1,
    urgency: "routine",
    requestDate: "2026-09-05",
    requiredByDate: "2026-09-14 12:00",
    status: "open",
    myResponse: "pending",
    clinicalContextSafe: "Scheduled Oncology Platelet Support Reserve",
    specialInstructions:
      "Platelet apheresis session takes approximately 60-75 minutes. Please refrain from aspirin 48 hours prior.",
    location: "Al-Galaa Transfusion Center, 2nd Floor Clinical Wing",
  },
];

const defaultDonations: DonationRecord[] = [
  {
    id: "DON-2026-0042",
    donationDate: "2026-06-14",
    bloodGroup: "O+",
    component: "whole_blood",
    volumeMl: 450,
    facilityName: "Central Blood Bank - Downtown Branch",
    facilityGovernorate: "Cairo",
    status: "completed",
    voucherId: "VCH-2026-9901",
    notes:
      "Successful collection. Serology screening cleared. Allocated to regional acute trauma pool.",
  },
  {
    id: "DON-2026-0021",
    donationDate: "2026-03-20",
    bloodGroup: "O+",
    component: "whole_blood",
    volumeMl: 450,
    facilityName: "Cairo University Specialized Hospital",
    facilityGovernorate: "Cairo",
    status: "completed",
    notes: "Routine voluntary donation for hospital emergency stock.",
  },
  {
    id: "DON-2025-0089",
    donationDate: "2025-11-10",
    bloodGroup: "O+",
    component: "red_cells",
    volumeMl: 450,
    facilityName: "Central Blood Bank - Downtown Branch",
    facilityGovernorate: "Cairo",
    status: "completed",
    notes: "Apheresis double red cell collection.",
  },
  {
    id: "DON-2025-0045",
    donationDate: "2025-07-04",
    bloodGroup: "O+",
    component: "whole_blood",
    volumeMl: 450,
    facilityName: "Al-Galaa Military Hospital",
    facilityGovernorate: "Cairo",
    status: "completed",
    voucherId: "VCH-2025-8812",
    notes: "Community blood drive participant.",
  },
];

const defaultVouchers: DonationVoucher[] = [
  {
    id: "vch-9901",
    voucherNumber: "VCH-2026-9901",
    donationId: "DON-2026-0042",
    issuedDate: "2026-06-14",
    expiryDate: "2027-06-14",
    status: "active",
    beneficiaryRights:
      "Entitles the donor or an immediate first-degree family member (spouse, child, or parent) to expedited priority blood replacement with zero processing fees at any accredited hospital or national blood bank facility in Egypt.",
    issuedBy: "National Blood Transfusion Service / Central Blood Bank",
  },
  {
    id: "vch-8812",
    voucherNumber: "VCH-2025-8812",
    donationId: "DON-2025-0045",
    issuedDate: "2025-07-04",
    expiryDate: "2026-07-04",
    status: "expired",
    beneficiaryRights:
      "Priority blood replacement certificate issued under the Community Voluntary Donors Program.",
    issuedBy: "National Blood Transfusion Service / Al-Galaa Transfusion Center",
  },
];

const defaultNotifications: DonorNotification[] = [
  {
    id: "notif-01",
    title: "Urgent O+ Blood Request nearby",
    message:
      "Cairo University Specialized Hospital requires O+ whole blood for an emergency surgery reserve.",
    timestamp: "2026-09-08T14:30:00.000Z",
    category: "request",
    read: false,
    link: "/donor/requests/dr-0811",
  },
  {
    id: "notif-02",
    title: "Donation Voucher VCH-2026-9901 is active",
    message:
      "Your priority replacement voucher from donation DON-2026-0042 is active and valid through June 14, 2027.",
    timestamp: "2026-06-15T09:00:00.000Z",
    category: "voucher",
    read: true,
    link: "/donor/vouchers",
  },
  {
    id: "notif-03",
    title: "You are eligible to donate today",
    message:
      "Your 56-day inter-donation recovery period has concluded. Consider responding to a local shortage request.",
    timestamp: "2026-08-10T08:00:00.000Z",
    category: "general",
    read: true,
  },
];

const defaultConsents: DonorConsent[] = [
  {
    id: "cst-01",
    donorId: "donor-omar-001",
    consentType: "blood_donation_screening",
    title: "Health & Biological Screening Consent",
    description:
      "Authorization for biological safety screening, infectious disease marker testing, and blood group verification.",
    status: "granted",
    grantedAt: "2026-01-10T10:00:00.000Z",
    legalNotice:
      "Mandated under national healthcare regulations. Testing is required for all donations to ensure blood product safety.",
  },
  {
    id: "cst-02",
    donorId: "donor-omar-001",
    consentType: "emergency_shortage_outreach",
    title: "Emergency Shortage Dispatch Outreach",
    description:
      "Consent to receive direct urgent SMS notifications and high-priority in-app appeals when compatible blood drops below reserve thresholds.",
    status: "granted",
    grantedAt: "2026-01-10T10:00:00.000Z",
    legalNotice:
      "You can revoke emergency outreach at any time. Revocation does not affect your eligibility to donate on a walk-in basis.",
  },
  {
    id: "cst-03",
    donorId: "donor-omar-001",
    consentType: "anonymized_analytics",
    title: "Anonymized Quality & Research Analytics",
    description:
      "Consent to include non-identifiable donation metrics in regional blood availability forecasting and clinical utilization research.",
    status: "granted",
    grantedAt: "2026-01-10T10:00:00.000Z",
    legalNotice:
      "All medical identifiers and direct contact information are permanently stripped before statistical aggregation.",
  },
  {
    id: "cst-04",
    donorId: "donor-omar-001",
    consentType: "electronic_communication",
    title: "Electronic Vouchers & Digital Notices",
    description:
      "Authorization to electronically issue digital Life-Saver redemption vouchers and receive electronic donation certificates.",
    status: "granted",
    grantedAt: "2026-01-10T10:00:00.000Z",
    legalNotice:
      "Enables paperless voucher verification and expedited family beneficiary credential verification.",
  },
];

let donorProfileState: DonorProfile = { ...defaultProfile };
let donationRequestsState: DonationRequest[] = [...defaultRequests];
let donationHistoryState: DonationRecord[] = [...defaultDonations];
let donationVouchersState: DonationVoucher[] = [...defaultVouchers];
let donorNotificationsState: DonorNotification[] = [...defaultNotifications];
let donorConsentsState: DonorConsent[] = [...defaultConsents];

const delay = (ms = 100) => new Promise((resolve) => setTimeout(resolve, ms));

export async function getDonorProfile(): Promise<DonorProfile> {
  await delay();
  return { ...donorProfileState };
}

export async function getDonationRequests(): Promise<DonationRequest[]> {
  await delay();
  return [...donationRequestsState];
}

export async function getDonationRequestById(
  id: string,
): Promise<DonationRequest | null> {
  await delay();
  const req = donationRequestsState.find(
    (r) => r.id === id || r.reference === id,
  );
  return req ? { ...req } : null;
}

export async function respondToDonationRequest(
  id: string,
  response: DonationResponseStatus,
): Promise<DonationRequest> {
  await delay();
  const idx = donationRequestsState.findIndex(
    (r) => r.id === id || r.reference === id,
  );
  if (idx === -1) {
    throw new Error(`Donation request "${id}" not found.`);
  }

  const existing = donationRequestsState[idx];
  const updated: DonationRequest = {
    ...existing,
    myResponse: response,
    status: response === "interested" ? "responded" : existing.status,
  };

  donationRequestsState[idx] = updated;

  // Append a notification for the response
  donorNotificationsState.unshift({
    id: `notif-${Date.now()}`,
    title:
      response === "interested"
        ? `Response Registered: ${existing.reference}`
        : `Request Declined: ${existing.reference}`,
    message:
      response === "interested"
        ? `You marked interest in request ${existing.reference} for ${existing.requestingOrg.name}. The center has been notified.`
        : `You declined request ${existing.reference}. You can change this choice at any time prior to session cutoff.`,
    timestamp: new Date().toISOString(),
    category: "response",
    read: false,
    link: `/donor/requests/${existing.id}`,
  });

  return updated;
}

export async function getDonationHistory(): Promise<DonationRecord[]> {
  await delay();
  return [...donationHistoryState];
}

export async function getDonationVouchers(): Promise<DonationVoucher[]> {
  await delay();
  return [...donationVouchersState];
}

export async function getDonorNotifications(): Promise<DonorNotification[]> {
  await delay();
  return [...donorNotificationsState];
}

export async function markNotificationRead(id: string): Promise<void> {
  await delay(50);
  donorNotificationsState = donorNotificationsState.map((n) =>
    n.id === id ? { ...n, read: true } : n,
  );
}

export async function getDonorConsents(): Promise<DonorConsent[]> {
  await delay(80);
  return structuredClone(donorConsentsState);
}

export async function grantDonorConsent(id: string): Promise<DonorConsent> {
  await delay(120);
  const idx = donorConsentsState.findIndex((c) => c.id === id);
  if (idx === -1) {
    throw new Error(`Consent agreement "${id}" not found.`);
  }

  const updated: DonorConsent = {
    ...donorConsentsState[idx],
    status: "granted",
    grantedAt: new Date().toISOString(),
    revokedAt: undefined,
  };

  donorConsentsState[idx] = updated;
  return structuredClone(updated);
}

export async function revokeDonorConsent(id: string): Promise<DonorConsent> {
  await delay(120);
  const idx = donorConsentsState.findIndex((c) => c.id === id);
  if (idx === -1) {
    throw new Error(`Consent agreement "${id}" not found.`);
  }

  const updated: DonorConsent = {
    ...donorConsentsState[idx],
    status: "revoked",
    revokedAt: new Date().toISOString(),
  };

  donorConsentsState[idx] = updated;
  return structuredClone(updated);
}

export function resetDonorMockStore(): void {
  donorProfileState = { ...defaultProfile };
  donationRequestsState = [...defaultRequests];
  donationHistoryState = [...defaultDonations];
  donationVouchersState = [...defaultVouchers];
  donorNotificationsState = [...defaultNotifications];
  donorConsentsState = [...defaultConsents];
}
