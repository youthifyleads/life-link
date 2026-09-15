import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";

async function logInAsDonor(page: Page) {
  await page.goto("/login");
  await page.evaluate(() => sessionStorage.clear());
  await page.goto("/login");
  const donorButton = page.getByRole("button", {
    name: /enter donor workspace/i,
  });
  await expect(donorButton).toBeVisible();
  await donorButton.click();
  await page.waitForURL("**/donor/dashboard");
}

async function logInAsCaregiver(page: Page) {
  await page.goto("/login");
  await page.evaluate(() => sessionStorage.clear());
  await page.goto("/login");
  const caregiverButton = page.getByRole("button", {
    name: /enter caregiver workspace/i,
  });
  await expect(caregiverButton).toBeVisible();
  await caregiverButton.click();
  await page.waitForURL("**/caregiver/dashboard");
}

test.describe("Phase 6: Donor and Caregiver Workflows", () => {
  test("allows Omar Donor to log in, view dashboard, and browse requests", async ({
    page,
  }) => {
    await logInAsDonor(page);

    // Verify Dashboard Identity & Eligibility
    await expect(page.getByText("Welcome back, Omar Donor")).toBeVisible();
    await expect(
      page.getByText("Eligible to Donate", { exact: true }),
    ).toBeVisible();
    await expect(page.getByText("Total Donations")).toBeVisible();
    await expect(page.getByText("Lives Impacted")).toBeVisible();

    // Verify Axe accessibility on donor dashboard
    const a11y = await new AxeBuilder({ page })
      .disableRules(["color-contrast"])
      .analyze();
    expect(a11y.violations).toEqual([]);

    // Navigate to Requests
    await page.goto("/donor/requests");
    await expect(
      page.getByRole("heading", { name: "Donation Requests" }),
    ).toBeVisible();
    await expect(page.getByText("DR-2026-0811")).toBeVisible();

    // Open Request Details
    await page.getByRole("link", { name: /view details/i }).first().click();
    await page.waitForURL("**/donor/requests/*");

    await expect(
      page.getByText("Safe Clinical Context:", { exact: false }),
    ).toBeVisible();
    await expect(
      page.getByText("Facility Location & Schedule"),
    ).toBeVisible();

    // Click Accept / I'm Interested
    const acceptButton = page.getByRole("button", {
      name: /accept \/ i'm interested to donate/i,
    });
    await expect(acceptButton).toBeVisible();
    await acceptButton.click();

    await expect(
      page.getByText("Thank you! Your interest has been confirmed."),
    ).toBeVisible();
  });

  test("allows donor to inspect donation history and vouchers", async ({
    page,
  }) => {
    await logInAsDonor(page);

    // 1. History
    await page.goto("/donor/donations");
    await expect(
      page.getByRole("heading", { name: "Donation History" }),
    ).toBeVisible();
    await expect(page.getByText("DON-2026-0042")).toBeVisible();
    await expect(page.getByText("VCH-2026-9901")).toBeVisible();

    // 2. Vouchers
    await page.goto("/donor/vouchers");
    await expect(
      page.getByRole("heading", { name: "Donation Vouchers" }),
    ).toBeVisible();
    await expect(page.getByText("Active Voucher")).toBeVisible();

    // Open Certificate Modal
    await page
      .getByRole("button", { name: /inspect certificate/i })
      .first()
      .click();
    await expect(
      page.getByText("Certificate Serial Reference"),
    ).toBeVisible();
    await expect(
      page.getByRole("dialog").getByText("VCH-2026-9901"),
    ).toBeVisible();
    await page.getByRole("button", { name: "Close", exact: true }).click();

    // 3. Notifications
    await page.goto("/donor/notifications");
    await expect(
      page.getByRole("heading", { name: "Donor Notifications" }),
    ).toBeVisible();
    await expect(page.getByText("Urgent O+ Blood Request")).toBeVisible();
  });

  test("allows Sara Caregiver to log in, track blood bag, and enforce privacy", async ({
    page,
  }) => {
    await logInAsCaregiver(page);

    // Dashboard
    await expect(
      page.getByRole("heading", { name: "Blood Unit Tracking" }),
    ).toBeVisible();
    await expect(page.getByText("UNT-B-POS-0331")).toBeVisible();
    await expect(
      page.getByText(/Destination: Cairo University Specialized Hospital/),
    ).toBeVisible();

    // Verify Axe accessibility on caregiver dashboard
    const a11yDashboard = await new AxeBuilder({ page })
      .disableRules(["color-contrast"])
      .analyze();
    expect(a11yDashboard.violations).toEqual([]);

    // Scan / Lookup View
    await page.goto("/caregiver/scan");
    await expect(
      page.getByRole("heading", { name: "Scan Blood Bag QR / Barcode" }),
    ).toBeVisible();

    // Simulate Scan with preset
    await page
      .getByRole("button", { name: /UNT-B-POS-0331/i })
      .click();
    await page.waitForURL("**/caregiver/tracking/UNT-B-POS-0331");

    // Tracking Details Page
    await expect(page.getByText("Bag UNT-B-POS-0331")).toBeVisible();
    await expect(
      page.getByText("Continuous 2°C–6°C Monitored Range"),
    ).toBeVisible();
    await expect(
      page.getByText("Custody Transfer Milestones"),
    ).toBeVisible();

    // Privacy Verification: no raw patient diagnosis or confidential staff IDs
    const content = await page.content();
    expect(content).not.toContain("C-Section");
    expect(content).not.toContain("Placenta Previa");
    expect(content).not.toContain("patient_id");

    // Accessibility on Tracking Details
    const a11yTracking = await new AxeBuilder({ page })
      .disableRules(["color-contrast"])
      .analyze();
    expect(a11yTracking.violations).toEqual([]);
  });

  test("verifies route protection by role", async ({ page }) => {
    // Caregiver cannot access /donor/dashboard
    await logInAsCaregiver(page);
    await page.goto("/donor/dashboard");
    await page.waitForURL("**/forbidden");

    // Donor cannot access /caregiver/dashboard
    await logInAsDonor(page);
    await page.goto("/caregiver/dashboard");
    await page.waitForURL("**/forbidden");
  });
});
