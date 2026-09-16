import type { UserRole } from "@/features/authentication/model/auth.types";
import type {
  Notification,
  NotificationFilters,
} from "@/features/notifications/types/notifications.types";

const mockLatency = 120;

function waitForMock<T>(value: T): Promise<T> {
  return new Promise<T>((resolve) => {
    window.setTimeout(() => resolve(value), mockLatency);
  });
}

const initialNotifications: Notification[] = [
  // Blood Bank Staff & Admin
  {
    id: "NOTIF-2026-001",
    title: "Urgent O- request received",
    message: "Cairo General Hospital submitted emergency requisition BR-2026-2194 for 2 units O- Red Blood Cells.",
    type: "request_update",
    priority: "urgent",
    relatedEntity: {
      type: "request",
      id: "BR-2026-2194",
      label: "Request BR-2026-2194",
      link: "/blood-bank/requests/BR-2026-2194",
    },
    createdAt: "2026-09-10T19:30:00+03:00",
    isRead: false,
    recipientRoles: ["blood_bank_staff", "admin"],
    sourceModule: "hospital",
  },
  {
    id: "NOTIF-2026-002",
    title: "Inventory alert: O- stock critical",
    message: "Regional reserve of O- Red Blood Cells has dropped to 3 units, falling below the required minimum safety buffer.",
    type: "inventory_alert",
    priority: "urgent",
    relatedEntity: {
      type: "inventory",
      id: "O_NEG",
      label: "O- Cold Storage Matrix",
      link: "/blood-bank/inventory",
    },
    createdAt: "2026-09-10T19:15:00+03:00",
    isRead: false,
    recipientRoles: ["blood_bank_staff", "admin"],
    sourceModule: "blood_bank",
  },
  {
    id: "NOTIF-2026-003",
    title: "Donor response received",
    message: "Omar Donor confirmed availability for emergency pediatric appeal DR-2026-0811 at Regional Blood Bank Center.",
    type: "donation_update",
    priority: "normal",
    relatedEntity: {
      type: "donation",
      id: "DR-2026-0811",
      label: "Appeal DR-2026-0811",
      link: "/blood-bank/requests",
    },
    createdAt: "2026-09-10T18:45:00+03:00",
    isRead: false,
    recipientRoles: ["blood_bank_staff"],
    sourceModule: "donor",
  },

  // Hospital Staff & Admin
  {
    id: "NOTIF-2026-004",
    title: "Blood request BR-2026-2194 confirmed",
    message: "Central Blood Bank acknowledged and confirmed clinical requisition BR-2026-2194. Unit allocation in progress.",
    type: "request_update",
    priority: "high",
    relatedEntity: {
      type: "request",
      id: "BR-2026-2194",
      label: "Requisition BR-2026-2194",
      link: "/hospital/requests/BR-2026-2194",
    },
    createdAt: "2026-09-10T19:20:00+03:00",
    isRead: false,
    recipientRoles: ["hospital_staff", "admin"],
    sourceModule: "blood_bank",
  },
  {
    id: "NOTIF-2026-005",
    title: "Units allocated for BR-2026-2194",
    message: "2 units (UNT-O-NEG-0992, UNT-O-NEG-0993) serologically verified and reserved for patient crossmatch.",
    type: "allocation_update",
    priority: "normal",
    relatedEntity: {
      type: "request",
      id: "BR-2026-2194",
      label: "Requisition BR-2026-2194",
      link: "/hospital/requests/BR-2026-2194",
    },
    createdAt: "2026-09-10T18:50:00+03:00",
    isRead: true,
    recipientRoles: ["hospital_staff", "admin"],
    sourceModule: "blood_bank",
  },
  {
    id: "NOTIF-2026-006",
    title: "Blood units dispatched for BR-2026-2189",
    message: "Carrier escort has departed Central Cold Storage. Estimated arrival at Cairo General Emergency Bay is 25 minutes.",
    type: "tracking_update",
    priority: "urgent",
    relatedEntity: {
      type: "request",
      id: "BR-2026-2189",
      label: "Requisition BR-2026-2189",
      link: "/hospital/requests/BR-2026-2189",
    },
    createdAt: "2026-09-10T18:10:00+03:00",
    isRead: false,
    recipientRoles: ["hospital_staff"],
    sourceModule: "blood_bank",
  },

  // Caregiver
  {
    id: "NOTIF-2026-007",
    title: "Unit UNT-B-POS-0331 is ready for transfer",
    message: "Biological unit UNT-B-POS-0331 has passed crossmatch verification and is packaged in certified thermal transit container.",
    type: "tracking_update",
    priority: "high",
    relatedEntity: {
      type: "unit",
      id: "UNT-B-POS-0331",
      label: "Unit UNT-B-POS-0331",
      link: "/caregiver/tracking/UNT-B-POS-0331",
    },
    createdAt: "2026-09-10T19:00:00+03:00",
    isRead: false,
    recipientRoles: ["caregiver"],
    sourceModule: "blood_bank",
  },
  {
    id: "NOTIF-2026-008",
    title: "Courier dispatched: 2°C–6°C continuous verified",
    message: "Clinical courier is en route to Cairo General Hospital. Cold-chain sensor confirms constant 3.8°C stability.",
    type: "tracking_update",
    priority: "urgent",
    relatedEntity: {
      type: "unit",
      id: "UNT-B-POS-0331",
      label: "Unit UNT-B-POS-0331",
      link: "/caregiver/tracking/UNT-B-POS-0331",
    },
    createdAt: "2026-09-10T18:40:00+03:00",
    isRead: false,
    recipientRoles: ["caregiver"],
    sourceModule: "blood_bank",
  },

  // Donor
  {
    id: "NOTIF-2026-009",
    title: "Your donation response was accepted",
    message: "Cairo University Pediatric Hospital confirmed your appointment slot for appeal DR-2026-0811 tomorrow at 10:00 AM.",
    type: "donation_update",
    priority: "normal",
    relatedEntity: {
      type: "donation",
      id: "DR-2026-0811",
      label: "Appeal DR-2026-0811",
      link: "/donor/requests/DR-2026-0811",
    },
    createdAt: "2026-09-10T18:30:00+03:00",
    isRead: false,
    recipientRoles: ["donor"],
    sourceModule: "donor",
  },
  {
    id: "NOTIF-2026-010",
    title: "New certificate VCH-2026-9901 issued",
    message: "Thank you for your life-saving platelet contribution! Your verified digital voucher certificate is now ready.",
    type: "donation_update",
    priority: "high",
    relatedEntity: {
      type: "donation",
      id: "VCH-2026-9901",
      label: "Voucher VCH-2026-9901",
      link: "/donor/vouchers",
    },
    createdAt: "2026-09-09T14:00:00+03:00",
    isRead: true,
    recipientRoles: ["donor"],
    sourceModule: "donor",
  },
  {
    id: "NOTIF-2026-011",
    title: "Urgent community shortage: O+ blood needed",
    message: "Regional blood stock for O+ blood has entered critical shortage status. Donors are warmly invited to schedule a walk-in.",
    type: "request_update",
    priority: "urgent",
    relatedEntity: {
      type: "donation",
      id: "DR-2026-0824",
      label: "Appeal DR-2026-0824",
      link: "/donor/requests",
    },
    createdAt: "2026-09-08T09:00:00+03:00",
    isRead: true,
    recipientRoles: ["donor"],
    sourceModule: "blood_bank",
  },

  // Admin / Governance
  {
    id: "NOTIF-2026-012",
    title: "New user account provisioned (USR-008)",
    message: "Technical support officer Youssef Fahmy was provisioned with platform_support credentials by Nour System Admin.",
    type: "system_announcement",
    priority: "normal",
    relatedEntity: {
      type: "user",
      id: "USR-008",
      label: "User USR-008",
      link: "/admin/users",
    },
    createdAt: "2026-09-09T21:40:00+03:00",
    isRead: true,
    recipientRoles: ["admin"],
    sourceModule: "admin",
  },
  {
    id: "NOTIF-2026-013",
    title: "System maintenance window scheduled",
    message: "Platform database indexing and cold-chain sensor firmware synchronization will execute on Sunday at 02:00 AM.",
    type: "system_announcement",
    priority: "low",
    relatedEntity: {
      type: "system",
      id: "MAINT-044",
      label: "Maintenance Window",
      link: "/activity",
    },
    createdAt: "2026-09-07T12:00:00+03:00",
    isRead: true,
    recipientRoles: ["hospital_staff", "blood_bank_staff", "admin"],
    sourceModule: "system",
  },
];

