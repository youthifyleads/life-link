import { lookupBloodUnit } from "@/features/blood-bank/inventory/inventory.mock";
import type { BloodUnit } from "@/features/blood-bank/types/blood-bank.types";
import type {
  CaregiverCustodyMilestone,
  CaregiverTrackingUnit,
  CaregiverUnitStatus,
} from "@/features/caregiver/types/caregiver.types";

const delay = (ms = 80) => new Promise((resolve) => setTimeout(resolve, ms));

function projectToCaregiverUnit(unit: BloodUnit): CaregiverTrackingUnit {
  let status: CaregiverUnitStatus = "available";
  let statusLabel = "Available in Central Reserve";
  let destinationHospital = "Central Blood Bank";
  let currentLocation = unit.storageLocation;

  if (unit.allocatedRequestId === "BR-2026-2192") {
    destinationHospital = "Cairo University Specialized Hospital";
    status = "received_at_hospital";
    statusLabel = "Received at Hospital - Cold Storage Ready";
    currentLocation =
      "Cairo University Specialized Hospital - Surgical Cold Storage";
  } else if (unit.allocatedRequestId === "BR-2026-2191") {
    destinationHospital = "Al-Galaa Military Hospital";
    status = "in_transit";
    statusLabel = "In Transit via Monitored Cold Transport";
    currentLocation = "Active Dispatch Vehicle (Cairo - Route 4)";
  } else if (unit.status === "allocated") {
    destinationHospital = "Accredited Clinical Partner";
    status = "allocated";
    statusLabel = "Allocated for Hospital Transfer";
    currentLocation = "Central Dispatch Holding Dock";
  } else if (unit.status === "quarantined") {
    status = "quarantined";
    statusLabel = "Under Quality Verification";
    currentLocation = "Central Testing Facility";
  }

  // Filter custody events to sanitize caregiver visibility:
  // Remove administrative notes, staff IDs, internal shelf/bin numbers, or clinical diagnosis.
  const rawEvents = unit.custodyEvents ?? [];
  const milestones: CaregiverCustodyMilestone[] = rawEvents.map((evt, idx) => {
    let friendlyTitle = evt.title;
    let friendlySummary =
      "Verified step logged in the national cold-chain tracking ledger.";

    if (evt.event === "registered") {
      friendlyTitle = "Blood Unit Registered & Verified";
      friendlySummary =
        "Blood bag processed, serology screening confirmed, and temperature-controlled storage initiated.";
    } else if (evt.event === "allocated") {
      friendlyTitle = "Allocated to Patient Hospital Transfer";
      friendlySummary = `Unit linked for transfer to ${destinationHospital}.`;
    } else if (evt.event === "prepared") {
      friendlyTitle = "Cold-Box Packing Completed";
      friendlySummary =
        "Unit sealed in certified 2°C–6°C insulated transport container with active temperature logger.";
    } else if (evt.event === "released") {
      friendlyTitle = "Dispatched for Transit";
      friendlySummary =
        "Courier departure recorded under monitored cold-chain supervision.";
    } else if (evt.event === "handoff_completed") {
      friendlyTitle = "Received at Hospital";
      friendlySummary = `Safe handover confirmed at ${destinationHospital} transfusion desk.`;
    }

    return {
      id: evt.id || `milestone-${idx}`,
      title: friendlyTitle,
      timestamp: evt.timestamp,
      location: evt.location.split("-")[0]?.trim() || evt.location,
      summary: friendlySummary,
    };
  });

  return {
    reference: unit.id,
    bloodGroup: unit.bloodGroup,
    component: unit.component,
    status,
    statusLabel,
    currentLocation,
    lastUpdated: unit.updatedAt || unit.collectionDate,
    destinationHospital,
    verifiedColdChain: true,
    milestones,
  };
}

// Pre-assigned tracked units for caregiver Sara Caregiver
const caregiverTrackedReferences = ["UNT-B-POS-0331", "UNT-AB-POS-0451"];

export async function getCaregiverDashboardUnits(): Promise<
  CaregiverTrackingUnit[]
> {
  await delay();
  const results: CaregiverTrackingUnit[] = [];

  for (const ref of caregiverTrackedReferences) {
    const raw = await lookupBloodUnit(ref);
    if (raw) {
      results.push(projectToCaregiverUnit(raw));
    }
  }

  return results;
}

export async function lookupCaregiverUnit(
  referenceOrCode: string,
): Promise<CaregiverTrackingUnit | null> {
  await delay();
  if (!referenceOrCode.trim()) return null;

  const raw = await lookupBloodUnit(referenceOrCode.trim());
  if (!raw) return null;

  return projectToCaregiverUnit(raw);
}
