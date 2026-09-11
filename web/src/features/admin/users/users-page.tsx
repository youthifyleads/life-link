import { UserPlus } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";

import { AdminPageFrame } from "@/features/admin/components/admin-page-frame";
import { useAdminUsers } from "@/features/admin/hooks/use-admin";
import type { AdminUser, UserFilters } from "@/features/admin/types/admin.types";
import { UserDetailsDialog } from "@/features/admin/users/user-details-dialog";
import { UserFormDialog } from "@/features/admin/users/user-form-dialog";
import { UsersFilters } from "@/features/admin/users/users-filters";
import { UsersTable } from "@/features/admin/users/users-table";
import { LoadingState } from "@/shared/components/feedback/system-states";
import { Button } from "@/shared/components/ui/button";

const initialFilters: UserFilters = {
  search: "",
  role: "all",
  organization: "all",
  status: "all",
  sortBy: "name_asc",
};

export function UsersPage() {
  const { t } = useTranslation();
  const [filters, setFilters] = useState<UserFilters>(initialFilters);
  const [formOpen, setFormOpen] = useState(false);
  const [selectedUserToEdit, setSelectedUserToEdit] = useState<AdminUser | null>(null);
  const [selectedUserToView, setSelectedUserToView] = useState<AdminUser | null>(null);
  const [viewOpen, setViewOpen] = useState(false);

  const { data: users, isLoading } = useAdminUsers(filters);

  const handleOpenCreate = () => {
    setSelectedUserToEdit(null);
    setFormOpen(true);
  };

  const handleOpenEdit = (user: AdminUser) => {
    setSelectedUserToEdit(user);
    setFormOpen(true);
  };

  const handleOpenView = (user: AdminUser) => {
    setSelectedUserToView(user);
    setViewOpen(true);
  };

  const handleResetFilters = () => {
    setFilters(initialFilters);
  };

  return (
    <AdminPageFrame
      title={t("admin.usersDirectoryTitle", "Users Management")}
      description={t(
        "admin.usersDirectoryDesc",
        "Supervise system user accounts, assign primary operational roles, and manage healthcare organization affiliations.",
      )}
      breadcrumbs={[
        { label: t("nav.administration", "Administration") },
        { label: t("nav.users", "Users") },
      ]}
      actions={
        <Button onClick={handleOpenCreate} size="sm" className="gap-1.5">
          <UserPlus className="size-4" aria-hidden="true" />
          <span>{t("admin.createUserAction", "Create User")}</span>
        </Button>
      }
    >
      <div className="space-y-6">
        <UsersFilters
          filters={filters}
          onFilterChange={setFilters}
          onReset={handleResetFilters}
        />

        {isLoading || !users ? (
          <LoadingState label={t("common.loadingRecords", "Loading users directory…")} rows={6} />
        ) : (
          <UsersTable
            users={users}
            onView={handleOpenView}
            onEdit={handleOpenEdit}
          />
        )}
      </div>

      <UserFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        userToEdit={selectedUserToEdit}
      />

      <UserDetailsDialog
        user={selectedUserToView}
        open={viewOpen}
        onOpenChange={setViewOpen}
        onEdit={handleOpenEdit}
      />
    </AdminPageFrame>
  );
}
