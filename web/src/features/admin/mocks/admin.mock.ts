import type { UserRole } from "@/features/authentication/model/auth.types";
import { getSharedBloodUnitsDirect } from "@/features/blood-bank/inventory/inventory.mock";
import type {
  AdminBloodBank,
  AdminGovernanceKPIs,
  AdminHospital,
  AdminRoleDefinition,
  AdminUser,
  AuditFilters,
  AuditLogEvent,
  BloodBankFilters,
  CreateBloodBankInput,
  CreateHospitalInput,
  CreateUserInput,
  HospitalFilters,
  PermissionDefinition,
  RolePermissionsMap,
  UpdateBloodBankInput,
  UpdateHospitalInput,
  UpdateUserInput,
  UserFilters,
} from "@/features/admin/types/admin.types";

const mockLatency = 160;

function waitForMock<T>(value: T): Promise<T> {
  return new Promise<T>((resolve) => {
    window.setTimeout(() => resolve(value), mockLatency);
  });
}

// Initial Mock Organizations
const initialHospitals: AdminHospital[] = [
  {
    id: "hospital-cairo-general",
    name: "Cairo General Hospital",
    facilityCode: "CGH-014",
    governorate: "Cairo",
    address: "12 Kasr Al-Ainy St, Downtown, Cairo",
    phone: "+20 2 2365 4120",
    status: "active",
    userCount: 14,
    activeRequestsCount: 2,
    createdAt: "2026-01-15T08:00:00+03:00",
  },
  {
    id: "hospital-nile-specialist",
    name: "Nile Specialist Hospital",
    facilityCode: "NSH-027",
    governorate: "Giza",
    address: "44 Nile Corniche, Agouza, Giza",
    phone: "+20 2 3761 9080",
    status: "active",
    userCount: 9,
    activeRequestsCount: 1,
    createdAt: "2026-02-01T09:30:00+03:00",
  },
  {
    id: "hospital-al-shifa",
    name: "Al Shifa Medical Center",
    facilityCode: "ASM-032",
    governorate: "Cairo",
    address: "18 Abbas Al-Akkad, Nasr City, Cairo",
    phone: "+20 2 2274 5500",
    status: "active",
    userCount: 6,
    activeRequestsCount: 1,
    createdAt: "2026-03-10T11:15:00+03:00",
  },
  {
    id: "hospital-childrens",
    name: "Children's Medical Hospital",
    facilityCode: "CMH-008",
    governorate: "Cairo",
    address: "1 Abou El-Reesh St, Sayeda Zeinab, Cairo",
    phone: "+20 2 2364 1200",
    status: "active",
    userCount: 12,
    activeRequestsCount: 1,
    createdAt: "2026-01-20T10:00:00+03:00",
  },
  {
    id: "hospital-october",
    name: "October University Hospital",
    facilityCode: "OUH-041",
    governorate: "Giza",
    address: "Central Axis, 6th of October City",
    phone: "+20 2 3835 1100",
    status: "active",
    userCount: 8,
    activeRequestsCount: 0,
    createdAt: "2026-04-05T14:20:00+03:00",
  },
  {
    id: "hospital-alex-care",
    name: "Alexandria Regional Care",
    facilityCode: "ARC-055",
    governorate: "Alexandria",
    address: "70 Horreya Ave, Al-Attarin, Alexandria",
    phone: "+20 3 4872 900",
    status: "inactive",
    userCount: 3,
    activeRequestsCount: 0,
    createdAt: "2026-05-18T12:00:00+03:00",
  },
];

const initialBloodBanks: AdminBloodBank[] = [
  {
    id: "central-blood-bank",
    name: "Central Blood Bank",
    facilityCode: "CBB-001",
    governorate: "Cairo",
    address: "5 Al-Bustan St, Bab El-Louk, Cairo",
    phone: "+20 2 2392 7800",
    status: "active",
    staffCount: 18,
    inventorySummary: {
      totalAvailable: 288,
      posture: "warning",
      lowStockGroupsCount: 2,
    },
    createdAt: "2026-01-10T08:00:00+03:00",
  },
  {
    id: "nile-regional-blood-bank",
    name: "Nile Regional Blood Bank",
    facilityCode: "NRB-002",
    governorate: "Giza",
    address: "8 Mourad St, Giza",
    phone: "+20 2 3572 4430",
    status: "active",
    staffCount: 11,
    inventorySummary: {
      totalAvailable: 142,
      posture: "optimal",
      lowStockGroupsCount: 0,
    },
    createdAt: "2026-02-15T09:00:00+03:00",
  },
  {
    id: "alex-central-blood-bank",
    name: "Alexandria Coastal Blood Bank",
    facilityCode: "ACB-003",
    governorate: "Alexandria",
    address: "22 Sultan Hussein St, Al-Azarita, Alexandria",
    phone: "+20 3 4861 200",
    status: "active",
    staffCount: 9,
    inventorySummary: {
      totalAvailable: 96,
      posture: "optimal",
      lowStockGroupsCount: 1,
    },
    createdAt: "2026-03-01T10:30:00+03:00",
  },
  {
    id: "delta-auxiliary-bank",
    name: "Delta Auxiliary Blood Depot",
    facilityCode: "DAB-004",
    governorate: "Gharbia",
    address: "El-Geish St, Tanta",
    phone: "+20 40 3341 800",
    status: "inactive",
    staffCount: 2,
    inventorySummary: {
      totalAvailable: 0,
      posture: "critical",
      lowStockGroupsCount: 8,
    },
    createdAt: "2026-04-12T13:45:00+03:00",
  },
];

