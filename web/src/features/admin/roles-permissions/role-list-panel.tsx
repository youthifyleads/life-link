import { Clock3, ShieldCheck, Users } from "lucide-react";
import { useTranslation } from "react-i18next";

import { AdminRoleBadge } from "@/features/admin/components/admin-role-badge";
import type { AdminRoleDefinition } from "@/features/admin/types/admin.types";
import type { UserRole } from "@/features/authentication/model/auth.types";
import { cn } from "@/shared/lib/utils";

interface RoleListPanelProps {
  roles: AdminRoleDefinition[];
  selectedRole: UserRole;
  onSelectRole: (role: UserRole) => void;
}

export function RoleListPanel({
  roles,
  selectedRole,
  onSelectRole,
}: RoleListPanelProps) {
  const { t } = useTranslation();

  return (
    <section aria-labelledby="roles-directory-heading" className="space-y-3">
      <div className="flex items-center justify-between">
        <h2
          id="roles-directory-heading"
          className="text-sm font-semibold tracking-tight text-foreground"
        >
          {t("admin.rolesTitle", "Operational Roles Directory")}
        </h2>
        <span className="text-xs text-muted-foreground">
          <bdi dir="ltr">{roles.length}</bdi>{" "}
          {t("admin.rolesTitle", "defined roles")}
        </span>
      </div>

      <div className="grid grid-cols-1 rounded-lg border border-border/80 bg-card shadow-2xs overflow-hidden sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {roles.map((role) => {
          const isSelected = selectedRole === role.code;

          return (
            <button
              key={role.code}
              type="button"
              onClick={() => onSelectRole(role.code)}
              className={cn(
                "flex flex-col justify-between border-b border-border/70 p-4 text-start transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
                isSelected ? "bg-primary/5" : "bg-card hover:bg-muted/30",
              )}
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <AdminRoleBadge
                    role={role.code}
                    className="bg-transparent px-0 text-foreground"
                  />
                  {role.isSystem ? (
                    <span className="inline-flex items-center gap-1 text-[10px] font-medium text-slate-700">
                      <ShieldCheck className="size-3" />
                      <span>{t("nav.administration", "System")}</span>
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-[10px] font-medium text-amber-800">
                      <Clock3 className="size-3" />
                      <span>{t("common.optional", "Future")}</span>
                    </span>
                  )}
                </div>

                <h3 className="mt-2 text-sm font-semibold text-foreground">
                  {t(`roles.${role.code}`, role.name)}
                </h3>
                <p className="mt-1 text-xs leading-relaxed text-muted-foreground line-clamp-2">
                  {role.description}
                </p>
              </div>

              <div className="mt-4 flex items-center justify-between border-t border-border/60 pt-3 text-xs text-muted-foreground">
                <span className="flex items-center gap-1.5">
                  <Users className="size-3.5" />
                  <span>
                    <bdi dir="ltr">{role.userCount}</bdi>{" "}
                    {t("admin.totalUsersHelper", "users")}
                  </span>
                </span>
                <span
                  className={cn(
                    "text-[11px] font-medium",
                    isSelected
                      ? "text-primary font-semibold"
                      : "text-muted-foreground",
                  )}
                >
                  {isSelected
                    ? t("common.inspect", "Inspecting")
                    : t("common.inspect", "Inspect")}
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </section>
  );
}
