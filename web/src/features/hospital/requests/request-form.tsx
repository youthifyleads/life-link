import { zodResolver } from "@hookform/resolvers/zod";
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  MapPin,
  Phone,
  Send,
} from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { Link, useSearchParams } from "react-router-dom";
import { z } from "zod";

import { formatDateTime } from "@/features/hospital/components/hospital-formatters";
import {
  useAvailableBloodBanks,
  useCreateHospitalRequest,
} from "@/features/hospital/hooks/use-hospital-requests";
import {
  bloodComponentLabels,
  bloodComponents,
} from "@/features/hospital/types/hospital.types";
import {
  bloodGroups,
  urgencyLevels,
} from "@/shared/components/clinical/clinical.types";
import { BloodGroupBadge } from "@/shared/components/clinical/blood-group-badge";
import { UrgencyBadge } from "@/shared/components/clinical/urgency-badge";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";

const requestSchema = z.object({
  bloodBankId: z.string().min(1, "Select a recipient blood bank."),
  bloodGroup: z.enum(bloodGroups, {
    message: "Select the required blood group.",
  }),
  component: z.enum(bloodComponents, {
    message: "Select a blood component.",
  }),
  quantity: z
    .number({ message: "Enter the number of units required." })
    .int("Quantity must be a whole number.")
    .min(1, "At least one unit is required.")
    .max(20, "Contact the blood bank directly for requests above 20 units."),
  urgency: z.enum(urgencyLevels, {
    message: "Select an urgency level.",
  }),
  requiredAt: z
    .string()
    .min(1, "Enter the required date and time.")
    .refine((value) => !Number.isNaN(Date.parse(value)), {
      message: "Enter a valid required date and time.",
    }),
  reason: z
    .string()
    .trim()
    .min(10, "Provide a clinical reason using at least 10 characters.")
    .max(500, "Keep the clinical reason under 500 characters."),
  notes: z
    .string()
    .trim()
    .max(1000, "Keep operational notes under 1,000 characters.")
    .optional(),
});

type RequestFormValues = z.infer<typeof requestSchema>;

function getDefaultRequiredAt() {
  const date = new Date(Date.now() + 24 * 60 * 60 * 1000);
  const localDate = new Date(
    date.getTime() - date.getTimezoneOffset() * 60_000,
  );
  return localDate.toISOString().slice(0, 16);
}

const fieldClassName =
  "min-h-10 w-full rounded-md border border-input bg-surface px-3 text-sm text-foreground focus-visible:border-ring focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/25";

const textareaClassName = `${fieldClassName} min-h-28 resize-y py-2.5 leading-6`;

