import type { UserRole } from "@/features/authentication/model/auth.types";
import type {
  ActivityEvent,
  ActivityFilters,
} from "@/features/notifications/types/notifications.types";

const mockLatency = 140;

function waitForMock<T>(value: T): Promise<T> {
  return new Promise<T>((resolve) => {
    window.setTimeout(() => resolve(value), mockLatency);
  });
}

const initialActivityEvents: ActivityEvent[] = [
  {
    id: "ACT-2026-8025",
    timestamp: "2026-09-10T19:30:00+03:00",
    actor: {
      id: "USR-002",
      name: "Dr. Sarah Mitchell",
      role: "hospital_staff",
      organization: "Cairo General Hospital",
    },
    action: "submitted emergency blood requisition BR-2026-2194",
    entityType: "Blood Request",
    entityId: "BR-2026-2194",
    entityName: "Emergency O- Pediatric Surgery Requisition",
    organization: "Cairo General Hospital",
    result: "success",
    details: "Requisition created with 2 units of O- Red Blood Cells required within 2 hours.",
    link: "/hospital/requests/BR-2026-2194",
    metadata: {
      urgency: "emergency",
      component: "packed_red_cells",
      unitsRequested: 2,
    },
  },
  {
    id: "ACT-2026-8024",
    timestamp: "2026-09-10T19:20:00+03:00",
    actor: {
      id: "USR-003",
      name: "Dr. Laila Al-Sayed",
      role: "blood_bank_staff",
      organization: "National Blood Transfusion Services",
    },
    action: "acknowledged and confirmed request BR-2026-2194",
    entityType: "Blood Request",
    entityId: "BR-2026-2194",
    entityName: "BR-2026-2194 Processing Status",
    organization: "National Blood Transfusion Services",
    result: "success",
    details: "Blood bank technician initiated matching and crossmatch verification workflow.",
    link: "/blood-bank/requests/BR-2026-2194",
  },
  {
    id: "ACT-2026-8023",
    timestamp: "2026-09-10T18:50:00+03:00",
    actor: {
      id: "USR-004",
      name: "Mariam Technologist",
      role: "blood_bank_staff",
      organization: "National Blood Transfusion Services",
    },
    action: "allocated unit UNT-O-NEG-0992 to request BR-2026-2194",
    entityType: "Blood Unit",
    entityId: "UNT-O-NEG-0992",
    entityName: "O- Packed Red Cells (Unit 0992)",
    organization: "National Blood Transfusion Services",
    result: "success",
    details: "Verified ABO/Rh match, continuous cold-chain integrity verified at 3.6°C.",
    link: "/blood-bank/inventory",
    metadata: {
      bayPosition: "A-01",
      bloodGroup: "O-",
      volumeMl: 450,
    },
  },
  {
    id: "ACT-2026-8022",
    timestamp: "2026-09-10T18:45:00+03:00",
    actor: {
      id: "USR-006",
      name: "Omar Donor",
      role: "donor",
      organization: "Egyptian National Blood Bank System",
    },
    action: "accepted emergency donation appeal DR-2026-0811",
    entityType: "Donation Appeal",
    entityId: "DR-2026-0811",
    entityName: "Cairo Children's Hospital Shortage Appeal",
    organization: "Egyptian National Blood Bank System",
    result: "success",
    details: "Donor registered commitment for scheduled walk-in phlebotomy appointment.",
    link: "/donor/requests/DR-2026-0811",
  },
  {
    id: "ACT-2026-8021",
    timestamp: "2026-09-10T18:40:00+03:00",
    actor: {
      id: "USR-003",
      name: "Dr. Laila Al-Sayed",
      role: "blood_bank_staff",
      organization: "National Blood Transfusion Services",
    },
    action: "dispatched thermal transit container for unit UNT-B-POS-0331",
    entityType: "Cold Chain Transit",
    entityId: "UNT-B-POS-0331",
    entityName: "B+ Plasma Transport Container",
    organization: "National Blood Transfusion Services",
    result: "success",
    details: "Temperature telemetry active. Escort handed over to clinical courier.",
    link: "/caregiver/tracking/UNT-B-POS-0331",
  },
  {
    id: "ACT-2026-8020",
    timestamp: "2026-09-10T17:15:00+03:00",
    actor: {
      id: "USR-001",
      name: "Nour System Admin",
      role: "admin",
      organization: "Blood Bank Platform Administration",
    },
    action: "changed role permission policy for admin.users",
    entityType: "Role Policy",
    entityId: "admin.users",
    entityName: "User Management Capability Matrix",
    organization: "Blood Bank Platform Administration",
    result: "warning",
    details: "High-impact permission modification applied after elevated credential confirmation.",
    link: "/admin/roles",
  },
  {
    id: "ACT-2026-8019",
    timestamp: "2026-09-10T15:30:00+03:00",
    actor: {
      id: "USR-001",
      name: "Nour System Admin",
      role: "admin",
      organization: "Blood Bank Platform Administration",
    },
    action: "provisioned user account USR-008 (Youssef Fahmy)",
    entityType: "User Account",
    entityId: "USR-008",
    entityName: "Youssef Fahmy (Platform Support)",
    organization: "Blood Bank Platform Administration",
    result: "success",
    details: "Assigned primary role 'platform_support' with read-only audit inspection scope.",
    link: "/admin/users",
  },
  {
    id: "ACT-2026-8018",
    timestamp: "2026-09-09T22:00:00+03:00",
    actor: {
      id: "USR-003",
      name: "Dr. Laila Al-Sayed",
      role: "blood_bank_staff",
      organization: "National Blood Transfusion Services",
    },
    action: "flagged unit UNT-AB-POS-0810 for biological quarantine review",
    entityType: "Blood Unit",
    entityId: "UNT-AB-POS-0810",
    entityName: "AB+ Platelets (Unit 0810)",
    organization: "National Blood Transfusion Services",
    result: "warning",
    details: "Serology discrepancy flagged during secondary crossmatch verification. Unit isolated to Quarantine Bin Q-02.",
    link: "/blood-bank/inventory",
  },
];

