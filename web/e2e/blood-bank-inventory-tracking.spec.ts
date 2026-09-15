import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";

async function enterBloodBankWorkspace(page: Page) {
  await page.goto("/login");
  await page
    .getByRole("button", { name: "Enter blood bank workspace" })
    .click();
  await expect(page).toHaveURL(/\/blood-bank\/dashboard$/);
}

async function expectAccessible(page: Page) {
  const accessibilityScan = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"])
    .analyze();
  expect(accessibilityScan.violations).toEqual([]);
}

test.describe("Blood Bank Inventory & QR Tracking Workflow", () => {
  test("navigates to Inventory, verifies KPIs, stock matrix, warnings, and filters", async ({
    page,
  }) => {
    await enterBloodBankWorkspace(page);

    // Navigate to Inventory via sidebar or direct URL
    await page.goto("/blood-bank/inventory");
    await expect(
      page.getByRole("heading", { name: "Central blood bank inventory" }),
    ).toBeVisible();

    // 1. Verify Inventory KPIs
    await expect(page.getByText("Total Available Units")).toBeVisible();
    await expect(page.getByText("Reserved Units")).toBeVisible();
    await expect(page.getByText("Quarantined Units")).toBeVisible();
    await expect(page.getByText("Expiring Soon (<48h)")).toBeVisible();
    await expect(page.getByText("Critical Low Stock Groups")).toBeVisible();

    // 2. Verify Operational Warnings
    await expect(
      page.getByText("Critical O- Negative Universal Stock Shortage"),
    ).toBeVisible();
    await expect(
      page.getByText("Expired Unit(s) Requiring Quarantine / Disposal"),
    ).toBeVisible();

    // 3. Verify Stock Matrix
    await expect(
      page.getByRole("heading", { name: "Blood Stock Matrix" }),
    ).toBeVisible();
    await expect(page.getByText("ABO/Rh Group")).toBeVisible();

    // 4. Verify Inventory Ledger Table
    await expect(
      page.getByRole("heading", { name: "Blood Unit Inventory Ledger" }),
    ).toBeVisible();
    await expect(
      page.getByRole("link", { name: "UNT-O-NEG-0142" }),
    ).toBeVisible();

    // 5. Test Filters: Filter by Status "Allocated"
    await page.locator("#filter-status").selectOption("allocated");
    await expect(
      page.getByRole("link", { name: "UNT-B-POS-0331" }),
    ).toBeVisible();
    await expect(
      page.getByRole("link", { name: "UNT-O-NEG-0142" }),
    ).toHaveCount(0);

    // 6. Test Expiry Window: Filter by "Already expired"
    await page.locator("#filter-status").selectOption("all");
    await page.locator("#filter-expiry").selectOption("expired");
    await expect(
      page.getByRole("link", { name: "UNT-O-NEG-0991" }),
    ).toBeVisible();

    // Accessibility check
    await expectAccessible(page);
  });

  test("registers new blood units via Unit Intake dialog and confirms addition to ledger", async ({
    page,
  }) => {
    await enterBloodBankWorkspace(page);
    await page.goto("/blood-bank/inventory");

    // Click "Register new unit" button
    await page.getByRole("button", { name: "Register new unit" }).click();

    // Verify modal appears
    await expect(
      page.getByRole("heading", { name: "Register new blood unit(s)" }),
    ).toBeVisible();

    // Fill intake form
    await page.locator("#bloodGroup").selectOption("O+");
    await page.locator("#component").selectOption("whole_blood");
    await page.locator("#quantity").fill("1");
    await page.locator("#storageLocation").fill("Fridge C — Shelf 3");
    await page.locator("#notes").fill("E2E phlebotomy intake test");

    // Proceed to review
    await page.getByRole("button", { name: "Review registration" }).click();
    await expect(
      page.getByRole("heading", { name: "Review clinical unit registration" }),
    ).toBeVisible();
    await expect(page.getByText("Fridge C — Shelf 3")).toBeVisible();

    // Confirm and save
    await page.getByRole("button", { name: "Confirm & register units" }).click();
    await expect(page.getByText("Successfully Registered!")).toBeVisible();

    // Done and view inventory
    await page.getByRole("button", { name: "Done & view inventory" }).click();
    await expect(page.getByText("Fridge C — Shelf 3").first()).toBeVisible();
  });

  test("looks up a blood unit in QR Tracking and inspects Chain of Custody timeline", async ({
    page,
  }) => {
    await enterBloodBankWorkspace(page);

    // Navigate to QR Tracking
    await page.goto("/blood-bank/tracking");
    await expect(
      page.getByRole("heading", { name: "Blood unit tracking & chain of custody" }),
    ).toBeVisible();

    // Test simulation scan preset: B+ Allocated unit UNT-B-POS-0331
    const presetSelect = page.getByLabel("Demo scan simulation presets");
    await presetSelect.selectOption("UNT-B-POS-0331");

    // Verify Tracking Result panel
    await expect(
      page.getByText("UNT-B-POS-0331").filter({ visible: true }).first(),
    ).toBeVisible();
    await expect(page.getByText("Allocated").filter({ visible: true }).first()).toBeVisible();
    await expect(page.getByText("Deep Freezer 2 — Rack A").filter({ visible: true }).first()).toBeVisible();
    await expect(page.getByText("BR-2026-2192").filter({ visible: true }).first()).toBeVisible();

    // Verify Chain of Custody timeline
    await expect(
      page.getByRole("heading", { name: "Chain of Custody Timeline" }),
    ).toBeVisible();
    await expect(
      page.getByText("Allocated to Hospital Blood Request").first(),
    ).toBeVisible();
    await expect(
      page.getByText("Plasma Fractionation & Flash Freezing").first(),
    ).toBeVisible();
    await expect(
      page.getByText("Mariam Blood Bank User (Blood Bank Staff)").first(),
    ).toBeVisible();

    // Click assigned request link and verify navigation to request details
    await page.getByRole("link", { name: "BR-2026-2192" }).first().click();
    await expect(page).toHaveURL(/\/blood-bank\/requests\/BR-2026-2192$/);

    // Accessibility check
    await expectAccessible(page);
  });
});
