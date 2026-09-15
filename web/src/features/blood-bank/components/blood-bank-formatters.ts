import { i18n } from "@/app/i18n/i18n";
import type {
  BloodBankQueueStatus,
  BloodBankRequestAction,
} from "@/features/blood-bank/types/blood-bank.types";

export function formatBloodBankDateTime(value: string) {
  const locale = i18n.language.startsWith("ar") ? "ar-EG" : "en-GB";
  return new Intl.DateTimeFormat(locale, {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

export function formatBloodBankStatus(status: BloodBankQueueStatus) {
  const fallback = status
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
  return i18n.t(`status.${status}`, fallback);
}

export const bloodBankActionLabels: Record<BloodBankRequestAction, string> = {
  acknowledge: "Acknowledge request",
  confirm: "Confirm request",
  start_preparation: "Start preparation",
  complete: "Mark completed",
  reject: "Reject request",
};

const bloodBankActionKeys: Record<BloodBankRequestAction, string> = {
  acknowledge: "bloodBank.acknowledgeRequest",
  confirm: "bloodBank.confirmRequest",
  start_preparation: "bloodBank.startPreparation",
  complete: "bloodBank.markCompleted",
  reject: "bloodBank.rejectRequest",
};

export function getBloodBankActionLabel(action: BloodBankRequestAction): string {
  return i18n.t(bloodBankActionKeys[action], bloodBankActionLabels[action]);
}

export function formatBloodBankFileSize(bytes: number) {
  const locale = i18n.language.startsWith("ar") ? "ar-EG" : "en-GB";
  const format = (value: number, digits: number) =>
    new Intl.NumberFormat(locale, {
      minimumFractionDigits: digits,
      maximumFractionDigits: digits,
    }).format(value);

  if (bytes < 1024) return `${format(bytes, 0)} B`;
  const kib = bytes / 1024;
  if (kib < 1024) return `${format(kib, 1)} KB`;
  return `${format(kib / 1024, 1)} MB`;
}
