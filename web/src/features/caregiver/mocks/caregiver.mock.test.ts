import { describe, expect, it } from "vitest";

import {
  getCaregiverDashboardUnits,
  lookupCaregiverUnit,
} from "@/features/caregiver/mocks/caregiver.mock";

describe("Caregiver Mock Repository & Privacy Projection", () => {
  it("retrieves assigned tracking units for caregiver dashboard", async () => {
    const units = await getCaregiverDashboardUnits();
    expect(units.length).toBeGreaterThanOrEqual(1);

    const unit = units[0];
    expect(unit.reference).toBe("UNT-B-POS-0331");
    expect(unit.bloodGroup).toBe("B+");
    expect(unit.component).toBe("fresh_frozen_plasma");
    expect(unit.destinationHospital).toContain("Cairo University");
  });

  it("looks up an active blood unit by reference and maps safe status", async () => {
    const unit = await lookupCaregiverUnit("UNT-B-POS-0331");
    expect(unit).not.toBeNull();
    expect(unit?.reference).toBe("UNT-B-POS-0331");
    expect(unit?.status).toBe("received_at_hospital");
    expect(unit?.verifiedColdChain).toBe(true);
  });

  it("strictly enforces privacy boundaries and decouples clinical notes", async () => {
    const unit = await lookupCaregiverUnit("UNT-B-POS-0331");
    expect(unit).not.toBeNull();

    // Verify raw staff identifiers, patient clinical notes, and private diagnosis are absent
    const unitString = JSON.stringify(unit);
    expect(unitString).not.toContain("C-Section");
    expect(unitString).not.toContain("Placenta Previa");
    expect(unitString).not.toContain("patient_id");

    // Milestones must exist and be sanitized
    expect(unit?.milestones.length).toBeGreaterThan(0);
    const firstMilestone = unit?.milestones[0];
    expect(firstMilestone?.title).toBeDefined();
    expect(firstMilestone?.summary).toBeDefined();
  });

  it("returns null when searching for an unknown reference", async () => {
    const result = await lookupCaregiverUnit("UNT-UNKNOWN-9999");
    expect(result).toBeNull();
  });
});
