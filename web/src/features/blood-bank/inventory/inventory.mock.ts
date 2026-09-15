import type {
  BloodBankComponent,
  BloodStockMatrixCell,
  BloodUnit,
  BloodUnitIntakePayload,
  BloodUnitStatus,
  CustodyEvent,
  InventoryKPIs,
  InventoryLedgerFilters,
  InventoryWarning,
} from "@/features/blood-bank/types/blood-bank.types";
import type { BloodGroup } from "@/shared/components/clinical/clinical.types";

const mockLatency = 180;

function waitForMock<T>(value: T): Promise<T> {
  return new Promise<T>((resolve) => {
    window.setTimeout(() => resolve(value), mockLatency);
  });
}

export const ALL_BLOOD_GROUPS: BloodGroup[] = [
  "A+",
  "A−",
  "B+",
  "B−",
  "AB+",
  "AB−",
  "O+",
  "O−",
];

export const ALL_COMPONENTS: BloodBankComponent[] = [
  "red_cells",
  "platelets",
  "fresh_frozen_plasma",
  "whole_blood",
  "cryoprecipitate",
];

// Baseline seed blood units
const initialUnits: BloodUnit[] = [
  // O- Red Blood Cells (Universal Donor - Critical High Demand)
  {
    id: "UNT-O-NEG-0142",
    bloodGroup: "O−",
    component: "red_cells",
    collectionDate: "2026-08-28",
    expiryDate: "2026-10-09",
    storageLocation: "Fridge A — Shelf 2",
    status: "available",
    registeredAt: "2026-08-28T10:15:00+03:00",
    updatedAt: "2026-08-28T14:30:00+03:00",
    custodyEvents: [
      {
        id: "evt-0142-1",
        event: "registered",
        title: "Intake & Serology Clearance",
        timestamp: "2026-08-28T10:15:00+03:00",
        location: "Central Blood Bank — Intake Bay",
        actor: "Donation Center Staff",
        role: "Phlebotomist",
        notes: "Unit collected and cleared initial infectious disease testing.",
      },
      {
        id: "evt-0142-2",
        event: "released",
        title: "Stored in Cold Chain",
        timestamp: "2026-08-28T14:30:00+03:00",
        location: "Central Blood Bank — Fridge A (Shelf 2)",
        actor: "Mariam Blood Bank User",
        role: "Blood Bank Staff",
        notes: "Temperature monitored at +4°C verified compliant.",
      },
    ],
  },
  {
    id: "UNT-O-NEG-0143",
    bloodGroup: "O−",
    component: "red_cells",
    collectionDate: "2026-08-29",
    expiryDate: "2026-10-10",
    storageLocation: "Fridge A — Shelf 2",
    status: "available",
    registeredAt: "2026-08-29T11:00:00+03:00",
    updatedAt: "2026-08-29T15:00:00+03:00",
    custodyEvents: [
      {
        id: "evt-0143-1",
        event: "registered",
        title: "Intake & Serology Clearance",
        timestamp: "2026-08-29T11:00:00+03:00",
        location: "Central Blood Bank — Intake Bay",
        actor: "Donation Center Staff",
        role: "Phlebotomist",
      },
    ],
  },
  {
    id: "UNT-O-NEG-0144",
    bloodGroup: "O−",
    component: "red_cells",
    collectionDate: "2026-08-30",
    expiryDate: "2026-10-11",
    storageLocation: "Fridge A — Shelf 2",
    status: "available",
    registeredAt: "2026-08-30T09:30:00+03:00",
    updatedAt: "2026-08-30T13:00:00+03:00",
    custodyEvents: [
      {
        id: "evt-0144-1",
        event: "registered",
        title: "Intake & Serology Clearance",
        timestamp: "2026-08-30T09:30:00+03:00",
        location: "Central Blood Bank — Intake Bay",
        actor: "Donation Center Staff",
        role: "Phlebotomist",
      },
    ],
  },
  {
    id: "UNT-O-NEG-0991",
    bloodGroup: "O−",
    component: "red_cells",
    collectionDate: "2026-08-10",
    expiryDate: "2026-09-08",
    storageLocation: "Quarantine Bay 1",
    status: "expired",
    notes: "Unit expired before assignment. Flagged for biohazard decontamination.",
    registeredAt: "2026-08-10T12:00:00+03:00",
    updatedAt: "2026-09-08T23:59:00+03:00",
    custodyEvents: [
      {
        id: "evt-0991-1",
        event: "registered",
        title: "Intake & Serology Clearance",
        timestamp: "2026-08-10T12:00:00+03:00",
        location: "Central Blood Bank — Intake Bay",
        actor: "Donation Center Staff",
        role: "Phlebotomist",
      },
      {
        id: "evt-0991-2",
        event: "expired",
        title: "Cold Chain Expiry Auto-Flag",
        timestamp: "2026-09-08T23:59:00+03:00",
        location: "Quarantine Bay 1",
        actor: "System Audit Monitor",
        role: "Quality Control",
        notes: "Exceeded 42-day red cell storage window.",
      },
    ],
  },
  {
    id: "UNT-O-NEG-0992",
    bloodGroup: "O−",
    component: "red_cells",
    collectionDate: "2026-09-01",
    expiryDate: "2026-10-13",
    storageLocation: "Quarantine Bay 2",
    status: "quarantined",
    notes: "Atypical antibody flagged during secondary screening. Awaiting lab verification.",
    registeredAt: "2026-09-01T08:00:00+03:00",
    updatedAt: "2026-09-02T10:00:00+03:00",
    custodyEvents: [
      {
        id: "evt-0992-1",
        event: "registered",
        title: "Intake & Serology Clearance",
        timestamp: "2026-09-01T08:00:00+03:00",
        location: "Central Blood Bank — Intake Bay",
        actor: "Donation Center Staff",
        role: "Phlebotomist",
      },
      {
        id: "evt-0992-2",
        event: "quarantined",
        title: "Quarantined for Secondary Immunohematology Assay",
        timestamp: "2026-09-02T10:00:00+03:00",
        location: "Quarantine Bay 2",
        actor: "Mariam Blood Bank User",
        role: "Blood Bank Staff",
        notes: "Pending confirmation from reference laboratory.",
      },
    ],
  },

  // A+ Platelets (Short Shelf Life - Expiring Soon)
  {
    id: "UNT-A-POS-0211",
    bloodGroup: "A+",
    component: "platelets",
    collectionDate: "2026-09-05",
    expiryDate: "2026-09-10T14:00:00+03:00", // within 24h
    storageLocation: "Agitator 1 — Tray B",
    status: "available",
    registeredAt: "2026-09-05T09:00:00+03:00",
    updatedAt: "2026-09-05T12:00:00+03:00",
    custodyEvents: [
      {
        id: "evt-0211-1",
        event: "registered",
        title: "Apheresis Collection & Bacterial Culture",
        timestamp: "2026-09-05T09:00:00+03:00",
        location: "Central Apheresis Suite",
        actor: "Apheresis Technician",
        role: "Specialist",
        notes: "Platelet agitator storage initiated at 22°C with continuous agitation.",
      },
    ],
  },
  {
    id: "UNT-A-POS-0212",
    bloodGroup: "A+",
    component: "platelets",
    collectionDate: "2026-09-06",
    expiryDate: "2026-09-11T16:00:00+03:00", // within 48h
    storageLocation: "Agitator 1 — Tray B",
    status: "available",
    registeredAt: "2026-09-06T10:00:00+03:00",
    updatedAt: "2026-09-06T13:00:00+03:00",
    custodyEvents: [
      {
        id: "evt-0212-1",
        event: "registered",
        title: "Apheresis Collection & Bacterial Culture",
        timestamp: "2026-09-06T10:00:00+03:00",
        location: "Central Apheresis Suite",
        actor: "Apheresis Technician",
        role: "Specialist",
      },
    ],
  },
  {
    id: "UNT-A-POS-0213",
    bloodGroup: "A+",
    component: "platelets",
    collectionDate: "2026-09-07",
    expiryDate: "2026-09-12T18:00:00+03:00",
    storageLocation: "Agitator 1 — Tray C",
    status: "available",
    registeredAt: "2026-09-07T14:00:00+03:00",
    updatedAt: "2026-09-07T16:00:00+03:00",
    custodyEvents: [
      {
        id: "evt-0213-1",
        event: "registered",
        title: "Apheresis Collection",
        timestamp: "2026-09-07T14:00:00+03:00",
        location: "Central Apheresis Suite",
        actor: "Apheresis Technician",
        role: "Specialist",
      },
    ],
  },

  // B+ Plasma (Allocated to Hospital Request BR-2026-2192)
  {
    id: "UNT-B-POS-0331",
    bloodGroup: "B+",
    component: "fresh_frozen_plasma",
    collectionDate: "2026-08-15",
    expiryDate: "2027-08-15",
    storageLocation: "Deep Freezer 2 — Rack A",
    status: "allocated",
    allocatedRequestId: "BR-2026-2192",
    registeredAt: "2026-08-15T08:00:00+03:00",
    updatedAt: "2026-09-08T07:30:00+03:00",
    custodyEvents: [
      {
        id: "evt-0331-1",
        event: "registered",
        title: "Plasma Fractionation & Flash Freezing",
        timestamp: "2026-08-15T08:00:00+03:00",
        location: "Central Processing Lab",
        actor: "Processing Specialist",
        role: "Lab Technologist",
        notes: "Frozen within 8 hours of phlebotomy to preserve Factor VIII.",
      },
      {
        id: "evt-0331-2",
        event: "reserved",
        title: "Reserved for Cross-Match",
        timestamp: "2026-09-07T11:00:00+03:00",
        location: "Deep Freezer 2 — Rack A",
        actor: "Mariam Blood Bank User",
        role: "Blood Bank Staff",
        relatedRequestId: "BR-2026-2192",
      },
      {
        id: "evt-0331-3",
        event: "allocated",
        title: "Allocated to Hospital Blood Request",
        timestamp: "2026-09-08T07:30:00+03:00",
        location: "Deep Freezer 2 — Rack A",
        actor: "Mariam Blood Bank User",
        role: "Blood Bank Staff",
        relatedRequestId: "BR-2026-2192",
        notes: "Allocated for surgical ICU support at Nile Specialist Hospital.",
      },
    ],
  },
  {
    id: "UNT-B-POS-0332",
    bloodGroup: "B+",
    component: "fresh_frozen_plasma",
    collectionDate: "2026-08-16",
    expiryDate: "2027-08-16",
    storageLocation: "Deep Freezer 2 — Rack A",
    status: "allocated",
    allocatedRequestId: "BR-2026-2192",
    registeredAt: "2026-08-16T09:00:00+03:00",
    updatedAt: "2026-09-08T07:30:00+03:00",
    custodyEvents: [
      {
        id: "evt-0332-1",
        event: "registered",
        title: "Plasma Fractionation",
        timestamp: "2026-08-16T09:00:00+03:00",
        location: "Central Processing Lab",
        actor: "Processing Specialist",
        role: "Lab Technologist",
      },
      {
        id: "evt-0332-2",
        event: "allocated",
        title: "Allocated to Hospital Blood Request",
        timestamp: "2026-09-08T07:30:00+03:00",
        location: "Deep Freezer 2 — Rack A",
        actor: "Mariam Blood Bank User",
        role: "Blood Bank Staff",
        relatedRequestId: "BR-2026-2192",
      },
    ],
  },

  // AB+ Red Blood Cells (Allocated to Hospital Request BR-2026-2191)
  {
    id: "UNT-AB-POS-0451",
    bloodGroup: "AB+",
    component: "red_cells",
    collectionDate: "2026-08-25",
    expiryDate: "2026-10-06",
    storageLocation: "Fridge B — Shelf 1",
    status: "allocated",
    allocatedRequestId: "BR-2026-2191",
    registeredAt: "2026-08-25T13:00:00+03:00",
    updatedAt: "2026-09-07T15:00:00+03:00",
    custodyEvents: [
      {
        id: "evt-0451-1",
        event: "registered",
        title: "Unit Intake & Serology Test",
        timestamp: "2026-08-25T13:00:00+03:00",
        location: "Intake Bay",
        actor: "Donation Center Staff",
        role: "Phlebotomist",
      },
      {
        id: "evt-0451-2",
        event: "allocated",
        title: "Allocated to Request BR-2026-2191",
        timestamp: "2026-09-07T15:00:00+03:00",
        location: "Fridge B — Shelf 1",
        actor: "Mariam Blood Bank User",
        role: "Blood Bank Staff",
        relatedRequestId: "BR-2026-2191",
      },
    ],
  },
  {
    id: "UNT-AB-POS-0452",
    bloodGroup: "AB+",
    component: "red_cells",
    collectionDate: "2026-08-26",
    expiryDate: "2026-10-07",
    storageLocation: "Fridge B — Shelf 1",
    status: "allocated",
    allocatedRequestId: "BR-2026-2191",
    registeredAt: "2026-08-26T10:00:00+03:00",
    updatedAt: "2026-09-07T15:00:00+03:00",
    custodyEvents: [
      {
        id: "evt-0452-1",
        event: "registered",
        title: "Unit Intake",
        timestamp: "2026-08-26T10:00:00+03:00",
        location: "Intake Bay",
        actor: "Donation Center Staff",
        role: "Phlebotomist",
      },
      {
        id: "evt-0452-2",
        event: "allocated",
        title: "Allocated to Request BR-2026-2191",
        timestamp: "2026-09-07T15:00:00+03:00",
        location: "Fridge B — Shelf 1",
        actor: "Mariam Blood Bank User",
        role: "Blood Bank Staff",
        relatedRequestId: "BR-2026-2191",
      },
    ],
  },

  // O+ Whole Blood & Red Cells (Healthy Stock)
  {
    id: "UNT-O-POS-0511",
    bloodGroup: "O+",
    component: "whole_blood",
    collectionDate: "2026-08-27",
    expiryDate: "2026-10-01",
    storageLocation: "Fridge C — Shelf 1",
    status: "available",
    registeredAt: "2026-08-27T10:00:00+03:00",
    updatedAt: "2026-08-27T11:00:00+03:00",
    custodyEvents: [
      {
        id: "evt-0511-1",
        event: "registered",
        title: "Whole Blood Collection",
        timestamp: "2026-08-27T10:00:00+03:00",
        location: "Mobile Donation Unit 3",
        actor: "Mobile Drive Lead",
        role: "Nurse",
      },
    ],
  },
  {
    id: "UNT-O-POS-0512",
    bloodGroup: "O+",
    component: "red_cells",
    collectionDate: "2026-09-01",
    expiryDate: "2026-10-13",
    storageLocation: "Fridge C — Shelf 2",
    status: "available",
    registeredAt: "2026-09-01T09:00:00+03:00",
    updatedAt: "2026-09-01T10:00:00+03:00",
    custodyEvents: [
      {
        id: "evt-0512-1",
        event: "registered",
        title: "Component Separation",
        timestamp: "2026-09-01T09:00:00+03:00",
        location: "Component Lab",
        actor: "Donation Center Staff",
        role: "Phlebotomist",
      },
    ],
  },
  {
    id: "UNT-O-POS-0513",
    bloodGroup: "O+",
    component: "red_cells",
    collectionDate: "2026-09-02",
    expiryDate: "2026-10-14",
    storageLocation: "Fridge C — Shelf 2",
    status: "available",
    registeredAt: "2026-09-02T11:00:00+03:00",
    updatedAt: "2026-09-02T12:00:00+03:00",
    custodyEvents: [
      {
        id: "evt-0513-1",
        event: "registered",
        title: "Component Separation",
        timestamp: "2026-09-02T11:00:00+03:00",
        location: "Component Lab",
        actor: "Donation Center Staff",
        role: "Phlebotomist",
      },
    ],
  },

  // A- Cryoprecipitate & Platelets (Low Stock)
  {
    id: "UNT-A-NEG-0611",
    bloodGroup: "A−",
    component: "cryoprecipitate",
    collectionDate: "2026-08-20",
    expiryDate: "2027-08-20",
    storageLocation: "Deep Freezer 1 — Rack B",
    status: "available",
    registeredAt: "2026-08-20T14:00:00+03:00",
    updatedAt: "2026-08-20T17:00:00+03:00",
    custodyEvents: [
      {
        id: "evt-0611-1",
        event: "registered",
        title: "Cryoprecipitate Thaw-Prep & Packaging",
        timestamp: "2026-08-20T14:00:00+03:00",
        location: "Deep Freezer 1",
        actor: "Lab Technologist",
        role: "Specialist",
      },
    ],
  },
  {
    id: "UNT-A-NEG-0612",
    bloodGroup: "A−",
    component: "red_cells",
    collectionDate: "2026-09-03",
    expiryDate: "2026-10-15",
    storageLocation: "Fridge A — Shelf 4",
    status: "reserved",
    notes: "Reserved for scheduled neonatal cardiac repair procedure.",
    registeredAt: "2026-09-03T10:00:00+03:00",
    updatedAt: "2026-09-07T09:00:00+03:00",
    custodyEvents: [
      {
        id: "evt-0612-1",
        event: "registered",
        title: "Unit Intake",
        timestamp: "2026-09-03T10:00:00+03:00",
        location: "Intake Bay",
        actor: "Donation Center Staff",
        role: "Phlebotomist",
      },
      {
        id: "evt-0612-2",
        event: "reserved",
        title: "Procedural Reservation Hold",
        timestamp: "2026-09-07T09:00:00+03:00",
        location: "Fridge A — Shelf 4",
        actor: "Mariam Blood Bank User",
        role: "Blood Bank Staff",
        notes: "Tagged hold for scheduled transfusion.",
      },
    ],
  },

  // B- Red Cells (Low Stock Warning)
  {
    id: "UNT-B-NEG-0711",
    bloodGroup: "B−",
    component: "red_cells",
    collectionDate: "2026-08-29",
    expiryDate: "2026-10-10",
    storageLocation: "Fridge B — Shelf 3",
    status: "available",
    registeredAt: "2026-08-29T10:00:00+03:00",
    updatedAt: "2026-08-29T12:00:00+03:00",
    custodyEvents: [
      {
        id: "evt-0711-1",
        event: "registered",
        title: "Unit Intake",
        timestamp: "2026-08-29T10:00:00+03:00",
        location: "Intake Bay",
        actor: "Donation Center Staff",
        role: "Phlebotomist",
      },
    ],
  },

  // AB- Units (Critical Shortage: 0 Available)
  {
    id: "UNT-AB-NEG-0811",
    bloodGroup: "AB−",
    component: "fresh_frozen_plasma",
    collectionDate: "2026-08-10",
    expiryDate: "2027-08-10",
    storageLocation: "Deep Freezer 2 — Rack C",
    status: "quarantined",
    notes: "Quarantined for confirmatory testing after lipemic appearance.",
    registeredAt: "2026-08-10T11:00:00+03:00",
    updatedAt: "2026-08-11T09:00:00+03:00",
    custodyEvents: [
      {
        id: "evt-0811-1",
        event: "registered",
        title: "Plasma Intake",
        timestamp: "2026-08-10T11:00:00+03:00",
        location: "Intake Bay",
        actor: "Donation Center Staff",
        role: "Phlebotomist",
      },
      {
        id: "evt-0811-2",
        event: "quarantined",
        title: "Quarantine Hold Placed",
        timestamp: "2026-08-11T09:00:00+03:00",
        location: "Deep Freezer 2 — Rack C",
        actor: "Mariam Blood Bank User",
        role: "Blood Bank Staff",
        notes: "Lipemic specimen evaluation.",
      },
    ],
  },
];

