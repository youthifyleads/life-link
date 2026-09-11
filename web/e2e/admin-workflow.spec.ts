import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";

async function enterAdminWorkspace(page: Page) {
  await page.goto("/login");
  const adminButton = page.getByRole("button", {
    name: /enter admin workspace/i,
  });
  await expect(adminButton).toBeVisible();
  await adminButton.click();
  await page.waitForURL("**/admin/dashboard");
}

test.describe("Phase 5: Admin Workspace & Governance Operations", () => {
  test("allows Nour System Admin to log in and access governance dashboard", async ({
    page,
  }) => {
    await enterAdminWorkspace(page);

    await expect(
      page.getByRole("heading", { name: "Platform Administration & Governance" }),
    ).toBeVisible();

    // Verify KPIs
    await expect(page.getByText("Total Users")).toBeVisible();
    await expect(page.getByText("Active Users")).toBeVisible();
    await expect(page.getByText("Total Hospitals")).toBeVisible();
    await expect(page.getByText("Total Blood Banks")).toBeVisible();
    await expect(page.getByText("Active Blood Requests")).toBeVisible();
    await expect(page.getByText("Recent Admin Changes")).toBeVisible();

    // Verify recent activity ledger
    await expect(
      page.getByRole("heading", { name: "Recent Administrative Activity" }),
    ).toBeVisible();

    // Run accessibility check
    const axeResults = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
      .analyze();
    expect(axeResults.violations).toEqual([]);
  });

  test("manages users with create, review step, and status toggles", async ({
    page,
  }) => {
    await enterAdminWorkspace(page);

    // Navigate to Users
    await page.goto("/admin/users");
    await expect(
      page.getByRole("heading", { name: "Users Management" }),
    ).toBeVisible();

    // Verify users table renders
    await expect(page.getByText("Ahmed Hospital User")).toBeVisible();
    await expect(page.getByText("Mariam Blood Bank User")).toBeVisible();

    // Filter users
    const searchInput = page.getByPlaceholder(/search users by name/i);
    await searchInput.fill("Ahmed");
    await expect(page.getByText("Ahmed Hospital User")).toBeVisible();
    await expect(page.getByText("Mariam Blood Bank User")).not.toBeVisible();
    await searchInput.clear();

    // Open create user dialog
    await page.getByRole("button", { name: /create user/i }).click();
    await expect(
      page.getByRole("heading", { name: "Create New User Account" }),
    ).toBeVisible();

    // Fill in form
    await page.getByLabel("Full Name").fill("Dr. Farida Salem");
    await page.getByLabel("Email Address").fill("farida.salem@hospital.test");
    await page.getByLabel("Initial Password").fill("SecurePass2026!");
    await page.getByLabel("Primary Role").selectOption("hospital_staff");

    // Click review
    await page.getByRole("button", { name: /review details/i }).click();
    await expect(page.getByText("Account Summary Review")).toBeVisible();
    await expect(page.getByText("Dr. Farida Salem")).toBeVisible();
    await expect(page.getByText("farida.salem@hospital.test")).toBeVisible();

    // Confirm save
    await page.getByRole("button", { name: /confirm & provision/i }).click();
    await expect(
      page.getByRole("heading", { name: "User Provisioned Successfully" }),
    ).toBeVisible();
    await page.getByRole("dialog").getByRole("button", { name: "Done" }).click();

    // Verify user is now in directory
    await expect(page.getByText("Dr. Farida Salem")).toBeVisible();

    // Toggle user status
    const deactivateBtn = page.getByRole("button", {
      name: /deactivate Dr\. Farida Salem/i,
    });
    await deactivateBtn.click();
    await expect(
      page.getByRole("button", { name: /activate Dr\. Farida Salem/i }),
    ).toBeVisible();
  });

  test("manages hospitals directory and operational states", async ({ page }) => {
    await enterAdminWorkspace(page);

    // Navigate to Hospitals
    await page.goto("/admin/hospitals");
    await expect(
      page.getByRole("heading", { name: "Hospitals Management" }),
    ).toBeVisible();

    // Check Cairo General Hospital
    await expect(page.getByText("Cairo General Hospital")).toBeVisible();
    await expect(page.getByText("CGH-014")).toBeVisible();

    // Inspect hospital details
    await page.getByRole("button", { name: "View Cairo General Hospital" }).click();
    await expect(
      page.getByRole("dialog").getByText("12 Kasr Al-Ainy St, Downtown, Cairo"),
    ).toBeVisible();
    await page.getByRole("dialog").getByRole("button", { name: "Close", exact: true }).click();

    // Toggle hospital status
    const deactivateBtn = page.getByRole("button", {
      name: "Deactivate Cairo General Hospital",
    });
    await deactivateBtn.click();
    await expect(
      page.getByRole("button", { name: "Activate Cairo General Hospital" }),
    ).toBeVisible();
  });

  test("inspects roles, permission matrix, and high-impact confirmations", async ({
    page,
  }) => {
    await enterAdminWorkspace(page);

    // Navigate to Roles & Permissions
    await page.goto("/admin/roles");
    await expect(
      page.getByRole("heading", { name: "Roles & Permissions" }),
    ).toBeVisible();

    // Verify roles directory
    await expect(page.getByText("System Administrator")).toBeVisible();
    await expect(page.getByText("Hospital Clinical Staff")).toBeVisible();
    await expect(page.getByText("Blood Bank Operational Staff")).toBeVisible();
    await expect(page.getByText("Medical Lead / Transfusion Lead")).toBeVisible();
    await expect(page.getByText("Platform Support Specialist")).toBeVisible();

    // Inspect permission matrix
    await expect(page.getByText("Clinical Blood Requests")).toBeVisible();
    await expect(page.getByText("Blood Stock & Cold Chain")).toBeVisible();
    await expect(page.getByText("Clinical Documentation")).toBeVisible();
    await expect(
      page.getByText("System Administration & Security"),
    ).toBeVisible();

    // High impact confirmation check
    const highImpactCheckbox = page.getByLabel(
      "Manage user accounts & directory for hospital_staff",
    );
    await highImpactCheckbox.click();

    // Verify confirmation modal pops up
    await expect(
      page.getByRole("heading", {
        name: "High-Impact Permission Modification",
      }),
    ).toBeVisible();
    await page.getByRole("button", { name: "Cancel" }).click();
  });

  test("inspects read-only audit logs ledger", async ({ page }) => {
    await enterAdminWorkspace(page);

    // Navigate to System Activity
    await page.goto("/admin/audit");
    await expect(
      page.getByRole("heading", { name: "System Activity / Audit Logs" }),
    ).toBeVisible();

    // Verify audit logs exist
    await expect(page.getByText("Read-Only Audit Trail")).toBeVisible();
    await expect(
      page.getByRole("table").getByText("Nour System Admin").first(),
    ).toBeVisible();

    // Open an audit log event
    const inspectBtn = page.getByRole("button", { name: /inspect/i }).first();
    await inspectBtn.click();

    await expect(
      page.getByText(
        "Audit record is read-only and cryptographically verified in system ledger.",
      ),
    ).toBeVisible();
    await page.getByRole("dialog").getByRole("button", { name: "Close", exact: true }).click();

    // Run accessibility check on audit ledger
    const axeResults = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
      .analyze();
    expect(axeResults.violations).toEqual([]);
  });
});
