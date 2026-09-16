import {
  Boxes,
  Calendar,
  MapPin,
  Phone,
  ShieldAlert,
  Users,
} from "lucide-react";
import { useTranslation } from "react-i18next";

import { formatDate } from "@/features/admin/components/admin-formatters";
import { AdminStatusBadge } from "@/features/admin/components/admin-status-badge";
import type { AdminBloodBank } from "@/features/admin/types/admin.types";
import { Button } from "@/shared/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog";

interface BloodBankDetailsDialogProps {
  bloodBank: AdminBloodBank | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEdit?: (bloodBank: AdminBloodBank) => void;
}

export function BloodBankDetailsDialog({
  bloodBank,
  open,
  onOpenChange,
  onEdit,
}: BloodBankDetailsDialogProps) {
  const { t } = useTranslation();
  if (!bloodBank) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs font-semibold uppercase text-rose-700">
              <bdi dir="ltr">{bloodBank.facilityCode}</bdi>
            </span>
            <AdminStatusBadge status={bloodBank.status} />
          </div>
          <DialogTitle className="text-lg">{bloodBank.name}</DialogTitle>
          <DialogDescription>{bloodBank.governorate} {t("common.governorate", "Governorate")}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2 text-sm">
          <div className="rounded-lg border border-border bg-muted/40 p-4 space-y-3">
            <div className="flex items-start gap-2 text-muted-foreground">
              <MapPin className="mt-0.5 size-4 shrink-0" />
              <span className="text-xs text-foreground">{bloodBank.address}</span>
            </div>

            <div className="flex items-center gap-2 text-muted-foreground">
              <Phone className="size-4 shrink-0" />
              <span className="text-xs text-foreground">
                <bdi dir="ltr">{bloodBank.phone}</bdi>
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 text-center">
            <div className="rounded-lg border border-border bg-card p-3 shadow-sm">
              <div className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
                <Users className="size-3.5" />
                <span>{t("admin.totalUsers", "Assigned Staff")}</span>
              </div>
              <div className="mt-1 text-xl font-bold text-foreground">
                <bdi dir="ltr">{bloodBank.staffCount}</bdi>
              </div>
            </div>

            <div className="rounded-lg border border-border bg-card p-3 shadow-sm">
              <div className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
                <Boxes className="size-3.5" />
                <span>{t("bloodBank.availableBloodUnits", "Available Units")}</span>
              </div>
              <div className="mt-1 text-xl font-bold text-foreground">
                <bdi dir="ltr">{bloodBank.inventorySummary.totalAvailable}</bdi>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between rounded-lg border border-border bg-card p-3 text-xs">
            <span className="flex items-center gap-1.5 text-muted-foreground">
              <ShieldAlert className="size-3.5" />
              <span>{t("healthcare.temperatureAssurance", "Cold Chain Posture")}</span>
            </span>
            <span
              className={`font-semibold capitalize ${
                bloodBank.inventorySummary.posture === "optimal"
                  ? "text-emerald-700"
                  : bloodBank.inventorySummary.posture === "warning"
                    ? "text-amber-800"
                    : "text-rose-800"
              }`}
            >
              {bloodBank.inventorySummary.posture}
            </span>
          </div>

          <div className="flex items-center justify-between rounded-lg border border-border bg-card px-4 py-2.5 text-xs">
            <span className="flex items-center gap-1.5 text-muted-foreground">
              <Calendar className="size-3.5" />
              <span>{t("admin.userCreatedCol", "Registered Date")}</span>
            </span>
            <span className="font-mono text-foreground">
              <bdi dir="ltr">{formatDate(bloodBank.createdAt)}</bdi>
            </span>
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
                onEdit(bloodBank);
              }}
            >
              {t("admin.editUserAction", "Edit Facility")}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
