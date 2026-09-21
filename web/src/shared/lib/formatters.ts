import { i18n } from "@/app/i18n/i18n";

const hospitalArabicMap: Record<string, string> = {
  // By ID
  "hospital-cairo-general": "مستشفى القاهرة العام",
  "hospital-nile-specialist": "مستشفى النيل التخصصي",
  "hospital-al-shifa": "مركز الشفاء الطبي",
  "hospital-childrens": "مستشفى جامعة القاهرة للأطفال",
  "hospital-october": "مستشفى جامعة 6 أكتوبر",
  "hospital-alex-care": "مستشفى رعاية الإسكندرية الإقليمي",
  "demo-hospital": "المستشفى التجريبي",

  // Database Seed Hospitals (UUIDs & Names)
  "8F7601FE-35C2-426F-AB9D-E36D3DAA1CB9": "مستشفى قصر العيني",
  "8f7601fe-35c2-426f-ab9d-e36d3daa1cb9": "مستشفى قصر العيني",
  "Al-Qasr Al-Aini Hospital": "مستشفى قصر العيني",
  "E1B4C932-842B-4BC2-9B7C-D3F28591A001": "مستشفى عين شمس التخصصي",
  "e1b4c932-842b-4bc2-9b7c-d3f28591a001": "مستشفى عين شمس التخصصي",
  "Ain Shams University Specialized Hospital": "مستشفى عين شمس التخصصي",

  // By English Name
  "Cairo General Hospital": "مستشفى القاهرة العام",
  "Nile Specialist Hospital": "مستشفى النيل التخصصي",
  "Al Shifa Medical Center": "مركز الشفاء الطبي",
  "Children's Medical Hospital": "مستشفى جامعة القاهرة للأطفال",
  "Cairo University Children's Hospital": "مستشفى جامعة القاهرة للأطفال",
  "October University Hospital": "مستشفى جامعة 6 أكتوبر",
  "Alexandria Regional Care": "مستشفى رعاية الإسكندرية الإقليمي",
  "Demo Hospital": "المستشفى التجريبي",
  "General Hospital": "المستشفى العام",
};

const organizationArabicMap: Record<string, string> = {
  // Blood Banks by ID
  "central-blood-bank": "بنك الدم المركزي",
  "nile-regional-blood-bank": "بنك دم النيل الإقليمي",
  "alex-central-blood-bank": "بنك دم ساحل الإسكندرية",
  "delta-auxiliary-bank": "مستودع دم الدلتا المساعد",
  "07397940-37A5-49A2-992D-3F2992660C9C": "المركز القومي لخدمات نقل الدم",
  "07397940-37a5-49a2-992d-3f2992660c9c": "المركز القومي لخدمات نقل الدم",
  "B2A5C911-381A-421F-811A-B1479831B002": "مركز خدمات نقل الدم الإقليمي بالعباسية",
  "b2a5c911-381a-421f-811a-b1479831b002": "مركز خدمات نقل الدم الإقليمي بالعباسية",

  // Blood Banks by Name
  "Central Blood Bank": "بنك الدم المركزي",
  "Nile Regional Blood Bank": "بنك دم النيل الإقليمي",
  "Alexandria Coastal Blood Bank": "بنك دم ساحل الإسكندرية",
  "Delta Auxiliary Blood Depot": "مستودع دم الدلتا المساعد",
  "National Blood Transfusion Center": "المركز القومي لخدمات نقل الدم",
  "Abbasiya Regional Blood Center": "مركز خدمات نقل الدم الإقليمي بالعباسية",

  // Platform Administration
  "platform-administration": "إدارة منصة بنك الدم",
  "Blood Bank Platform Administration": "إدارة منصة بنك الدم",
  "Platform Administration": "إدارة منصة بنك الدم",
};

const storageLocationArabicMap: Record<string, string> = {
  "Central Storage Rack": "وحدة التخزين المركزية",
  "Central Agitator Bay": "محطة هزازات الصفائح المركزية",
  "Central Cold Chain Vault": "مستودع التبريد المركزي",
  "Quarantine Unit": "غرفة الحجر الصحي",
  "Fridge A — Shelf 1": "ثلاجة أ — رف 1",
  "Fridge A — Shelf 2": "ثلاجة أ — رف 2",
  "Fridge A — Shelf 3": "ثلاجة أ — رف 3",
  "Fridge B — Shelf 1": "ثلاجة ب — رف 1",
  "Fridge B — Shelf 2": "ثلاجة ب — رف 2",
  "Fridge C — Shelf 1": "ثلاجة ج — رف 1",
  "Fridge C — Shelf 2": "ثلاجة ج — رف 2",
  "Fridge C — Shelf 3": "ثلاجة ج — رف 3",
  "Fridge D — Shelf 1": "ثلاجة د — رف 1",
  "Fridge D — Shelf 2": "ثلاجة د — رف 2",
  "Fridge E — Shelf 1": "ثلاجة هـ — رف 1",
  "Fridge E — Shelf 2": "ثلاجة هـ — رف 2",
  "Agitator 1 — Shelf 1": "هزاز الصفائح 1 — رف 1",
  "Agitator 1 — Shelf 2": "هزاز الصفائح 1 — رف 2",
  "Agitator 1 — Shelf 3": "هزاز الصفائح 1 — رف 3",
  "Agitator 2 — Shelf 1": "هزاز الصفائح 2 — رف 1",
  "Agitator 2 — Shelf 2": "هزاز الصفائح 2 — رف 2",
  "Deep Freezer A (-30C)": "مجمد فائق أ (-30°م)",
  "Deep Freezer B (-30C)": "مجمد فائق ب (-30°م)",
  "Deep Freezer C (-30C)": "مجمد فائق ج (-30°م)",
};

