import { ShieldCheck, Sparkles, Users } from "lucide-react";
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
          <bdi dir="ltr">{roles.length}</bdi> {t("admin.rolesTitle", "defined roles")}
        </span>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {roles.map((role) => {
          const isSelected = selectedRole === role.code;

          return (
            <button
              key={role.code}
              type="button"
              onClick={() => onSelectRole(role.code)}
              className={cn(
                "flex flex-col justify-between rounded-lg border p-4 text-start transition-all hover:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
                isSelected
                  ? "border-primary bg-primary/5 ring-1 ring-primary"
                  : "border-border bg-card hover:border-border/80",
              )}
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <AdminRoleBadge role={role.code} />
                  {role.isSystem ? (
                    <span className="inline-flex items-center gap-1 rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-medium text-slate-700">
                      <ShieldCheck className="size-3" />
                      <span>{t("nav.administration", "System")}</span>
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 rounded bg-amber-50 px-1.5 py-0.5 text-[10px] font-medium text-amber-800">
                      <Sparkles className="size-3" />
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
                    <bdi dir="ltr">{role.userCount}</bdi> {t("admin.totalUsersHelper", "users")}
                  </span>
                </span>
                <span
                  className={cn(
                    "text-[11px] font-medium",
                    isSelected ? "text-primary font-semibold" : "text-muted-foreground",
                  )}
                >
                  {isSelected ? t("common.inspect", "Inspecting") : t("common.inspect", "Inspect")}
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </section>
  );
}
