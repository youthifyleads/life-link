import { i18n } from "@/app/i18n/i18n";
import type { RequestStatus } from "@/shared/components/clinical/clinical.types";

export function formatDateTime(value: string) {
  const locale = i18n.language.startsWith("ar") ? "ar-EG" : "en-GB";
  return new Intl.DateTimeFormat(locale, {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

export function formatFileSize(bytes: number) {
  if (bytes < 1_000_000) return `${Math.ceil(bytes / 1000)} KB`;
  return `${(bytes / 1_000_000).toFixed(1)} MB`;
}

export function formatStatusLabel(status: RequestStatus) {
  const fallback = status
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
  return i18n.t(`status.${status}`, fallback);
}