// Single in-memory repository shared between inventory, requests, and tracking
let sharedBloodUnits: BloodUnit[] = structuredClone(initialUnits);

export function getSharedBloodUnitsDirect(): BloodUnit[] {
  return sharedBloodUnits;
}

export function setSharedBloodUnitsDirect(units: BloodUnit[]) {
  sharedBloodUnits = units;
}

/**
 * Get all blood units, optionally filtered
 */
export async function getInventoryUnits(
  filters?: Partial<InventoryLedgerFilters>,
): Promise<BloodUnit[]> {
  let result = [...sharedBloodUnits];
  const now = Date.now();

  if (filters?.search?.trim()) {
    const q = filters.search.trim().toLowerCase();
    result = result.filter(
      (u) =>
        u.id.toLowerCase().includes(q) ||
        u.storageLocation.toLowerCase().includes(q) ||
        u.bloodGroup.toLowerCase().includes(q) ||
        (u.allocatedRequestId && u.allocatedRequestId.toLowerCase().includes(q)) ||
        (u.notes && u.notes.toLowerCase().includes(q)),
    );
  }

  if (filters?.bloodGroup && filters.bloodGroup !== "all") {
    result = result.filter((u) => u.bloodGroup === filters.bloodGroup);
  }

  if (filters?.component && filters.component !== "all") {
    result = result.filter((u) => u.component === filters.component);
  }

  if (filters?.status && filters.status !== "all") {
    result = result.filter((u) => u.status === filters.status);
  }

  if (filters?.expiryWindow && filters.expiryWindow !== "all") {
    result = result.filter((u) => {
      const expTime = new Date(u.expiryDate).getTime();
      const diffMs = expTime - now;

      switch (filters.expiryWindow) {
        case "expired":
          return diffMs <= 0 || u.status === "expired";
        case "within_24h":
          return diffMs > 0 && diffMs <= 24 * 60 * 60 * 1000;
        case "within_48h":
          return diffMs > 0 && diffMs <= 48 * 60 * 60 * 1000;
        case "within_7d":
          return diffMs > 0 && diffMs <= 7 * 24 * 60 * 60 * 1000;
        default:
          return true;
      }
    });
  }

  if (filters?.sortBy) {
    result.sort((a, b) => {
      switch (filters.sortBy) {
        case "expiry_soonest":
          return (
            new Date(a.expiryDate).getTime() - new Date(b.expiryDate).getTime()
          );
        case "expiry_latest":
          return (
            new Date(b.expiryDate).getTime() - new Date(a.expiryDate).getTime()
          );
        case "collection_newest":
          return (
            new Date(b.collectionDate).getTime() -
            new Date(a.collectionDate).getTime()
          );
        case "id_asc":
        default:
          return a.id.localeCompare(b.id);
      }
    });
  }

  return waitForMock(structuredClone(result));
}

