import { AlertTriangle, Check, Shield } from "lucide-react";
import { useTranslation } from "react-i18next";

import { AdminRoleBadge } from "@/features/admin/components/admin-role-badge";
import type {
  PermissionCategory,
  PermissionDefinition,
  RolePermissionsMap,
} from "@/features/admin/types/admin.types";
import type { UserRole } from "@/features/authentication/model/auth.types";
import { cn } from "@/shared/lib/utils";

interface PermissionMatrixTableProps {
  permissions: PermissionDefinition[];
  rolePermissions: RolePermissionsMap;
  selectedRole: UserRole;
  onTogglePermission: (
    role: UserRole,
    permission: PermissionDefinition,
    currentGranted: boolean,
  ) => void;
  isUpdating?: boolean;
}

const categoryMeta: Record<
  PermissionCategory,
  { label: string; description: string }
> = {
  requests: {
    label: "Clinical Blood Requests",
    description:
      "Requisition creation, workflow progression, cancellation, and timeline operations.",
  },
  inventory: {
    label: "Blood Stock & Cold Chain",
    description:
      "Donor unit registration, cold storage positioning, stock tracking, and allocation.",
  },
  documents: {
    label: "Clinical Documentation",
    description:
      "Diagnostic reports, antibody screens, transfusion waivers, and compliance sign-offs.",
  },
  administration: {
    label: "System Administration & Security",
    description:
      "Directory management, facility provisioning, role configuration, and audit logs.",
  },
};

export function PermissionMatrixTable({
  permissions,
  rolePermissions,
  selectedRole,
  onTogglePermission,
  isUpdating,
}: PermissionMatrixTableProps) {
  const { t } = useTranslation();
  const currentRolePerms = rolePermissions[selectedRole] ?? [];

  const categories: PermissionCategory[] = [
    "requests",
    "inventory",
    "documents",
    "administration",
  ];

  return (
    <div className="rounded-lg border border-border/80 bg-card shadow-2xs overflow-hidden">
      <div className="flex flex-col gap-3 border-b border-border p-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base font-semibold tracking-tight text-foreground">
              {t("admin.rolesTitle", "Permission Matrix")}
            </h3>
            <AdminRoleBadge
              role={selectedRole}
              className="bg-transparent px-0 text-foreground"
            />
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            {t(
              "admin.rolesPermissionsDesc",
              "Configure granted capabilities for the currently inspected role. High-impact operations prompt explicit confirmation.",
            )}
          </p>
        </div>

        <div className="flex items-center gap-2 rounded-md bg-muted/40 px-3 py-1.5 text-xs text-muted-foreground font-mono">
          <Shield className="size-3.5 text-primary" />
          <span>
            <bdi dir="ltr">{currentRolePerms.length}</bdi> /{" "}
            <bdi dir="ltr">{permissions.length}</bdi>{" "}
            {t("admin.permissions", "capabilities granted")}
          </span>
        </div>
      </div>

      <div className="divide-y divide-border">
        {categories.map((category) => {
          const catMeta = categoryMeta[category];
          const catPermissions = permissions.filter(
            (p) => p.category === category,
          );

          return (
            <div key={category} className="p-5">
              <div className="mb-4">
                <span className="text-xs font-semibold text-foreground">
                  {catMeta.label}
                </span>
                <p className="mt-1 text-xs text-muted-foreground">
                  {catMeta.description}
                </p>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-2">
                {catPermissions.map((permission) => {
                  const isGranted = currentRolePerms.includes(permission.code);

                  return (
                    <div
                      key={permission.id}
                      className={cn(
                        "flex items-start justify-between gap-3 border-b border-border/70 py-3.5 transition-colors",
                        isGranted
                          ? "bg-primary/[0.02]"
                          : "bg-background hover:bg-muted/20",
                      )}
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <label
                            htmlFor={`perm-${selectedRole}-${permission.id}`}
                            className="cursor-pointer text-xs font-semibold text-foreground"
                          >
                            {permission.label}
                          </label>
                          {permission.isHighImpact && (
                            <span className="inline-flex items-center gap-1 text-[10px] font-medium text-amber-800">
                              <AlertTriangle className="size-2.5" />
                              <span>{t("common.warning", "High-Impact")}</span>
                            </span>
                          )}
                        </div>
                        <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                          {permission.description}
                        </p>
                      </div>

                      <div className="flex shrink-0 items-center">
                        <input
                          id={`perm-${selectedRole}-${permission.id}`}
                          type="checkbox"
                          checked={isGranted}
                          disabled={
                            isUpdating ||
                            (selectedRole === "admin" &&
                              permission.category === "administration")
                          }
                          onChange={() =>
                            onTogglePermission(
                              selectedRole,
                              permission,
                              isGranted,
                            )
                          }
                          aria-label={t("admin.permissionForRole", {
                            permission: permission.label,
                            role: selectedRole,
                          })}
                          className="size-4 rounded border-border text-primary focus:ring-primary focus:ring-offset-background disabled:opacity-50"
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex items-center justify-between border-t border-border bg-muted/20 px-5 py-3 text-xs text-muted-foreground">
        <span className="flex items-center gap-1.5">
          <Check className="size-3.5 text-emerald-600" />
          <span>
            {t(
              "admin.rolesDesc",
              "Explicit permission model. Avoids ambiguous wildcards.",
            )}
          </span>
        </span>
        <span>
          {t("admin.auditDesc", "Changes generate immutable audit events")}
        </span>
      </div>
    </div>
  );
}
