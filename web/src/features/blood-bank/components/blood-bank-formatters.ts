import { i18n } from "@/app/i18n/i18n";
import {
  bloodBankComponentLabels,
  type BloodBankComponent,
  type BloodBankQueueStatus,
  type BloodBankRequestAction,
} from "@/features/blood-bank/types/blood-bank.types";
import {
  formatHospitalName,
  formatOrganizationName,
  formatUserName,
} from "@/shared/lib/formatters";

export { formatHospitalName, formatOrganizationName, formatUserName };

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

export function formatBloodBankComponent(component: BloodBankComponent): string {
  const isArabic = i18n.language.startsWith("ar");
  if (isArabic) {
    switch (component) {
      case "red_cells":
        return "خلايا دم حمراء مركزة";
      case "platelets":
        return "صفائح دموية";
      case "fresh_frozen_plasma":
        return "بلازما طازجة مجمدة";
      case "cryoprecipitate":
        return "راسب برودي (كريوبريسيبتيت)";
      case "whole_blood":
        return "دم كامل";
      default:
        return bloodBankComponentLabels[component] ?? component;
    }
  }
  return bloodBankComponentLabels[component] ?? component;
}

const documentTitleArabicMap: Record<string, string> = {
  "emergency-release-authorization.pdf": "تفويض صرف طارئ للدم",
  "patient-antibody-screen.pdf": "فحص الأجسام المضادة للمريض",
  "oncology-platelet-requisition.pdf": "طلب صفائح لأورام الأطفال",
  "surgical-transfusion-order.pdf": "أمر نقل دم جراحي",
  "preoperative-crossmatch-request.pdf": "طلب مطابقة ما قبل الجراحة",
  "crossmatch-report.pdf": "تقرير فحص التوافق والمطابقة",
  "blood-requisition.pdf": "طلب صرف دم سريري",
  "consent-form.pdf": "نموذج موافقة المريض لنقل الدم",
  "lab-results.pdf": "نتائج الفحوصات المخبرية",
};

export function formatDocumentTitle(name: string): string {
  const isArabic = i18n.language.startsWith("ar");
  if (!isArabic) return name;
  return documentTitleArabicMap[name] ?? name;
}


