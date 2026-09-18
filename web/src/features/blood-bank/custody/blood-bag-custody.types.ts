import type {
  BloodBankComponent,
  BloodUnitStatus,
  CustodyEventType,
} from "@/features/blood-bank/types/blood-bank.types";
import type { BloodGroup } from "@/shared/components/clinical/clinical.types";

export interface BloodBagCustodyEvent {
  id: string;
  event: CustodyEventType | string;
  location: string;
  staff_member: string;
  staff_role: string;
  timestamp: string;
  quarantine_reason?: string | null;
}

export interface BloodBagCustodyHistory {
  bag_id: string;
  barcode: string;
  blood_group: BloodGroup;
  component: BloodBankComponent;
  collection_date: string;
  expiry_date: string;
  days_remaining: number;
  current_status: BloodUnitStatus;
  location: string;
  history: BloodBagCustodyEvent[];
}
