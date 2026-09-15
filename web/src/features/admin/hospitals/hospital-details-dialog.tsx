import {
  Calendar,
  ClipboardList,
  MapPin,
  Phone,
  Users,
} from "lucide-react";
import { useTranslation } from "react-i18next";

import { formatDate } from "@/features/admin/components/admin-formatters";
import { AdminStatusBadge } from "@/features/admin/components/admin-status-badge";
import type { AdminHospital } from "@/features/admin/types/admin.types";
import { Button } from "@/shared/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog";

interface HospitalDetailsDialogProps {
  hospital: AdminHospital | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEdit?: (hospital: AdminHospital) => void;
}

export function HospitalDetailsDialog({
  hospital,
  open,
  onOpenChange,
  onEdit,
}: HospitalDetailsDialogProps) {
  const { t } = useTranslation();
  if (!hospital) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs font-semibold uppercase text-primary">
              <bdi dir="ltr">{hospital.facilityCode}</bdi>
            </span>
            <AdminStatusBadge status={hospital.status} />
          </div>
          <DialogTitle className="text-lg">{hospital.name}</DialogTitle>
          <DialogDescription>{hospital.governorate} {t("common.governorate", "Governorate")}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2 text-sm">
          <div className="rounded-lg border border-border bg-muted/40 p-4 space-y-3">
            <div className="flex items-start gap-2 text-muted-foreground">
              <MapPin className="mt-0.5 size-4 shrink-0" />
              <span className="text-xs text-foreground">{hospital.address}</span>
            </div>

            <div className="flex items-center gap-2 text-muted-foreground">
              <Phone className="size-4 shrink-0" />
              <span className="text-xs text-foreground">
                <bdi dir="ltr">{hospital.phone}</bdi>
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 text-center">
            <div className="rounded-lg border border-border bg-card p-3 shadow-sm">
              <div className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
                <Users className="size-3.5" />
                <span>{t("admin.totalUsers", "Users")}</span>
              </div>
              <div className="mt-1 text-xl font-bold text-foreground">
                <bdi dir="ltr">{hospital.userCount}</bdi>
              </div>
            </div>

            <div className="rounded-lg border border-border bg-card p-3 shadow-sm">
              <div className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
                <ClipboardList className="size-3.5" />
                <span>{t("admin.activeBloodRequests", "Active Requests")}</span>
              </div>
              <div className="mt-1 text-xl font-bold text-foreground">
                <bdi dir="ltr">{hospital.activeRequestsCount}</bdi>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between rounded-lg border border-border bg-card px-4 py-2.5 text-xs">
            <span className="flex items-center gap-1.5 text-muted-foreground">
              <Calendar className="size-3.5" />
              <span>{t("admin.userCreatedCol", "Registered Date")}</span>
            </span>
            <span className="font-mono text-foreground">
              <bdi dir="ltr">{formatDate(hospital.createdAt)}</bdi>
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
                onEdit(hospital);
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
