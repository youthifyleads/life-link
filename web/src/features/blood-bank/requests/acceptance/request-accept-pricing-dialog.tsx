import { zodResolver } from "@hookform/resolvers/zod";
import { Check, Hospital, LoaderCircle, ReceiptText } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { z } from "zod";

import { useAcceptRequest } from "@/features/blood-bank/requests/acceptance/use-accept-request";
import type { BloodBankRequest } from "@/features/blood-bank/types/blood-bank.types";
import { normalizeApiError } from "@/shared/api/api-error";
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
import { formatHospitalName } from "@/shared/lib/formatters";

interface RequestAcceptPricingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  request: Pick<
    BloodBankRequest,
    "id" | "hospital" | "bloodGroup" | "quantity"
  >;
  onAccepted: (unitPrice: number) => void;
}

const defaultUnitPrice = 450;

export function RequestAcceptPricingDialog({
  open,
  onOpenChange,
  request,
  onAccepted,
}: RequestAcceptPricingDialogProps) {
  const { i18n, t } = useTranslation();
  const [submissionError, setSubmissionError] = useState<string>();
  const acceptMutation = useAcceptRequest(request.id);

  const pricingSchema = useMemo(
    () =>
      z.object({
        unitPrice: z
          .number({
            required_error: t(
              "bloodBank.unitPriceRequired",
              "Unit price is required.",
            ),
            invalid_type_error: t(
              "bloodBank.unitPriceRequired",
              "Enter a valid unit price.",
            ),
          })
          .positive(
            t("bloodBank.unitPricePositive", "Unit price must be greater than zero."),
          )
          .refine(
            (value) => Number.isInteger(value * 100),
            t(
              "bloodBank.unitPricePrecision",
              "Unit price can have no more than two decimal places.",
            ),
          ),
      }),
    [t],
  );

  type PricingFormValues = z.infer<typeof pricingSchema>;

  const {
    register,
    handleSubmit,
    reset,
    setFocus,
    watch,
    formState: { errors },
  } = useForm<PricingFormValues>({
    resolver: zodResolver(pricingSchema),
    defaultValues: { unitPrice: defaultUnitPrice },
  });

  useEffect(() => {
    if (!open) return;

    setSubmissionError(undefined);
    reset({ unitPrice: defaultUnitPrice });
    const focusTimer = window.setTimeout(() => setFocus("unitPrice"), 0);
    return () => window.clearTimeout(focusTimer);
  }, [open, reset, setFocus]);

  const unitPrice = watch("unitPrice");
  const safeUnitPrice = Number.isFinite(unitPrice) ? unitPrice : 0;
  const totalAmount = safeUnitPrice * request.quantity;
  const currencyFormatter = useMemo(
    () =>
      new Intl.NumberFormat(i18n.language.startsWith("ar") ? "ar-EG" : "en-EG", {
        style: "currency",
        currency: "EGP",
        currencyDisplay: "code",
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }),
    [i18n.language],
  );

  const submitAcceptance = handleSubmit(async ({ unitPrice: submittedPrice }) => {
    setSubmissionError(undefined);

    try {
      await acceptMutation.mutateAsync({ unit_price: submittedPrice });
      onAccepted(submittedPrice);
      onOpenChange(false);
    } catch (error) {
      setSubmissionError(normalizeApiError(error).message);
      window.setTimeout(() => setFocus("unitPrice"), 0);
    }
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent dir={i18n.dir()} className="max-w-xl p-0">
        <DialogHeader className="border-b border-border px-5 py-5 pe-14 sm:px-6 sm:pe-14">
          <DialogTitle className="flex items-center gap-2 text-lg">
            <ReceiptText aria-hidden="true" className="size-5 text-primary" />
            {t("bloodBank.acceptPricingTitle", "Accept request and set pricing")}
          </DialogTitle>
          <DialogDescription className="leading-5">
            {t(
              "bloodBank.acceptPricingDescription",
              "Confirm the hospital request and record the agreed price for each blood unit.",
            )}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={submitAcceptance}>
          <div className="space-y-5 px-5 py-5 sm:px-6">
            <section aria-label={t("bloodBank.requestSummary", "Request summary")}>
              <dl className="grid border-s border-t border-border sm:grid-cols-3">
                <div className="border-b border-e border-border bg-surface-subtle p-3.5 sm:col-span-3">
                  <dt className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                    <Hospital aria-hidden="true" className="size-3.5 text-primary" />
                    {t("bloodBank.hospital", "Hospital")}
                  </dt>
                  <dd className="mt-1.5 text-sm font-semibold text-foreground">
                    {formatHospitalName(request.hospital.name)}
                  </dd>
                </div>
                <div className="border-b border-e border-border bg-surface p-3.5 sm:col-span-2">
                  <dt className="text-xs font-medium text-muted-foreground">
                    {t("common.bloodGroup", "Blood group")}
                  </dt>
                  <dd className="mt-1.5">
                    <BloodGroupBadge group={request.bloodGroup} />
                  </dd>
                </div>
                <div className="border-b border-e border-border bg-surface p-3.5">
                  <dt className="text-xs font-medium text-muted-foreground">
                    {t("bloodBank.quantity", "Quantity")}
                  </dt>
                  <dd className="mt-1.5 text-sm font-semibold tabular-nums text-foreground">
                    <bdi dir="auto">
                      {new Intl.NumberFormat(i18n.language).format(request.quantity)} {t("bloodBank.units", "units")}
                    </bdi>
                  </dd>
                </div>
              </dl>
            </section>

            <div>
              <Label htmlFor="request-unit-price">
                {t("bloodBank.unitPriceEgp", "Unit Price (EGP)")}
              </Label>
              <div className="relative mt-2">
                <Input
                  id="request-unit-price"
                  type="number"
                  min="0.01"
                  step="0.01"
                  inputMode="decimal"
                  dir="ltr"
                  autoComplete="off"
                  aria-invalid={Boolean(errors.unitPrice)}
                  aria-describedby={errors.unitPrice ? "request-unit-price-error" : undefined}
                  className="pe-16 text-end font-semibold tabular-nums"
                  disabled={acceptMutation.isPending}
                  {...register("unitPrice", { valueAsNumber: true })}
                />
                <span className="pointer-events-none absolute end-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-muted-foreground">
                  EGP
                </span>
              </div>
              {errors.unitPrice ? (
                <p id="request-unit-price-error" role="alert" className="mt-1.5 text-xs text-destructive">
                  {errors.unitPrice.message}
                </p>
              ) : null}
            </div>

            <section aria-labelledby="request-total-heading" className="border border-primary/25 bg-primary/5 p-4">
              <div className="flex items-end justify-between gap-4">
                <div>
                  <h2 id="request-total-heading" className="text-sm font-semibold text-foreground">
                    {t("bloodBank.totalAmount", "Total Amount")}
                  </h2>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {t("bloodBank.totalAmountFormula", "Unit Price × Quantity")}
                  </p>
                </div>
                <strong className="text-xl font-semibold tabular-nums text-primary">
                  <bdi dir="auto">{currencyFormatter.format(totalAmount)}</bdi>
                </strong>
              </div>
              <p className="mt-3 border-t border-primary/15 pt-3 text-xs tabular-nums text-muted-foreground">
                <bdi dir="auto">
                  {currencyFormatter.format(safeUnitPrice)} × {new Intl.NumberFormat(i18n.language).format(request.quantity)}
                </bdi>
              </p>
            </section>

            {submissionError ? (
              <p role="alert" className="border border-destructive/30 bg-emergency-subtle p-3 text-sm text-destructive">
                {submissionError}
              </p>
            ) : null}
          </div>

          <DialogFooter className="m-0 border-t border-border bg-surface-subtle px-5 py-4 sm:px-6">
            <Button
              type="button"
              variant="secondary"
              onClick={() => onOpenChange(false)}
              disabled={acceptMutation.isPending}
            >
              {t("common.cancel", "Cancel")}
            </Button>
            <Button type="submit" disabled={acceptMutation.isPending}>
              {acceptMutation.isPending ? (
                <LoaderCircle aria-hidden="true" className="size-4 animate-spin" />
              ) : (
                <Check aria-hidden="true" className="size-4" />
              )}
              {t("bloodBank.confirmAccept", "Confirm accept")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