const initialUsers: AdminUser[] = [
  {
    id: "USR-001",
    fullName: "Nour System Admin",
    email: "nour.admin@example.test",
    primaryRole: "admin",
    roles: ["admin"],
    organizationId: "platform-administration",
    organizationName: "Blood Bank Platform Administration",
    organizationType: "platform",
    status: "active",
    createdAt: "2026-01-01T08:00:00+03:00",
    lastActivityAt: "2026-09-09T21:40:00+03:00",
    phone: "+20 10 0123 4567",
  },
  {
    id: "USR-002",
    fullName: "Ahmed Hospital User",
    email: "ahmed.hospital@example.test",
    primaryRole: "hospital_staff",
    roles: ["hospital_staff"],
    organizationId: "hospital-cairo-general",
    organizationName: "Cairo General Hospital",
    organizationType: "hospital",
    status: "active",
    createdAt: "2026-01-18T09:00:00+03:00",
    lastActivityAt: "2026-09-09T20:50:00+03:00",
    phone: "+20 10 1234 5678",
  },
  {
    id: "USR-003",
    fullName: "Mariam Blood Bank User",
    email: "mariam.bloodbank@example.test",
    primaryRole: "blood_bank_staff",
    roles: ["blood_bank_staff"],
    organizationId: "central-blood-bank",
    organizationName: "Central Blood Bank",
    organizationType: "blood_bank",
    status: "active",
    createdAt: "2026-01-12T10:30:00+03:00",
    lastActivityAt: "2026-09-09T21:15:00+03:00",
    phone: "+20 10 2345 6789",
  },
  {
    id: "USR-004",
    fullName: "Dr. Tarek Mansour",
    email: "tarek.mansour@example.test",
    primaryRole: "hospital_staff",
    roles: ["hospital_staff"],
    organizationId: "hospital-nile-specialist",
    organizationName: "Nile Specialist Hospital",
    organizationType: "hospital",
    status: "active",
    createdAt: "2026-02-05T11:00:00+03:00",
    lastActivityAt: "2026-09-09T18:30:00+03:00",
    phone: "+20 10 3456 7890",
  },
  {
    id: "USR-005",
    fullName: "Salma Ezzat",
    email: "salma.ezzat@example.test",
    primaryRole: "hospital_staff",
    roles: ["hospital_staff"],
    organizationId: "hospital-childrens",
    organizationName: "Children's Medical Hospital",
    organizationType: "hospital",
    status: "active",
    createdAt: "2026-02-10T14:15:00+03:00",
    lastActivityAt: "2026-09-09T17:45:00+03:00",
    phone: "+20 10 4567 8901",
  },
  {
    id: "USR-006",
    fullName: "Kareem Helmy",
    email: "kareem.helmy@example.test",
    primaryRole: "blood_bank_staff",
    roles: ["blood_bank_staff"],
    organizationId: "nile-regional-blood-bank",
    organizationName: "Nile Regional Blood Bank",
    organizationType: "blood_bank",
    status: "active",
    createdAt: "2026-02-20T08:45:00+03:00",
    lastActivityAt: "2026-09-09T16:20:00+03:00",
    phone: "+20 10 5678 9012",
  },
  {
    id: "USR-007",
    fullName: "Dr. Mona Khalil",
    email: "mona.khalil@example.test",
    primaryRole: "medical_lead",
    roles: ["medical_lead"],
    organizationId: "central-blood-bank",
    organizationName: "Central Blood Bank",
    organizationType: "blood_bank",
    status: "active",
    createdAt: "2026-01-25T09:15:00+03:00",
    lastActivityAt: "2026-09-08T15:00:00+03:00",
    phone: "+20 10 6789 0123",
  },
  {
    id: "USR-008",
    fullName: "Youssef Fahmy",
    email: "youssef.fahmy@example.test",
    primaryRole: "platform_support",
    roles: ["platform_support"],
    organizationId: "platform-administration",
    organizationName: "Blood Bank Platform Administration",
    organizationType: "platform",
    status: "active",
    createdAt: "2026-02-14T10:00:00+03:00",
    lastActivityAt: "2026-09-08T19:20:00+03:00",
    phone: "+20 10 7890 1234",
  },
  {
    id: "USR-009",
    fullName: "Hany Adel",
    email: "hany.adel@example.test",
    primaryRole: "hospital_staff",
    roles: ["hospital_staff"],
    organizationId: "hospital-al-shifa",
    organizationName: "Al Shifa Medical Center",
    organizationType: "hospital",
    status: "inactive",
    createdAt: "2026-03-01T12:00:00+03:00",
    lastActivityAt: "2026-08-20T11:00:00+03:00",
    phone: "+20 10 8901 2345",
  },
];

