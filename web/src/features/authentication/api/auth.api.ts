import { apiClient, authHttpClient } from "@/shared/api/http-client";
import type {
  AuthMessageResponse,
  AuthenticatedUser,
  ForgotPasswordInput,
  LoginInput,
  ResetPasswordInput,
  TokenResponse,
  UserRole,
} from "@/features/authentication/model/auth.types";

interface BackendUserPayload {
  id: string;
  email: string;
  full_name?: string;
  display_name?: string;
  role?: string;
  primary_role?: string;
  institution_id?: string | null;
  is_active?: boolean;
  status?: string;
  phone?: string | null;
}

export function mapBackendRoleToFrontendRole(role?: string): UserRole {
  switch (role) {
    case "hospital_user":
    case "hospital_staff":
      return "hospital_staff";
    case "blood_bank_operator":
    case "blood_bank_staff":
    case "lab_technician":
      return "blood_bank_staff";
    case "admin":
      return "admin";
    case "medical_lead":
      return "medical_lead";
    case "platform_support":
      return "platform_support";
    case "caregiver":
      return "caregiver";
    case "donor":
    case "normal_user":
      return "donor";
    default:
      return "hospital_staff";
  }
}

export function adaptBackendUser(data: unknown): AuthenticatedUser {
  const raw = (data || {}) as BackendUserPayload;

  if (raw.primary_role && Array.isArray((data as AuthenticatedUser)?.organizations)) {
    return data as AuthenticatedUser;
  }

  const roleStr = String(raw.role || raw.primary_role || "hospital_user");
  const primaryRole = mapBackendRoleToFrontendRole(roleStr);
  const orgType =
    primaryRole === "hospital_staff" || primaryRole === "medical_lead"
      ? "hospital"
      : primaryRole === "blood_bank_staff"
        ? "blood_bank"
        : "platform";
  const orgName =
    primaryRole === "hospital_staff" || primaryRole === "medical_lead"
      ? "Al-Qasr Al-Aini Hospital"
      : primaryRole === "blood_bank_staff"
        ? "National Blood Transfusion Center"
        : "Life Link Platform";
  const orgId = String(raw.institution_id || `org-${raw.id || "default"}`);

  return {
    id: String(raw.id || "user-id"),
    email: String(raw.email || ""),
    display_name: String(raw.full_name || raw.display_name || (raw.email ? String(raw.email).split("@")[0] : "User")),
    primary_role: primaryRole,
    roles: [primaryRole],
    active_organization_id: orgId,
    organizations: [
      {
        id: orgId,
        name: orgName,
        type: orgType,
      },
    ],
    permissions: [
      "hospital.requests.view",
      "hospital.requests.create",
      "hospital.requests.cancel",
      "hospital.documents.upload",
      "blood_bank.inventory.view",
      "blood_bank.requests.view",
      "blood_bank.requests.allocate",
    ],
  };
}

export const authApi = {
  async login(input: LoginInput) {
    const { data } = await authHttpClient.post<TokenResponse>(
      "/auth/login",
      input,
    );
    return data;
  },

  async refresh() {
    const { data } = await authHttpClient.post<TokenResponse>("/auth/refresh");
    return data;
  },

  async getCurrentUser(): Promise<AuthenticatedUser> {
    const { data } = await apiClient.get<unknown>("/auth/me");
    return adaptBackendUser(data);
  },

  async logout() {
    await authHttpClient.post("/auth/logout");
  },

  async forgotPassword(input: ForgotPasswordInput) {
    const { data } = await authHttpClient.post<AuthMessageResponse>(
      "/auth/forgot-password",
      input,
    );
    return data;
  },

  async resetPassword(input: ResetPasswordInput) {
    const { data } = await authHttpClient.post<AuthMessageResponse>(
      "/auth/reset-password",
      input,
    );
    return data;
  },
};
