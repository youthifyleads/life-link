import { Edit, Eye, Power, PowerOff } from "lucide-react";
import { useTranslation } from "react-i18next";

import { formatDate, formatTimeShort } from "@/features/admin/components/admin-formatters";
import { AdminRoleBadge } from "@/features/admin/components/admin-role-badge";
import { AdminStatusBadge } from "@/features/admin/components/admin-status-badge";
import { useToggleUserStatus } from "@/features/admin/hooks/use-admin";
import type { AdminUser } from "@/features/admin/types/admin.types";
import { Button } from "@/shared/components/ui/button";

interface UsersTableProps {
  users: AdminUser[];
  onView: (user: AdminUser) => void;
  onEdit: (user: AdminUser) => void;
}

export function UsersTable({ users, onView, onEdit }: UsersTableProps) {
  const { t } = useTranslation();
  const toggleMutation = useToggleUserStatus();

  const handleToggle = (user: AdminUser) => {
    void toggleMutation.mutateAsync(user.id);
  };

  if (users.length === 0) {
    return (
      <div className="rounded-lg border border-border bg-card p-12 text-center">
        <h3 className="text-sm font-semibold text-foreground">
          {t("admin.noUsersFoundTitle", "No users match your filter criteria")}
        </h3>
        <p className="mt-1 text-xs text-muted-foreground">
          {t(
            "admin.noUsersFoundDesc",
            "Try adjusting your search terms, role filters, or status selection.",
          )}
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-lg border border-border bg-card shadow-sm">
      <div
        tabIndex={0}
        role="region"
        aria-label={t("admin.usersTableLabel")}
        className="overflow-x-auto"
      >
        <table className="w-full text-start text-xs">
          <thead className="border-b border-border bg-muted/40 font-semibold uppercase tracking-wider text-muted-foreground">
            <tr>
              <th scope="col" className="px-4 py-3 text-start">
                {t("admin.auditEntityIdCol", "User ID")}
              </th>
              <th scope="col" className="px-4 py-3 text-start">
                {t("admin.userFullNameCol", "Full Name")}
              </th>
              <th scope="col" className="px-4 py-3 text-start">
                {t("admin.userEmailCol", "Email")}
              </th>
              <th scope="col" className="px-4 py-3 text-start">
                {t("admin.userRoleCol", "Role")}
              </th>
              <th scope="col" className="px-4 py-3 text-start">
                {t("admin.userOrgCol", "Organization")}
              </th>
              <th scope="col" className="px-4 py-3 text-start">
                {t("admin.userStatusCol", "Status")}
              </th>
              <th scope="col" className="px-4 py-3 text-start">
                {t("admin.userCreatedCol", "Created Date")}
              </th>
              <th scope="col" className="px-4 py-3 text-start">
                {t("admin.userLastActivityCol", "Last Activity")}
              </th>
              <th scope="col" className="px-4 py-3 text-end">
                {t("admin.userActionsCol", "Actions")}
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {users.map((user) => (
              <tr
                key={user.id}
                className="transition-colors hover:bg-muted/30 focus-within:bg-muted/30"
              >
                <td className="whitespace-nowrap px-4 py-3 font-mono text-[11px] font-medium text-foreground">
                  <button
                    type="button"
                    onClick={() => onView(user)}
                    className="hover:underline text-primary focus-visible:outline-none"
                    title={t("common.viewDetails", "View user details")}
                  >
                    <bdi dir="ltr">{user.id}</bdi>
                  </button>
                </td>
                <td className="whitespace-nowrap px-4 py-3 font-semibold text-foreground">
                  {user.fullName}
                </td>
                <td className="whitespace-nowrap px-4 py-3 font-mono text-muted-foreground">
                  <bdi dir="ltr">{user.email}</bdi>
                </td>
                <td className="whitespace-nowrap px-4 py-3">
                  <AdminRoleBadge role={user.primaryRole} />
                </td>
                <td className="whitespace-nowrap px-4 py-3 text-muted-foreground">
                  <span className="font-medium text-foreground">
                    {user.organizationName}
                  </span>
                </td>
                <td className="whitespace-nowrap px-4 py-3">
                  <AdminStatusBadge status={user.status} />
                </td>
                <td className="whitespace-nowrap px-4 py-3 text-muted-foreground font-mono text-[11px]">
                  <bdi dir="ltr">{formatDate(user.createdAt)}</bdi>
                </td>
                <td className="whitespace-nowrap px-4 py-3 text-muted-foreground font-mono text-[11px]">
                  <bdi dir="ltr">{formatTimeShort(user.lastActivityAt)}</bdi>
                </td>
                <td className="whitespace-nowrap px-4 py-3 text-end">
                  <div className="inline-flex items-center gap-1 justify-end">
                    <Button
                      type="button"
                      variant="secondary"
                      size="sm"
                      onClick={() => onView(user)}
                      className="size-7 p-0"
                      title={t("common.view", "View user profile")}
                      aria-label={`${t("common.view", "View")} ${user.fullName}`}
                    >
                      <Eye className="size-3.5" aria-hidden="true" />
                    </Button>
                    <Button
                      type="button"
                      variant="secondary"
                      size="sm"
                      onClick={() => onEdit(user)}
                      className="size-7 p-0"
                      title={t("common.edit", "Edit user details")}
                      aria-label={`${t("common.edit", "Edit")} ${user.fullName}`}
                    >
                      <Edit className="size-3.5" aria-hidden="true" />
                    </Button>
                    <Button
                      type="button"
                      variant="secondary"
                      size="sm"
                      onClick={() => handleToggle(user)}
                      disabled={toggleMutation.isPending}
                      className={`size-7 p-0 ${
                        user.status === "active"
                          ? "text-rose-700 hover:text-rose-800"
                          : "text-emerald-700 hover:text-emerald-800"
                      }`}
                      title={
                        user.status === "active"
                          ? t("admin.deactivateUserAction", "Deactivate user")
                          : t("admin.activateUserAction", "Activate user")
                      }
                      aria-label={
                        user.status === "active"
                          ? `${t("admin.deactivateUserAction", "Deactivate")} ${user.fullName}`
                          : `${t("admin.activateUserAction", "Activate")} ${user.fullName}`
                      }
                    >
                      {user.status === "active" ? (
                        <PowerOff className="size-3.5" aria-hidden="true" />
                      ) : (
                        <Power className="size-3.5" aria-hidden="true" />
                      )}
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="border-t border-border bg-muted/20 px-4 py-3 text-xs text-muted-foreground">
        {t("hospital.records", "records")}: <bdi dir="ltr">{users.length}</bdi>
      </div>
    </div>
  );
}
