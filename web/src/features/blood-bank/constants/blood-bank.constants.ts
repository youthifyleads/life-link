import type {
  BloodBankComponent,
  BloodBankQueueStatus,
  BloodBankRequest,
  BloodBankRequestAction,
} from "@/features/blood-bank/types/blood-bank.types";
import type { BloodGroup } from "@/shared/components/clinical/clinical.types";

export const ALL_BLOOD_GROUPS: BloodGroup[] = [
  "A+",
  "A−",
  "B+",
  "B−",
  "AB+",
  "AB−",
  "O+",
  "O−",
];

export const ALL_COMPONENTS: BloodBankComponent[] = [
  "red_cells",
  "platelets",
  "fresh_frozen_plasma",
  "whole_blood",
  "cryoprecipitate",
];

export const ACTION_TRANSITIONS: Record<
  BloodBankRequestAction,
  { from: BloodBankQueueStatus[]; to: BloodBankQueueStatus; note: string }
> = {
  acknowledge: {
    from: ["submitted"],
    to: "acknowledged",
    note: "Request acknowledged in this local preview.",
  },
  confirm: {
    from: ["acknowledged"],
    to: "confirmed",
    note: "Request availability confirmed in this local preview.",
  },
  start_preparation: {
    from: ["confirmed"],
    to: "preparing",
    note: "Preparation started in this local preview.",
  },
  complete: {
    from: ["preparing"],
    to: "completed",
    note: "Request marked complete in this local preview.",
  },
  reject: {
    from: ["submitted", "acknowledged"],
    to: "rejected",
    note: "Request rejected in this local preview.",
  },
};

export function getAvailableActions(
  request: BloodBankRequest,
): BloodBankRequestAction[] {
  return (Object.keys(ACTION_TRANSITIONS) as BloodBankRequestAction[]).filter(
    (action) => ACTION_TRANSITIONS[action].from.includes(request.status),
  );
}
