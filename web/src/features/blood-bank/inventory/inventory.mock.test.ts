import { beforeEach, describe, expect, it } from "vitest";

import {
  getBloodStockMatrix,
  getInventoryKPIs,
  getInventoryUnits,
  getInventoryWarnings,
  lookupBloodUnit,
  registerBloodUnits,
  resetInventoryMock,
  updateBloodUnitStatus,
} from "@/features/blood-bank/inventory/inventory.mock";
import {
  allocateUnitsToRequest,
  deallocateUnitFromRequest,
  getBloodUnits,
  resetBloodBankMockRequests,
} from "@/features/blood-bank/requests/blood-bank-requests.mock";

describe("Blood Bank Inventory & Shared Store (Single Source of Truth)", () => {
  beforeEach(() => {
    resetInventoryMock();
    resetBloodBankMockRequests();
  });

  it("calculates accurate inventory KPIs matching seed data", async () => {
    const kpis = await getInventoryKPIs();
    expect(kpis.totalAvailable).toBeGreaterThan(0);
    expect(kpis.reservedUnits).toBeGreaterThan(0);
    expect(kpis.quarantinedUnits).toBeGreaterThan(0);
    expect(kpis.expiringSoon).toBeGreaterThan(0);
    expect(kpis.criticalLowStockGroups).toContain("O−");
    expect(kpis.criticalLowStockGroups).toContain("AB−");
  });

  it("builds blood stock matrix for all 8 ABO/Rh groups and components", async () => {
    const matrix = await getBloodStockMatrix();
    expect(matrix.length).toBe(8 * 5); // 8 groups * 5 components

    const oNegRbc = matrix.find(
      (c) => c.bloodGroup === "O−" && c.component === "red_cells",
    );
    expect(oNegRbc).toBeDefined();
    expect(oNegRbc?.available).toBe(3);

    const abNegPlasma = matrix.find(
      (c) => c.bloodGroup === "AB−" && c.component === "fresh_frozen_plasma",
    );
    expect(abNegPlasma).toBeDefined();
    expect(abNegPlasma?.available).toBe(0);
    expect(abNegPlasma?.condition).toBe("critical");
  });

  it("detects operational warnings: critical shortage, expired units, expiring in 24h/48h", async () => {
    const warnings = await getInventoryWarnings();

    // Critical shortage for O- and AB-
    const oNegWarning = warnings.find((w) => w.id === "warn-crit-o-neg");
    expect(oNegWarning).toBeDefined();
    expect(oNegWarning?.type).toBe("critical");

    const abNegWarning = warnings.find((w) => w.id === "warn-crit-ab-neg");
    expect(abNegWarning).toBeDefined();

    // Expired unit warning
    const expiredWarning = warnings.find((w) => w.id === "warn-expired-units");
    expect(expiredWarning).toBeDefined();
    expect(expiredWarning?.type).toBe("critical");

    // Expiring soon warnings
    const exp24Warning = warnings.find((w) => w.id === "warn-expiring-24h");
    expect(exp24Warning).toBeDefined();
    expect(exp24Warning?.type).toBe("warning");
  });

  it("filters inventory ledger by group, component, status, and search", async () => {
    // Filter by group O-
    const oNegUnits = await getInventoryUnits({ bloodGroup: "O−" });
    expect(oNegUnits.length).toBeGreaterThan(0);
    expect(oNegUnits.every((u) => u.bloodGroup === "O−")).toBe(true);

    // Filter by component platelets
    const platelets = await getInventoryUnits({ component: "platelets" });
    expect(platelets.length).toBeGreaterThan(0);
    expect(platelets.every((u) => u.component === "platelets")).toBe(true);

    // Filter by status allocated
    const allocated = await getInventoryUnits({ status: "allocated" });
    expect(allocated.length).toBeGreaterThan(0);
    expect(allocated.every((u) => u.status === "allocated")).toBe(true);

    // Search query
    const searchRes = await getInventoryUnits({ search: "UNT-O-NEG-0142" });
    expect(searchRes.length).toBe(1);
    expect(searchRes[0].id).toBe("UNT-O-NEG-0142");
  });

  it("registers new blood units with initial custody event and updates available stock", async () => {
    const initialKpis = await getInventoryKPIs();

    const created = await registerBloodUnits({
      bloodGroup: "O+",
      component: "whole_blood",
      collectionDate: "2026-09-09",
      expiryDate: "2026-10-14",
      quantity: 2,
      storageLocation: "Fridge C — Shelf 3",
      notes: "Donor drive batch 41",
    });

    expect(created.length).toBe(2);
    expect(created[0].bloodGroup).toBe("O+");
    expect(created[0].status).toBe("available");
    expect(created[0].custodyEvents?.length).toBe(1);
    expect(created[0].custodyEvents?.[0].event).toBe("registered");

    const updatedKpis = await getInventoryKPIs();
    expect(updatedKpis.totalAvailable).toBe(initialKpis.totalAvailable + 2);

    // Newly registered units immediately appear in request allocation pool
    const poolUnits = await getBloodUnits({ bloodGroup: "O+" });
    expect(poolUnits.some((u) => u.id === created[0].id)).toBe(true);
  });

  it("maintains strict single-source synchronization between request allocation, inventory ledger, and QR tracking", async () => {
    const targetUnitId = "UNT-O-NEG-0142";
    const requestId = "BR-2026-2194";

    // 1. Initial state: unit is available
    const initialLookup = await lookupBloodUnit(targetUnitId);
    expect(initialLookup?.status).toBe("available");
    expect(initialLookup?.allocatedRequestId).toBeUndefined();

    // 2. Hospital request allocates unit
    const allocationResult = await allocateUnitsToRequest(requestId, [targetUnitId]);
    expect(allocationResult.request.allocatedUnitIds).toContain(targetUnitId);

    // 3. Check shared store via lookupBloodUnit (QR Tracking)
    const trackedAfterAllocation = await lookupBloodUnit(targetUnitId);
    expect(trackedAfterAllocation?.status).toBe("allocated");
    expect(trackedAfterAllocation?.allocatedRequestId).toBe(requestId);

    // Check that custody timeline has recorded the allocation
    const latestEvent =
      trackedAfterAllocation?.custodyEvents?.[
        trackedAfterAllocation.custodyEvents.length - 1
      ];
    expect(latestEvent?.event).toBe("allocated");
    expect(latestEvent?.relatedRequestId).toBe(requestId);

    // 4. Check inventory ledger reflection
    const allocatedLedger = await getInventoryUnits({ status: "allocated" });
    expect(allocatedLedger.some((u) => u.id === targetUnitId)).toBe(true);

    // 5. Deallocate unit
    await deallocateUnitFromRequest(requestId, targetUnitId);
    const trackedAfterDeallocation = await lookupBloodUnit(targetUnitId);
    expect(trackedAfterDeallocation?.status).toBe("available");
    expect(trackedAfterDeallocation?.allocatedRequestId).toBeUndefined();

    const deallocEvent =
      trackedAfterDeallocation?.custodyEvents?.[
        trackedAfterDeallocation.custodyEvents.length - 1
      ];
    expect(deallocEvent?.event).toBe("deallocated");
  });

  it("updates unit status to quarantined and records audit custody event", async () => {
    const unitId = "UNT-O-NEG-0144";
    const updated = await updateBloodUnitStatus(
      unitId,
      "quarantined",
      "Quarantine Bay 3",
      "Flagged for lipemic inspection",
    );

    expect(updated.status).toBe("quarantined");
    expect(updated.storageLocation).toBe("Quarantine Bay 3");

    const lastEvent = updated.custodyEvents?.[updated.custodyEvents.length - 1];
    expect(lastEvent?.event).toBe("quarantined");
    expect(lastEvent?.location).toBe("Quarantine Bay 3");
    expect(lastEvent?.notes).toBe("Flagged for lipemic inspection");
  });
});
