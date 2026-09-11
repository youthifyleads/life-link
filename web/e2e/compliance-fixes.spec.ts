import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";

async function logInAsHospital(page: Page) {
  await page.goto("/login");
  await page.evaluate(() => {
    sessionStorage.clear();
    localStorage.clear();
  });
  await page.goto("/login");
  await page.getByRole("button", { name: /enter demo workspace/i }).click();
  await page.waitForURL("**/hospital/dashboard");
}

async function logInAsDonor(page: Page) {
  await page.goto("/login");
  await page.evaluate(() => {
    sessionStorage.clear();
    localStorage.clear();
  });
  await page.goto("/login");
  await page.getByRole("button", { name: /enter donor workspace/i }).click();
  await page.waitForURL("**/donor/dashboard");
}

test.describe("Phase 7.5 Compliance Fixes - Hospital Blood Bank Selection & Donor Consents", () => {
  test("allows Hospital Staff to select a target blood bank and submit requisition", async ({
    page,
  }) => {
    // Login as hospital staff
    await logInAsHospital(page);

    // Navigate to Create Blood Request
    await page.goto("/hospital/requests/create");
    await page.waitForLoadState("networkidle");

    // Step 1: Requirements
    await page.locator("#blood-group").selectOption("O−");
    await page.locator("#blood-component").selectOption("red_cells");
    await page.locator("#quantity").fill("3");
    await page.locator("#urgency").selectOption("emergency");
    await page.locator("#reason").fill("Immediate hemorrhage trauma protocol activation");
    await page.locator("#notes").fill("Operating Room 4 — STAT delivery required");

    // Proceed to Step 2: Select Blood Bank
    await page.getByRole("button", { name: /Select Blood Bank/i }).click();

    // Verify Available Blood Banks are displayed
    await expect(page.getByText("Select Recipient Blood Bank")).toBeVisible();
    await expect(page.getByText("Nile Regional Blood Bank")).toBeVisible();
    await expect(page.getByText("Central Blood Bank")).toBeVisible();
    await expect(page.getByText("Alexandria Coastal Blood Bank")).toBeVisible();

    // Select Nile Regional Blood Bank (NRB-002)
    await page.locator("#bank-nile-regional-blood-bank").check();

    // Proceed to Step 3: Review
    await page.getByRole("button", { name: /Proceed to Clinical Review/i }).click();

    // Verify Review Summary contains both blood requirements and selected blood bank
    await expect(page.getByText("Confirm Clinical Request")).toBeVisible();
    await expect(page.getByText("Nile Regional Blood Bank")).toBeVisible();
    await expect(page.getByText("NRB-002")).toBeVisible();
    await expect(page.getByText("Immediate hemorrhage trauma protocol activation")).toBeVisible();

    // Submit Request
    await page.getByRole("button", { name: /Submit Blood Request/i }).click();

    // Verify success confirmation with target bank
    await expect(page.getByText(/Blood request submitted to Nile Regional Blood Bank/i)).toBeVisible();
    await expect(page.getByText(/Giza/i)).toBeVisible();

    // Navigate to Request Details
    await page.getByRole("link", { name: /View request details/i }).click();
    await page.waitForLoadState("networkidle");

    // Verify Recipient Blood Bank card is prominently displayed in request details
    await expect(page.getByText("Recipient Blood Bank")).toBeVisible();
    await expect(page.locator("#target-bank-title")).toHaveText("Nile Regional Blood Bank");
    await expect(page.getByText("NRB-002")).toBeVisible();
  });

  test("allows Donor to view, revoke, and grant consent authorizations with confirmation", async ({
    page,
  }) => {
    // Login as donor
    await logInAsDonor(page);

    // Verify shortcut to Consents on Dashboard
    await expect(page.getByRole("link", { name: /Consents & Authorizations/i })).toBeVisible();

    // Navigate to Consents page
    await page.goto("/donor/consents");
    await page.waitForLoadState("networkidle");

    // Verify Consent records are displayed
    await expect(page.getByText("Donor Consents & Authorizations")).toBeVisible();
    await expect(page.getByText("Emergency Shortage Dispatch Outreach")).toBeVisible();
    await expect(page.getByText("Health & Biological Screening Consent")).toBeVisible();

    // Find the Emergency Shortage card and click Revoke Consent
    const outreachCard = page.locator("article").filter({ hasText: "Emergency Shortage Dispatch Outreach" });
    await outreachCard.getByRole("button", { name: /Revoke Consent/i }).click();

    // Verify confirmation modal
    await expect(page.getByText("Revoke Consent Agreement?")).toBeVisible();
    await page.getByRole("button", { name: /Confirm Revocation/i }).click();

    // Verify status changed to Revoked
    await expect(page.getByText(/has been revoked/i)).toBeVisible();
    await expect(outreachCard.getByText("Authorization Revoked")).toBeVisible();
    await expect(outreachCard.getByRole("button", { name: /Grant Consent/i })).toBeVisible();

    // Click Grant Consent to re-authorize
    await outreachCard.getByRole("button", { name: /Grant Consent/i }).click();
    await expect(page.getByText("Grant Consent Authorization")).toBeVisible();
    await page.getByRole("button", { name: /Confirm & Grant Consent/i }).click();

    // Verify status restored to Active & Granted
    await expect(page.getByText(/successfully granted/i)).toBeVisible();
    await expect(outreachCard.getByText("Active & Granted")).toBeVisible();
  });

  test("has zero accessibility violations on /donor/consents and /hospital/requests/create", async ({
    page,
  }) => {
    // 1. Check /donor/consents
    await logInAsDonor(page);
    await page.goto("/donor/consents");
    await page.waitForLoadState("networkidle");

    const donorResults = await new AxeBuilder({ page }).analyze();
    expect(donorResults.violations).toEqual([]);

    // 2. Check /hospital/requests/create
    await logInAsHospital(page);
    await page.goto("/hospital/requests/create");
    await page.waitForLoadState("networkidle");

    const hospitalResults = await new AxeBuilder({ page }).analyze();
    expect(hospitalResults.violations).toEqual([]);
  });
});
