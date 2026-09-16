import { i18n } from "@/app/i18n/i18n";
import type { UserRole } from "@/features/authentication/model/auth.types";

function locale() {
  return i18n.language.startsWith("ar") ? "ar-EG" : "en-US";
}

export function formatDateTime(isoString: string): string {
  try {
    return new Intl.DateTimeFormat(locale(), {
      month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit",
    }).format(new Date(isoString));
  } catch { return isoString; }
}

export function formatDate(isoString: string): string {
  try {
    return new Intl.DateTimeFormat(locale(), {
      month: "short", day: "numeric", year: "numeric",
    }).format(new Date(isoString));
  } catch { return isoString; }
}

export function formatShortDate(isoString: string): string {
  try {
    return new Intl.DateTimeFormat(locale(), { month: "short", day: "numeric" }).format(new Date(isoString));
  } catch { return isoString; }
}

export function formatTimeShort(isoString: string): string {
  try {
    return new Intl.DateTimeFormat(locale(), { hour: "2-digit", minute: "2-digit" }).format(new Date(isoString));
  } catch { return isoString; }
}

export function getLocalizedRoleName(role: UserRole | string): string {
  return i18n.t(`roles.${role}`, role.replace(/_/g, " "));
}

const moduleKeys: Record<string, string> = {
  hospital_requisition: "notifications.modules.hospital",
  hospital: "notifications.modules.hospital",
  blood_bank_allocation: "notifications.modules.bloodBank",
  blood_bank: "notifications.modules.bloodBank",
  tracking_transit: "notifications.modules.tracking",
  tracking: "notifications.modules.tracking",
  donor_portal: "notifications.modules.donor",
  donor: "notifications.modules.donor",
  caregiver_portal: "notifications.modules.caregiver",
  caregiver: "notifications.modules.caregiver",
  admin_governance: "notifications.modules.admin",
  admin: "notifications.modules.admin",
};

export function getLocalizedSourceModuleName(module: string): string {
  const key = moduleKeys[module];
  return key ? i18n.t(key) : module.replace(/_/g, " ");
}
