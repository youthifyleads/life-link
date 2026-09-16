import i18n from "i18next";
import { initReactI18next } from "react-i18next";

import { resources } from "@/app/i18n/resources";

const STORAGE_KEY = "lifelink_lang";

const getInitialLanguage = (): string => {
  if (typeof window !== "undefined") {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved === "ar" || saved === "en") {
      return saved;
    }
  }
  return "en";
};

const initialLanguage = getInitialLanguage();

void i18n.use(initReactI18next).init({
  resources,
  lng: initialLanguage,
  fallbackLng: "en",
  interpolation: {
    escapeValue: false,
  },
});

export function setAppLanguage(language: "en" | "ar"): Promise<unknown> {
  if (typeof window !== "undefined") {
    localStorage.setItem(STORAGE_KEY, language);
  }
  return i18n.changeLanguage(language);
}

export function getCurrentLanguage(): "en" | "ar" {
  const current = i18n.resolvedLanguage ?? i18n.language ?? "en";
  return current.startsWith("ar") ? "ar" : "en";
}

export function getDocumentDirection(): "ltr" | "rtl" {
  return getCurrentLanguage() === "ar" ? "rtl" : "ltr";
}

// i18n is the single authority for document language and direction. Keeping
// this outside component effects prevents transient mixed-direction frames.
if (typeof document !== "undefined") {
  document.documentElement.lang = initialLanguage;
  document.documentElement.dir = initialLanguage === "ar" ? "rtl" : "ltr";
}

i18n.on("languageChanged", (language) => {
  if (typeof document === "undefined") return;
  const normalized = language.startsWith("ar") ? "ar" : "en";
  document.documentElement.lang = normalized;
  document.documentElement.dir = normalized === "ar" ? "rtl" : "ltr";
});

export { i18n };
