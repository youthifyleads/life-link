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

  // Blood Banks by Name
  "Central Blood Bank": "بنك الدم المركزي",
  "Nile Regional Blood Bank": "بنك دم النيل الإقليمي",
  "Alexandria Coastal Blood Bank": "بنك دم ساحل الإسكندرية",
  "Delta Auxiliary Blood Depot": "مستودع دم الدلتا المساعد",

  // Platform Administration
  "platform-administration": "إدارة منصة بنك الدم",
  "Blood Bank Platform Administration": "إدارة منصة بنك الدم",
  "Platform Administration": "إدارة منصة بنك الدم",
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