let activityStore: ActivityEvent[] = [...initialActivityEvents];

export async function getActivityEvents(filters?: ActivityFilters): Promise<ActivityEvent[]> {
  let list = [...activityStore];

  if (filters?.role && filters.role !== "all") {
    list = list.filter((e) => e.actor.role === (filters.role as UserRole));
  }

  if (filters?.result && filters.result !== "all") {
    list = list.filter((e) => e.result === filters.result);
  }

  if (filters?.timeRange && filters.timeRange !== "all") {
    const now = new Date().getTime();
    const dayMs = 24 * 60 * 60 * 1000;
    if (filters.timeRange === "today") {
      list = list.filter((e) => now - new Date(e.timestamp).getTime() <= dayMs);
    } else if (filters.timeRange === "week") {
      list = list.filter((e) => now - new Date(e.timestamp).getTime() <= 7 * dayMs);
    } else if (filters.timeRange === "month") {
      list = list.filter((e) => now - new Date(e.timestamp).getTime() <= 30 * dayMs);
    }
  }

  if (filters?.search?.trim()) {
    const q = filters.search.toLowerCase().trim();
    list = list.filter(
      (e) =>
        e.actor.name.toLowerCase().includes(q) ||
        e.action.toLowerCase().includes(q) ||
        e.entityId.toLowerCase().includes(q) ||
        (e.entityName && e.entityName.toLowerCase().includes(q)) ||
        e.organization.toLowerCase().includes(q) ||
        (e.details && e.details.toLowerCase().includes(q)),
    );
  }

  // Newest first
  list.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  return waitForMock(list);
}

export function recordActivityEvent(
  event: Omit<ActivityEvent, "id" | "timestamp">,
): ActivityEvent {
  const id = `ACT-${new Date().getFullYear()}-${String(activityStore.length + 1).padStart(4, "0")}`;
  const newEvent: ActivityEvent = {
    ...event,
    id,
    timestamp: new Date().toISOString(),
  };

  activityStore = [newEvent, ...activityStore];
  return newEvent;
}

export function resetActivityMock(): void {
  activityStore = [...initialActivityEvents];
}