/**
 * Compute real-time Inventory KPIs
 */
export async function getInventoryKPIs(): Promise<InventoryKPIs> {
  const now = Date.now();
  const available = sharedBloodUnits.filter((u) => u.status === "available");
  const reserved = sharedBloodUnits.filter((u) => u.status === "reserved");
  const quarantined = sharedBloodUnits.filter((u) => u.status === "quarantined");

  const expiringSoon = sharedBloodUnits.filter((u) => {
    if (u.status === "expired") return false;
    const diff = new Date(u.expiryDate).getTime() - now;
    return diff > 0 && diff <= 48 * 60 * 60 * 1000;
  });

  // Calculate available counts per blood group to identify critical low stock (<= 2 units, or <= 3 for O- universal)
  const criticalLowStockGroups: BloodGroup[] = [];
  for (const group of ALL_BLOOD_GROUPS) {
    const groupCount = available.filter((u) => u.bloodGroup === group).length;
    const threshold = group === "O−" ? 3 : 2;
    if (groupCount <= threshold) {
      criticalLowStockGroups.push(group);
    }
  }

  return waitForMock({
    totalAvailable: available.length,
    reservedUnits: reserved.length,
    quarantinedUnits: quarantined.length,
    expiringSoon: expiringSoon.length,
    criticalLowStockGroups,
  });
}