let notificationsStore: Notification[] = [...initialNotifications];

export async function getNotifications(filters?: NotificationFilters): Promise<Notification[]> {
  let list = [...notificationsStore];

  if (filters?.roleView && filters.roleView !== "all") {
    list = list.filter((n) => n.recipientRoles.includes(filters.roleView as UserRole));
  }

  if (filters?.unreadOnly) {
    list = list.filter((n) => !n.isRead);
  }

  if (filters?.type && filters.type !== "all") {
    list = list.filter((n) => n.type === filters.type);
  }

  if (filters?.priority && filters.priority !== "all") {
    list = list.filter((n) => n.priority === filters.priority);
  }

  if (filters?.search?.trim()) {
    const q = filters.search.toLowerCase().trim();
    list = list.filter(
      (n) =>
        n.title.toLowerCase().includes(q) ||
        n.message.toLowerCase().includes(q) ||
        n.relatedEntity.id.toLowerCase().includes(q) ||
        (n.relatedEntity.label && n.relatedEntity.label.toLowerCase().includes(q)),
    );
  }

  // Sort by newest first
  list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  return waitForMock(list);
}

export async function getUnreadCount(role?: UserRole): Promise<number> {
  const list = role
    ? notificationsStore.filter((n) => !n.isRead && n.recipientRoles.includes(role))
    : notificationsStore.filter((n) => !n.isRead);

  return waitForMock(list.length);
}

export async function markNotificationAsRead(id: string): Promise<Notification> {
  const index = notificationsStore.findIndex((n) => n.id === id);
  if (index === -1) {
    throw new Error(`Notification with ID ${id} not found.`);
  }

  const updated: Notification = {
    ...notificationsStore[index]!,
    isRead: true,
  };

  notificationsStore[index] = updated;
  return waitForMock(updated);
}

export async function markAllNotificationsAsRead(role?: UserRole): Promise<void> {
  notificationsStore = notificationsStore.map((n) => {
    if (!role || n.recipientRoles.includes(role)) {
      return { ...n, isRead: true };
    }
    return n;
  });

  return waitForMock(undefined);
}

export function createNotification(
  data: Omit<Notification, "id" | "createdAt" | "isRead"> & { isRead?: boolean },
): Notification {
  const id = `NOTIF-${new Date().getFullYear()}-${String(notificationsStore.length + 1).padStart(3, "0")}`;
  const newNotif: Notification = {
    ...data,
    id,
    createdAt: new Date().toISOString(),
    isRead: data.isRead ?? false,
  };

  notificationsStore = [newNotif, ...notificationsStore];
  return newNotif;
}

export function resetNotificationsMock(): void {
  notificationsStore = [...initialNotifications];
}
