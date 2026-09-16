import { expect, test, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

test.setTimeout(120_000);

type DemoRole = "hospital_staff" | "blood_bank_staff" | "admin" | "donor" | "caregiver";

const routesByRole: Record<DemoRole, string[]> = {
  hospital_staff: [
    "/hospital/dashboard",
    "/hospital/requests",
    "/hospital/requests/create",
    "/hospital/requests/BR-2026-1049",
    "/hospital/documents",
  ],
  blood_bank_staff: [
    "/blood-bank/dashboard",
    "/blood-bank/requests",
    "/blood-bank/requests/BR-2026-2194",
    "/blood-bank/inventory",
    "/blood-bank/tracking",
    "/blood-bank/documents",
  ],
  admin: [
    "/admin/dashboard",
    "/admin/users",
    "/admin/hospitals",
    "/admin/blood-banks",
    "/admin/roles",
    "/admin/audit",
  ],
  donor: [
    "/donor/dashboard",
    "/donor/requests",
    "/donor/requests/dr-0811",
    "/donor/donations",
    "/donor/vouchers",
    "/donor/consents",
    "/donor/notifications",
  ],
  caregiver: [
    "/caregiver/dashboard",
    "/caregiver/scan",
    "/caregiver/tracking/UNT-B-POS-0331",
  ],
};

async function startArabicSession(page: Page, role: DemoRole) {
  await page.goto("/login");
  await page.evaluate((selectedRole) => {
    localStorage.setItem("lifelink_lang", "ar");
    sessionStorage.setItem("blood-bank:development-demo-session", selectedRole);
  }, role);
}

async function expectStableRtlPage(page: Page, route: string) {
  await page.goto(route);
  await expect(page.locator("html")).toHaveAttribute("lang", "ar");
  await expect(page.locator("html")).toHaveAttribute("dir", "rtl");
  await expect(page.locator("main h1").first()).toBeVisible();
  await expect.poll(async () => page.evaluate(() => document.fonts.status)).toBe("loaded");

  const layout = await page.evaluate(() => ({
    viewport: document.documentElement.clientWidth,
    page: document.documentElement.scrollWidth,
    bodyText: document.body.innerText,
    bodyFont: getComputedStyle(document.body).fontFamily,
  }));

  expect(layout.page, `${route} should not overflow the viewport`).toBeLessThanOrEqual(layout.viewport + 1);
  expect(layout.bodyText, `${route} should contain Arabic interface copy`).toMatch(/[\u0600-\u06ff]/);
  expect(layout.bodyFont).toContain("Noto Sans Arabic Variable");
}

test("language switcher updates and persists document language and direction", async ({ page }) => {
  await page.goto("/login");
  await page.evaluate(() => localStorage.clear());
  await page.reload();

  await page.locator("#language-switcher-trigger").click();
  await page.locator("#language-option-ar").click();

  await expect(page.locator("html")).toHaveAttribute("lang", "ar");
  await expect(page.locator("html")).toHaveAttribute("dir", "rtl");
  await expect(page.getByRole("heading", { name: "تنسيق سريري متكامل من الطلب حتى التسليم." })).toBeVisible();
  await expect.poll(() => page.evaluate(() => localStorage.getItem("lifelink_lang"))).toBe("ar");
});

for (const [role, routes] of Object.entries(routesByRole) as [DemoRole, string[]][]) {
  test(`${role} screens render as stable Arabic RTL layouts`, async ({ page }) => {
    await startArabicSession(page, role);
    for (const route of routes) await expectStableRtlPage(page, route);

    const accessibility = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
      .analyze();
    expect(accessibility.violations).toEqual([]);
  });
}

test("mobile navigation and language popovers open inside the RTL viewport", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "mobile", "Mobile-only overlay check");
  await startArabicSession(page, "hospital_staff");
  await expectStableRtlPage(page, "/hospital/dashboard");

  await page.getByRole("button", { name: "فتح القائمة" }).click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await expect(page.getByRole("navigation", { name: "التنقل الرئيسي" })).toBeVisible();
  await page.keyboard.press("Escape");

  await page.locator("#language-switcher-trigger").click();
  const popover = page.locator("#language-switcher-popover");
  await expect(popover).toBeVisible();
  const box = await popover.boundingBox();
  expect(box).not.toBeNull();
  expect(box!.x).toBeGreaterThanOrEqual(0);
  expect(box!.x + box!.width).toBeLessThanOrEqual(390);
});
