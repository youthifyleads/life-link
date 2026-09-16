import type { RequestStatus } from "@/shared/components/clinical/clinical.types";
import type { BloodUnitStatus } from "@/features/blood-bank/types/blood-bank.types";
import type { CaregiverUnitStatus } from "@/features/caregiver/types/caregiver.types";
import type {
  DonationResponseStatus,
  VoucherStatus,
} from "@/features/donor/types/donor.types";

/**
 * Backend System Status Enums (as defined in Section 7 of Specification)
 */
export type BackendRequestStatus =
  | "requested"
  | "acknowledged"
  | "confirmed"
  | "prepared"
  | "completed"
  | "cancelled"
  | "expired";

export interface StatusPresentation {
  code: string;
  label: string;
  description: string;
  variant: "default" | "secondary" | "destructive" | "outline" | "success" | "warning";
}

/**
 * Normalizes backend request status to frontend lifecycle RequestStatus.
 */
export function normalizeBackendRequestStatus(
  status: BackendRequestStatus | string,
): RequestStatus {
  switch (status.toLowerCase()) {
    case "requested":
    case "submitted":
      return "submitted";
    case "acknowledged":
      return "acknowledged";
    case "needs_information":
      return "needs_information";
    case "confirmed":
      return "confirmed";
    case "prepared":
    case "preparing":
      return "preparing";
    case "ready":
      return "ready";
    case "completed":
      return "completed";
    case "cancelled":
      return "cancelled";
    case "rejected":
      return "rejected";
    case "expired":
      return "cancelled"; // or terminal cancelled
    case "draft":
    default:
      return "draft";
  }
}

/**
 * Serializes frontend RequestStatus to the backend contract enum.
 */
export function serializeFrontendRequestStatus(
  status: RequestStatus,
): BackendRequestStatus {
  switch (status) {
    case "draft":
    case "submitted":
      return "requested";
    case "acknowledged":
    case "needs_information":
      return "acknowledged";
    case "confirmed":
      return "confirmed";
    case "preparing":
    case "ready":
      return "prepared";
    case "completed":
      return "completed";
    case "cancelled":
    case "rejected":
    default:
      return "cancelled";
  }
}

/**
 * Canonical Display presentation for all requisition statuses.
 */
export function getRequestStatusPresentation(
  status: RequestStatus | BackendRequestStatus,
): StatusPresentation {
  const normalized = normalizeBackendRequestStatus(status);

  switch (normalized) {
    case "draft":
      return {
        code: "draft",
        label: "Draft",
        description: "Local draft, not transmitted to blood bank queue.",
        variant: "outline",
      };
    case "submitted":
      return {
        code: "submitted",
        label: "Submitted",
        description: "Awaiting triage and acknowledgment from the recipient blood bank.",
        variant: "secondary",
      };
    case "acknowledged":
      return {
        code: "acknowledged",
        label: "Acknowledged",
        description: "Received and under review by blood bank technical staff.",
        variant: "secondary",
      };
    case "needs_information":
      return {
        code: "needs_information",
        label: "Needs Information",
        description: "Additional clinical rationale or documents requested.",
        variant: "warning",
      };
    case "confirmed":
      return {
        code: "confirmed",
        label: "Confirmed",
        description: "Clinical requirement approved; units reserved from inventory.",
        variant: "default",
      };
    case "preparing":
      return {
        code: "preparing",
        label: "Preparing",
        description: "Units undergoing compatibility verification and packaging.",
        variant: "default",
      };
    case "ready":
      return {
        code: "ready",
        label: "Preparation Completed",
        description: "Packaged in cold container; awaiting transit release.",
        variant: "success",
      };
    case "completed":
      return {
        code: "completed",
        label: "Completed",
        description: "Delivered to receiving hospital and accepted for transfusion.",
        variant: "success",
      };
    case "rejected":
      return {
        code: "rejected",
        label: "Rejected",
        description: "Requisition could not be fulfilled; clinical reason recorded.",
        variant: "destructive",
      };
    case "cancelled":
      return {
        code: "cancelled",
        label: "Cancelled",
        description: "Requisition withdrawn by requesting hospital clinician.",
        variant: "outline",
      };
  }
}