/**
 * Compute Blood Stock Matrix (ABO/Rh x Component)
 */
export async function getBloodStockMatrix(): Promise<BloodStockMatrixCell[]> {
  const now = Date.now();
  const cells: BloodStockMatrixCell[] = [];

  for (const group of ALL_BLOOD_GROUPS) {
    for (const comp of ALL_COMPONENTS) {
      const groupCompUnits = sharedBloodUnits.filter(
        (u) => u.bloodGroup === group && u.component === comp,
      );

      const available = groupCompUnits.filter((u) => u.status === "available").length;
      const reserved = groupCompUnits.filter((u) => u.status === "reserved").length;
      const expiringSoon = groupCompUnits.filter((u) => {
        if (u.status === "expired") return false;
        const diff = new Date(u.expiryDate).getTime() - now;
        return diff > 0 && diff <= 48 * 60 * 60 * 1000;
      }).length;

      let condition: "optimal" | "warning" | "critical" = "optimal";
      if (available === 0 && (group === "O−" || group === "AB−" || group === "A+")) {
        condition = "critical";
      } else if (available === 0) {
        condition = "warning";
      } else if (available === 1) {
        condition = "warning";
      }

      cells.push({
        bloodGroup: group,
        component: comp,
        available,
        reserved,
        expiringSoon,
        condition,
      });
    }
  }

  return waitForMock(cells);
}

