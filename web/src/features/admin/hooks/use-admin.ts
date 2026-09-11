import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  createAdminBloodBank,
  createAdminHospital,
  createAdminUser,
  getAdminAuditLogs,
  getAdminBloodBanks,
  getAdminHospitals,
  getAdminKPIs,
  getAdminRoles,
  getAdminUsers,
  getPermissionMatrix,
  toggleBloodBankStatus,
  toggleHospitalStatus,
  toggleUserStatus,
  updateAdminBloodBank,
  updateAdminHospital,
  updateAdminUser,
  updateRolePermissions,
} from "@/features/admin/mocks/admin.mock";
import type {
  AuditFilters,
  BloodBankFilters,
  CreateBloodBankInput,
  CreateHospitalInput,
  CreateUserInput,
  HospitalFilters,
  UpdateBloodBankInput,
  UpdateHospitalInput,
  UpdateUserInput,
  UserFilters,
} from "@/features/admin/types/admin.types";
import type { UserRole } from "@/features/authentication/model/auth.types";

export const adminQueryKeys = {
  all: ["admin"] as const,
  kpis: () => ["admin", "kpis"] as const,
  users: (filters?: Partial<UserFilters>) => ["admin", "users", filters] as const,
  hospitals: (filters?: Partial<HospitalFilters>) => ["admin", "hospitals", filters] as const,
  bloodBanks: (filters?: Partial<BloodBankFilters>) => ["admin", "blood-banks", filters] as const,
  roles: () => ["admin", "roles"] as const,
  permissions: () => ["admin", "permissions"] as const,
  audit: (filters?: Partial<AuditFilters>) => ["admin", "audit", filters] as const,
};

export function useAdminKPIs() {
  return useQuery({
    queryKey: adminQueryKeys.kpis(),
    queryFn: () => getAdminKPIs(),
  });
}

export function useAdminUsers(filters?: Partial<UserFilters>) {
  return useQuery({
    queryKey: adminQueryKeys.users(filters),
    queryFn: () => getAdminUsers(filters),
  });
}

export function useCreateAdminUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateUserInput) => createAdminUser(input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["admin"] });
    },
  });
}

export function useUpdateAdminUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateUserInput }) =>
      updateAdminUser(id, input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["admin"] });
    },
  });
}

export function useToggleUserStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => toggleUserStatus(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["admin"] });
    },
  });
}

export function useAdminHospitals(filters?: Partial<HospitalFilters>) {
  return useQuery({
    queryKey: adminQueryKeys.hospitals(filters),
    queryFn: () => getAdminHospitals(filters),
  });
}

export function useCreateAdminHospital() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateHospitalInput) => createAdminHospital(input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["admin"] });
    },
  });
}

export function useUpdateAdminHospital() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateHospitalInput }) =>
      updateAdminHospital(id, input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["admin"] });
    },
  });
}

export function useToggleHospitalStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => toggleHospitalStatus(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["admin"] });
    },
  });
}

export function useAdminBloodBanks(filters?: Partial<BloodBankFilters>) {
  return useQuery({
    queryKey: adminQueryKeys.bloodBanks(filters),
    queryFn: () => getAdminBloodBanks(filters),
  });
}

export function useCreateAdminBloodBank() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateBloodBankInput) => createAdminBloodBank(input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["admin"] });
    },
  });
}

export function useUpdateAdminBloodBank() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateBloodBankInput }) =>
      updateAdminBloodBank(id, input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["admin"] });
    },
  });
}

export function useToggleBloodBankStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => toggleBloodBankStatus(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["admin"] });
    },
  });
}

export function useAdminRoles() {
  return useQuery({
    queryKey: adminQueryKeys.roles(),
    queryFn: () => getAdminRoles(),
  });
}

export function usePermissionMatrix() {
  return useQuery({
    queryKey: adminQueryKeys.permissions(),
    queryFn: () => getPermissionMatrix(),
  });
}

export function useUpdateRolePermissions() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      role,
      permissions,
    }: {
      role: UserRole;
      permissions: string[];
    }) => updateRolePermissions(role, permissions),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["admin"] });
    },
  });
}

export function useAdminAuditLogs(filters?: Partial<AuditFilters>) {
  return useQuery({
    queryKey: adminQueryKeys.audit(filters),
    queryFn: () => getAdminAuditLogs(filters),
  });
}
