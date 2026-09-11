import type { BloodBankComponent } from "@/features/blood-bank/types/blood-bank.types";
import type {
  BloodGroup,
  UrgencyLevel,
} from "@/shared/components/clinical/clinical.types";

export type DonorEligibilityStatus =
  | "eligible"
  | "temporary_deferral"
  | "permanent_deferral";

export interface DonorMetrics {
  totalDonations: number;
  unitsContributed: number;
  livesImpacted: number;
  activeVouchers: number;
}

export interface DonorProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  bloodGroup: BloodGroup;
  eligibilityStatus: DonorEligibilityStatus;
  eligibilityMessage: string;
  lastDonationDate: string;
  nextEligibleDate?: string;
  metrics: DonorMetrics;
}

export type DonationResponseStatus = "pending" | "interested" | "declined";

export type DonationRequestStatus =
  | "open"
  | "responded"
  | "fulfilled"
  | "closed";

export interface DonationRequest {
  id: string;
  reference: string;
  requestingOrg: {
    id: string;
    name: string;
    type: "hospital" | "blood_bank";
    governorate: string;
    address: string;
    phone: string;
  };
  bloodGroup: BloodGroup;
  component: BloodBankComponent;
  quantityRequested: number;
  urgency: UrgencyLevel;
  requestDate: string;
  requiredByDate: string;
  status: DonationRequestStatus;
  myResponse: DonationResponseStatus;
  clinicalContextSafe: string;
  specialInstructions?: string;
  location: string;
}

export type DonationHistoryStatus = "completed" | "processing" | "deferred";

export interface DonationRecord {
  id: string;
  donationDate: string;
  bloodGroup: BloodGroup;
  component: BloodBankComponent;
  volumeMl: number;
  facilityName: string;
  facilityGovernorate: string;
  status: DonationHistoryStatus;
  voucherId?: string;
  notes?: string;
}

export type VoucherStatus = "active" | "redeemed" | "expired";

export interface DonationVoucher {
  id: string;
  voucherNumber: string;
  donationId: string;
  issuedDate: string;
  expiryDate: string;
  status: VoucherStatus;
  beneficiaryRights: string;
  issuedBy: string;
}

export type DonorNotificationCategory =
  | "request"
  | "response"
  | "voucher"
  | "general";

export interface DonorNotification {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  category: DonorNotificationCategory;
  read: boolean;
  link?: string;
}

export type ConsentStatus = "granted" | "revoked";

export type DonorConsentType =
  | "blood_donation_screening"
  | "emergency_shortage_outreach"
  | "anonymized_analytics"
  | "electronic_communication";

export interface DonorConsent {
  id: string;
  donorId: string;
  consentType: DonorConsentType;
  title: string;
  description: string;
  status: ConsentStatus;
  grantedAt: string;
  revokedAt?: string;
  legalNotice: string;
}
