import { afterEach, describe, expect, it } from "vitest";

import {
  allocateUnitsToRequest,
  deallocateUnitFromRequest,
  getAvailableActions,
  getBloodBankRequestById,
  getBloodBankRequests,
  getBloodUnits,
  reserveUnitsForRequest,
  resetBloodBankMockRequests,
  transitionBloodBankRequest,
  updateDocumentReviewStatus,
} from "@/features/blood-bank/requests/blood-bank-requests.mock";

describe("blood bank mock request workflow", () => {
  afterEach(() => {
    resetBloodBankMockRequests();
  });

  it("exposes only valid actions for the current status", async () => {
    const requests = await getBloodBankRequests();
    const submitted = requests.find(
      (request) => request.status === "submitted",
    );
    const completed = requests.find(
      (request) => request.status === "completed",
    );

    expect(submitted && getAvailableActions(submitted)).toEqual([
      "acknowledge",
      "reject",
    ]);
    expect(completed && getAvailableActions(completed)).toEqual([]);
  });

  it("moves a request through a valid local transition and records history", async () => {
    const updated = await transitionBloodBankRequest(
      "BR-2026-2194",
      "acknowledge",
    );

    expect(updated.status).toBe("acknowledged");
    expect(updated.history.at(-1)).toMatchObject({
      status: "acknowledged",
      actor: "Mariam Blood Bank User",
    });
  });

  it("rejects an invalid workflow transition", async () => {
    await expect(
      transitionBloodBankRequest("BR-2026-2190", "confirm"),
    ).rejects.toThrow("cannot be moved from completed");
  });

  it("retrieves a blood request by ID with documents and unit allocations", async () => {
    const request = await getBloodBankRequestById("BR-2026-2194");
    expect(request).toBeDefined();
    expect(request?.id).toBe("BR-2026-2194");
    expect(request?.documents.length).toBeGreaterThan(0);
    expect(request?.clinicalReason).toBeTruthy();
  });

  it("allocates and deallocates units to a request", async () => {
    const units = await getBloodUnits({ bloodGroup: "O−" });
    const targetUnit = units.find((u) => u.status === "available");
    expect(targetUnit).toBeDefined();

    const { request: afterAllocation, units: updatedUnits } =
      await allocateUnitsToRequest("BR-2026-2194", [targetUnit!.id]);

    expect(afterAllocation.allocatedUnitIds).toContain(targetUnit!.id);
    const allocatedUnitInStore = updatedUnits.find((u) => u.id === targetUnit!.id);
    expect(allocatedUnitInStore?.status).toBe("allocated");

    const { request: afterDeallocation } = await deallocateUnitFromRequest(
      "BR-2026-2194",
      targetUnit!.id,
    );
    expect(afterDeallocation.allocatedUnitIds).not.toContain(targetUnit!.id);
  });

  it("reserves units for a request", async () => {
    const units = await getBloodUnits({ bloodGroup: "O−" });
    const targetUnit = units.find((u) => u.status === "available");
    expect(targetUnit).toBeDefined();

    const { request: afterReservation, units: updatedUnits } =
      await reserveUnitsForRequest("BR-2026-2194", [targetUnit!.id]);

    expect(afterReservation.allocatedUnitIds).toContain(targetUnit!.id);
    const reservedUnit = updatedUnits.find((u) => u.id === targetUnit!.id);
    expect(reservedUnit?.status).toBe("reserved");
  });

  it("updates document review status", async () => {
    const updated = await updateDocumentReviewStatus(
      "BR-2026-2194",
      "doc-2194-2",
      "accepted",
    );
    const doc = updated.documents.find((d) => d.id === "doc-2194-2");
    expect(doc?.reviewStatus).toBe("accepted");
  });

  it("records rejection reason in event history when rejecting", async () => {
    const updated = await transitionBloodBankRequest(
      "BR-2026-2194",
      "reject",
      { rejectReason: "Crossmatch incompatibility detected on preliminary test." },
    );
    expect(updated.status).toBe("rejected");
    expect(updated.history.at(-1)?.note).toContain("Crossmatch incompatibility");
  });

  it("retrieves all blood bank documents across incoming hospital requests", async () => {
    const { getBloodBankAllDocuments } = await import(
      "./blood-bank-requests.mock"
    );
    const docs = await getBloodBankAllDocuments();
    expect(docs.length).toBeGreaterThanOrEqual(2);
    expect(docs[0]).toHaveProperty("requestId");
    expect(docs[0]).toHaveProperty("hospital");
    expect(docs[0]).toHaveProperty("bloodGroup");
  });

  it("automatically releases allocated units back to available inventory when requisition is rejected", async () => {
    const { allocateUnitsToRequest } = await import(
      "./blood-bank-requests.mock"
    );
    const { getSharedBloodUnitsDirect } = await import(
      "@/features/blood-bank/inventory/inventory.mock"
    );

    // Pick an available unit
    const available = getSharedBloodUnitsDirect().find(
      (u) => u.status === "available" && u.bloodGroup === "A+",
    );
    expect(available).toBeDefined();

    // Allocate unit to BR-2026-2193
    await allocateUnitsToRequest("BR-2026-2193", [available!.id]);
    expect(
      getSharedBloodUnitsDirect().find((u) => u.id === available!.id)?.status,
    ).toBe("allocated");

    // Reject BR-2026-2193
    const rejected = await transitionBloodBankRequest("BR-2026-2193", "reject", {
      rejectReason: "Hospital clinical cancellation after allocation.",
    });

    expect(rejected.status).toBe("rejected");
    expect(rejected.allocatedUnitIds.length).toBe(0);

    // Verify unit status was restored to "available"
    const restoredUnit = getSharedBloodUnitsDirect().find(
      (u) => u.id === available!.id,
    );
    expect(restoredUnit?.status).toBe("available");
    expect(restoredUnit?.allocatedRequestId).toBeUndefined();
  });
});
