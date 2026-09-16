import { zodResolver } from "@hookform/resolvers/zod";
import {
  CheckCircle2,
  ChevronRight,
  ClipboardCheck,
  LoaderCircle,
  PackagePlus,
  RotateCcw,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { z } from "zod";

import {
  ALL_BLOOD_GROUPS,
  ALL_COMPONENTS,
} from "@/features/blood-bank/inventory/inventory.mock";
import {
  bloodBankComponentLabels,
  type BloodBankComponent,
  type BloodUnit,
  type BloodUnitIntakePayload,
} from "@/features/blood-bank/types/blood-bank.types";
import { BloodGroupBadge } from "@/shared/components/clinical/blood-group-badge";
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

const intakeSchema = z
  .object({
    unitId: z.string().optional(),
    bloodGroup: z.enum([
      "A+",
      "A−",
      "B+",
      "B−",
      "AB+",
      "AB−",
      "O+",
      "O−",
    ] as const, {
      required_error: "Blood group is required.",
    }),
    component: z.enum([
      "red_cells",
      "platelets",
      "fresh_frozen_plasma",
      "whole_blood",
      "cryoprecipitate",
    ] as const, {
      required_error: "Component is required.",
    }),
    collectionDate: z.string().min(1, "Collection date is required."),
    expiryDate: z.string().min(1, "Expiry date is required."),
    quantity: z.coerce
      .number()
      .int("Must be a whole number")
      .min(1, "Quantity must be at least 1")
      .max(20, "Batch intake maximum is 20 units"),
    storageLocation: z
      .string()
      .trim()
      .min(2, "Storage location is required (e.g. Fridge A — Shelf 1)"),
    notes: z.string().optional(),
  })
  .refine(
    (data) => new Date(data.expiryDate) >= new Date(data.collectionDate),
    {
      message: "Expiry date must be on or after collection date.",
      path: ["expiryDate"],
    },
  );

type IntakeFormValues = z.infer<typeof intakeSchema>;

interface UnitIntakeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: (createdUnits: BloodUnit[]) => void;
  registerFn: (payload: BloodUnitIntakePayload) => Promise<BloodUnit[]>;
}

const commonLocations = [
  "Fridge A — Shelf 1",
  "Fridge A — Shelf 2",
  "Fridge B — Shelf 1",
  "Agitator 1 — Tray A",
  "Deep Freezer 1 — Rack A",
  "Deep Freezer 2 — Rack B",
];

function calculateDefaultExpiry(collectionDateStr: string, component: BloodBankComponent): string {
  const base = new Date(collectionDateStr);
  if (isNaN(base.getTime())) return "";

  let addDays = 42; // red cells default
  if (component === "platelets") addDays = 5;
  else if (component === "whole_blood") addDays = 35;
  else if (component === "fresh_frozen_plasma" || component === "cryoprecipitate") addDays = 365;

  base.setDate(base.getDate() + addDays);
  return base.toISOString().split("T")[0];
}

