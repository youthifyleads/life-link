import { zodResolver } from "@hookform/resolvers/zod";
import {
  Barcode,
  Check,
  LoaderCircle,
  PackageMinus,
  ScanBarcode,
  ShieldAlert,
  X,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { z } from "zod";

import {
  useAllocateBag,
  useDeallocateBag,
} from "@/features/blood-bank/requests/allocation/use-barcode-allocation";
import type {
  BloodBankComponent,
  BloodUnit,
  BloodUnitStatus,
} from "@/features/blood-bank/types/blood-bank.types";
import { BloodGroupBadge } from "@/shared/components/clinical/blood-group-badge";
import type { BloodGroup } from "@/shared/components/clinical/clinical.types";
import { normalizeApiError } from "@/shared/api/api-error";
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
import { cn } from "@/shared/lib/utils";

interface BarcodeAllocationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  requestId: string;
  quota: number;
  allocatedUnits: BloodUnit[];
  allUnits: BloodUnit[];
}

interface AllocatedBagRow {
  barcode: string;
  bloodGroup?: BloodGroup;
  component?: BloodBankComponent;
  status: BloodUnitStatus;
}

interface Notice {
  tone: "success" | "error" | "quarantine";
  message: string;
}

function toAllocatedBag(unit: BloodUnit): AllocatedBagRow {
  return {
    barcode: unit.id,
    bloodGroup: unit.bloodGroup,
    component: unit.component,
    status: unit.status === "quarantined" ? "quarantined" : "allocated",
  };
}

