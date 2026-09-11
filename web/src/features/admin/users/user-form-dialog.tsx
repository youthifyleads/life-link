import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, ArrowRight, CheckCircle2, ShieldCheck, UserPlus } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { z } from "zod";

import { AdminRoleBadge } from "@/features/admin/components/admin-role-badge";
import { AdminStatusBadge } from "@/features/admin/components/admin-status-badge";
import {
  useAdminBloodBanks,
  useAdminHospitals,
  useCreateAdminUser,
  useUpdateAdminUser,
} from "@/features/admin/hooks/use-admin";
import type { AdminUser } from "@/features/admin/types/admin.types";
import type { UserRole } from "@/features/authentication/model/auth.types";
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

const createUserSchema = z.object({
  fullName: z.string().min(2, "Full name must be at least 2 characters."),
  email: z.string().email("Enter a valid email address."),
  password: z
    .string()
    .min(6, "Password must be at least 6 characters.")
    .optional()
    .or(z.literal("")),
  primaryRole: z.enum([
    "hospital_staff",
    "blood_bank_staff",
    "admin",
    "medical_lead",
    "platform_support",
    "donor",
    "caregiver",
  ]),
  organizationId: z.string().min(1, "Select an assigned organization."),
  status: z.enum(["active", "inactive"]),
  phone: z.string().optional(),
});

type UserFormValues = z.infer<typeof createUserSchema>;

interface UserFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userToEdit?: AdminUser | null;
}