export const PERMISSION_DEFINITIONS: PermissionDefinition[] = [
  // Requests
  {
    id: "req_view",
    code: "req.view",
    label: "View blood requests",
    description: "Inspect clinical blood requisitions and processing status.",
    category: "requests",
  },
  {
    id: "req_create",
    code: "req.create",
    label: "Create new blood requests",
    description: "Submit hospital blood requisitions with clinical urgency.",
    category: "requests",
  },
  {
    id: "req_update_status",
    code: "req.update_status",
    label: "Update request processing status",
    description: "Transition requests from acknowledged to confirmed, prepared, or rejected.",
    category: "requests",
  },
  {
    id: "req_cancel",
    code: "req.cancel",
    label: "Cancel active blood requests",
    description: "Retract blood requisitions prior to preparation.",
    category: "requests",
  },

  // Inventory
  {
    id: "inv_view",
    code: "inv.view",
    label: "View inventory ledger & stock matrix",
    description: "Browse regional blood stock, cold-chain status, and ABO/Rh matrix.",
    category: "inventory",
  },
  {
    id: "inv_create",
    code: "inv.create",
    label: "Intake & register new blood units",
    description: "Register donor blood units with barcoding and serology verification.",
    category: "inventory",
  },
  {
    id: "inv_update",
    code: "inv.update",
    label: "Modify unit storage & quarantine status",
    description: "Update refrigerator bay positions and flag units for biological quarantine.",
    category: "inventory",
  },
  {
    id: "inv_allocate",
    code: "inv.allocate",
    label: "Allocate blood units to hospital requests",
    description: "Commit verified units directly to specific patient requisitions.",
    category: "inventory",
  },

  // Documents
  {
    id: "doc_view",
    code: "doc.view",
    label: "View attached clinical documents",
    description: "Access physician orders, antibody screens, and crossmatch waivers.",
    category: "documents",
  },
  {
    id: "doc_upload",
    code: "doc.upload",
    label: "Upload supporting documents",
    description: "Attach requisitions and diagnostic reports to requests.",
    category: "documents",
  },
  {
    id: "doc_review",
    code: "doc.review",
    label: "Review & approve clinical documents",
    description: "Sign off on attached transfusion documents or request clarifications.",
    category: "documents",
  },

  // Administration (High Impact)
  {
    id: "admin_users",
    code: "admin.users",
    label: "Manage user accounts & directory",
    description: "Create, edit, activate, deactivate users, and provision access credentials.",
    category: "administration",
    isHighImpact: true,
  },
  {
    id: "admin_organizations",
    code: "admin.organizations",
    label: "Manage hospital & blood bank organizations",
    description: "Provision facility records, manage addresses, and toggle facility status.",
    category: "administration",
    isHighImpact: true,
  },
  {
    id: "admin_roles",
    code: "admin.roles",
    label: "Configure roles and permissions",
    description: "Modify role-level access boundaries across operational domains.",
    category: "administration",
    isHighImpact: true,
  },
  {
    id: "admin_audit",
    code: "admin.audit",
    label: "Inspect system activity & audit logs",
    description: "View full chronological audit trails of governance and clinical events.",
    category: "administration",
  },
];

const initialRolePermissions: RolePermissionsMap = {
  admin: PERMISSION_DEFINITIONS.map((p) => p.code),
  hospital_staff: [
    "req.view",
    "req.create",
    "req.cancel",
    "doc.view",
    "doc.upload",
  ],
  blood_bank_staff: [
    "req.view",
    "req.update_status",
    "inv.view",
    "inv.create",
    "inv.update",
    "inv.allocate",
    "doc.view",
    "doc.review",
  ],
  medical_lead: [
    "req.view",
    "inv.view",
    "doc.view",
    "doc.review",
  ],
  platform_support: [
    "req.view",
    "inv.view",
    "admin.audit",
  ],
  donor: ["inv.view"],
  caregiver: ["req.view"],
};

export const ROLE_DEFINITIONS: AdminRoleDefinition[] = [
  {
    code: "admin",
    name: "System Administrator",
    description: "Unrestricted governance access across users, facilities, role security, and audit activity.",
    userCount: 1,
    isSystem: true,
    isFuture: false,
  },
  {
    code: "hospital_staff",
    name: "Hospital Clinical Staff",
    description: "Hospital doctors, nursing coordinators, and transfusion leads ordering blood for patient care.",
    userCount: 4,
    isSystem: true,
    isFuture: false,
  },
  {
    code: "blood_bank_staff",
    name: "Blood Bank Operational Staff",
    description: "Regional blood center technologists, phlebotomists, and dispatch allocation specialists.",
    userCount: 2,
    isSystem: true,
    isFuture: false,
  },
  {
    code: "medical_lead",
    name: "Medical Lead / Transfusion Lead",
    description: "Chief hematologists and clinical consultants reviewing crossmatch waivers and high-volume orders.",
    userCount: 1,
    isSystem: false,
    isFuture: true,
  },
  {
    code: "platform_support",
    name: "Platform Support Specialist",
    description: "Technical operations engineers assisting with organization onboarding and audit investigations.",
    userCount: 1,
    isSystem: false,
    isFuture: true,
  },
  {
    code: "donor",
    name: "Voluntary Donor",
    description: "Community blood donors receiving shortage notifications and appointment schedules.",
    userCount: 0,
    isSystem: false,
    isFuture: true,
  },
  {
    code: "caregiver",
    name: "Patient Caregiver",
    description: "Authorized patient advocates tracking blood availability for scheduled pediatric or surgical procedures.",
    userCount: 0,
    isSystem: false,
    isFuture: true,
  },
];