/**
 * Compute operational clinical warnings
 */
export async function getInventoryWarnings(): Promise<InventoryWarning[]> {
  const warnings: InventoryWarning[] = [];
  const now = Date.now();

  // 1. Critical Shortage Warnings (Emergency Red)
  const oNegAvailable = sharedBloodUnits.filter(
    (u) => u.bloodGroup === "O−" && u.status === "available",
  ).length;
  if (oNegAvailable <= 3) {
    warnings.push({
      id: "warn-crit-o-neg",
      type: "critical",
      title: "Critical O- Negative Universal Stock Shortage",
      description: `Only ${oNegAvailable} O− unit(s) available in central cold chain. Universal uncrossmatched reserve threshold is compromised.`,
      bloodGroup: "O−",
      unitCount: oNegAvailable,
    });
  }

  const abNegAvailable = sharedBloodUnits.filter(
    (u) => u.bloodGroup === "AB−" && u.status === "available",
  ).length;
  if (abNegAvailable === 0) {
    warnings.push({
      id: "warn-crit-ab-neg",
      type: "critical",
      title: "AB- Negative Stock Exhausted (0 Available)",
      description: "Zero AB− units are currently available for allocation. Immediate donor recall is recommended.",
      bloodGroup: "AB−",
      unitCount: 0,
    });
  }

  // 2. Expired Units Warning (Emergency Red for biohazard audit)
  const expiredUnits = sharedBloodUnits.filter(
    (u) => u.status === "expired" || new Date(u.expiryDate).getTime() <= now,
  );
  if (expiredUnits.length > 0) {
    warnings.push({
      id: "warn-expired-units",
      type: "critical",
      title: `${expiredUnits.length} Expired Unit(s) Requiring Quarantine / Disposal`,
      description: `Units (${expiredUnits.map((u) => u.id).join(", ")}) have surpassed permissible viability windows. Ensure segregation into Quarantine Bay.`,
      unitCount: expiredUnits.length,
      unitIds: expiredUnits.map((u) => u.id),
    });
  }

  // 3. Units Expiring within 24 Hours (Amber Warning)
  const expiring24h = sharedBloodUnits.filter((u) => {
    if (u.status === "expired") return false;
    const diff = new Date(u.expiryDate).getTime() - now;
    return diff > 0 && diff <= 24 * 60 * 60 * 1000;
  });
  if (expiring24h.length > 0) {
    warnings.push({
      id: "warn-expiring-24h",
      type: "warning",
      title: `${expiring24h.length} Unit(s) Expiring within 24 Hours`,
      description: `Prioritize dispatch or crossmatching for ${expiring24h.map((u) => `${u.id} (${u.bloodGroup})`).join(", ")}.`,
      unitCount: expiring24h.length,
      unitIds: expiring24h.map((u) => u.id),
    });
  }

  // 4. Units Expiring within 48 Hours (Amber Warning)
  const expiring48h = sharedBloodUnits.filter((u) => {
    if (u.status === "expired") return false;
    const diff = new Date(u.expiryDate).getTime() - now;
    return diff > 24 * 60 * 60 * 1000 && diff <= 48 * 60 * 60 * 1000;
  });
  if (expiring48h.length > 0) {
    warnings.push({
      id: "warn-expiring-48h",
      type: "warning",
      title: `${expiring48h.length} Unit(s) Expiring within 48 Hours`,
      description: `Platelets and cellular fractions near end of validity: ${expiring48h.map((u) => u.id).join(", ")}.`,
      unitCount: expiring48h.length,
      unitIds: expiring48h.map((u) => u.id),
    });
  }

  return waitForMock(warnings);
}

