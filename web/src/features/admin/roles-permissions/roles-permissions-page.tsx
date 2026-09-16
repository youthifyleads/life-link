import { useState } from "react";
import { useTranslation } from "react-i18next";

import { AdminPageFrame } from "@/features/admin/components/admin-page-frame";
import {
  useAdminRoles,
  usePermissionMatrix,
  useUpdateRolePermissions,
} from "@/features/admin/hooks/use-admin";
import { PermissionConfirmModal } from "@/features/admin/roles-permissions/permission-confirm-modal";
import { PermissionMatrixTable } from "@/features/admin/roles-permissions/permission-matrix-table";
import { RoleListPanel } from "@/features/admin/roles-permissions/role-list-panel";
import type { PermissionDefinition } from "@/features/admin/types/admin.types";
import type { UserRole } from "@/features/authentication/model/auth.types";
import { LoadingState } from "@/shared/components/feedback/system-states";

export function RolesPermissionsPage() {
  const { t } = useTranslation();
  const [selectedRole, setSelectedRole] = useState<UserRole>("hospital_staff");
  const [confirmModal, setConfirmModal] = useState<{
    open: boolean;
    role: UserRole;
    permission: PermissionDefinition | null;
    action: "grant" | "revoke";
  }>({
    open: false,
    role: "hospital_staff",
    permission: null,
    action: "grant",
  });

  const { data: roles, isLoading: rolesLoading } = useAdminRoles();
  const { data: matrixData, isLoading: matrixLoading } = usePermissionMatrix();
  const updateMutation = useUpdateRolePermissions();

  const handleTogglePermission = (
    role: UserRole,
    permission: PermissionDefinition,
    currentGranted: boolean,
  ) => {
    const action = currentGranted ? "revoke" : "grant";

    // If permission is high-impact, prompt confirmation modal first
    if (permission.isHighImpact || permission.category === "administration") {
      setConfirmModal({
        open: true,
        role,
        permission,
        action,
      });
      return;
    }

    // Otherwise apply directly
    executeToggle(role, permission.code, currentGranted);
  };

  const executeToggle = async (
    role: UserRole,
    permissionCode: string,
    currentGranted: boolean,
  ) => {
    if (!matrixData) return;

    const currentPerms = matrixData.rolePermissions[role] ?? [];
    const updatedPerms = currentGranted
      ? currentPerms.filter((p) => p !== permissionCode)
      : [...currentPerms, permissionCode];

    await updateMutation.mutateAsync({
      role,
      permissions: updatedPerms,
    });
  };

  const handleConfirmHighImpact = async () => {
    if (!confirmModal.permission) return;

    const isCurrentlyGranted = confirmModal.action === "revoke";
    await executeToggle(
      confirmModal.role,
      confirmModal.permission.code,
      isCurrentlyGranted,
    );

    setConfirmModal((prev) => ({ ...prev, open: false }));
  };

  if (rolesLoading || matrixLoading || !roles || !matrixData) {
    return (
      <AdminPageFrame
        title={t("admin.rolesPermissionsTitle", "Roles & Permissions")}
        description={t(
          "admin.rolesPermissionsDesc",
          "Configure role-based access control boundaries, clinical capabilities, and administrative privileges.",
        )}
        breadcrumbs={[
          { label: t("nav.administration", "Administration") },
          { label: t("nav.rolesPermissions", "Roles & Permissions") },
        ]}
      >
        <LoadingState label={t("common.loadingRecords", "Loading access control matrix…")} rows={6} />
      </AdminPageFrame>
    );
  }

  const selectedRoleDef = roles.find((r) => r.code === selectedRole);

  return (
    <AdminPageFrame
      title={t("admin.rolesPermissionsTitle", "Roles & Permissions")}
      description={t(
        "admin.rolesPermissionsDesc",
        "Configure role-based access control boundaries, clinical capabilities, and administrative privileges.",
      )}
      breadcrumbs={[
        { label: t("nav.administration", "Administration") },
        { label: t("nav.rolesPermissions", "Roles & Permissions") },
      ]}
    >
      <div className="space-y-8">
        {/* Roles Directory */}
        <RoleListPanel
          roles={roles}
          selectedRole={selectedRole}
          onSelectRole={setSelectedRole}
        />

        {/* Selected Role Permission Matrix */}
        <PermissionMatrixTable
          permissions={matrixData.permissions}
          rolePermissions={matrixData.rolePermissions}
          selectedRole={selectedRole}
          onTogglePermission={handleTogglePermission}
          isUpdating={updateMutation.isPending}
        />
      </div>

      {/* High-Impact Confirmation Modal */}
      {confirmModal.permission && (
        <PermissionConfirmModal
          open={confirmModal.open}
          onOpenChange={(open) =>
            setConfirmModal((prev) => ({ ...prev, open }))
          }
          roleName={selectedRoleDef?.name ?? confirmModal.role}
          permissionLabel={confirmModal.permission.label}
          action={confirmModal.action}
          onConfirm={() => void handleConfirmHighImpact()}
          isPending={updateMutation.isPending}
        />
      )}
    </AdminPageFrame>
  );
}