const initialAuditLogs: AuditLogEvent[] = [
  {
    id: "AUD-2026-9014",
    timestamp: "2026-09-09T21:40:00+03:00",
    actor: {
      id: "USR-001",
      name: "Nour System Admin",
      role: "admin",
      organization: "Blood Bank Platform Administration",
    },
    action: "User account provisioned",
    entityType: "User",
    entityId: "USR-008",
    entityName: "Youssef Fahmy (platform_support)",
    organization: "Blood Bank Platform Administration",
    result: "success",
    details: "New user account created with primary role 'platform_support' and assigned to Platform Administration.",
    metadata: {
      assignedRole: "platform_support",
      organizationId: "platform-administration",
    },
  },
  {
    id: "AUD-2026-9013",
    timestamp: "2026-09-09T20:15:00+03:00",
    actor: {
      id: "USR-001",
      name: "Nour System Admin",
      role: "admin",
      organization: "Blood Bank Platform Administration",
    },
    action: "Hospital facility configuration updated",
    entityType: "Hospital",
    entityId: "hospital-cairo-general",
    entityName: "Cairo General Hospital",
    organization: "Cairo General Hospital",
    result: "success",
    details: "Facility contact phone and emergency liaison updated.",
    metadata: {
      updatedFields: ["phone"],
    },
  },
  {
    id: "AUD-2026-9012",
    timestamp: "2026-09-09T18:40:00+03:00",
    actor: {
      id: "USR-003",
      name: "Mariam Blood Bank User",
      role: "blood_bank_staff",
      organization: "Central Blood Bank",
    },
    action: "Blood unit allocation committed",
    entityType: "Blood Unit",
    entityId: "UNT-B-POS-0331",
    entityName: "B+ Fresh Frozen Plasma (BR-2026-2192)",
    organization: "Central Blood Bank",
    result: "success",
    details: "Committed unit UNT-B-POS-0331 to Nile Specialist Hospital surgery request BR-2026-2192.",
    metadata: {
      requestId: "BR-2026-2192",
      component: "fresh_frozen_plasma",
    },
  },
  {
    id: "AUD-2026-9011",
    timestamp: "2026-09-09T15:30:00+03:00",
    actor: {
      id: "USR-001",
      name: "Nour System Admin",
      role: "admin",
      organization: "Blood Bank Platform Administration",
    },
    action: "Role permission boundary updated",
    entityType: "Role & Permission",
    entityId: "role-medical-lead",
    entityName: "Medical Lead Role",
    organization: "Blood Bank Platform Administration",
    result: "warning",
    details: "High-impact permission review: doc.review permission added to medical_lead profile.",
    metadata: {
      modifiedRole: "medical_lead",
      permissionAdded: "doc.review",
    },
  },
  {
    id: "AUD-2026-9010",
    timestamp: "2026-09-09T11:20:00+03:00",
    actor: {
      id: "USR-002",
      name: "Ahmed Hospital User",
      role: "hospital_staff",
      organization: "Cairo General Hospital",
    },
    action: "Emergency blood request submitted",
    entityType: "Blood Request",
    entityId: "BR-2026-2194",
    entityName: "O- Red Blood Cells (6 Units)",
    organization: "Cairo General Hospital",
    result: "success",
    details: "Emergency crossmatch waiver requisition submitted to Central Blood Bank.",
    metadata: {
      urgency: "emergency",
      bloodGroup: "O−",
      quantity: 6,
    },
  },
  {
    id: "AUD-2026-9009",
    timestamp: "2026-09-08T16:05:00+03:00",
    actor: {
      id: "USR-001",
      name: "Nour System Admin",
      role: "admin",
      organization: "Blood Bank Platform Administration",
    },
    action: "User account deactivated",
    entityType: "User",
    entityId: "USR-009",
    entityName: "Hany Adel (hospital_staff)",
    organization: "Al Shifa Medical Center",
    result: "success",
    details: "User status changed to inactive following clinical staff rotation.",
    metadata: {
      previousStatus: "active",
      newStatus: "inactive",
    },
  },
  {
    id: "AUD-2026-9008",
    timestamp: "2026-09-08T12:00:00+03:00",
    actor: {
      id: "USR-001",
      name: "Nour System Admin",
      role: "admin",
      organization: "Blood Bank Platform Administration",
    },
    action: "Blood bank facility status paused",
    entityType: "Blood Bank",
    entityId: "delta-auxiliary-bank",
    entityName: "Delta Auxiliary Blood Depot",
    organization: "Delta Auxiliary Blood Depot",
    result: "warning",
    details: "Facility temporarily marked inactive pending refrigerator cold-chain recalibration.",
    metadata: {
      reason: "Cold chain calibration",
    },
  },
];

