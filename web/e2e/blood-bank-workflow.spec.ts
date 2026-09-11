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

test("shows blood bank operations without backend traffic", async ({
  page,
}) => {
  const apiRequests: string[] = [];
  page.on("request", (request) => {
    if (request.url().includes("/api/v1/")) apiRequests.push(request.url());
  });

  await enterBloodBankWorkspace(page);

  await expect(
    page.getByRole("heading", { name: "Blood bank operations" }),
  ).toBeVisible();
  await expect(page.getByText("Available blood units")).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Request status overview" }),
  ).toBeVisible();
  await expect(
    page.getByText("BR-2026-2194").filter({ visible: true }).first(),
  ).toBeVisible();
  await expect(
    page.getByText("Central Blood Bank").filter({ visible: true }).first(),
  ).toBeVisible();
  await expectAccessible(page);
  expect(apiRequests).toEqual([]);
});

test("filters and progresses an incoming request locally from queue", async ({
  page,
}) => {
  await enterBloodBankWorkspace(page);
  await page.goto("/blood-bank/requests");

  await page
    .getByPlaceholder("Search ID, hospital, or component")
    .fill("BR-2026-2194");
  await expect(
    page.getByText("Cairo General Hospital").filter({ visible: true }).first(),
  ).toBeVisible();
  await expect(page.getByText("BR-2026-2193")).toHaveCount(0);

  await page
    .getByRole("button", { name: "Acknowledge request" })
    .first()
    .click();
  await expect(
    page.getByText(/BR-2026-2194: Acknowledge request completed/),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Confirm request" }).first(),
  ).toBeVisible();
  await expectAccessible(page);
});

test("navigates to request details and reviews clinical requirements and timeline", async ({
  page,
}) => {
  await enterBloodBankWorkspace(page);
  await page.goto("/blood-bank/requests");

  // Click on the request ID link
  await page.getByRole("link", { name: "BR-2026-2194" }).first().click();
  await expect(page).toHaveURL(/\/blood-bank\/requests\/BR-2026-2194$/);

  await expect(
    page.getByRole("heading", { name: "BR-2026-2194 — Requisition Review" }),
  ).toBeVisible();
  await expect(page.getByText("Cairo General Hospital").first()).toBeVisible();
  await expect(page.getByText("Clinical indication")).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Operational timeline & audit log" }),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Allocated blood units" }),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Available blood unit matching" }),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Supporting clinical documentation" }),
  ).toBeVisible();

  await expectAccessible(page);
});

test("allocates and removes blood units in the unit matching interface", async ({
  page,
}) => {
  await enterBloodBankWorkspace(page);
  await page.goto("/blood-bank/requests/BR-2026-2194");

  // Verify initial allocation state
  await expect(page.getByText("0 / 6 units allocated")).toBeVisible();

  // Allocate a matching unit from available inventory
  await page.getByRole("button", { name: "Allocate unit UNT-O-NEG-0142" }).click();

  // Expect allocated ledger to update
  await expect(page.getByText("1 / 6 units allocated")).toBeVisible();
  await expect(
    page.getByText(/Allocated 1 blood unit\(s\) to requisition BR-2026-2194/),
  ).toBeVisible();

  // Remove the unit allocation
  await page
    .getByRole("button", { name: "Remove unit UNT-O-NEG-0142 from allocation" })
    .click();

  await expect(page.getByText("0 / 6 units allocated")).toBeVisible();
  await expect(
    page.getByText(/Unit UNT-O-NEG-0142 unallocated from requisition BR-2026-2194/),
  ).toBeVisible();
});

test("reviews supporting document and accepts it", async ({ page }) => {
  await enterBloodBankWorkspace(page);
  await page.goto("/blood-bank/requests/BR-2026-2194");

  // Find the pending document and click accept
  await expect(page.getByText("patient-antibody-screen.pdf")).toBeVisible();
  await expect(page.getByText("Review pending")).toBeVisible();

  await page.getByRole("button", { name: "Accept patient-antibody-screen.pdf" }).click();
  await expect(
    page.getByText('Document status marked as "accepted"'),
  ).toBeVisible();
});

test("requires clinical rejection reason before confirming request rejection", async ({
  page,
}) => {
  await enterBloodBankWorkspace(page);
  await page.goto("/blood-bank/requests/BR-2026-2194");

  await page.getByRole("button", { name: "Reject request" }).click();
  await expect(
    page.getByRole("heading", { name: "Reject hospital blood request?" }),
  ).toBeVisible();

  // Attempt to submit without reason
  await page.getByRole("button", { name: "Confirm rejection" }).click();
  await expect(
    page.getByText("Please provide a clinical or operational rejection reason"),
  ).toBeVisible();

  // Enter reason and confirm
  await page
    .getByLabel(/Reason for rejection/)
    .fill("Incompatible antibody screen detected; cross-matching impossible.");
  await page.getByRole("button", { name: "Confirm rejection" }).click();

  await expect(
    page.getByText(/Status transitioned to "rejected"/),
  ).toBeVisible();
});

test("exposes resilient queue states", async ({ page }) => {
  await enterBloodBankWorkspace(page);

  await page.goto("/blood-bank/requests?state=empty");
  await expect(
    page.getByRole("heading", {
      name: "No incoming requests match this view",
    }),
  ).toBeVisible();

  await page.goto("/blood-bank/requests?state=permission");
  await expect(
    page.getByRole("heading", {
      name: "Incoming requests are outside your access scope",
    }),
  ).toBeVisible();

  await page.goto("/blood-bank/requests?state=error");
  await expect(
    page.getByRole("heading", {
      name: "Incoming requests could not be loaded",
    }),
  ).toBeVisible();
});
