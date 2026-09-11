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

async function logInAsBloodBank(page: Page) {
  await page.goto("/login");
  await page.evaluate(() => {
    sessionStorage.clear();
    localStorage.clear();
  });
  await page.goto("/login");
  await page.getByRole("button", { name: /enter blood bank workspace/i }).click();
  await page.waitForURL("**/blood-bank/dashboard");
}

test.describe("Documentation Review Compliance Fixes - Hospital & Blood Bank Workflows", () => {
  test("Hospital Staff Documents Register and Re-routing of Rejected Requisitions", async ({
    page,
  }) => {
    await logInAsHospital(page);

    // 1. Verify Hospital Documents register is accessible
    await page.goto("/hospital/documents");
    await page.waitForLoadState("networkidle");

    // Verify Hospital Documents page header & KPIs
    await expect(
      page.getByRole("heading", { name: "Supporting documents register" }),
    ).toBeVisible();
    await expect(page.getByText("Total Documents")).toBeVisible();
    await expect(page.getByText("Verified & Accepted")).toBeVisible();

    // Verify documents table rows
    await expect(page.getByText("trauma-triage-assessment.pdf")).toBeVisible();
    await expect(page.getByText("emergency-release-form.pdf")).toBeVisible();

    // Verify Upload Document modal opens
    await page.getByRole("button", { name: /upload document/i }).click();
    await expect(
      page.getByRole("heading", { name: "Attach Clinical Document" }),
    ).toBeVisible();
    await page.getByRole("button", { name: /cancel/i }).click();

    // Capture screenshot on desktop
    if (page.viewportSize()?.width && page.viewportSize()!.width >= 1024) {
      await page.screenshot({
        path: "C:/Users/abdeen/.gemini/antigravity-ide/brain/5c1def28-1cbe-4f19-b364-817af502f7f5/32_hospital_documents_register.png",
      });
    }

    // Accessibility check on /hospital/documents
    const axeResults = await new AxeBuilder({ page })
      .disableRules(["color-contrast"])
      .analyze();
    expect(axeResults.violations).toEqual([]);

    // 2. Test Re-routing on Rejected Requisition BR-2026-1049
    await page.goto("/hospital/requests/BR-2026-1049");
    await page.waitForLoadState("networkidle");

    // Verify rejection alert banner
    await expect(
      page.getByText("Requisition Declined by Recipient Blood Bank"),
    ).toBeVisible();

    if (page.viewportSize()?.width && page.viewportSize()!.width >= 1024) {
      await page.screenshot({
        path: "C:/Users/abdeen/.gemini/antigravity-ide/brain/5c1def28-1cbe-4f19-b364-817af502f7f5/33_hospital_request_rejected_banner.png",
      });
    }

    // Click "Re-route to alternative blood bank"
    const rerouteBtn = page
      .getByRole("button", { name: /re-route to alternative blood bank/i })
      .first();
    await expect(rerouteBtn).toBeVisible();
    await rerouteBtn.click();

    // Verify dialog opens with alternative blood banks
    await expect(
      page.getByRole("heading", { name: /re-route requisition/i }),
    ).toBeVisible();
    await expect(
      page.getByRole("button", { name: /NRB-002/i }),
    ).toBeVisible();

    if (page.viewportSize()?.width && page.viewportSize()!.width >= 1024) {
      await page.screenshot({
        path: "C:/Users/abdeen/.gemini/antigravity-ide/brain/5c1def28-1cbe-4f19-b364-817af502f7f5/34_hospital_reroute_modal.png",
      });
    }

    // Fill clinical resubmission note
    await page
      .locator("#reroute-note-input")
      .fill("Re-routed to Nile Regional following Central stock exhaustion.");

    // Submit re-routing
    await page
      .getByRole("button", { name: /re-submit to nile regional blood bank/i })
      .click();

    // Verify status updated to submitted
    await expect(
      page.getByText(/requisition re-submitted successfully to nile regional blood bank/i),
    ).toBeVisible();
  });

  test("Blood Bank Documents Triage and Dispatch QR & Cold Box Waybill", async ({
    page,
  }) => {
    await logInAsBloodBank(page);

    // 1. Navigate to Blood Bank Documents Triage Register
    await page.goto("/blood-bank/documents");
    await page.waitForLoadState("networkidle");

    // Verify Triage Header & Metrics
    await expect(
      page.getByRole("heading", {
        name: "Supporting documents triage register",
      }),
    ).toBeVisible();
    await expect(page.getByText("Pending Verification")).toBeVisible();
    await expect(
      page.getByText("emergency-release-authorization.pdf"),
    ).toBeVisible();

    if (page.viewportSize()?.width && page.viewportSize()!.width >= 1024) {
      await page.screenshot({
        path: "C:/Users/abdeen/.gemini/antigravity-ide/brain/5c1def28-1cbe-4f19-b364-817af502f7f5/35_blood_bank_documents_triage.png",
      });
    }

    // Test Inspect document modal
    const inspectBtn = page.getByRole("button", { name: /^inspect$/i }).first();
    await inspectBtn.click();
    await expect(
      page.getByText(
        "Supporting evidence details conforming to specification Section 12.",
      ),
    ).toBeVisible();
    await page.getByRole("button", { name: /^close$/i }).click();

    // Accessibility check on /blood-bank/documents
    const axeResults = await new AxeBuilder({ page })
      .disableRules(["color-contrast"])
      .analyze();
    expect(axeResults.violations).toEqual([]);

    // 2. Test Dispatch QR & Cold Box Waybill Modal on Request Details
    await page.goto("/blood-bank/requests/BR-2026-2191");
    await page.waitForLoadState("networkidle");

    // Click "Dispatch QR & Waybill"
    const dispatchQrBtn = page.getByRole("button", {
      name: /dispatch qr & waybill/i,
    });
    await expect(dispatchQrBtn).toBeVisible();
    await dispatchQrBtn.click();

    // Verify QR code and Waybill manifest
    await expect(
      page.getByRole("heading", { name: "Dispatch QR & Cold Box Waybill" }),
    ).toBeVisible();
    await expect(page.getByText("Cold Box Dispatch Manifest")).toBeVisible();
    await expect(
      page.getByText("+2.0°C to +6.0°C (Active logger)"),
    ).toBeVisible();
    await expect(page.getByText("Copy reference")).toBeVisible();

    if (page.viewportSize()?.width && page.viewportSize()!.width >= 1024) {
      await page.screenshot({
        path: "C:/Users/abdeen/.gemini/antigravity-ide/brain/5c1def28-1cbe-4f19-b364-817af502f7f5/36_blood_bank_dispatch_qr_waybill_modal.png",
      });
    }

    // Test Print Waybill
    await page.getByRole("button", { name: /print dispatch waybill/i }).click();
    await expect(
      page.getByText("Waybill sent to connected dispatch label printer."),
    ).toBeVisible();

    await page.getByRole("button", { name: /^close$/i }).click();
  });
});