export function RequestForm() {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const mutation = useCreateHospitalRequest(
    searchParams.get("simulate") === "error",
  );
  const bloodBanksQuery = useAvailableBloodBanks();
  const [step, setStep] = useState<
    "details" | "blood_bank" | "review" | "success"
  >("details");

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    getValues,
    formState: { errors },
  } = useForm<RequestFormValues>({
    resolver: zodResolver(requestSchema),
    defaultValues: {
      bloodBankId: "central-blood-bank",
      bloodGroup: "O+",
      component: "red_cells",
      quantity: 1,
      urgency: "routine",
      requiredAt: getDefaultRequiredAt(),
      reason: "",
      notes: "",
    },
  });

  const selectedBloodBankId = watch("bloodBankId");
  const values = getValues();
  const availableBanks = bloodBanksQuery.data ?? [];
  const selectedBank =
    availableBanks.find((b) => b.id === selectedBloodBankId) ??
    availableBanks[0];

  const proceedToBankSelection = handleSubmit(() => {
    mutation.reset();
    setStep("blood_bank");
  });

  const proceedToReview = () => {
    if (!selectedBloodBankId) {
      setValue("bloodBankId", availableBanks[0]?.id ?? "central-blood-bank");
    }
    mutation.reset();
    setStep("review");
  };

  const submitRequest = async () => {
    const currentValues = getValues();
    try {
      await mutation.mutateAsync({
        ...currentValues,
        requiredAt: new Date(currentValues.requiredAt).toISOString(),
        notes: currentValues.notes || undefined,
      });
      setStep("success");
    } catch {
      // Inline error state rendered below
    }
  };

  if (step === "success" && mutation.data) {
    return (
      <section
        className="border border-success/30 bg-success-subtle p-6 sm:p-8"
        aria-labelledby="request-created-title"
      >
        <CheckCircle2 aria-hidden="true" className="size-8 text-success" />
        <h2 id="request-created-title" className="mt-5 text-xl font-semibold">
          {t("common.success")} • {mutation.data.targetBloodBank?.name ?? t("healthcare.bloodBank")}
        </h2>
        <p className="mt-2 max-w-[65ch] text-sm leading-6 text-muted-foreground">
          {t("hospital.requestId")}: <strong className="text-foreground"><bdi dir="ltr">{mutation.data.id}</bdi></strong> —{" "}
          <strong className="text-foreground">
            {mutation.data.targetBloodBank?.name}
          </strong>{" "}
          ({mutation.data.targetBloodBank?.governorate}).
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Button asChild>
            <Link to={`/hospital/requests/${mutation.data.id}`}>
              {t("common.viewDetails")}
              <ArrowRight aria-hidden="true" className="size-4 rtl:rotate-180" />
            </Link>
          </Button>
          <Button asChild variant="secondary">
            <Link to="/hospital/requests">{t("common.back")}</Link>
          </Button>
        </div>
      </section>
    );
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_18rem]">
      <section className="border border-border bg-surface">
        {/* Step Indicator Header */}
        <div className="flex items-center gap-2 border-b border-border px-5 py-4 sm:gap-3">
          <span
            className={`flex size-7 items-center justify-center rounded-full text-xs font-semibold ${
              step === "details"
                ? "bg-primary text-primary-foreground"
                : "bg-success text-white"
            }`}
          >
            {step === "details" ? "1" : <CheckCircle2 className="size-4" />}
          </span>
          <span className="text-xs font-semibold sm:text-sm">{t("hospital.step1")}</span>
          <span className="h-px flex-1 bg-border" />
          <span
            className={`flex size-7 items-center justify-center rounded-full text-xs font-semibold ${
              step === "blood_bank"
                ? "bg-primary text-primary-foreground"
                : step === "review"
                  ? "bg-success text-white"
                  : "bg-muted text-muted-foreground"
            }`}
          >
            {step === "review" ? <CheckCircle2 className="size-4" /> : "2"}
          </span>
          <span className="text-xs font-semibold sm:text-sm">{t("hospital.step2")}</span>
          <span className="h-px flex-1 bg-border" />
          <span
            className={`flex size-7 items-center justify-center rounded-full text-xs font-semibold ${
              step === "review"
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground"
            }`}
          >
            3
          </span>
          <span className="text-xs font-semibold sm:text-sm">{t("common.confirm")}</span>
        </div>

        {/* STEP 1: Clinical Requirements */}
        {step === "details" && (
          <form className="p-5 sm:p-6" noValidate onSubmit={proceedToBankSelection}>
            <div className="grid gap-5 sm:grid-cols-2">
              <Field
                id="blood-group"
                label={t("common.bloodGroup")}
                error={errors.bloodGroup?.message}
              >
                <select
                  id="blood-group"
                  className={fieldClassName}
                  aria-invalid={Boolean(errors.bloodGroup)}
                  {...register("bloodGroup")}
                >
                  {bloodGroups.map((group) => (
                    <option key={group} value={group}>
                      {group}
                    </option>
                  ))}
                </select>
              </Field>

              <Field
                id="blood-component"
                label={t("common.component")}
                error={errors.component?.message}
              >
                <select
                  id="blood-component"
                  className={fieldClassName}
                  aria-invalid={Boolean(errors.component)}
                  {...register("component")}
                >
                  {bloodComponents.map((component) => (
                    <option key={component} value={component}>
                      {t(`healthcare.${component}`, bloodComponentLabels[component])}
                    </option>
                  ))}
                </select>
              </Field>

              <Field
                id="quantity"
                label={`${t("common.quantity")} (${t("common.units")})`}
                error={errors.quantity?.message}
              >
                <Input
                  id="quantity"
                  type="number"
                  min={1}
                  max={20}
                  inputMode="numeric"
                  aria-invalid={Boolean(errors.quantity)}
                  {...register("quantity", { valueAsNumber: true })}
                />
              </Field>

              <Field
                id="urgency"
                label={t("common.urgency")}
                error={errors.urgency?.message}
              >
                <select
                  id="urgency"
                  className={fieldClassName}
                  aria-invalid={Boolean(errors.urgency)}
                  {...register("urgency")}
                >
                  {urgencyLevels.map((urgency) => (
                    <option key={urgency} value={urgency}>
                      {t(`urgency.${urgency}`)}
                    </option>
                  ))}
                </select>
              </Field>

              <Field
                id="required-at"
                label={t("hospital.requiredBy")}
                error={errors.requiredAt?.message}
                className="sm:col-span-2"
              >
                <Input
                  id="required-at"
                  type="datetime-local"
                  aria-invalid={Boolean(errors.requiredAt)}
                  {...register("requiredAt")}
                />
              </Field>

              <Field
                id="reason"
                label={t("hospital.diagnosis")}
                hint={t("hospital.clinicalJustificationHint")}
                error={errors.reason?.message}
                className="sm:col-span-2"
              >
                <textarea
                  id="reason"
                  className={textareaClassName}
                  aria-invalid={Boolean(errors.reason)}
                  {...register("reason")}
                />
              </Field>

              <Field
                id="notes"
                label={t("hospital.operationalNotes")}
                hint={t("common.optional")}
                error={errors.notes?.message}
                className="sm:col-span-2"
              >
                <textarea
                  id="notes"
                  className={textareaClassName}
                  aria-invalid={Boolean(errors.notes)}
                  {...register("notes")}
                />
              </Field>
            </div>

            <div className="mt-7 flex flex-col-reverse gap-3 border-t border-border pt-5 sm:flex-row sm:justify-end">
              <Button asChild type="button" variant="ghost">
                <Link to="/hospital/requests">{t("common.cancel")}</Link>
              </Button>
              <Button type="submit">
                {t("hospital.selectTargetBank")}
                <ArrowRight aria-hidden="true" className="size-4 rtl:rotate-180" />
              </Button>
            </div>
          </form>
        )}

        {/* STEP 2: Target Blood Bank Selection */}
        {step === "blood_bank" && (
          <div className="p-5 sm:p-6">
            <div>
              <h2 className="text-lg font-semibold">{t("hospital.selectTargetBank")}</h2>
              <p className="mt-1 text-sm leading-6 text-muted-foreground">
                {t("hospital.recommendedBanks")}
              </p>
            </div>

            <div className="mt-6 space-y-4" role="radiogroup" aria-label={t("hospital.availableBloodBanks")}>
              {availableBanks.map((bank) => {
                const isSelected = selectedBloodBankId === bank.id;
                const isInactive = bank.status === "inactive";
                const posture = bank.availabilitySummary?.posture ?? "optimal";

                return (
                  <div
                    key={bank.id}
                    onClick={() => {
                      if (!isInactive) {
                        setValue("bloodBankId", bank.id);
                      }
                    }}
                    className={`relative cursor-pointer border p-4 transition-colors sm:p-5 ${
                      isSelected
                        ? "border-primary bg-primary/5 ring-1 ring-primary"
                        : "border-border bg-surface hover:border-border/80 hover:bg-surface-subtle"
                    } ${isInactive ? "opacity-60 cursor-not-allowed" : ""}`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3">
                        <input
                          type="radio"
                          id={`bank-${bank.id}`}
                          name="bloodBankSelection"
                          value={bank.id}
                          checked={isSelected}
                          disabled={isInactive}
                          onChange={() => setValue("bloodBankId", bank.id)}
                          className="mt-1 size-4 text-primary focus:ring-primary"
                        />
                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <label
                              htmlFor={`bank-${bank.id}`}
                              className="font-semibold text-foreground cursor-pointer"
                            >
                              {bank.name}
                            </label>
                            <span className="rounded bg-muted px-2 py-0.5 text-xs font-mono font-medium text-muted-foreground">
                              <bdi dir="ltr">{bank.facilityCode}</bdi>
                            </span>
                            {isInactive ? (
                              <span className="rounded bg-destructive/10 px-2 py-0.5 text-xs font-semibold text-destructive">
                                {t("common.inactive")}
                              </span>
                            ) : (
                              <span className="rounded bg-success/10 px-2 py-0.5 text-xs font-semibold text-success">
                                {t("common.active")}
                              </span>
                            )}
                          </div>

                          <div className="mt-2 flex flex-wrap items-center gap-y-1 gap-x-4 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <MapPin className="size-3.5" aria-hidden="true" />
                              {bank.governorate} — {bank.address}
                            </span>
                            <span className="flex items-center gap-1">
                              <Phone className="size-3.5" aria-hidden="true" />
                              <bdi dir="ltr">{bank.phone}</bdi>
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Stock Posture Pill */}
                      <div className="hidden text-end sm:block">
                        <span
                          className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ${
                            posture === "optimal"
                              ? "bg-success-subtle text-success border border-success/30"
                              : posture === "warning"
                                ? "bg-warning-subtle text-[#854d0e] border border-warning/30"
                                : "bg-emergency-subtle text-destructive border border-destructive/30"
                          }`}
                        >
                          {posture === "warning" && <AlertTriangle className="size-3" />}
                          {bank.availabilitySummary.totalAvailable} {t("common.units")}
                        </span>
                        <p className="mt-1 text-[11px] text-muted-foreground capitalize">
                          {posture}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-7 flex flex-col-reverse gap-3 border-t border-border pt-5 sm:flex-row sm:justify-between">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setStep("details")}
              >
                <ArrowLeft aria-hidden="true" className="size-4 rtl:rotate-180" />
                {t("common.back")}
              </Button>
              <Button
                type="button"
                onClick={proceedToReview}
              >
                {t("common.next")}
                <ArrowRight aria-hidden="true" className="size-4 rtl:rotate-180" />
              </Button>
            </div>
          </div>
        )}

        {/* STEP 3: Clinical Review & Submit */}
        {step === "review" && (
          <div className="p-5 sm:p-6">
            {mutation.isError ? (
              <div
                role="alert"
                className="mb-5 border border-destructive/30 bg-emergency-subtle p-4 text-sm text-[#7a1a13]"
              >
                <p className="font-semibold">{t("common.error")}</p>
                <p className="mt-1 leading-6">{mutation.error.message}</p>
              </div>
            ) : null}

            <h2 className="text-lg font-semibold">{t("common.confirm")}</h2>
            <p className="mt-1 text-sm leading-6 text-muted-foreground">
              {t("hospital.createRequestDescription")}
            </p>

            {/* Recipient Blood Bank Card */}
            <div className="mt-5 border border-primary/30 bg-primary/5 p-4 sm:p-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    {t("hospital.recipientBank")}
                  </span>
                  <h3 className="mt-1 text-base font-semibold text-foreground">
                    {selectedBank?.name}
                  </h3>
                  <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <MapPin className="size-3.5" />
                      {selectedBank?.governorate} — {selectedBank?.address}
                    </span>
                    <span className="flex items-center gap-1">
                      <Phone className="size-3.5" />
                      <bdi dir="ltr">{selectedBank?.phone}</bdi>
                    </span>
                  </div>
                </div>
                <span className="rounded bg-muted px-2.5 py-1 text-xs font-mono font-medium">
                  <bdi dir="ltr">{selectedBank?.facilityCode}</bdi>
                </span>
              </div>
            </div>

            <dl className="mt-5 grid border border-border sm:grid-cols-2">
              <ReviewItem label={t("common.bloodGroup")}>
                <BloodGroupBadge group={values.bloodGroup} />
              </ReviewItem>
              <ReviewItem label={t("common.component")}>
                {t(`healthcare.${values.component}`, bloodComponentLabels[values.component])}
              </ReviewItem>
              <ReviewItem label={t("common.quantity")}>
                <span className="font-semibold tabular-nums">
                  {values.quantity} {values.quantity === 1 ? t("common.unit") : t("common.units")}
                </span>
              </ReviewItem>
              <ReviewItem label={t("common.urgency")}>
                <UrgencyBadge urgency={values.urgency} />
              </ReviewItem>
              <ReviewItem label={t("hospital.requiredBy")}>
                <bdi dir="ltr">{formatDateTime(new Date(values.requiredAt).toISOString())}</bdi>
              </ReviewItem>
              <ReviewItem label={t("hospital.diagnosis")}>{values.reason}</ReviewItem>
              {values.notes ? (
                <ReviewItem label={t("hospital.operationalNotes")} className="sm:col-span-2">
                  {values.notes}
                </ReviewItem>
              ) : null}
            </dl>

            <div className="mt-7 flex flex-col-reverse gap-3 border-t border-border pt-5 sm:flex-row sm:justify-between">
              <Button
                type="button"
                variant="ghost"
                disabled={mutation.isPending}
                onClick={() => {
                  mutation.reset();
                  setStep("blood_bank");
                }}
              >
                <ArrowLeft aria-hidden="true" className="size-4 rtl:rotate-180" />
                {t("hospital.selectTargetBank")}
              </Button>
              <Button
                type="button"
                disabled={mutation.isPending}
                onClick={() => void submitRequest()}
              >
                <Send aria-hidden="true" className="size-4 rtl:rotate-180" />
                {mutation.isPending ? t("common.loading") : t("common.submit")}
              </Button>
            </div>
          </div>
        )}
      </section>

      <aside
        aria-label={t("hospital.guidelinesTitle")}
        className="self-start border border-border bg-surface-subtle p-5 xl:sticky xl:top-24"
      >
        <h2 className="text-sm font-semibold">{t("hospital.guidelinesTitle")}</h2>
        <ul className="mt-3 space-y-3 text-sm leading-6 text-muted-foreground">
          <li>{t("hospital.guidelineNearestBank")}</li>
          <li>{t("hospital.guidelineCompatibility")}</li>
          <li>{t("hospital.guidelineEmergency")}</li>
          <li>{t("hospital.guidelinePrivacy")}</li>
          <li>{t("hospital.guidelineDocuments")}</li>
        </ul>
      </aside>
    </div>
  );
}

interface FieldProps {
  id: string;
  label: string;
  hint?: string;
  error?: string;
  className?: string;
  children: React.ReactNode;
}

function Field({ id, label, hint, error, className, children }: FieldProps) {
  return (
    <div className={className}>
      <Label htmlFor={id} className="mb-2 block">
        {label}
      </Label>
      {children}
      {hint && !error ? (
        <p className="mt-1.5 text-xs leading-5 text-muted-foreground">{hint}</p>
      ) : null}
      {error ? (
        <p className="mt-1.5 text-sm text-destructive" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}

function ReviewItem({
  label,
  children,
  className,
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`border-b border-border p-4 sm:border-e ${className ?? ""}`}
    >
      <dt className="text-xs font-medium text-muted-foreground">{label}</dt>
      <dd className="mt-2 text-sm leading-6 text-foreground">{children}</dd>
    </div>
  );
}
