export const userRoles = [
  "hospital_staff",
  "blood_bank_staff",
  "admin",
  "donor",
  "caregiver",
  "medical_lead",
  "platform_support",
] as const;

export type UserRole = (typeof userRoles)[number];

export interface OrganizationSummary {
  id: string;
  name: string;
  type: "hospital" | "blood_bank" | "platform";
}

export interface AuthenticatedUser {
  id: string;
  email: string;
  display_name: string;
  primary_role: UserRole;
  roles: UserRole[];
  organizations: OrganizationSummary[];
  active_organization_id: string;
  permissions: string[];
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface TokenResponse {
  access_token: string;
  token_type: "bearer";
  expires_in: number;
}
