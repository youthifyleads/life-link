import { zodResolver } from "@hookform/resolvers/zod";
import { Hospital as HospitalIcon } from "lucide-react";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { egyptGovernorates, getGovernorateLabel } from "@/features/admin/components/governorates";
import { z } from "zod";

import {
  useCreateAdminHospital,
  useUpdateAdminHospital,
} from "@/features/admin/hooks/use-admin";
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
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";

const hospitalSchema = z.object({
  name: z.string().min(3, "Hospital name must be at least 3 characters."),
  facilityCode: z.string().min(3, "Facility code must be at least 3 characters (e.g. CGH-014)."),
  governorate: z.string().min(2, "Governorate is required."),
  address: z.string().min(5, "Address must be at least 5 characters."),
  phone: z.string().min(7, "Enter a valid contact phone."),
  status: z.enum(["active", "inactive"]),
});

type HospitalFormValues = z.infer<typeof hospitalSchema>;

interface HospitalFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  hospitalToEdit?: AdminHospital | null;
}

export function HospitalFormDialog({
  open,
  onOpenChange,
  hospitalToEdit,
}: HospitalFormDialogProps) {
  const { t } = useTranslation();
  const isEditing = Boolean(hospitalToEdit);
  const createMutation = useCreateAdminHospital();
  const updateMutation = useUpdateAdminHospital();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<HospitalFormValues>({
    resolver: zodResolver(hospitalSchema),
    defaultValues: {
      name: "",
      facilityCode: "",
      governorate: "Cairo",
      address: "",
      phone: "",
      status: "active",
    },
  });

  useEffect(() => {
    if (hospitalToEdit) {
      reset({
        name: hospitalToEdit.name,
        facilityCode: hospitalToEdit.facilityCode,
        governorate: hospitalToEdit.governorate,
        address: hospitalToEdit.address,
        phone: hospitalToEdit.phone,
        status: hospitalToEdit.status,
      });
    } else {
      reset({
        name: "",
        facilityCode: "",
        governorate: "Cairo",
        address: "",
        phone: "",
        status: "active",
      });
    }
  }, [hospitalToEdit, open, reset]);

  const onSubmit = async (values: HospitalFormValues) => {
    try {
      if (isEditing && hospitalToEdit) {
        await updateMutation.mutateAsync({
          id: hospitalToEdit.id,
          input: values,
        });
      } else {
        await createMutation.mutateAsync(values);
      }
      onOpenChange(false);
    } catch {
      // Handled by query client
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {isEditing
              ? t("admin.editUserAction", "Edit Hospital Facility")
              : t("admin.registerHospitalAction", "Register Hospital Facility")}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? t("admin.hospitalsDirectoryDesc", "Update healthcare facility record, contact phone, and operational state.")
              : t("admin.hospitalsDesc", "Provision a new clinical hospital facility authorized to submit blood requisitions.")}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-2">
          <div className="space-y-1.5">
            <Label htmlFor="hosp-name">
              {t("admin.userFullNameCol", "Hospital Name")}
            </Label>
            <Input
              id="hosp-name"
              placeholder={t("admin.hospitalNamePlaceholder")}
              {...register("name")}
              aria-invalid={Boolean(errors.name)}
            />
            {errors.name && (
              <p className="text-xs text-destructive">{errors.name.message}</p>
            )}
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="hosp-code">
                {t("admin.auditEntityIdCol", "Facility Code")}
              </Label>
              <Input
                id="hosp-code"
                placeholder={t("admin.hospitalCodePlaceholder")}
                {...register("facilityCode")}
                aria-invalid={Boolean(errors.facilityCode)}
              />
              {errors.facilityCode && (
                <p className="text-xs text-destructive">
                  {errors.facilityCode.message}
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="hosp-gov">
                {t("common.governorate", "Governorate")}
              </Label>
              <select
                id="hosp-gov"
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                {...register("governorate")}
              >
                {egyptGovernorates.map((governorate) => (
                  <option key={governorate} value={governorate}>{getGovernorateLabel(governorate)}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="hosp-address">
              {t("common.address", "Physical Address")}
            </Label>
            <Input
              id="hosp-address"
              placeholder={t("admin.hospitalAddressPlaceholder")}
              {...register("address")}
              aria-invalid={Boolean(errors.address)}
            />
            {errors.address && (
              <p className="text-xs text-destructive">{errors.address.message}</p>
            )}
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="hosp-phone">
                {t("common.phone", "Contact Phone")}
              </Label>
              <Input
                id="hosp-phone"
                placeholder="+20 2 XXXX XXXX"
                {...register("phone")}
                aria-invalid={Boolean(errors.phone)}
              />
              {errors.phone && (
                <p className="text-xs text-destructive">{errors.phone.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="hosp-status">
                {t("common.status", "Status")}
              </Label>
              <select
                id="hosp-status"
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                {...register("status")}
              >
                <option value="active">{t("common.active", "Active")}</option>
                <option value="inactive">{t("common.inactive", "Inactive")}</option>
              </select>
            </div>
          </div>

          <DialogFooter className="mt-6 gap-2">
            <Button
              type="button"
              variant="secondary"
              onClick={() => onOpenChange(false)}
            >
              {t("common.cancel", "Cancel")}
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || createMutation.isPending || updateMutation.isPending}
              className="gap-1.5"
            >
              <HospitalIcon className="size-4" aria-hidden="true" />
              <span>
                {isSubmitting || createMutation.isPending || updateMutation.isPending
                  ? t("common.loading", "Saving Facility…")
                  : isEditing
                    ? t("common.saveChanges", "Update Facility")
                    : t("admin.registerHospitalAction", "Register Facility")}
              </span>
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