/**
 * Register / Intake new blood units
 */
export async function registerBloodUnits(
  payload: BloodUnitIntakePayload,
): Promise<BloodUnit[]> {
  const count = Math.max(1, payload.quantity || 1);
  const nowStr = new Date().toISOString();
  const created: BloodUnit[] = [];

  const groupSlug = payload.bloodGroup
    .replace("+", "-POS")
    .replace("−", "-NEG")
    .replace("-", "-NEG");

  for (let i = 0; i < count; i++) {
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const unitId =
      count === 1 && payload.unitId?.trim()
        ? payload.unitId.trim()
        : `UNT-${groupSlug}-${randomSuffix}`;

    const newUnit: BloodUnit = {
      id: unitId,
      bloodGroup: payload.bloodGroup,
      component: payload.component,
      collectionDate: payload.collectionDate,
      expiryDate: payload.expiryDate,
      storageLocation: payload.storageLocation,
      status: "available",
      notes: payload.notes,
      registeredAt: nowStr,
      updatedAt: nowStr,
      custodyEvents: [
        {
          id: `evt-${unitId}-init`,
          event: "registered",
          title: "Intake Registration & Quality Intake",
          timestamp: nowStr,
          location: payload.storageLocation,
          actor: "Mariam Blood Bank User",
          role: "Blood Bank Staff",
          notes: payload.notes
            ? `Batch intake of ${count} unit(s). Notes: ${payload.notes}`
            : `Batch intake of ${count} unit(s) registered into Central Blood Bank stock.`,
        },
      ],
    };

    created.push(newUnit);
  }

  // Prepend to top of inventory
  sharedBloodUnits = [...created, ...sharedBloodUnits];

  return waitForMock(structuredClone(created));
}

