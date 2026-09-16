import { i18n } from "@/app/i18n/i18n";

export function formatDateTime(isoString: string) {
  try {
    const locale = i18n.language.startsWith("ar") ? "ar-EG" : "en-US";
    return new Intl.DateTimeFormat(locale, {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(isoString));
  } catch {
    return isoString;
  }
}

export function formatDate(isoString: string) {
  try {
    const locale = i18n.language.startsWith("ar") ? "ar-EG" : "en-US";
    return new Intl.DateTimeFormat(locale, {
      month: "short",
      day: "numeric",
      year: "numeric",
    }).format(new Date(isoString));
  } catch {
    return isoString;
  }
}

export function formatShortDate(isoString: string) {
  try {
    const locale = i18n.language.startsWith("ar") ? "ar-EG" : "en-US";
    return new Intl.DateTimeFormat(locale, {
      month: "short",
      day: "numeric",
    }).format(new Date(isoString));
  } catch {
    return isoString;
  }
}