export function UnitIntakeDialog({
  open,
  onOpenChange,
  onSuccess,
  registerFn,
}: UnitIntakeDialogProps) {
  const { t } = useTranslation();
  const [step, setStep] = useState<"form" | "review" | "success">("form");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createdUnits, setCreatedUnits] = useState<BloodUnit[]>([]);

  const todayStr = new Date().toISOString().split("T")[0];

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<IntakeFormValues>({
    resolver: zodResolver(intakeSchema),
    defaultValues: {
      unitId: "",
      bloodGroup: "O−",
      component: "red_cells",
      collectionDate: todayStr,
      expiryDate: calculateDefaultExpiry(todayStr, "red_cells"),
      quantity: 1,
      storageLocation: "Fridge A — Shelf 1",
      notes: "",
    },
  });

  const selectedComponent = watch("component");
  const selectedCollectionDate = watch("collectionDate");
  const selectedBloodGroup = watch("bloodGroup");
  const formValues = watch();

  // Auto-adjust default expiry when component or collection date changes
  useEffect(() => {
    if (selectedCollectionDate && selectedComponent) {
      const suggestedExpiry = calculateDefaultExpiry(selectedCollectionDate, selectedComponent);
      setValue("expiryDate", suggestedExpiry);
    }
  }, [selectedComponent, selectedCollectionDate, setValue]);

  const handleClose = () => {
    onOpenChange(false);
    // Reset state after dialog animation
    setTimeout(() => {
      setStep("form");
      reset();
    }, 200);
  };

  const onProceedToReview = handleSubmit(() => {
    setStep("review");
  });

  const onConfirmSave = async () => {
    setIsSubmitting(true);
    try {
      const res = await registerFn(formValues);
      setCreatedUnits(res);
      onSuccess(res);
      setStep("success");
    } catch (err) {
      console.error("Unit intake failed:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-primary">
            <PackagePlus aria-hidden="true" className="size-4" />
            <span>{t("bloodBank.unitIntakeTitle")}</span>
          </div>
          <DialogTitle>
            {step === "form"
              ? t("bloodBank.intakeRegisterTitle")
              : step === "review"
                ? t("bloodBank.intakeReviewTitle")
                : t("bloodBank.intakeSuccessTitle")}
          </DialogTitle>
          <DialogDescription>
            {step === "form"
              ? t("bloodBank.intakeFormDesc")
              : step === "review"
                ? t("bloodBank.intakeReviewDesc")
                : t("bloodBank.intakeSuccessDesc")}
          </DialogDescription>
        </DialogHeader>

        {/* STEP 1: FORM */}
        {step === "form" ? (
          <form
            id="unit-intake-form"
            onSubmit={onProceedToReview}
            noValidate
            className="space-y-4 py-2"
          >
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {/* Blood Group */}
              <div className="space-y-1.5">
                <Label htmlFor="bloodGroup" className="text-xs font-semibold">
                  {t("bloodBank.bloodGroupRequired")}
                </Label>
                <select
                  id="bloodGroup"
                  {...register("bloodGroup")}
                  className="h-9 w-full rounded-none border border-field-stroke bg-background px-3 text-xs text-foreground focus:border-primary focus:outline-none"
                >
                  {ALL_BLOOD_GROUPS.map((g) => (
                    <option key={g} value={g}>
                      {g}
                    </option>
                  ))}
                </select>
                {errors.bloodGroup ? (
                  <p className="text-[11px] text-destructive">
                    {errors.bloodGroup.message}
                  </p>
                ) : null}
              </div>

              {/* Component */}
              <div className="space-y-1.5">
                <Label htmlFor="component" className="text-xs font-semibold">
                  {t("bloodBank.bloodComponentRequired")}
                </Label>
                <select
                  id="component"
                  {...register("component")}
                  className="h-9 w-full rounded-none border border-field-stroke bg-background px-3 text-xs text-foreground focus:border-primary focus:outline-none"
                >
                  {ALL_COMPONENTS.map((c) => (
                    <option key={c} value={c}>
                      {bloodBankComponentLabels[c]}
                    </option>
                  ))}
                </select>
                {errors.component ? (
                  <p className="text-[11px] text-destructive">
                    {errors.component.message}
                  </p>
                ) : null}
              </div>

              {/* Unit ID (Optional / Custom) */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label htmlFor="unitId" className="text-xs font-semibold">
                    {t("bloodBank.unitIdOptional")}
                  </Label>
                  <span className="text-[10px] text-muted-foreground">
                    {t("bloodBank.autoGeneratedIfEmpty")}
                  </span>
                </div>
                <Input
                  id="unitId"
                  placeholder={`e.g. UNT-${selectedBloodGroup.replace("+", "POS").replace("−", "NEG")}-9821`}
                  {...register("unitId")}
                  className="h-9 text-xs"
                  dir="ltr"
                />
                {errors.unitId ? (
                  <p className="text-[11px] text-destructive">
                    {errors.unitId.message}
                  </p>
                ) : null}
              </div>

              {/* Quantity */}
              <div className="space-y-1.5">
                <Label htmlFor="quantity" className="text-xs font-semibold">
                  {t("bloodBank.intakeQuantityRequired")}
                </Label>
                <Input
                  id="quantity"
                  type="number"
                  min={1}
                  max={20}
                  {...register("quantity")}
                  className="h-9 text-xs"
                />
                {errors.quantity ? (
                  <p className="text-[11px] text-destructive">
                    {errors.quantity.message}
                  </p>
                ) : (
                  <p className="text-[10px] text-muted-foreground">
                    {t("bloodBank.batchQuantityNotice")}
                  </p>
                )}
              </div>

              {/* Collection Date */}
              <div className="space-y-1.5">
                <Label htmlFor="collectionDate" className="text-xs font-semibold">
                  {t("bloodBank.collectionDateRequired")}
                </Label>
                <Input
                  id="collectionDate"
                  type="date"
                  max={todayStr}
                  {...register("collectionDate")}
                  className="h-9 text-xs"
                />
                {errors.collectionDate ? (
                  <p className="text-[11px] text-destructive">
                    {errors.collectionDate.message}
                  </p>
                ) : null}
              </div>

              {/* Expiry Date */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label htmlFor="expiryDate" className="text-xs font-semibold">
                    {t("bloodBank.expiryDateRequired")}
                  </Label>
                  <span className="text-[10px] text-muted-foreground">
                    {t("bloodBank.autoCalculatedDefault")}
                  </span>
                </div>
                <Input
                  id="expiryDate"
                  type="date"
                  min={formValues.collectionDate}
                  {...register("expiryDate")}
                  className="h-9 text-xs"
                />
                {errors.expiryDate ? (
                  <p className="text-[11px] text-destructive">
                    {errors.expiryDate.message}
                  </p>
                ) : null}
              </div>
            </div>

            {/* Storage Location */}
            <div className="space-y-1.5">
              <Label htmlFor="storageLocation" className="text-xs font-semibold">
                {t("bloodBank.storageLocationRequired")}
              </Label>
              <Input
                id="storageLocation"
                placeholder={t("bloodBank.storageLocationPlaceholder")}
                {...register("storageLocation")}
                className="h-9 text-xs"
              />
              <div className="flex flex-wrap gap-1.5 pt-1">
                <span className="text-[10px] text-muted-foreground self-center">
                  {t("bloodBank.quickSelect")}
                </span>
                {commonLocations.map((loc) => (
                  <button
                    key={loc}
                    type="button"
                    onClick={() => setValue("storageLocation", loc)}
                    className="border border-border bg-surface-subtle px-2 py-0.5 text-[10px] text-foreground hover:bg-surface hover:border-primary focus:outline-none"
                  >
                    {loc}
                  </button>
                ))}
              </div>
              {errors.storageLocation ? (
                <p className="text-[11px] text-destructive">
                  {errors.storageLocation.message}
                </p>
              ) : null}
            </div>

            {/* Notes */}
            <div className="space-y-1.5">
              <Label htmlFor="notes" className="text-xs font-semibold">
                {t("bloodBank.clinicalBatchNotes")}
              </Label>
              <textarea
                id="notes"
                rows={2}
                placeholder={t("bloodBank.notesPlaceholder")}
                {...register("notes")}
                className="w-full rounded-none border border-field-stroke bg-background p-2 text-xs text-foreground focus:border-primary focus:outline-none"
              />
            </div>
          </form>
        ) : null}

        {/* STEP 2: REVIEW BEFORE SAVE */}
        {step === "review" ? (
          <div className="space-y-4 py-2 text-xs">
            <div className="border border-primary/20 bg-primary/5 p-3 text-primary">
              <div className="flex items-center gap-2 font-semibold">
                <ClipboardCheck aria-hidden="true" className="size-4" />
                <span>{t("bloodBank.reviewBatchSpecs")}</span>
              </div>
              <p className="mt-0.5 text-[11px] text-muted-foreground">
                {t("bloodBank.reviewBatchDesc")}
              </p>
            </div>

            <dl className="grid grid-cols-2 gap-px border border-border bg-border">
              <div className="bg-surface p-3">
                <dt className="text-[11px] text-muted-foreground">{t("common.bloodGroup")}</dt>
                <dd className="mt-1 font-semibold flex items-center gap-2">
                  <BloodGroupBadge group={formValues.bloodGroup} />
                  <bdi dir="ltr">{formValues.bloodGroup}</bdi>
                </dd>
              </div>

              <div className="bg-surface p-3">
                <dt className="text-[11px] text-muted-foreground">{t("common.component")}</dt>
                <dd className="mt-1 font-semibold">
                  {bloodBankComponentLabels[formValues.component]}
                </dd>
              </div>

              <div className="bg-surface p-3">
                <dt className="text-[11px] text-muted-foreground">{t("bloodBank.quantityToRegister")}</dt>
                <dd className="mt-1 font-semibold tabular-nums">
                  <bdi dir="ltr">{formValues.quantity}</bdi> {t("common.units")}
                </dd>
              </div>

              <div className="bg-surface p-3">
                <dt className="text-[11px] text-muted-foreground">{t("bloodBank.targetStorage")}</dt>
                <dd className="mt-1 font-semibold">{formValues.storageLocation}</dd>
              </div>

              <div className="bg-surface p-3">
                <dt className="text-[11px] text-muted-foreground">{t("bloodBank.collection")}</dt>
                <dd className="mt-1 font-semibold tabular-nums">
                  <bdi dir="ltr">{formValues.collectionDate}</bdi>
                </dd>
              </div>

              <div className="bg-surface p-3">
                <dt className="text-[11px] text-muted-foreground">{t("bloodBank.expiry")}</dt>
                <dd className="mt-1 font-semibold tabular-nums text-emergency">
                  <bdi dir="ltr">{formValues.expiryDate}</bdi>
                </dd>
              </div>
            </dl>

            {formValues.notes ? (
              <div className="border border-border bg-surface p-3">
                <span className="text-[11px] font-semibold text-muted-foreground">
                  {t("bloodBank.unitNotesLabel")}
                </span>
                <p className="mt-0.5 text-foreground">{formValues.notes}</p>
              </div>
            ) : null}
          </div>
        ) : null}

        {/* STEP 3: SUCCESS */}
        {step === "success" ? (
          <div className="space-y-4 py-3 text-xs">
            <div className="flex items-center gap-3 border border-emerald-500/30 bg-emerald-500/10 p-4 text-emerald-800 dark:text-emerald-300">
              <CheckCircle2 aria-hidden="true" className="size-5 shrink-0 text-emerald-600" />
              <div>
                <p className="font-semibold text-sm">
                  {t("bloodBank.registeredUnitsCount", { count: createdUnits.length })}
                </p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {t("bloodBank.registeredUnitsDesc")}
                </p>
              </div>
            </div>

            <div className="space-y-1.5">
              <p className="font-semibold text-xs text-muted-foreground">
                {t("bloodBank.registeredUnitRefs")}
              </p>
              <div className="max-h-36 overflow-y-auto border border-border bg-surface-subtle p-2 space-y-1">
                {createdUnits.map((u) => (
                  <div
                    key={u.id}
                    className="flex items-center justify-between border-b border-border/50 py-1 text-xs last:border-b-0"
                  >
                    <span className="font-mono font-bold text-foreground">
                      <bdi dir="ltr">{u.id}</bdi>
                    </span>
                    <span className="text-muted-foreground">
                      <bdi dir="ltr">{u.bloodGroup}</bdi> · {u.storageLocation}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : null}

        {/* FOOTER ACTIONS */}
        <DialogFooter className="gap-2 sm:gap-0">
          {step === "form" ? (
            <>
              <Button type="button" variant="secondary" onClick={handleClose}>
                {t("common.cancel")}
              </Button>
              <Button type="submit" form="unit-intake-form">
                {t("bloodBank.reviewRegistrationAction")}
                <ChevronRight aria-hidden="true" className="size-3.5 rtl:rotate-180" />
              </Button>
            </>
          ) : step === "review" ? (
            <>
              <Button
                type="button"
                variant="secondary"
                disabled={isSubmitting}
                onClick={() => setStep("form")}
              >
                {t("bloodBank.backToEditAction")}
              </Button>
              <Button
                type="button"
                disabled={isSubmitting}
                onClick={onConfirmSave}
              >
                {isSubmitting ? (
                  <LoaderCircle aria-hidden="true" className="size-3.5 animate-spin" />
                ) : (
                  <CheckCircle2 aria-hidden="true" className="size-3.5" />
                )}
                {t("bloodBank.confirmRegisterAction")}
              </Button>
            </>
          ) : (
            <>
              <Button
                type="button"
                variant="secondary"
                onClick={() => {
                  setStep("form");
                  reset();
                }}
              >
                <RotateCcw aria-hidden="true" className="size-3.5 rtl:rotate-180" />
                {t("bloodBank.registerMoreUnitsAction")}
              </Button>
              <Button type="button" onClick={handleClose}>
                {t("bloodBank.doneViewInventoryAction")}
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
