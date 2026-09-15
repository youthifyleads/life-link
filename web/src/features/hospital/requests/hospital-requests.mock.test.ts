import { describe, expect, it } from "vitest";
import {
  availableBloodBanks,
  createHospitalRequest,
  getAvailableBloodBanks,
  getHospitalRequest,
} from "./hospital-requests.mock";

describe("hospital-requests.mock", () => {
  it("returns list of available blood banks with inventory posture", async () => {
    const banks = await getAvailableBloodBanks();
    expect(banks.length).toBeGreaterThanOrEqual(3);
    expect(banks[0]).toHaveProperty("id");
    expect(banks[0]).toHaveProperty("name");
    expect(banks[0]).toHaveProperty("facilityCode");
    expect(banks[0]).toHaveProperty("governorate");
    expect(banks[0]).toHaveProperty("availabilitySummary");
  });

  it("creates a hospital blood request with selected blood bank", async () => {
    const targetBank = availableBloodBanks[1]; // Nile Regional Blood Bank
    const newRequest = await createHospitalRequest({
      bloodBankId: targetBank.id,
      bloodGroup: "O−",
      component: "red_cells",
      quantity: 3,
      urgency: "emergency",
      requiredAt: "2026-09-12T12:00:00Z",
      reason: "Emergency protocol blood transfusion",
      notes: "Operating room 2",
    });

    expect(newRequest.id).toMatch(/^BR-2026-/);
    expect(newRequest.bloodBankId).toBe(targetBank.id);
    expect(newRequest.targetBloodBank.id).toBe(targetBank.id);
    expect(newRequest.targetBloodBank.name).toBe(targetBank.name);
    expect(newRequest.status).toBe("submitted");
    expect(newRequest.history[0]?.note).toContain(targetBank.name);

    // Verify retrieval by id
    const retrieved = await getHospitalRequest(newRequest.id);
    expect(retrieved?.id).toBe(newRequest.id);
    expect(retrieved?.targetBloodBank.name).toBe(targetBank.name);
  });

  it("handles failure flag properly", async () => {
    await expect(
      createHospitalRequest(
        {
          bloodBankId: "central-blood-bank",
          bloodGroup: "A+",
          component: "platelets",
          quantity: 1,
          urgency: "routine",
          requiredAt: "2026-09-12T12:00:00Z",
          reason: "Routine pre-op",
        },
        true,
      ),
    ).rejects.toThrow(/could not save this request/);
  });

  it("re-routes a rejected requisition to an alternative blood bank", async () => {
    const { rerouteHospitalRequest } = await import("./hospital-requests.mock");
    const targetBank = availableBloodBanks[1]; // Nile Regional

    const rerouted = await rerouteHospitalRequest(
      "BR-2026-1049",
      targetBank.id,
      "Stock depleted at primary; urgent re-routing.",
    );

    expect(rerouted.id).toBe("BR-2026-1049");
    expect(rerouted.bloodBankId).toBe(targetBank.id);
    expect(rerouted.targetBloodBank.name).toBe(targetBank.name);
    expect(rerouted.status).toBe("submitted");
    expect(
      rerouted.history[rerouted.history.length - 1]?.note,
    ).toContain(targetBank.name);
  });

  it("retrieves all hospital supporting documents and supports upload", async () => {
    const { getHospitalAllDocuments, uploadHospitalDocumentToRequest } =
      await import("./hospital-requests.mock");

    const docs = await getHospitalAllDocuments();
    expect(docs.length).toBeGreaterThanOrEqual(1);
    expect(docs[0]).toHaveProperty("requestId");
    expect(docs[0]).toHaveProperty("bloodGroup");
    expect(docs[0]).toHaveProperty("targetBloodBankName");

    const uploadRes = await uploadHospitalDocumentToRequest("BR-2026-1048", {
      name: "crossmatch-compatibility.pdf",
      sizeBytes: 256000,
      mimeType: "application/pdf",
    });

    expect(uploadRes.document.name).toBe("crossmatch-compatibility.pdf");
    expect(uploadRes.document.requestId).toBe("BR-2026-1048");
    expect(uploadRes.request.documents.some((d) => d.name === "crossmatch-compatibility.pdf")).toBe(true);
  });
});