export function UserFormDialog({
  open,
  onOpenChange,
  userToEdit,
}: UserFormDialogProps) {
  const { t } = useTranslation();
  const isEditing = Boolean(userToEdit);
  const [step, setStep] = useState<"form" | "review" | "success">("form");

  const { data: hospitals } = useAdminHospitals();
  const { data: bloodBanks } = useAdminBloodBanks();

  const createUserMutation = useCreateAdminUser();
  const updateUserMutation = useUpdateAdminUser();

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm<UserFormValues>({
    resolver: zodResolver(createUserSchema),
    defaultValues: {
      fullName: "",
      email: "",
      password: "",
      primaryRole: "hospital_staff",
      organizationId: "",
      status: "active",
      phone: "",
    },
  });

  const formValues = watch();

  useEffect(() => {
    if (userToEdit) {
      reset({
        fullName: userToEdit.fullName,
        email: userToEdit.email,
        password: "",
        primaryRole: userToEdit.primaryRole,
        organizationId: userToEdit.organizationId,
        status: userToEdit.status,
        phone: userToEdit.phone ?? "",
      });
    } else {
      reset({
        fullName: "",
        email: "",
        password: "",
        primaryRole: "hospital_staff",
        organizationId: hospitals?.[0]?.id ?? "hospital-cairo-general",
        status: "active",
        phone: "",
      });
    }
    setStep("form");
  }, [userToEdit, open, reset, hospitals]);

  const onProceedToReview = handleSubmit(() => {
    setStep("review");
  });

  const onConfirmSave = async () => {
    try {
      if (isEditing && userToEdit) {
        await updateUserMutation.mutateAsync({
          id: userToEdit.id,
          input: {
            fullName: formValues.fullName,
            email: formValues.email,
            primaryRole: formValues.primaryRole as UserRole,
            organizationId: formValues.organizationId,
            status: formValues.status,
            phone: formValues.phone || undefined,
          },
        });
      } else {
        await createUserMutation.mutateAsync({
          fullName: formValues.fullName,
          email: formValues.email,
          password: formValues.password || "TemporaryPass2026!",
          primaryRole: formValues.primaryRole as UserRole,
          organizationId: formValues.organizationId,
          status: formValues.status,
          phone: formValues.phone || undefined,
        });
      }
      setStep("success");
    } catch {
      // Error handled by query / mutation
    }
  };

  const getOrganizationLabel = (id: string) => {
    if (id === "platform-administration") return t("admin.operations", "Blood Bank Platform Administration");
    const hosp = hospitals?.find((h) => h.id === id);
    if (hosp) return hosp.name;
    const bb = bloodBanks?.find((b) => b.id === id);
    if (bb) return bb.name;
    return id;
  };

  const handleClose = () => {
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>
            {isEditing
              ? t("admin.editUserAction", "Edit User Account")
              : t("admin.createUserAction", "Create New User Account")}
          </DialogTitle>
          <DialogDescription>
            {step === "form" &&
              t(
                "admin.usersDesc",
                "Specify user identity, primary access role, and clinical organization affiliation.",
              )}
            {step === "review" &&
              t(
                "admin.confirmRoleChangeDesc",
                "Review user account credentials and organization assignment before provisioning.",
              )}
            {step === "success" &&
              t(
                "admin.auditDesc",
                "User account has been saved to the centralized governance repository.",
              )}
          </DialogDescription>
        </DialogHeader>

        {step === "form" && (
          <form onSubmit={onProceedToReview} className="space-y-4 py-2">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-1.5 sm:col-span-2">
                <Label htmlFor="user-fullName">
                  {t("admin.userFullNameCol", "Full Name")}
                </Label>
                <Input
                  id="user-fullName"
                  placeholder={t("admin.userNamePlaceholder")}
                  {...register("fullName")}
                  aria-invalid={Boolean(errors.fullName)}
                />
                {errors.fullName && (
                  <p className="text-xs text-destructive">
                    {errors.fullName.message}
                  </p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="user-email">
                  {t("admin.userEmailCol", "Email Address")}
                </Label>
                <Input
                  id="user-email"
                  type="email"
                  placeholder={t("admin.userEmailPlaceholder")}
                  {...register("email")}
                  aria-invalid={Boolean(errors.email)}
                />
                {errors.email && (
                  <p className="text-xs text-destructive">
                    {errors.email.message}
                  </p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="user-phone">
                  {t("common.phone", "Phone Number")} ({t("common.optional", "Optional")})
                </Label>
                <Input
                  id="user-phone"
                  placeholder="+20 10 XXXX XXXX"
                  {...register("phone")}
                />
              </div>

              {!isEditing && (
                <div className="space-y-1.5 sm:col-span-2">
                  <Label htmlFor="user-password">
                    {t("auth.password", "Initial Password")}
                  </Label>
                  <Input
                    id="user-password"
                    type="password"
                    placeholder={t("admin.initialPasswordPlaceholder")}
                    {...register("password")}
                    aria-invalid={Boolean(errors.password)}
                  />
                  {errors.password && (
                    <p className="text-xs text-destructive">
                      {errors.password.message}
                    </p>
                  )}
                </div>
              )}

              <div className="space-y-1.5">
                <Label htmlFor="user-role">
                  {t("admin.userRoleCol", "Primary Role")}
                </Label>
                <select
                  id="user-role"
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  {...register("primaryRole")}
                >
                  <option value="hospital_staff">
                    {t("roles.hospital_staff", "Hospital Staff")}
                  </option>
                  <option value="blood_bank_staff">
                    {t("roles.blood_bank_staff", "Blood Bank Staff")}
                  </option>
                  <option value="admin">
                    {t("roles.admin", "System Administrator")}
                  </option>
                  <option value="medical_lead">
                    {t("roles.medical_lead", "Medical Lead")}
                  </option>
                  <option value="platform_support">
                    {t("roles.platform_support", "Platform Support")}
                  </option>
                  <option value="donor">
                    {t("roles.donor", "Donor")}
                  </option>
                  <option value="caregiver">
                    {t("roles.caregiver", "Caregiver")}
                  </option>
                </select>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="user-status">
                  {t("admin.userStatusCol", "Account Status")}
                </Label>
                <select
                  id="user-status"
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  {...register("status")}
                >
                  <option value="active">{t("common.active", "Active")}</option>
                  <option value="inactive">{t("common.inactive", "Inactive")}</option>
                </select>
              </div>

              <div className="space-y-1.5 sm:col-span-2">
                <Label htmlFor="user-org">
                  {t("admin.userOrgCol", "Assigned Organization")}
                </Label>
                <select
                  id="user-org"
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  {...register("organizationId")}
                >
                  <optgroup label={t("nav.administration", "Platform Administration")}>
                    <option value="platform-administration">
                      {t("admin.operations", "Blood Bank Platform Administration")}
                    </option>
                  </optgroup>
                  <optgroup label={t("admin.hospitalsTitle", "Hospital Facilities")}>
                    {hospitals?.map((h) => (
                      <option key={h.id} value={h.id}>
                        {h.name} ({h.facilityCode})
                      </option>
                    ))}
                  </optgroup>
                  <optgroup label={t("admin.bloodBanksTitle", "Regional Blood Banks")}>
                    {bloodBanks?.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.name} ({b.facilityCode})
                      </option>
                    ))}
                  </optgroup>
                </select>
              </div>
            </div>

            <DialogFooter className="mt-6 gap-2">
              <Button type="button" variant="secondary" onClick={handleClose}>
                {t("common.cancel", "Cancel")}
              </Button>
              <Button type="submit" className="gap-1.5">
                <span>{t("admin.inspectAuditAction", "Review Details")}</span>
                <ArrowRight className="size-4 rtl:rotate-180" aria-hidden="true" />
              </Button>
            </DialogFooter>
          </form>
        )}

        {step === "review" && (
          <div className="space-y-4 py-2">
            <div className="rounded-lg border border-border bg-muted/30 p-4">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                {t("common.overview", "Account Summary Review")}
              </h4>
              <dl className="mt-3 divide-y divide-border text-sm">
                <div className="flex justify-between py-2">
                  <dt className="text-muted-foreground">
                    {t("admin.userFullNameCol", "Full Name")}:
                  </dt>
                  <dd className="font-semibold text-foreground">
                    {formValues.fullName}
                  </dd>
                </div>
                <div className="flex justify-between py-2">
                  <dt className="text-muted-foreground">
                    {t("admin.userEmailCol", "Email")}:
                  </dt>
                  <dd className="font-mono text-foreground">
                    <bdi dir="ltr">{formValues.email}</bdi>
                  </dd>
                </div>
                <div className="flex justify-between py-2">
                  <dt className="text-muted-foreground">
                    {t("admin.userRoleCol", "Assigned Role")}:
                  </dt>
                  <dd>
                    <AdminRoleBadge role={formValues.primaryRole as UserRole} />
                  </dd>
                </div>
                <div className="flex justify-between py-2">
                  <dt className="text-muted-foreground">
                    {t("admin.userOrgCol", "Organization")}:
                  </dt>
                  <dd className="font-medium text-foreground">
                    {getOrganizationLabel(formValues.organizationId)}
                  </dd>
                </div>
                <div className="flex justify-between py-2">
                  <dt className="text-muted-foreground">
                    {t("admin.userStatusCol", "Status")}:
                  </dt>
                  <dd>
                    <AdminStatusBadge status={formValues.status} />
                  </dd>
                </div>
                {formValues.phone && (
                  <div className="flex justify-between py-2">
                    <dt className="text-muted-foreground">
                      {t("common.phone", "Phone")}:
                    </dt>
                    <dd className="text-foreground">
                      <bdi dir="ltr">{formValues.phone}</bdi>
                    </dd>
                  </div>
                )}
              </dl>
            </div>

            <div className="flex items-start gap-2.5 rounded-md border border-amber-200 bg-amber-50/50 p-3 text-xs text-amber-900">
              <ShieldCheck className="size-4 shrink-0 text-amber-800" aria-hidden="true" />
              <span>
                {t(
                  "admin.recentAdminActivityDesc",
                  "Saving this user will generate an immutable audit record in the system activity ledger.",
                )}
              </span>
            </div>

            <DialogFooter className="gap-2">
              <Button
                type="button"
                variant="secondary"
                onClick={handleClose}
              >
                {t("common.cancel", "Cancel")}
              </Button>
              <Button
                type="button"
                variant="secondary"
                onClick={() => setStep("form")}
                className="gap-1.5"
              >
                <ArrowLeft className="size-4 rtl:rotate-180" aria-hidden="true" />
                <span>{t("common.back", "Back to Edit")}</span>
              </Button>
              <Button
                type="button"
                onClick={() => void onConfirmSave()}
                disabled={createUserMutation.isPending || updateUserMutation.isPending}
                className="gap-1.5"
              >
                <UserPlus className="size-4" aria-hidden="true" />
                <span>
                  {createUserMutation.isPending || updateUserMutation.isPending
                    ? t("common.loading", "Saving...")
                    : isEditing
                      ? t("common.saveChanges", "Confirm & Update User")
                      : t("admin.createUserAction", "Confirm & Provision User")}
                </span>
              </Button>
            </DialogFooter>
          </div>
        )}

        {step === "success" && (
          <div className="py-6 text-center">
            <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
              <CheckCircle2 className="size-7" aria-hidden="true" />
            </div>
            <h3 className="mt-3 text-base font-semibold text-foreground">
              {isEditing
                ? t("common.success", "User Updated Successfully")
                : t("common.success", "User Provisioned Successfully")}
            </h3>
            <p className="mx-auto mt-2 max-w-sm text-xs text-muted-foreground">
              {t(
                "admin.auditDesc",
                "The user profile and organization access rights have been committed and registered in the activity audit ledger.",
              )}
            </p>
            <div className="mt-6 flex justify-center">
              <Button type="button" onClick={handleClose}>
                {t("common.close", "Done")}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