// In-Memory Mutatable Stores
let users: AdminUser[] = structuredClone(initialUsers);
let hospitals: AdminHospital[] = structuredClone(initialHospitals);
let bloodBanks: AdminBloodBank[] = structuredClone(initialBloodBanks);
let rolePermissions: RolePermissionsMap = structuredClone(initialRolePermissions);
let auditLogs: AuditLogEvent[] = structuredClone(initialAuditLogs);

function appendAuditLog(event: Omit<AuditLogEvent, "id" | "timestamp" | "actor">) {
  const timestamp = new Date().toISOString();
  const id = `AUD-2026-${9015 + auditLogs.length}`;
  const actor = {
    id: "USR-001",
    name: "Nour System Admin",
    role: "admin" as UserRole,
    organization: "Blood Bank Platform Administration",
  };

  const newLog: AuditLogEvent = {
    id,
    timestamp,
    actor,
    ...event,
  };

  auditLogs = [newLog, ...auditLogs];
}

// -------------------------------------------------------------
// Users Management
// -------------------------------------------------------------

export async function getAdminUsers(filters?: Partial<UserFilters>): Promise<AdminUser[]> {
  let result = [...users];

  if (filters?.search?.trim()) {
    const q = filters.search.trim().toLowerCase();
    result = result.filter(
      (u) =>
        u.fullName.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        u.id.toLowerCase().includes(q) ||
        u.organizationName.toLowerCase().includes(q),
    );
  }

  if (filters?.role && filters.role !== "all") {
    result = result.filter((u) => u.primaryRole === filters.role);
  }

  if (filters?.organization && filters.organization !== "all") {
    result = result.filter((u) => u.organizationId === filters.organization);
  }

  if (filters?.status && filters.status !== "all") {
    result = result.filter((u) => u.status === filters.status);
  }

  if (filters?.sortBy) {
    result.sort((a, b) => {
      switch (filters.sortBy) {
        case "created_desc":
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case "activity_desc":
          return (
            new Date(b.lastActivityAt).getTime() -
            new Date(a.lastActivityAt).getTime()
          );
        case "name_asc":
        default:
          return a.fullName.localeCompare(b.fullName);
      }
    });
  }

  return waitForMock(structuredClone(result));
}

export async function getAdminUserById(id: string): Promise<AdminUser | undefined> {
  const user = users.find((u) => u.id === id);
  return waitForMock(user ? structuredClone(user) : undefined);
}

export async function createAdminUser(input: CreateUserInput): Promise<AdminUser> {
  // Resolve organization name and type
  let organizationName = "Blood Bank Platform Administration";
  let organizationType: "hospital" | "blood_bank" | "platform" = "platform";

  const targetHospital = hospitals.find((h) => h.id === input.organizationId);
  if (targetHospital) {
    organizationName = targetHospital.name;
    organizationType = "hospital";
    targetHospital.userCount += 1;
  } else {
    const targetBloodBank = bloodBanks.find((b) => b.id === input.organizationId);
    if (targetBloodBank) {
      organizationName = targetBloodBank.name;
      organizationType = "blood_bank";
      targetBloodBank.staffCount += 1;
    }
  }

  const id = `USR-${String(users.length + 1).padStart(3, "0")}`;
  const now = new Date().toISOString();

  const newUser: AdminUser = {
    id,
    fullName: input.fullName,
    email: input.email,
    primaryRole: input.primaryRole,
    roles: [input.primaryRole],
    organizationId: input.organizationId,
    organizationName,
    organizationType,
    status: input.status,
    createdAt: now,
    lastActivityAt: now,
    phone: input.phone,
  };

  users = [newUser, ...users];

  appendAuditLog({
    action: "User account provisioned",
    entityType: "User",
    entityId: newUser.id,
    entityName: `${newUser.fullName} (${newUser.primaryRole})`,
    organization: organizationName,
    result: "success",
    details: `Created new user ${newUser.fullName} with role ${newUser.primaryRole} assigned to ${organizationName}.`,
    metadata: {
      userId: newUser.id,
      primaryRole: newUser.primaryRole,
      organizationId: newUser.organizationId,
    },
  });

  return waitForMock(structuredClone(newUser));
}

