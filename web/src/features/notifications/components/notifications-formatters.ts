import { i18n } from "@/app/i18n/i18n";
import type { UserRole } from "@/features/authentication/model/auth.types";
import type { Notification } from "@/features/notifications/types/notifications.types";

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

export function getLocalizedNotificationTitle(item: Notification): string {
  if (!i18n.language.startsWith("ar")) {
    return item.title;
  }

  const key = `notifications.items.${item.id}.title`;
  if (i18n.exists(key)) {
    return i18n.t(key);
  }

  // Dynamic simulation pattern matching
  if (item.title.startsWith("New blood requisition:")) {
    return item.title.replace("New blood requisition:", "طلب دم جديد:");
  }
  if (item.title.startsWith("Units allocated for request")) {
    return item.title.replace("Units allocated for request", "تم تخصيص الوحدات للطلب");
  }
  if (item.title.startsWith("Blood unit dispatched:")) {
    return item.title.replace("Blood unit dispatched:", "تم شحن وحدة الدم:");
  }
  if (item.title.startsWith("Donor confirmed appeal:")) {
    return item.title.replace("Donor confirmed appeal:", "أكد المتبرع استجابته للنداء:");
  }
  if (item.title.startsWith("Low reserve alert:")) {
    return item.title.replace("Low reserve alert:", "إنذار انخفاض الرصيد:");
  }
  if (item.title.startsWith("Governance security event:")) {
    return item.title.replace("Governance security event:", "حدث أمني حوكمي:");
  }

  return item.title;
}

export function getLocalizedNotificationMessage(item: Notification): string {
  if (!i18n.language.startsWith("ar")) {
    return item.message;
  }

  const key = `notifications.items.${item.id}.message`;
  if (i18n.exists(key)) {
    return i18n.t(key);
  }

  // Dynamic simulation pattern matching
  const reqMatch = item.message.match(/^(.*) \((.*)\) submitted blood request (.*)\. Clinical review required\.$/);
  if (reqMatch) {
    return `قدم ${reqMatch[1]} (${reqMatch[2]}) طلب دم ${reqMatch[3]}. المراجعة السريرية مطلوبة.`;
  }
  const allocMatch = item.message.match(/^(.*) confirmed unit allocation for (.*)\. Prepared for crossmatch validation\.$/);
  if (allocMatch) {
    return `أكد ${allocMatch[1]} تخصيص الوحدات للطلب ${allocMatch[2]}. جاهز لاختبار التوافق.`;
  }
  const unitMatch = item.message.match(/^Unit (.*) has departed Central Storage under active 2°C–6°C continuous temperature assurance\.$/);
  if (unitMatch) {
    return `غادرت الوحدة ${unitMatch[1]} مستودع التخزين المركزي مع ضمان استقرار سلسلة التبريد 2° إلى 6° مئوية.`;
  }
  const donorMatch = item.message.match(/^(.*) registered voluntary participation for shortage appeal (.*)\.$/);
  if (donorMatch) {
    return `سجل ${donorMatch[1]} مشاركة تطوعية لنداء سد العجز ${donorMatch[2]}.`;
  }
  const invMatch = item.message.match(/^Blood bank cold-chain reserve for group (.*) reached critical minimum safety threshold\.$/);
  if (invMatch) {
    return `وصل احتياطي بنك الدم المبرد للفصيلة ${invMatch[1]} إلى الحد الأدنى الحرج للأمان.`;
  }
  const permMatch = item.message.match(/^(.*) modified permission policy matrix for capability (.*)\.$/);
  if (permMatch) {
    return `قام ${permMatch[1]} بتعديل مصفوفة سياسات الصلاحيات للقدرة ${permMatch[2]}.`;
  }

  return item.message;
}
