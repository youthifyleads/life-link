import { apiClient } from "@/shared/api/http-client";
import type {
  AdminUser,
  AdminHospital,
  AdminBloodBank,
  CreateUserInput,
  UpdateUserInput,
  CreateHospitalInput,
  CreateBloodBankInput,
  UserFilters,
  HospitalFilters,
  BloodBankFilters,
} from "@/features/admin/types/admin.types";
import type { UserRole } from "@/features/authentication/model/auth.types";

export interface BackendUserDTO {
  id: string;
  email: string;
  name: string;
  role: string;
  institution_id?: string | null;
  is_active: boolean;
  phone?: string | null;
  created_at: string;
  updated_at: string;
}

export interface BackendInstitutionDTO {
  id: string;
  name: string;
  type: "hospital" | "blood_bank";
  code: string;
  address?: string | null;
  governorate?: string | null;
  phone?: string | null;
  email?: string | null;
  is_active: boolean;
  latitude?: number | null;
  longitude?: number | null;
  created_at: string;
  updated_at: string;
}

export function mapBackendUserDtoToAdminUser(dto: BackendUserDTO): AdminUser {
  return {
    id: dto.id,
    fullName: dto.name,
    email: dto.email,
    primaryRole: (dto.role as UserRole) || "hospital_staff",
    roles: [(dto.role as UserRole) || "hospital_staff"],
    organizationId: dto.institution_id || "unassigned",
    organizationName: "Associated Institution",
    organizationType: "hospital",
    status: dto.is_active ? "active" : "inactive",
    createdAt: dto.created_at,
    lastActivityAt: dto.updated_at,
    phone: dto.phone || undefined,
  };
}

export function mapBackendInstitutionDtoToHospital(dto: BackendInstitutionDTO): AdminHospital {
  return {
    id: dto.id,
    name: dto.name,
    facilityCode: dto.code,
    governorate: dto.governorate || "Cairo",
    address: dto.address || "Medical District",
    phone: dto.phone || "+20 2 0000 0000",
    status: dto.is_active ? "active" : "inactive",
    userCount: 3,
    activeRequestsCount: 1,
    createdAt: dto.created_at,
  };
}

export function mapBackendInstitutionDtoToBloodBank(dto: BackendInstitutionDTO): AdminBloodBank {
  return {
    id: dto.id,
    name: dto.name,
    facilityCode: dto.code,
    governorate: dto.governorate || "Cairo",
    address: dto.address || "Blood Transfusion Center",
    phone: dto.phone || "+20 2 0000 0000",
    status: dto.is_active ? "active" : "inactive",
    staffCount: 4,
    inventorySummary: {
      totalAvailable: 150,
      posture: "optimal",
      lowStockGroupsCount: 0,
    },
    createdAt: dto.created_at,
  };
}

export const adminApi = {
  async getUsers(filters?: Partial<UserFilters>): Promise<AdminUser[]> {
    const params: Record<string, string> = {};
    if (filters?.role && filters.role !== "all") {
      params.role = filters.role;
    }
    const { data } = await apiClient.get<BackendUserDTO[]>("/users", { params });
    return data.map(mapBackendUserDtoToAdminUser);
  },

  async createUser(input: CreateUserInput): Promise<AdminUser> {
    const payload = {
      name: input.fullName,
      email: input.email,
      password: input.password || "TempPass@2026",
      role: input.primaryRole,
      institution_id: input.organizationId || null,
      phone: input.phone || null,
    };
    const { data } = await apiClient.post<BackendUserDTO>("/users", payload);
    return mapBackendUserDtoToAdminUser(data);
  },

  async updateUser(id: string, input: UpdateUserInput): Promise<AdminUser> {
    const payload: Record<string, any> = {};
    if (input.fullName) payload.name = input.fullName;
    if (input.primaryRole) payload.role = input.primaryRole;
    if (input.organizationId) payload.institution_id = input.organizationId;
    if (input.status) payload.is_active = input.status === "active";
    if (input.phone) payload.phone = input.phone;

    const { data } = await apiClient.patch<BackendUserDTO>(`/users/${id}`, payload);
    return mapBackendUserDtoToAdminUser(data);
  },

  async getHospitals(_filters?: Partial<HospitalFilters>): Promise<AdminHospital[]> {
    const { data } = await apiClient.get<BackendInstitutionDTO[]>("/institutions", {
      params: { type: "hospital" },
    });
    return data.map(mapBackendInstitutionDtoToHospital);
  },

  async createHospital(input: CreateHospitalInput): Promise<AdminHospital> {
    const payload = {
      name: input.name,
      type: "hospital",
      code: input.facilityCode,
      governorate: input.governorate,
      address: input.address,
      phone: input.phone,
      is_active: input.status === "active",
    };
    const { data } = await apiClient.post<BackendInstitutionDTO>("/institutions", payload);
    return mapBackendInstitutionDtoToHospital(data);
  },

  async getBloodBanks(_filters?: Partial<BloodBankFilters>): Promise<AdminBloodBank[]> {
    const { data } = await apiClient.get<BackendInstitutionDTO[]>("/institutions", {
      params: { type: "blood_bank" },
    });
    return data.map(mapBackendInstitutionDtoToBloodBank);
  },

  async createBloodBank(input: CreateBloodBankInput): Promise<AdminBloodBank> {
    const payload = {
      name: input.name,
      type: "blood_bank",
      code: input.facilityCode,
      governorate: input.governorate,
      address: input.address,
      phone: input.phone,
      is_active: input.status === "active",
    };
    const { data } = await apiClient.post<BackendInstitutionDTO>("/institutions", payload);
    return mapBackendInstitutionDtoToBloodBank(data);
  },
};