export async function updateAdminUser(id: string, input: UpdateUserInput): Promise<AdminUser> {
  const index = users.findIndex((u) => u.id === id);
  if (index < 0) {
    throw new Error("User not found in administration repository.");
  }

  const current = users[index];
  let organizationName = current.organizationName;
  let organizationType = current.organizationType;

  if (input.organizationId && input.organizationId !== current.organizationId) {
    const targetHospital = hospitals.find((h) => h.id === input.organizationId);
    if (targetHospital) {
      organizationName = targetHospital.name;
      organizationType = "hospital";
    } else {
      const targetBloodBank = bloodBanks.find((b) => b.id === input.organizationId);
      if (targetBloodBank) {
        organizationName = targetBloodBank.name;
        organizationType = "blood_bank";
      } else {
        organizationName = "Blood Bank Platform Administration";
        organizationType = "platform";
      }
    }
  }

  const updated: AdminUser = {
    ...current,
    fullName: input.fullName ?? current.fullName,
    email: input.email ?? current.email,
    primaryRole: input.primaryRole ?? current.primaryRole,
    roles: input.primaryRole ? [input.primaryRole] : current.roles,
    organizationId: input.organizationId ?? current.organizationId,
    organizationName,
    organizationType,
    status: input.status ?? current.status,
    phone: input.phone ?? current.phone,
    lastActivityAt: new Date().toISOString(),
  };

  users[index] = updated;

  appendAuditLog({
    action: "User account modified",
    entityType: "User",
    entityId: updated.id,
    entityName: `${updated.fullName} (${updated.primaryRole})`,
    organization: organizationName,
    result: "success",
    details: `Updated user profile information and access configuration for ${updated.fullName}.`,
    metadata: {
      userId: updated.id,
      changes: Object.keys(input),
    },
  });

  return waitForMock(structuredClone(updated));
}

export async function toggleUserStatus(id: string): Promise<AdminUser> {
  const index = users.findIndex((u) => u.id === id);
  if (index < 0) {
    throw new Error("User not found in administration repository.");
  }

  const current = users[index];
  const newStatus = current.status === "active" ? "inactive" : "active";

  const updated: AdminUser = {
    ...current,
    status: newStatus,
    lastActivityAt: new Date().toISOString(),
  };

  users[index] = updated;

  appendAuditLog({
    action: newStatus === "active" ? "User account activated" : "User account deactivated",
    entityType: "User",
    entityId: updated.id,
    entityName: `${updated.fullName} (${updated.primaryRole})`,
    organization: updated.organizationName,
    result: "success",
    details: `Account state shifted from ${current.status} to ${newStatus}.`,
    metadata: {
      userId: updated.id,
      previousStatus: current.status,
      newStatus,
    },
  });

  return waitForMock(structuredClone(updated));
}

// -------------------------------------------------------------
// Hospitals Management
// -------------------------------------------------------------

export async function getAdminHospitals(filters?: Partial<HospitalFilters>): Promise<AdminHospital[]> {
  let result = [...hospitals];

  if (filters?.search?.trim()) {
    const q = filters.search.trim().toLowerCase();
    result = result.filter(
      (h) =>
        h.name.toLowerCase().includes(q) ||
        h.facilityCode.toLowerCase().includes(q) ||
        h.address.toLowerCase().includes(q) ||
        h.governorate.toLowerCase().includes(q),
    );
  }

  if (filters?.governorate && filters.governorate !== "all") {
    result = result.filter((h) => h.governorate === filters.governorate);
  }

  if (filters?.status && filters.status !== "all") {
    result = result.filter((h) => h.status === filters.status);
  }

  return waitForMock(structuredClone(result));
}

export async function getAdminHospitalById(id: string): Promise<AdminHospital | undefined> {
  const hospital = hospitals.find((h) => h.id === id);
  return waitForMock(hospital ? structuredClone(hospital) : undefined);
}

export async function createAdminHospital(input: CreateHospitalInput): Promise<AdminHospital> {
  const id = `hospital-${input.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "")}`;
  const now = new Date().toISOString();

  const newHospital: AdminHospital = {
    id,
    name: input.name,
    facilityCode: input.facilityCode.toUpperCase(),
    governorate: input.governorate,
    address: input.address,
    phone: input.phone,
    status: input.status,
    userCount: 0,
    activeRequestsCount: 0,
    createdAt: now,
  };

  hospitals = [newHospital, ...hospitals];

  appendAuditLog({
    action: "Hospital facility registered",
    entityType: "Hospital",
    entityId: newHospital.id,
    entityName: newHospital.name,
    organization: newHospital.name,
    result: "success",
    details: `Provisioned new healthcare facility record ${newHospital.name} (${newHospital.facilityCode}).`,
    metadata: {
      facilityCode: newHospital.facilityCode,
      governorate: newHospital.governorate,
    },
  });

  return waitForMock(structuredClone(newHospital));
}

export async function updateAdminHospital(id: string, input: UpdateHospitalInput): Promise<AdminHospital> {
  const index = hospitals.findIndex((h) => h.id === id);
  if (index < 0) {
    throw new Error("Hospital facility not found.");
  }

  const current = hospitals[index];
  const updated: AdminHospital = {
    ...current,
    name: input.name ?? current.name,
    facilityCode: input.facilityCode ? input.facilityCode.toUpperCase() : current.facilityCode,
    governorate: input.governorate ?? current.governorate,
    address: input.address ?? current.address,
    phone: input.phone ?? current.phone,
    status: input.status ?? current.status,
  };

  hospitals[index] = updated;

  appendAuditLog({
    action: "Hospital facility modified",
    entityType: "Hospital",
    entityId: updated.id,
    entityName: updated.name,
    organization: updated.name,
    result: "success",
    details: `Updated facility details for ${updated.name}.`,
    metadata: {
      facilityId: updated.id,
      changes: Object.keys(input),
    },
  });

  return waitForMock(structuredClone(updated));
}

