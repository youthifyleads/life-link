import {
  Calendar,
  Clock,
  Mail,
  Phone,
  Shield,
} from "lucide-react";
import { useTranslation } from "react-i18next";

import { formatDateTime } from "@/features/admin/components/admin-formatters";
import { AdminRoleBadge } from "@/features/admin/components/admin-role-badge";
import { AdminStatusBadge } from "@/features/admin/components/admin-status-badge";
import type { AdminUser } from "@/features/admin/types/admin.types";
import { Button } from "@/shared/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog";

interface UserDetailsDialogProps {
  user: AdminUser | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEdit?: (user: AdminUser) => void;
}

export function UserDetailsDialog({
  user,
  open,
  onOpenChange,
  onEdit,
}: UserDetailsDialogProps) {
  const { t } = useTranslation();
  if (!user) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs font-semibold text-muted-foreground">
              <bdi dir="ltr">{user.id}</bdi>
            </span>
            <AdminStatusBadge status={user.status} />
          </div>
          <DialogTitle className="text-lg">{user.fullName}</DialogTitle>
          <DialogDescription>{user.organizationName}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2 text-sm">
          <div className="rounded-lg border border-border bg-muted/40 p-4 space-y-3">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Mail className="size-4 shrink-0" />
              <span className="font-mono text-xs text-foreground select-all">
                <bdi dir="ltr">{user.email}</bdi>
              </span>
            </div>

            {user.phone && (
              <div className="flex items-center gap-2 text-muted-foreground">
                <Phone className="size-4 shrink-0" />
                <span className="text-xs text-foreground">
                  <bdi dir="ltr">{user.phone}</bdi>
                </span>
              </div>
            )}

            <div className="flex items-center gap-2 text-muted-foreground">
              <Shield className="size-4 shrink-0" />
              <div className="flex items-center gap-1.5">
                <span className="text-xs">{t("admin.primaryRoleLabel", "Primary Role:")}</span>
                <AdminRoleBadge role={user.primaryRole} />
              </div>
            </div>
          </div>

          <div className="divide-y divide-border rounded-lg border border-border bg-card p-3 text-xs">
            <div className="flex items-center justify-between py-2">
              <span className="flex items-center gap-1.5 text-muted-foreground">
                <Calendar className="size-3.5" />
                <span>{t("admin.userCreatedCol", "Created Date")}</span>
              </span>
              <span className="font-mono text-foreground">
                <bdi dir="ltr">{formatDateTime(user.createdAt)}</bdi>
              </span>
            </div>
            <div className="flex items-center justify-between py-2">
              <span className="flex items-center gap-1.5 text-muted-foreground">
                <Clock className="size-3.5" />
                <span>{t("admin.userLastActivityCol", "Last Activity")}</span>
              </span>
              <span className="font-mono text-foreground">
                <bdi dir="ltr">{formatDateTime(user.lastActivityAt)}</bdi>
              </span>
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button
            type="button"
            variant="secondary"
            onClick={() => onOpenChange(false)}
          >
            {t("common.close", "Close")}
          </Button>
          {onEdit && (
            <Button
              type="button"
              onClick={() => {
                onOpenChange(false);
                onEdit(user);
              }}
            >
              {t("admin.editUserAction", "Edit User")}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