/**
 * Lookup a blood unit by ID or barcode/QR string
 */
export async function lookupBloodUnit(
  idOrQr: string,
): Promise<BloodUnit | null> {
  const query = idOrQr.trim().toLowerCase();
  const found = sharedBloodUnits.find((u) => u.id.toLowerCase() === query);
  return waitForMock(found ? structuredClone(found) : null);
}

/**
 * Update unit status (e.g. quarantine or release) and record custody event
 */
export async function updateBloodUnitStatus(
  unitId: string,
  status: BloodUnitStatus,
  location?: string,
  note?: string,
): Promise<BloodUnit> {
  const index = sharedBloodUnits.findIndex((u) => u.id === unitId);
  if (index < 0) {
    throw new Error(`Unit ${unitId} not found in inventory.`);
  }

  const current = sharedBloodUnits[index];
  const nowStr = new Date().toISOString();

  const newEvent: CustodyEvent = {
    id: `evt-${unitId}-${(current.custodyEvents?.length || 0) + 1}`,
    event:
      status === "quarantined"
        ? "quarantined"
        : status === "expired"
          ? "expired"
          : "released",
    title:
      status === "quarantined"
        ? "Moved to Quarantine Bay"
        : status === "expired"
          ? "Flagged as Expired"
          : `Status changed to ${status}`,
    timestamp: nowStr,
    location: location || current.storageLocation,
    actor: "Mariam Blood Bank User",
    role: "Blood Bank Staff",
    notes: note,
  };

  const updated: BloodUnit = {
    ...current,
    status,
    storageLocation: location || current.storageLocation,
    updatedAt: nowStr,
    custodyEvents: [...(current.custodyEvents || []), newEvent],
  };

  sharedBloodUnits = sharedBloodUnits.map((u, i) => (i === index ? updated : u));
  return waitForMock(structuredClone(updated));
}