export async function toggleHospitalStatus(id: string): Promise<AdminHospital> {
  const index = hospitals.findIndex((h) => h.id === id);
  if (index < 0) {
    throw new Error("Hospital facility not found.");
  }

  const current = hospitals[index];
  const newStatus = current.status === "active" ? "inactive" : "active";

  const updated: AdminHospital = {
    ...current,
    status: newStatus,
  };

  hospitals[index] = updated;

  appendAuditLog({
    action: newStatus === "active" ? "Hospital facility activated" : "Hospital facility deactivated",
    entityType: "Hospital",
    entityId: updated.id,
    entityName: updated.name,
    organization: updated.name,
    result: newStatus === "active" ? "success" : "warning",
    details: `Hospital operational status changed from ${current.status} to ${newStatus}.`,
    metadata: {
      hospitalId: updated.id,
      previousStatus: current.status,
      newStatus,
    },
  });

  return waitForMock(structuredClone(updated));
}

// -------------------------------------------------------------
// Blood Banks Management
// -------------------------------------------------------------

export async function getAdminBloodBanks(filters?: Partial<BloodBankFilters>): Promise<AdminBloodBank[]> {
  // Sync live available blood unit count for Central Blood Bank from shared inventory store
  const availableLiveCount = getSharedBloodUnitsDirect().filter(
    (u) => u.status === "available",
  ).length;

  const syncedBloodBanks = bloodBanks.map((b) => {
    if (b.id === "central-blood-bank") {
      return {
        ...b,
        inventorySummary: {
          ...b.inventorySummary,
          totalAvailable: 280 + availableLiveCount,
        },
      };
    }
    return b;
  });

  let result = [...syncedBloodBanks];

  if (filters?.search?.trim()) {
    const q = filters.search.trim().toLowerCase();
    result = result.filter(
      (b) =>
        b.name.toLowerCase().includes(q) ||
        b.facilityCode.toLowerCase().includes(q) ||
        b.address.toLowerCase().includes(q) ||
        b.governorate.toLowerCase().includes(q),
    );
  }

  if (filters?.governorate && filters.governorate !== "all") {
    result = result.filter((b) => b.governorate === filters.governorate);
  }

  if (filters?.status && filters.status !== "all") {
    result = result.filter((b) => b.status === filters.status);
  }

  return waitForMock(structuredClone(result));
}

export async function getAdminBloodBankById(id: string): Promise<AdminBloodBank | undefined> {
  const bank = bloodBanks.find((b) => b.id === id);
  return waitForMock(bank ? structuredClone(bank) : undefined);
}

export async function createAdminBloodBank(input: CreateBloodBankInput): Promise<AdminBloodBank> {
  const id = `blood-bank-${input.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "")}`;
  const now = new Date().toISOString();

  const newBank: AdminBloodBank = {
    id,
    name: input.name,
    facilityCode: input.facilityCode.toUpperCase(),
    governorate: input.governorate,
    address: input.address,
    phone: input.phone,
    status: input.status,
    staffCount: 0,
    inventorySummary: {
      totalAvailable: 0,
      posture: "optimal",
      lowStockGroupsCount: 0,
    },
    createdAt: now,
  };

  bloodBanks = [newBank, ...bloodBanks];

  appendAuditLog({
    action: "Blood bank facility registered",
    entityType: "Blood Bank",
    entityId: newBank.id,
    entityName: newBank.name,
    organization: newBank.name,
    result: "success",
    details: `Provisioned new regional blood bank center ${newBank.name} (${newBank.facilityCode}).`,
    metadata: {
      facilityCode: newBank.facilityCode,
      governorate: newBank.governorate,
    },
  });

  return waitForMock(structuredClone(newBank));
}

export async function updateAdminBloodBank(id: string, input: UpdateBloodBankInput): Promise<AdminBloodBank> {
  const index = bloodBanks.findIndex((b) => b.id === id);
  if (index < 0) {
    throw new Error("Blood bank facility not found.");
  }

  const current = bloodBanks[index];
  const updated: AdminBloodBank = {
    ...current,
    name: input.name ?? current.name,
    facilityCode: input.facilityCode ? input.facilityCode.toUpperCase() : current.facilityCode,
    governorate: input.governorate ?? current.governorate,
    address: input.address ?? current.address,
    phone: input.phone ?? current.phone,
    status: input.status ?? current.status,
  };

  bloodBanks[index] = updated;

  appendAuditLog({
    action: "Blood bank facility modified",
    entityType: "Blood Bank",
    entityId: updated.id,
    entityName: updated.name,
    organization: updated.name,
    result: "success",
    details: `Updated facility details for ${updated.name}.`,
    metadata: {
      bloodBankId: updated.id,
      changes: Object.keys(input),
    },
  });

  return waitForMock(structuredClone(updated));
}

