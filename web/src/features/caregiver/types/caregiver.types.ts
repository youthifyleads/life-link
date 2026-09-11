import type { BloodBankComponent } from "@/features/blood-bank/types/blood-bank.types";
import type { BloodGroup } from "@/shared/components/clinical/clinical.types";

export type CaregiverUnitStatus =
  | "allocated"
  | "in_transit"
  | "received_at_hospital"
  | "ready_for_transfusion"
  | "transfused"
  | "available"
  | "quarantined";

export interface CaregiverCustodyMilestone {
  id: string;
  title: string;
  timestamp: string;
  location: string;
  summary: string;
}

export interface CaregiverTrackingUnit {
  reference: string;
  bloodGroup: BloodGroup;
  component: BloodBankComponent;
  status: CaregiverUnitStatus;
  statusLabel: string;
  currentLocation: string;
  lastUpdated: string;
  destinationHospital: string;
  verifiedColdChain: boolean;
  milestones: CaregiverCustodyMilestone[];
}
