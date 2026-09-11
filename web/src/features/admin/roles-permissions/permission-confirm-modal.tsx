import { AlertTriangle, ShieldAlert } from "lucide-react";
import { useTranslation } from "react-i18next";

import { Button } from "@/shared/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog";

interface PermissionConfirmModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  roleName: string;
  permissionLabel: string;
  action: "grant" | "revoke";
  onConfirm: () => void;
  isPending?: boolean;
}

export function PermissionConfirmModal({
  open,
  onOpenChange,
  roleName,
  permissionLabel,
  action,
  onConfirm,
  isPending,
}: PermissionConfirmModalProps) {
  const { t } = useTranslation();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="flex size-10 items-center justify-center rounded-full bg-amber-100 text-amber-800 mb-2">
            <AlertTriangle className="size-5" aria-hidden="true" />
          </div>
          <DialogTitle className="text-base">
            {t("admin.confirmRoleChange", "High-Impact Permission Modification")}
          </DialogTitle>
          <DialogDescription>
            {t("admin.confirmRoleChangeDesc", "Altering platform permissions modifies security governance. Confirm this administrative action.")} (
            <span className="font-semibold text-foreground">{roleName}</span>)
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 py-2 text-xs">
          <div className="rounded-lg border border-amber-200 bg-amber-50/60 p-3 text-amber-900">
            <div className="flex items-start gap-2">
              <ShieldAlert className="mt-0.5 size-4 shrink-0 text-amber-800" />
              <div>
                <p className="font-semibold">{t("admin.permissions", "Privilege")}: {permissionLabel}</p>
                <p className="mt-1 leading-relaxed text-amber-800">
                  {t("admin.rolesDesc", "Modifying this permission directly shifts security boundaries across all current and future users assigned to this role.")}
                </p>
              </div>
            </div>
          </div>
          <p className="text-muted-foreground">
            {t("admin.auditDesc", "This administrative operation will be permanently recorded in the system audit ledger.")}
          </p>
        </div>

        <DialogFooter className="gap-2">
          <Button
            type="button"
            variant="secondary"
            onClick={() => onOpenChange(false)}
          >
            {t("common.cancel", "Cancel")}
          </Button>
          <Button
            type="button"
            variant={action === "revoke" ? "destructive" : "default"}
            onClick={onConfirm}
            disabled={isPending}
          >
            {isPending
              ? t("common.loading", "Updating…")
              : action === "grant"
                ? t("common.confirm", "Confirm Grant")
                : t("common.confirm", "Confirm Revocation")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