export async function toggleBloodBankStatus(id: string): Promise<AdminBloodBank> {
  const index = bloodBanks.findIndex((b) => b.id === id);
  if (index < 0) {
    throw new Error("Blood bank facility not found.");
  }

  const current = bloodBanks[index];
  const newStatus = current.status === "active" ? "inactive" : "active";

  const updated: AdminBloodBank = {
    ...current,
    status: newStatus,
  };

  bloodBanks[index] = updated;

  appendAuditLog({
    action: newStatus === "active" ? "Blood bank facility activated" : "Blood bank facility deactivated",
    entityType: "Blood Bank",
    entityId: updated.id,
    entityName: updated.name,
    organization: updated.name,
    result: newStatus === "active" ? "success" : "warning",
    details: `Blood bank operational state shifted to ${newStatus}.`,
    metadata: {
      bloodBankId: updated.id,
      previousStatus: current.status,
      newStatus,
    },
  });

  return waitForMock(structuredClone(updated));
}

// -------------------------------------------------------------
// Roles & Permissions Management
// -------------------------------------------------------------

export async function getAdminRoles(): Promise<AdminRoleDefinition[]> {
  // Dynamically count current users per role
  const updatedRoles = ROLE_DEFINITIONS.map((r) => {
    const count = users.filter((u) => u.primaryRole === r.code && u.status === "active").length;
    return {
      ...r,
      userCount: count,
    };
  });

  return waitForMock(structuredClone(updatedRoles));
}

export async function getPermissionMatrix(): Promise<{
  permissions: PermissionDefinition[];
  rolePermissions: RolePermissionsMap;
}> {
  return waitForMock({
    permissions: structuredClone(PERMISSION_DEFINITIONS),
    rolePermissions: structuredClone(rolePermissions),
  });
}

export async function updateRolePermissions(
  role: UserRole,
  permissions: string[],
): Promise<RolePermissionsMap> {
  rolePermissions = {
    ...rolePermissions,
    [role]: permissions,
  };

  appendAuditLog({
    action: "Role permissions matrix updated",
    entityType: "Role & Permission",
    entityId: `role-${role}`,
    entityName: `${role.replace(/_/g, " ").toUpperCase()} permissions`,
    organization: "Blood Bank Platform Administration",
    result: "warning",
    details: `Updated permissions for role ${role}. Active permissions count: ${permissions.length}.`,
    metadata: {
      role,
      activePermissions: permissions,
    },
  });

  return waitForMock(structuredClone(rolePermissions));
}

// -------------------------------------------------------------
// Audit Logs
// -------------------------------------------------------------

export async function getAdminAuditLogs(filters?: Partial<AuditFilters>): Promise<AuditLogEvent[]> {
  let result = [...auditLogs];

  if (filters?.search?.trim()) {
    const q = filters.search.trim().toLowerCase();
    result = result.filter(
      (log) =>
        log.action.toLowerCase().includes(q) ||
        log.actor.name.toLowerCase().includes(q) ||
        log.entityId.toLowerCase().includes(q) ||
        (log.entityName && log.entityName.toLowerCase().includes(q)) ||
        log.organization.toLowerCase().includes(q),
    );
  }

  if (filters?.actor && filters.actor !== "all") {
    result = result.filter((log) => log.actor.id === filters.actor);
  }

  if (filters?.organization && filters.organization !== "all") {
    result = result.filter((log) => log.organization === filters.organization);
  }

  if (filters?.action && filters.action !== "all") {
    result = result.filter((log) => log.action === filters.action);
  }

  if (filters?.dateRange && filters.dateRange !== "all") {
    const now = Date.now();
    result = result.filter((log) => {
      const logTime = new Date(log.timestamp).getTime();
      const diffMs = now - logTime;

      switch (filters.dateRange) {
        case "today":
          return diffMs <= 24 * 60 * 60 * 1000;
        case "past_7_days":
          return diffMs <= 7 * 24 * 60 * 60 * 1000;
        case "past_30_days":
          return diffMs <= 30 * 24 * 60 * 60 * 1000;
        default:
          return true;
      }
    });
  }

  if (filters?.sortBy === "timestamp_asc") {
    result.sort(
      (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime(),
    );
  } else {
    result.sort(
      (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
    );
  }

  return waitForMock(structuredClone(result));
}

export async function getAdminAuditLogById(id: string): Promise<AuditLogEvent | undefined> {
  const found = auditLogs.find((l) => l.id === id);
  return waitForMock(found ? structuredClone(found) : undefined);
}

// -------------------------------------------------------------
// Governance KPIs
// -------------------------------------------------------------

export async function getAdminKPIs(): Promise<AdminGovernanceKPIs> {
  const totalUsers = users.length;
  const activeUsers = users.filter((u) => u.status === "active").length;
  const totalHospitals = hospitals.length;
  const totalBloodBanks = bloodBanks.length;
  const activeBloodRequests = hospitals.reduce(
    (acc, h) => acc + h.activeRequestsCount,
    0,
  );
  const recentAdminChanges = auditLogs.length;

  return waitForMock({
    totalUsers,
    activeUsers,
    totalHospitals,
    totalBloodBanks,
    activeBloodRequests,
    recentAdminChanges,
  });
}

export function resetAdminMock() {
  users = structuredClone(initialUsers);
  hospitals = structuredClone(initialHospitals);
  bloodBanks = structuredClone(initialBloodBanks);
  rolePermissions = structuredClone(initialRolePermissions);
  auditLogs = structuredClone(initialAuditLogs);
}