export function BarcodeAllocationDialog({
  open,
  onOpenChange,
  requestId,
  quota,
  allocatedUnits,
  allUnits,
}: BarcodeAllocationDialogProps) {
  const { i18n, t } = useTranslation();
  const [allocatedBags, setAllocatedBags] = useState<AllocatedBagRow[]>([]);
  const [notice, setNotice] = useState<Notice>();
  const [deallocationBarcode, setDeallocationBarcode] = useState<string>();

  const allocateMutation = useAllocateBag(requestId);
  const deallocateMutation = useDeallocateBag(requestId);

  const barcodeSchema = useMemo(
    () =>
      z.object({
        barcode: z
          .string()
          .trim()
          .min(1, t("bloodBank.barcodeRequired", "Scan or enter a bag barcode.")),
      }),
    [t],
  );
  const deallocationSchema = useMemo(
    () =>
      z.object({
        reason: z
          .string()
          .trim()
          .min(
            1,
            t(
              "bloodBank.deallocationReasonRequired",
              "A deallocation reason is required.",
            ),
          ),
      }),
    [t],
  );

  type BarcodeFormValues = z.infer<typeof barcodeSchema>;
  type DeallocationFormValues = z.infer<typeof deallocationSchema>;

  const {
    register: registerBarcode,
    handleSubmit: handleBarcodeSubmit,
    reset: resetBarcode,
    setError: setBarcodeError,
    setFocus: setBarcodeFocus,
    formState: { errors: barcodeErrors },
  } = useForm<BarcodeFormValues>({
    resolver: zodResolver(barcodeSchema),
    defaultValues: { barcode: "" },
  });

  const {
    register: registerReason,
    handleSubmit: handleReasonSubmit,
    reset: resetReason,
    setFocus: setReasonFocus,
    formState: { errors: reasonErrors },
  } = useForm<DeallocationFormValues>({
    resolver: zodResolver(deallocationSchema),
    defaultValues: { reason: "" },
  });

  useEffect(() => {
    if (!open) return;

    setAllocatedBags(allocatedUnits.map(toAllocatedBag));
    setNotice(undefined);
    setDeallocationBarcode(undefined);
    resetBarcode({ barcode: "" });
    resetReason({ reason: "" });

    const focusTimer = window.setTimeout(() => setBarcodeFocus("barcode"), 0);
    return () => window.clearTimeout(focusTimer);
  }, [allocatedUnits, open, resetBarcode, resetReason, setBarcodeFocus]);

  const allocatedCount = allocatedBags.length;
  const isQuotaFilled = allocatedCount >= quota;
  const quotaPercentage = Math.min(
    100,
    quota > 0 ? Math.round((allocatedCount / quota) * 100) : 100,
  );

  const refocusBarcode = () => {
    window.setTimeout(() => setBarcodeFocus("barcode"), 0);
  };

  const submitBarcode = handleBarcodeSubmit(async ({ barcode }) => {
    const normalizedBarcode = barcode.trim();
    setNotice(undefined);

    if (isQuotaFilled) {
      setBarcodeError("barcode", {
        message: t(
          "bloodBank.allocationQuotaFilled",
          "The request quota is already filled.",
        ),
      });
      return;
    }

    if (
      allocatedBags.some(
        (bag) => bag.barcode.toLocaleLowerCase() === normalizedBarcode.toLocaleLowerCase(),
      )
    ) {
      setBarcodeError("barcode", {
        message: t(
          "bloodBank.bagAlreadyAllocated",
          "This bag is already allocated to the request.",
        ),
      });
      return;
    }

    const knownUnit = allUnits.find(
      (unit) => unit.id.toLocaleLowerCase() === normalizedBarcode.toLocaleLowerCase(),
    );

    if (knownUnit?.status === "quarantined") {
      setNotice({
        tone: "quarantine",
        message: t(
          "bloodBank.quarantinedBagBlocked",
          "This blood bag is quarantined and cannot be allocated. Review its custody record before proceeding.",
        ),
      });
      resetBarcode({ barcode: "" });
      refocusBarcode();
      return;
    }

    try {
      await allocateMutation.mutateAsync({ barcode: normalizedBarcode });
      setAllocatedBags((current) => [
        ...current,
        knownUnit
          ? { ...toAllocatedBag(knownUnit), status: "allocated" }
          : { barcode: normalizedBarcode, status: "allocated" },
      ]);
      setNotice({
        tone: "success",
        message: t("bloodBank.bagAllocatedSuccess", {
          barcode: normalizedBarcode,
          defaultValue: `Bag ${normalizedBarcode} was allocated successfully.`,
        }),
      });
      resetBarcode({ barcode: "" });
      refocusBarcode();
    } catch (error) {
      const apiError = normalizeApiError(error);
      const isQuarantineError =
        apiError.code?.toLocaleLowerCase().includes("quarant") ||
        apiError.message.toLocaleLowerCase().includes("quarant");

      setNotice({
        tone: isQuarantineError ? "quarantine" : "error",
        message: apiError.message,
      });
      refocusBarcode();
    }
  });

  const beginDeallocation = (barcode: string) => {
    setNotice(undefined);
    setDeallocationBarcode(barcode);
    resetReason({ reason: "" });
    window.setTimeout(() => setReasonFocus("reason"), 0);
  };

  const cancelDeallocation = () => {
    setDeallocationBarcode(undefined);
    resetReason({ reason: "" });
    refocusBarcode();
  };

  const submitDeallocation = handleReasonSubmit(async ({ reason }) => {
    if (!deallocationBarcode) return;

    setNotice(undefined);
    try {
      await deallocateMutation.mutateAsync({
        barcode: deallocationBarcode,
        reason: reason.trim(),
      });
      setAllocatedBags((current) =>
        current.filter((bag) => bag.barcode !== deallocationBarcode),
      );
      setNotice({
        tone: "success",
        message: t("bloodBank.bagDeallocatedSuccess", {
          barcode: deallocationBarcode,
          defaultValue: `Bag ${deallocationBarcode} was deallocated successfully.`,
        }),
      });
      setDeallocationBarcode(undefined);
      resetReason({ reason: "" });
      refocusBarcode();
    } catch (error) {
      const apiError = normalizeApiError(error);
      setNotice({ tone: "error", message: apiError.message });
      window.setTimeout(() => setReasonFocus("reason"), 0);
    }
  });

  const isBusy = allocateMutation.isPending || deallocateMutation.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        dir={i18n.dir()}
        className="flex max-h-[90vh] max-w-4xl flex-col overflow-hidden p-0"
      >
        <DialogHeader className="shrink-0 border-b border-border px-5 py-5 pe-14 sm:px-6 sm:pe-14">
          <DialogTitle className="flex items-center gap-2 text-lg">
            <ScanBarcode aria-hidden="true" className="size-5 text-primary" />
            {t("bloodBank.barcodeAllocationTitle", "One-by-one barcode allocation")}
          </DialogTitle>
          <DialogDescription className="max-w-[70ch] leading-5">
            {t("bloodBank.barcodeAllocationDescription", {
              id: requestId,
              defaultValue: `Scan or manually enter each blood bag for request ${requestId}. Each successful entry is allocated immediately.`,
            })}
          </DialogDescription>
        </DialogHeader>

        <div className="min-h-0 flex-1 space-y-5 overflow-y-auto p-5 sm:p-6">
          <section aria-labelledby="barcode-quota-heading">
            <div className="flex items-end justify-between gap-4">
              <div>
                <h2 id="barcode-quota-heading" className="text-sm font-semibold text-foreground">
                  {t("bloodBank.quotaProgress", "Request quota progress")}
                </h2>
                <p className="mt-1 text-xs text-muted-foreground">
                  {t("bloodBank.allocatedOf", {
                    count: allocatedCount,
                    total: quota,
                    defaultValue: `${allocatedCount} of ${quota} bags allocated`,
                  })}
                </p>
              </div>
              <strong className="text-lg tabular-nums text-foreground">
                <bdi dir="ltr">{allocatedCount} / {quota}</bdi>
              </strong>
            </div>
            <div
              className="mt-3 h-2 overflow-hidden rounded-full bg-surface-subtle"
              role="progressbar"
              aria-label={t("bloodBank.quotaProgress", "Request quota progress")}
              aria-valuemin={0}
              aria-valuemax={quota}
              aria-valuenow={Math.min(allocatedCount, quota)}
            >
              <div
                className={cn(
                  "h-full transition-[width] duration-200",
                  isQuotaFilled ? "bg-success" : "bg-primary",
                )}
                style={{ width: `${quotaPercentage}%` }}
              />
            </div>
          </section>

          <section aria-labelledby="barcode-entry-heading" className="border border-border bg-surface-subtle p-4">
            <h2 id="barcode-entry-heading" className="text-sm font-semibold text-foreground">
              {t("bloodBank.scanNextBag", "Scan the next blood bag")}
            </h2>
            <p className="mt-1 text-xs leading-5 text-muted-foreground">
              {t(
                "bloodBank.scannerInputHelp",
                "Use a connected barcode scanner or type the barcode manually, then press Enter.",
              )}
            </p>

            <form className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-start" onSubmit={submitBarcode}>
              <div className="min-w-0 flex-1">
                <Label htmlFor="allocation-barcode" className="sr-only">
                  {t("bloodBank.bagBarcode", "Blood bag barcode")}
                </Label>
                <div className="relative">
                  <Barcode
                    aria-hidden="true"
                    className="pointer-events-none absolute start-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
                  />
                  <Input
                    id="allocation-barcode"
                    autoFocus
                    autoComplete="off"
                    spellCheck={false}
                    dir="ltr"
                    placeholder={t("bloodBank.barcodePlaceholder", "BAG-A-POS-0901")}
                    aria-invalid={Boolean(barcodeErrors.barcode)}
                    aria-describedby={barcodeErrors.barcode ? "allocation-barcode-error" : "allocation-barcode-help"}
                    className="ps-10 font-mono"
                    disabled={isBusy || isQuotaFilled}
                    {...registerBarcode("barcode")}
                  />
                </div>
                {barcodeErrors.barcode ? (
                  <p id="allocation-barcode-error" role="alert" className="mt-1.5 text-xs text-destructive">
                    {barcodeErrors.barcode.message}
                  </p>
                ) : (
                  <p id="allocation-barcode-help" className="sr-only">
                    {t("bloodBank.scannerInputHelp", "Scan or manually enter a barcode and press Enter.")}
                  </p>
                )}
              </div>
              <Button type="submit" disabled={isBusy || isQuotaFilled} className="sm:min-w-36">
                {allocateMutation.isPending ? (
                  <LoaderCircle aria-hidden="true" className="size-4 animate-spin" />
                ) : (
                  <ScanBarcode aria-hidden="true" className="size-4" />
                )}
                {t("bloodBank.allocateBag", "Allocate bag")}
              </Button>
            </form>

            <div className="mt-3 flex items-start gap-2 border border-warning/30 bg-warning-subtle p-3 text-xs leading-5 text-[#6f4a00]">
              <ShieldAlert aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
              <p>
                <strong>{t("bloodBank.quarantineWarning", "Quarantine warning:")}</strong>{" "}
                {t(
                  "bloodBank.quarantineWarningDescription",
                  "Quarantined blood bags cannot be allocated. Review the bag status and custody record before retrying.",
                )}
              </p>
            </div>
          </section>

          {notice ? (
            <div
              role={notice.tone === "success" ? "status" : "alert"}
              className={cn(
                "flex items-start gap-2 border p-3 text-sm leading-5",
                notice.tone === "success" && "border-success/30 bg-success-subtle text-success",
                notice.tone === "error" && "border-destructive/30 bg-emergency-subtle text-destructive",
                notice.tone === "quarantine" && "border-warning/30 bg-warning-subtle text-[#6f4a00]",
              )}
            >
              {notice.tone === "success" ? (
                <Check aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
              ) : (
                <ShieldAlert aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
              )}
              <span>{notice.message}</span>
            </div>
          ) : null}

          <section aria-labelledby="allocated-bags-heading">
            <div className="mb-2 flex items-center justify-between gap-3">
              <h2 id="allocated-bags-heading" className="text-sm font-semibold text-foreground">
                {t("bloodBank.allocatedBags", "Allocated bags")}
              </h2>
              <span className="text-xs tabular-nums text-muted-foreground">
                {t("bloodBank.bagCount", {
                  count: allocatedCount,
                  defaultValue: `${allocatedCount} bags`,
                })}
              </span>
            </div>

            <div className="overflow-x-auto border border-border" role="region" tabIndex={0} aria-label={t("bloodBank.allocatedBags", "Allocated bags table")}>
              <table className="w-full min-w-[42rem] border-collapse text-start text-xs">
                <thead className="border-b border-border bg-surface-subtle text-muted-foreground">
                  <tr>
                    <th scope="col" className="px-3.5 py-2.5 text-start">{t("bloodBank.barcode", "Barcode")}</th>
                    <th scope="col" className="px-3 py-2.5 text-start">{t("common.bloodGroup", "Blood group")}</th>
                    <th scope="col" className="px-3 py-2.5 text-start">{t("common.component", "Component")}</th>
                    <th scope="col" className="px-3 py-2.5 text-start">{t("common.status", "Status")}</th>
                    <th scope="col" className="px-3.5 py-2.5 text-end">{t("common.actions", "Actions")}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border bg-surface">
                  {allocatedBags.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-4 py-8 text-center text-sm text-muted-foreground">
                        {t("bloodBank.noBagsAllocated", "No blood bags have been allocated to this request.")}
                      </td>
                    </tr>
                  ) : (
                    allocatedBags.map((bag) => (
                      <tr key={bag.barcode} className="hover:bg-surface-subtle/60">
                        <td className="px-3.5 py-3 font-mono font-semibold text-foreground">
                          <bdi dir="ltr">{bag.barcode}</bdi>
                        </td>
                        <td className="px-3 py-3">
                          {bag.bloodGroup ? <BloodGroupBadge group={bag.bloodGroup} /> : <span aria-hidden="true">—</span>}
                        </td>
                        <td className="px-3 py-3 font-medium text-foreground">
                          {bag.component ? t(`healthcare.${bag.component}`, bag.component.replaceAll("_", " ")) : <span aria-hidden="true">—</span>}
                        </td>
                        <td className="px-3 py-3">
                          <span className="inline-flex border border-primary/25 bg-primary/10 px-2 py-0.5 font-semibold text-primary">
                            {t(`status.${bag.status}`, bag.status)}
                          </span>
                        </td>
                        <td className="px-3.5 py-3 text-end">
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="h-7 text-xs text-destructive hover:text-destructive"
                            disabled={isBusy}
                            onClick={() => beginDeallocation(bag.barcode)}
                            aria-label={`${t("bloodBank.deallocateBag", "Deallocate bag")} ${bag.barcode}`}
                          >
                            <PackageMinus aria-hidden="true" className="size-3.5" />
                            {t("bloodBank.deallocate", "Deallocate")}
                          </Button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </section>

          {deallocationBarcode ? (
            <section aria-labelledby="deallocation-heading" className="border border-destructive/25 bg-emergency-subtle p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 id="deallocation-heading" className="text-sm font-semibold text-foreground">
                    {t("bloodBank.deallocateBag", "Deallocate blood bag")}
                  </h2>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {t("bloodBank.deallocateBagDescription", {
                      barcode: deallocationBarcode,
                      defaultValue: `Record why bag ${deallocationBarcode} is being removed from this request.`,
                    })}
                  </p>
                </div>
                <Button type="button" variant="ghost" size="icon" className="size-8" onClick={cancelDeallocation} disabled={deallocateMutation.isPending}>
                  <X aria-hidden="true" className="size-4" />
                  <span className="sr-only">{t("common.cancel", "Cancel")}</span>
                </Button>
              </div>

              <form className="mt-4" onSubmit={submitDeallocation}>
                <Label htmlFor="deallocation-reason">
                  {t("bloodBank.deallocationReason", "Deallocation reason")}
                  <span aria-hidden="true" className="text-destructive">*</span>
                </Label>
                <textarea
                  id="deallocation-reason"
                  rows={3}
                  placeholder={t(
                    "bloodBank.deallocationReasonPlaceholder",
                    "Example: Bag seal damaged during preparation",
                  )}
                  aria-invalid={Boolean(reasonErrors.reason)}
                  aria-describedby={reasonErrors.reason ? "deallocation-reason-error" : undefined}
                  disabled={deallocateMutation.isPending}
                  className="mt-2 w-full resize-y rounded-md border border-input bg-surface px-3 py-2 text-sm text-foreground outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/20 disabled:opacity-70"
                  {...registerReason("reason")}
                />
                {reasonErrors.reason ? (
                  <p id="deallocation-reason-error" role="alert" className="mt-1.5 text-xs text-destructive">
                    {reasonErrors.reason.message}
                  </p>
                ) : null}
                <div className="mt-3 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                  <Button type="button" variant="secondary" onClick={cancelDeallocation} disabled={deallocateMutation.isPending}>
                    {t("common.cancel", "Cancel")}
                  </Button>
                  <Button type="submit" variant="destructive" disabled={deallocateMutation.isPending}>
                    {deallocateMutation.isPending ? (
                      <LoaderCircle aria-hidden="true" className="size-4 animate-spin" />
                    ) : (
                      <PackageMinus aria-hidden="true" className="size-4" />
                    )}
                    {t("bloodBank.confirmDeallocation", "Confirm deallocation")}
                  </Button>
                </div>
              </form>
            </section>
          ) : null}
        </div>

        <DialogFooter className="m-0 shrink-0 border-t border-border bg-surface-subtle px-5 py-4 sm:px-6">
          <Button type="button" variant="secondary" onClick={() => onOpenChange(false)} disabled={isBusy}>
            {t("common.close", "Close")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