/**
 * Canonical Display presentation for biological blood units.
 */
export function getBloodUnitStatusPresentation(
  status: BloodUnitStatus,
): StatusPresentation {
  switch (status) {
    case "available":
      return {
        code: "available",
        label: "Available",
        description: "Tested, safe, and ready for clinical allocation.",
        variant: "success",
      };
    case "allocated":
      return {
        code: "allocated",
        label: "Allocated",
        description: "Assigned to an active hospital blood requisition.",
        variant: "default",
      };
    case "reserved":
      return {
        code: "reserved",
        label: "Reserved",
        description: "Held temporarily for cross-matching or emergency reserve.",
        variant: "warning",
      };
    case "quarantined":
      return {
        code: "quarantined",
        label: "Quarantined",
        description: "Isolated pending re-testing or temperature deviation review.",
        variant: "destructive",
      };
    case "expired":
      return {
        code: "expired",
        label: "Expired",
        description: "Past biological viable date; scheduled for safe disposal.",
        variant: "outline",
      };
  }
}

/**
 * Canonical Display presentation for cold-chain transit tracking.
 */
export function getTrackingStatusPresentation(
  status: CaregiverUnitStatus,
): StatusPresentation {
  switch (status) {
    case "allocated":
      return {
        code: "allocated",
        label: "Units Allocated",
        description: "Compatible units assigned at the donor facility.",
        variant: "secondary",
      };
    case "in_transit":
      return {
        code: "in_transit",
        label: "In Transit",
        description: "Dispatched under continuous 2°C–6°C cold-box monitoring.",
        variant: "warning",
      };
    case "received_at_hospital":
      return {
        code: "received_at_hospital",
        label: "Received at Hospital",
        description: "Security barcode scanned at receiving facility reception.",
        variant: "default",
      };
    case "ready_for_transfusion":
      return {
        code: "ready_for_transfusion",
        label: "Ready for Transfusion",
        description: "Bedside verification complete; ready for infusion.",
        variant: "success",
      };
    case "transfused":
      return {
        code: "transfused",
        label: "Transfused",
        description: "Clinical administration documented in electronic health record.",
        variant: "success",
      };
    case "quarantined":
      return {
        code: "quarantined",
        label: "Quarantined",
        description: "Cold-chain violation detected; held for inspection.",
        variant: "destructive",
      };
    case "available":
    default:
      return {
        code: "available",
        label: "In Storage",
        description: "Secure central blood bank storage.",
        variant: "outline",
      };
  }
}

/**
 * Canonical Display presentation for donor workflow statuses.
 */
export function getDonorResponseStatusPresentation(
  status: DonationResponseStatus,
): StatusPresentation {
  switch (status) {
    case "interested":
      return {
        code: "interested",
        label: "Confirmed Available",
        description: "Donor confirmed availability to donate.",
        variant: "success",
      };
    case "declined":
      return {
        code: "declined",
        label: "Declined",
        description: "Donor unable to attend this emergency appeal.",
        variant: "outline",
      };
    case "pending":
    default:
      return {
        code: "pending",
        label: "Awaiting Response",
        description: "Appeal dispatched; awaiting donor confirmation.",
        variant: "secondary",
      };
  }
}

export function getVoucherStatusPresentation(
  status: VoucherStatus,
): StatusPresentation {
  switch (status) {
    case "active":
      return {
        code: "active",
        label: "Active / Valid",
        description: "Ready to redeem for priority emergency blood access.",
        variant: "success",
      };
    case "redeemed":
      return {
        code: "redeemed",
        label: "Redeemed",
        description: "Transfusion credits claimed for family beneficiary.",
        variant: "secondary",
      };
    case "expired":
      return {
        code: "expired",
        label: "Expired",
        description: "Validity period ended without redemption.",
        variant: "outline",
      };
  }
}
