import { beforeEach, describe, expect, it } from "vitest";

import {
  getCurrentLanguage,
  getDocumentDirection,
  i18n,
  setAppLanguage,
} from "@/app/i18n/i18n";

describe("i18n and RTL direction management", () => {
  beforeEach(async () => {
    localStorage.clear();
    await setAppLanguage("en");
  });

  it("initializes with English and LTR document direction", () => {
    expect(getCurrentLanguage()).toBe("en");
    expect(getDocumentDirection()).toBe("ltr");
    expect(document.documentElement.lang).toBe("en");
    expect(document.documentElement.dir).toBe("ltr");
  });

  it("switches to Arabic, updates document attributes to RTL, and persists to localStorage", async () => {
    await setAppLanguage("ar");

    expect(getCurrentLanguage()).toBe("ar");
    expect(getDocumentDirection()).toBe("rtl");
    expect(document.documentElement.lang).toBe("ar");
    expect(document.documentElement.dir).toBe("rtl");
    expect(localStorage.getItem("lifelink_lang")).toBe("ar");
  });

  it("translates professional Arabic healthcare terminology correctly", async () => {
    await setAppLanguage("ar");

    expect(i18n.t("healthcare.bloodRequest")).toBe("طلب دم");
    expect(i18n.t("healthcare.bloodBank")).toBe("بنك الدم");
    expect(i18n.t("healthcare.bloodUnit")).toBe("وحدة دم");
    expect(i18n.t("healthcare.inventory")).toBe("المخزون");
    expect(i18n.t("healthcare.tracking")).toBe("التتبع");
    expect(i18n.t("healthcare.donor")).toBe("المتبرع");
    expect(i18n.t("healthcare.caregiver")).toBe("المرافق");
    expect(i18n.t("healthcare.admin")).toBe("مدير النظام");
    expect(i18n.t("healthcare.crossmatch")).toBe("التوافق السريري والمطابقة");
    expect(i18n.t("healthcare.quarantine")).toBe("مستودع العزل (الحجر)");
  });

  it("translates status enums and urgency levels into Arabic", async () => {
    await setAppLanguage("ar");

    expect(i18n.t("status.submitted")).toBe("تم التقديم");
    expect(i18n.t("status.confirmed")).toBe("مؤكد");
    expect(i18n.t("status.preparing")).toBe("قيد التجهيز");
    expect(i18n.t("status.ready")).toBe("جاهز للإرسال");
    expect(i18n.t("status.completed")).toBe("مكتمل");
    expect(i18n.t("status.rejected")).toBe("مرفوض");

    expect(i18n.t("urgency.urgent")).toBe("عاجل");
    expect(i18n.t("urgency.emergency")).toBe("طارئ جداً");
    expect(i18n.t("urgency.routine")).toBe("عادي");
  });

  it("switches back to English smoothly", async () => {
    await setAppLanguage("ar");
    expect(getDocumentDirection()).toBe("rtl");

    await setAppLanguage("en");
    expect(getCurrentLanguage()).toBe("en");
    expect(getDocumentDirection()).toBe("ltr");
    expect(document.documentElement.lang).toBe("en");
    expect(document.documentElement.dir).toBe("ltr");
    expect(localStorage.getItem("lifelink_lang")).toBe("en");
  });
});
