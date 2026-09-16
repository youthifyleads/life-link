import { expect, test } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

test.describe("Unified Notification and Communication Layer (Phase 7)", () => {
  test.beforeEach(async ({ page }) => {
    // Clear storage to guarantee fresh sessions
    await page.goto("/login");
    await page.evaluate(() => {
      window.sessionStorage.clear();
      window.localStorage.clear();
    });
  });

  test("allows Hospital Staff to view notification popover, mark all as read, and navigate to notification center", async ({
    page,
  }) => {
    await page.goto("/login");
    await page.getByRole("button", { name: /Enter (demo|hospital) workspace/i }).click();
    await expect(page).toHaveURL(/.*\/hospital\/dashboard/);

    // Verify header notification bell and unread badge exist
    const bellBtn = page.locator("#header-notification-bell-btn");
    await expect(bellBtn).toBeVisible();

    const unreadBadge = page.locator("#header-notification-unread-badge");
    await expect(unreadBadge).toBeVisible();

    // Click notification bell to open quick preview popover
    await bellBtn.click();
    const popoverContent = page.getByLabel("Notification quick preview");
    await expect(popoverContent).toBeVisible();
    await expect(popoverContent.getByText("Notifications", { exact: true })).toBeVisible();

    // Verify mark all as read button works in popover
    const markAllBtn = page.locator("#header-mark-all-read-btn");
    await expect(markAllBtn).toBeVisible();
    await markAllBtn.click();

    // Unread badge should now be dismissed
    await expect(unreadBadge).not.toBeVisible();

    // Navigate to full notification center via popover link
    await page.locator("#header-view-all-notifications-link").click();
    await expect(page).toHaveURL(/.*\/notifications/);

    // Verify Notification Center page elements
    await expect(
      page.getByRole("heading", { name: "Notification Center", level: 1 }),
    ).toBeVisible();

    // Test search functionality
    const searchInput = page.locator("#notification-search-input");
    await searchInput.fill("BR-2026-2194");
    await expect(page.getByText("Requisition BR-2026-2194").first()).toBeVisible();

    // Test simulate events trigger
    const simulateBtn = page.locator("#simulate-workflow-events-btn");
    await expect(simulateBtn).toBeVisible();
    await simulateBtn.click();

    const simulatorDialog = page.getByRole("dialog");
    await expect(simulatorDialog).toBeVisible();
    await expect(simulatorDialog.getByText("Workflow Event Simulator")).toBeVisible();

    // Trigger hospital request event
    const triggerButtons = simulatorDialog.getByRole("button", { name: "Trigger" });
    await triggerButtons.first().click();
    await expect(simulatorDialog.getByText("Dispatched: REQUEST_CREATED")).toBeVisible();

    // Close dialog by pressing Escape
    await page.keyboard.press("Escape");
    await expect(simulatorDialog).not.toBeVisible();
  });

  test("allows inspecting system activity ledger and viewing event metadata dialog", async ({
    page,
  }) => {
    await page.goto("/login");
    await page.getByRole("button", { name: "Enter admin workspace" }).click();
    await expect(page).toHaveURL(/.*\/admin\/dashboard/);

    // Navigate to activity ledger
    await page.goto("/activity");
    await expect(
      page.getByRole("heading", { name: "System Activity Ledger", level: 1 }),
    ).toBeVisible();

    // Check table headers
    await expect(page.getByRole("columnheader", { name: "Timestamp" })).toBeVisible();
    await expect(page.getByRole("columnheader", { name: "Actor & Organization" })).toBeVisible();
    await expect(page.getByRole("columnheader", { name: "Action" })).toBeVisible();

    // Search for specific action
    const searchInput = page.locator("#activity-search-input");
    await searchInput.fill("BR-2026-2194");
    await expect(page.getByText("BR-2026-2194").first()).toBeVisible();

    // Click Details button on the first row
    const detailsButtons = page.getByRole("button", { name: "Details" });
    await detailsButtons.first().click();

    // Dialog should open with JSON operational metadata
    const eventDialog = page.getByRole("dialog");
    await expect(eventDialog).toBeVisible();
    await expect(eventDialog.getByText("Target Entity:")).toBeVisible();

    await page.keyboard.press("Escape");
    await expect(eventDialog).not.toBeVisible();
  });

  test("allows user to configure notification preferences and save", async ({
    page,
  }) => {
    await page.goto("/login");
    await page.getByRole("button", { name: "Enter donor workspace" }).click();
    await expect(page).toHaveURL(/.*\/donor\/dashboard/);

    // Navigate to preferences page
    await page.goto("/settings/notifications");
    await expect(
      page.getByRole("heading", { name: "Notification Preferences", level: 1 }),
    ).toBeVisible();

    // Toggle a checkbox
    const inAppCheckbox = page.locator("#pref-in-app");
    await inAppCheckbox.click({ force: true });

    // Save preferences
    const saveBtn = page.locator("#save-preferences-btn");
    await expect(saveBtn).toBeVisible();
    await saveBtn.click();

    // Verify success confirmation
    await expect(
      page.getByText("Notification preferences saved successfully."),
    ).toBeVisible();
  });

  test("has zero accessibility violations on notifications, activity, and preferences", async ({
    page,
  }) => {
    await page.goto("/login");
    await page.getByRole("button", { name: "Enter admin workspace" }).click();
    await expect(page).toHaveURL(/.*\/admin\/dashboard/);

    // Audit /notifications
    await page.goto("/notifications");
    await page.waitForLoadState("networkidle");
    const notifsAudit = await new AxeBuilder({ page })
      .disableRules(["color-contrast"])
      .analyze();
    expect(notifsAudit.violations).toEqual([]);

    // Audit /activity
    await page.goto("/activity");
    await page.waitForLoadState("networkidle");
    const activityAudit = await new AxeBuilder({ page })
      .disableRules(["color-contrast"])
      .analyze();
    expect(activityAudit.violations).toEqual([]);

    // Audit /settings/notifications
    await page.goto("/settings/notifications");
    await page.waitForLoadState("networkidle");
    const prefsAudit = await new AxeBuilder({ page })
      .disableRules(["color-contrast"])
      .analyze();
    expect(prefsAudit.violations).toEqual([]);
  });
});
