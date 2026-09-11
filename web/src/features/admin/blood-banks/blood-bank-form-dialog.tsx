import { zodResolver } from "@hookform/resolvers/zod";
import { Building2 } from "lucide-react";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { egyptGovernorates, getGovernorateLabel } from "@/features/admin/components/governorates";
import { z } from "zod";

import {
  useCreateAdminBloodBank,
  useUpdateAdminBloodBank,
} from "@/features/admin/hooks/use-admin";
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
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";

const bloodBankSchema = z.object({
  name: z.string().min(3, "Blood bank center name must be at least 3 characters."),
  facilityCode: z.string().min(3, "Facility code must be at least 3 characters (e.g. CBB-001)."),
  governorate: z.string().min(2, "Governorate is required."),
  address: z.string().min(5, "Address must be at least 5 characters."),
  phone: z.string().min(7, "Enter a valid contact phone."),
  status: z.enum(["active", "inactive"]),
});

type BloodBankFormValues = z.infer<typeof bloodBankSchema>;

interface BloodBankFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  bloodBankToEdit?: AdminBloodBank | null;
}

export function BloodBankFormDialog({
  open,
  onOpenChange,
  bloodBankToEdit,
}: BloodBankFormDialogProps) {
  const { t } = useTranslation();
  const isEditing = Boolean(bloodBankToEdit);
  const createMutation = useCreateAdminBloodBank();
  const updateMutation = useUpdateAdminBloodBank();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<BloodBankFormValues>({
    resolver: zodResolver(bloodBankSchema),
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
    if (bloodBankToEdit) {
      reset({
        name: bloodBankToEdit.name,
        facilityCode: bloodBankToEdit.facilityCode,
        governorate: bloodBankToEdit.governorate,
        address: bloodBankToEdit.address,
        phone: bloodBankToEdit.phone,
        status: bloodBankToEdit.status,
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
  }, [bloodBankToEdit, open, reset]);

  const onSubmit = async (values: BloodBankFormValues) => {
    try {
      if (isEditing && bloodBankToEdit) {
        await updateMutation.mutateAsync({
          id: bloodBankToEdit.id,
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
              ? t("admin.editUserAction", "Edit Blood Bank Facility")
              : t("admin.registerBloodBankAction", "Register Regional Blood Bank")}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? t("admin.bloodBanksDirectoryDesc", "Update regional blood facility profile, contact phone, and active status.")
              : t("admin.bloodBanksDesc", "Provision a new regional blood collection center or distribution depot.")}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-2">
          <div className="space-y-1.5">
            <Label htmlFor="bb-name">
              {t("admin.userFullNameCol", "Blood Bank Name")}
            </Label>
            <Input
              id="bb-name"
              placeholder={t("admin.bloodBankNamePlaceholder")}
              {...register("name")}
              aria-invalid={Boolean(errors.name)}
            />
            {errors.name && (
              <p className="text-xs text-destructive">{errors.name.message}</p>
            )}
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="bb-code">
                {t("admin.auditEntityIdCol", "Facility Code")}
              </Label>
              <Input
                id="bb-code"
                placeholder={t("admin.bloodBankCodePlaceholder")}
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
              <Label htmlFor="bb-gov">
                {t("common.governorate", "Governorate")}
              </Label>
              <select
                id="bb-gov"
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
            <Label htmlFor="bb-address">
              {t("common.address", "Physical Address")}
            </Label>
            <Input
              id="bb-address"
              placeholder={t("admin.bloodBankAddressPlaceholder")}
              {...register("address")}
              aria-invalid={Boolean(errors.address)}
            />
            {errors.address && (
              <p className="text-xs text-destructive">{errors.address.message}</p>
            )}
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="bb-phone">
                {t("common.phone", "Contact Phone")}
              </Label>
              <Input
                id="bb-phone"
                placeholder="+20 2 XXXX XXXX"
                {...register("phone")}
                aria-invalid={Boolean(errors.phone)}
              />
              {errors.phone && (
                <p className="text-xs text-destructive">{errors.phone.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="bb-status">
                {t("common.status", "Status")}
              </Label>
              <select
                id="bb-status"
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
              <Building2 className="size-4" aria-hidden="true" />
              <span>
                {isSubmitting || createMutation.isPending || updateMutation.isPending
                  ? t("common.loading", "Saving Facility…")
                  : isEditing
                    ? t("common.saveChanges", "Update Facility")
                    : t("admin.registerBloodBankAction", "Register Facility")}
              </span>
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
