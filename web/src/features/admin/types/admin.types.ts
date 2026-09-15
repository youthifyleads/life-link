import type { UserRole } from "@/features/authentication/model/auth.types";

export type OrganizationType = "hospital" | "blood_bank" | "platform";

export interface AdminUser {
  id: string;
  fullName: string;
  email: string;
  primaryRole: UserRole;
  roles: UserRole[];
  organizationId: string;
  organizationName: string;
  organizationType: OrganizationType;
  status: "active" | "inactive";
  createdAt: string;
  lastActivityAt: string;
  phone?: string;
}

export interface UserFilters {
  search: string;
  role: UserRole | "all";
  organization: string | "all";
  status: "active" | "inactive" | "all";
  sortBy: "name_asc" | "created_desc" | "activity_desc";
}

export interface CreateUserInput {
  fullName: string;
  email: string;
  password?: string;
  primaryRole: UserRole;
  organizationId: string;
  status: "active" | "inactive";
  phone?: string;
}

export interface UpdateUserInput {
  fullName?: string;
  email?: string;
  primaryRole?: UserRole;
  organizationId?: string;
  status?: "active" | "inactive";
  phone?: string;
}

export interface AdminHospital {
  id: string;
  name: string;
  facilityCode: string;
  governorate: string;
  address: string;
  phone: string;
  status: "active" | "inactive";
  userCount: number;
  activeRequestsCount: number;
  createdAt: string;
}

export interface HospitalFilters {
  search: string;
  governorate: string | "all";
  status: "active" | "inactive" | "all";
}

export interface CreateHospitalInput {
  name: string;
  facilityCode: string;
  governorate: string;
  address: string;
  phone: string;
  status: "active" | "inactive";
}

export interface UpdateHospitalInput {
  name?: string;
  facilityCode?: string;
  governorate?: string;
  address?: string;
  phone?: string;
  status?: "active" | "inactive";
}

export interface AdminBloodBank {
  id: string;
  name: string;
  facilityCode: string;
  governorate: string;
  address: string;
  phone: string;
  status: "active" | "inactive";
  staffCount: number;
  inventorySummary: {
    totalAvailable: number;
    posture: "optimal" | "warning" | "critical";
    lowStockGroupsCount: number;
  };
  createdAt: string;
}

export interface BloodBankFilters {
  search: string;
  governorate: string | "all";
  status: "active" | "inactive" | "all";
}

export interface CreateBloodBankInput {
  name: string;
  facilityCode: string;
  governorate: string;
  address: string;
  phone: string;
  status: "active" | "inactive";
}

export interface UpdateBloodBankInput {
  name?: string;
  facilityCode?: string;
  governorate?: string;
  address?: string;
  phone?: string;
  status?: "active" | "inactive";
}

export interface AdminRoleDefinition {
  code: UserRole;
  name: string;
  description: string;
  userCount: number;
  isSystem: boolean;
  isFuture: boolean;
}

export type PermissionCategory =
  | "requests"
  | "inventory"
  | "documents"
  | "administration";

export interface PermissionDefinition {
  id: string;
  code: string;
  label: string;
  description: string;
  category: PermissionCategory;
  isHighImpact?: boolean;
}

export type RolePermissionsMap = Record<UserRole, string[]>;

export interface AuditLogEvent {
  id: string;
  timestamp: string;
  actor: {
    id: string;
    name: string;
    role: UserRole;
    organization: string;
  };
  action: string;
  entityType:
    | "User"
    | "Hospital"
    | "Blood Bank"
    | "Role & Permission"
    | "Blood Request"
    | "Blood Unit";
  entityId: string;
  entityName?: string;
  organization: string;
  result: "success" | "warning" | "failure";
  details?: string;
  metadata?: Record<string, unknown>;
}

export interface AuditFilters {
  search: string;
  actor: string | "all";
  organization: string | "all";
  action: string | "all";
  dateRange: "all" | "today" | "past_7_days" | "past_30_days";
  sortBy: "timestamp_desc" | "timestamp_asc";
}

export interface AdminGovernanceKPIs {
  totalUsers: number;
  activeUsers: number;
  totalHospitals: number;
  totalBloodBanks: number;
  activeBloodRequests: number;
  recentAdminChanges: number;
}