/**
 * Synchronize request allocation with shared store
 */
export function allocateUnitsInSharedStore(
  requestId: string,
  unitIds: string[],
): BloodUnit[] {
  const nowStr = new Date().toISOString();
  sharedBloodUnits = sharedBloodUnits.map((unit) => {
    if (unitIds.includes(unit.id)) {
      const newEvent: CustodyEvent = {
        id: `evt-${unit.id}-${(unit.custodyEvents?.length || 0) + 1}`,
        event: "allocated",
        title: "Allocated to Hospital Blood Request",
        timestamp: nowStr,
        location: unit.storageLocation,
        actor: "Mariam Blood Bank User",
        role: "Blood Bank Staff",
        relatedRequestId: requestId,
        notes: `Allocated to hospital blood request ${requestId}.`,
      };

      return {
        ...unit,
        status: "allocated" as BloodUnitStatus,
        allocatedRequestId: requestId,
        updatedAt: nowStr,
        custodyEvents: [...(unit.custodyEvents || []), newEvent],
      };
    }
    return unit;
  });
  return structuredClone(sharedBloodUnits);
}

/**
 * Synchronize request reservation with shared store
 */
export function reserveUnitsInSharedStore(
  requestId: string,
  unitIds: string[],
): BloodUnit[] {
  const nowStr = new Date().toISOString();
  sharedBloodUnits = sharedBloodUnits.map((unit) => {
    if (unitIds.includes(unit.id)) {
      const newEvent: CustodyEvent = {
        id: `evt-${unit.id}-${(unit.custodyEvents?.length || 0) + 1}`,
        event: "reserved",
        title: "Reserved for Cross-Match",
        timestamp: nowStr,
        location: unit.storageLocation,
        actor: "Mariam Blood Bank User",
        role: "Blood Bank Staff",
        relatedRequestId: requestId,
        notes: `Reserved for cross-matching for request ${requestId}.`,
      };

      return {
        ...unit,
        status: "reserved" as BloodUnitStatus,
        allocatedRequestId: requestId,
        updatedAt: nowStr,
        custodyEvents: [...(unit.custodyEvents || []), newEvent],
      };
    }
    return unit;
  });
  return structuredClone(sharedBloodUnits);
}

/**
 * Synchronize deallocation with shared store
 */
export function deallocateUnitInSharedStore(
  requestId: string,
  unitId: string,
): BloodUnit[] {
  const nowStr = new Date().toISOString();
  sharedBloodUnits = sharedBloodUnits.map((unit) => {
    if (unit.id === unitId) {
      const newEvent: CustodyEvent = {
        id: `evt-${unit.id}-${(unit.custodyEvents?.length || 0) + 1}`,
        event: "deallocated",
        title: "Deallocated from Request",
        timestamp: nowStr,
        location: unit.storageLocation,
        actor: "Mariam Blood Bank User",
        role: "Blood Bank Staff",
        relatedRequestId: requestId,
        notes: `Released from request ${requestId}. Restored to available inventory.`,
      };

      return {
        ...unit,
        status: "available" as BloodUnitStatus,
        allocatedRequestId: undefined,
        updatedAt: nowStr,
        custodyEvents: [...(unit.custodyEvents || []), newEvent],
      };
    }
    return unit;
  });
  return structuredClone(sharedBloodUnits);
}

/**
 * Reset mock store to initial baseline
 */
export function resetInventoryMock() {
  sharedBloodUnits = structuredClone(initialUnits);
}