const userArabicMap: Record<string, string> = {
  "Dr. Sarah Chen": "د. سارة تشن",
  "Mariam Al-Mansoor": "مريم المنصور",
  "Mariam Blood Bank User": "مريم المنصور",
  "System Administrator": "مدير النظام",
  "Nour System Admin": "نور مديرة النظام",
  "Ahmed Hospital User": "أحمد (طاقم المستشفى)",
  "Omar Hassan": "عمر حسن",
  "Sara Mostafa": "سارة مصطفى",
  "Dr. Tarek Mansour": "د. طارق منصور",
  "Dr. Mona El-Sayed": "د. منى السيد",
  "Dr. Youssef Nabil": "د. يوسف نبيل",
  "Dr. Hany Salama": "د. هاني سلامة",
  "Kareem Blood Lead": "كريم المشرف الطبي",
  "Salma Lab Tech": "سلمى فنية المختبر",
};

export function formatHospitalName(
  name?: string | null,
  id?: string | null,
): string {
  if (!name && !id) return "";
  const isArabic = i18n.language.startsWith("ar");
  if (!isArabic) {
    return name || id || "";
  }
  if (id && hospitalArabicMap[id]) {
    return hospitalArabicMap[id];
  }
  if (name && hospitalArabicMap[name]) {
    return hospitalArabicMap[name];
  }
  return name || id || "";
}

export function formatOrganizationName(
  name?: string | null,
  id?: string | null,
): string {
  if (!name && !id) return "";
  const isArabic = i18n.language.startsWith("ar");
  if (!isArabic) {
    return name || id || "";
  }
  if (id && organizationArabicMap[id]) {
    return organizationArabicMap[id];
  }
  if (name && organizationArabicMap[name]) {
    return organizationArabicMap[name];
  }
  if (id && hospitalArabicMap[id]) {
    return hospitalArabicMap[id];
  }
  if (name && hospitalArabicMap[name]) {
    return hospitalArabicMap[name];
  }
  return name || id || "";
}

export function formatUserName(name?: string | null): string {
  if (!name) return "";
  const isArabic = i18n.language.startsWith("ar");
  if (!isArabic) {
    return name;
  }
  return userArabicMap[name] || name;
}

export function formatDateTime(isoString: string): string {
  try {
    const locale = i18n.language.startsWith("ar") ? "ar-EG" : "en-GB";
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

export function formatDate(isoString: string): string {
  try {
    const locale = i18n.language.startsWith("ar") ? "ar-EG" : "en-GB";
    return new Intl.DateTimeFormat(locale, {
      month: "short",
      day: "numeric",
      year: "numeric",
    }).format(new Date(isoString));
  } catch {
    return isoString;
  }
}

export function formatShortDate(isoString: string): string {
  try {
    const locale = i18n.language.startsWith("ar") ? "ar-EG" : "en-GB";
    return new Intl.DateTimeFormat(locale, {
      month: "short",
      day: "numeric",
    }).format(new Date(isoString));
  } catch {
    return isoString;
  }
}

export function formatTimeShort(isoString: string): string {
  try {
    const locale = i18n.language.startsWith("ar") ? "ar-EG" : "en-GB";
    return new Intl.DateTimeFormat(locale, {
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(isoString));
  } catch {
    return isoString;
  }
}

/**
 * Formats long UUIDs or technical database keys into short, human-readable labels.
 * E.g. "8F7601FE-35C2-426F-AB9D-E36D3DAA1CB9" -> "#8F7601FE"
 * Standard codes (e.g. "UNT-O-NEG-0142" or "REQ-2026-001") remain intact.
 */
export function formatShortId(id?: string | null): string {
  if (!id) return "";
  const trimmed = id.trim();
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (uuidRegex.test(trimmed)) {
    return `#${trimmed.slice(0, 8).toUpperCase()}`;
  }
  if (trimmed.length > 20 && !trimmed.startsWith("UNT-") && !trimmed.startsWith("BR-") && !trimmed.startsWith("REQ-")) {
    return `#${trimmed.slice(0, 8).toUpperCase()}`;
  }
  return trimmed;
}

/**
 * Localizes blood bank cold chain storage locations (fridges, freezers, agitators) to Arabic when active.
 */
export function formatStorageLocation(location?: string | null): string {
  if (!location) return "";
  const isArabic = i18n.language.startsWith("ar");
  if (!isArabic) return location;
  if (storageLocationArabicMap[location]) {
    return storageLocationArabicMap[location];
  }
  // Generic translation fallback for dynamic locations like "Fridge A — Shelf 4"
  return location
    .replace(/^Fridge\s+([A-Za-z0-9]+)\s*—\s*Shelf\s*([0-9]+)/i, "ثلاجة $1 — رف $2")
    .replace(/^Agitator\s+([A-Za-z0-9]+)\s*—\s*Shelf\s*([0-9]+)/i, "هزاز الصفائح $1 — رف $2")
    .replace(/^Deep Freezer\s+([A-Za-z0-9]+)/i, "مجمد فائق $1")
    .replace(/\(-30C\)/i, "(-30°م)");
}

/**
 * Formats technical MIME types (e.g. application/pdf, image/png) into clinical document formats (PDF, PNG, etc.).
 */
export function formatMimeType(mimeType?: string | null): string {
  if (!mimeType) return "PDF";
  const lower = mimeType.toLowerCase();
  if (lower.includes("pdf")) return "PDF";
  if (lower.includes("jpeg") || lower.includes("jpg")) return "JPG";
  if (lower.includes("png")) return "PNG";
  if (lower.includes("image")) return "IMG";
  if (lower.includes("word") || lower.includes("document")) return "DOC";
  return lower.split("/")[1]?.toUpperCase() ?? "PDF";
}
