import { afterEach, describe, expect, it } from "vitest";

import {
  clearDemoSession,
  restoreDemoSession,
  startDemoSession,
} from "@/features/authentication/model/demo-session";

describe("development demo session", () => {
  afterEach(() => {
    clearDemoSession();
  });

  it("creates the approved hospital user without a backend response", () => {
    const user = startDemoSession();

    expect(user).toMatchObject({
      display_name: "Ahmed Hospital User",
      primary_role: "hospital_staff",
      active_organization_id: "demo-hospital",
    });
    expect(user.organizations).toEqual([
      expect.objectContaining({ name: "Demo Hospital", type: "hospital" }),
    ]);
  });

  it("restores and clears the tab-scoped session marker", () => {
    expect(restoreDemoSession()).toBeNull();

    startDemoSession();
    expect(restoreDemoSession()?.display_name).toBe("Ahmed Hospital User");

    clearDemoSession();
    expect(restoreDemoSession()).toBeNull();
  });

  it("creates and restores an isolated blood bank staff preview", () => {
    const user = startDemoSession("blood_bank_staff");

    expect(user).toMatchObject({
      display_name: "Mariam Blood Bank User",
      primary_role: "blood_bank_staff",
      active_organization_id: "central-blood-bank",
    });
    expect(restoreDemoSession()?.organizations).toEqual([
      expect.objectContaining({
        name: "Central Blood Bank",
        type: "blood_bank",
      }),
    ]);
  });

  it("creates and restores an isolated admin workspace session", () => {
    const user = startDemoSession("admin");

    expect(user).toMatchObject({
      display_name: "Nour System Admin",
      primary_role: "admin",
      active_organization_id: "platform-administration",
    });
    expect(restoreDemoSession()?.organizations).toEqual([
      expect.objectContaining({
        name: "Blood Bank Platform Administration",
        type: "platform",
      }),
    ]);
  });

  it("creates and restores an isolated donor workspace session", () => {
    const user = startDemoSession("donor");

    expect(user).toMatchObject({
      display_name: "Omar Donor",
      primary_role: "donor",
      active_organization_id: "donor-portal",
    });
    expect(restoreDemoSession()?.organizations).toEqual([
      expect.objectContaining({
        name: "Donor Portal",
        type: "platform",
      }),
    ]);
  });

  it("creates and restores an isolated caregiver workspace session", () => {
    const user = startDemoSession("caregiver");

    expect(user).toMatchObject({
      display_name: "Sara Caregiver",
      primary_role: "caregiver",
      active_organization_id: "caregiver-tracking",
    });
    expect(restoreDemoSession()?.organizations).toEqual([
      expect.objectContaining({
        name: "Caregiver Tracking",
        type: "platform",
      }),
    ]);
  });
});
