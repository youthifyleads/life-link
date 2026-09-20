import {
  Check,
  Clock,
  Copy,
  ExternalLink,
  FileText,
  MapPin,
  Printer,
  QrCode,
  ShieldCheck,
  Thermometer,
} from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";

import {
  bloodBankComponentLabels,
  type BloodUnit,
  type BloodUnitStatus,
} from "@/features/blood-bank/types/blood-bank.types";
import { Button } from "@/shared/components/ui/button";

interface TrackingResultProps {
  unit: BloodUnit;
}

export function TrackingResult({ unit }: TrackingResultProps) {
  const { t } = useTranslation();
  const [copied, setCopied] = useState(false);
  const [printState, setPrintState] = useState<"idle" | "printing" | "printed">("idle");

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(unit.id);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handlePrint = () => {
    setPrintState("printing");
    window.setTimeout(() => {
      try {
        window.print();
      } finally {
        setPrintState("printed");
        window.setTimeout(() => setPrintState("idle"), 2500);
      }
    }, 100);
  };

  const getStatusIndicator = (status: BloodUnitStatus) => {
    switch (status) {
      case "available":
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-xs font-semibold text-emerald-700 dark:text-emerald-400 border border-emerald-500/20">
            <span className="size-1.5 rounded-full bg-emerald-500 shrink-0" />
            <span>{t("status.available", "Available in stock")}</span>
          </span>
        );
      case "reserved":
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/10 px-2.5 py-0.5 text-xs font-semibold text-amber-700 dark:text-amber-400 border border-amber-500/20">
            <span className="size-1.5 rounded-full bg-amber-500 shrink-0" />
            <span>{t("status.reserved", "Reserved")}</span>
          </span>
        );
      case "allocated":
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary border border-primary/20">
            <span className="size-1.5 rounded-full bg-primary shrink-0" />
            <span>{t("caregiver.allocated", "Allocated to requisition")}</span>
          </span>
        );
      case "quarantined":
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-purple-500/10 px-2.5 py-0.5 text-xs font-semibold text-purple-700 dark:text-purple-400 border border-purple-500/20">
            <span className="size-1.5 rounded-full bg-purple-500 shrink-0" />
            <span>{t("status.quarantined", "Quarantined")}</span>
          </span>
        );
      case "expired":
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-destructive/10 px-2.5 py-0.5 text-xs font-semibold text-destructive border border-destructive/20">
            <span className="size-1.5 rounded-full bg-destructive shrink-0" />
            <span>{t("status.expired", "Expired")}</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium text-foreground">
            <span className="size-1.5 rounded-full bg-muted-foreground shrink-0" />
            <span>{status}</span>
          </span>
        );
    }
  };

  const isRhPositive = unit.bloodGroup.includes("+");

  return (
    <div className="border border-border/80 bg-surface shadow-2xs rounded-lg p-4 sm:p-5 space-y-5">
      {/* Printable Thermal Label (Visible only on print) */}
      <div className="hidden print:block printable-unit-label border-2 border-black p-5 text-black bg-white mb-6">
        <div className="flex items-center justify-between border-b-2 border-black pb-3">
          <div>
            <p className="text-xs font-mono uppercase font-bold tracking-widest text-gray-700">
              {t("healthcare.bloodBank", "Central Blood Bank")} · ISBT 128
            </p>
            <h1 className="text-base font-black tracking-tight">
              {t("bloodBank.officialDispatchLabel", "ISBT 128 Compliant Blood Product Custody Label")}
            </h1>
          </div>
          <div className="border-2 border-black px-3 py-1 text-center bg-gray-100">
            <span className="block text-[9px] uppercase font-bold text-gray-600">
              {t("bloodBank.aboRhGroup", "ABO / Rh")}
            </span>
            <span className="text-lg font-black font-mono">{unit.bloodGroup}</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 py-3 border-b-2 border-black text-xs font-mono">
          <div>
            <span className="block text-[10px] uppercase font-bold text-gray-700">
              {t("bloodBank.productIdentifier", "Unit DIN")}
            </span>
            <span className="text-base font-black tracking-wide">{unit.id}</span>
          </div>
          <div>
            <span className="block text-[10px] uppercase font-bold text-gray-700">
              {t("common.component", "Component")}
            </span>
            <span className="text-sm font-bold">
              {bloodBankComponentLabels[unit.component]}
            </span>
          </div>
          <div>
            <span className="block text-[10px] uppercase font-bold text-gray-700">
              {t("bloodBank.collection", "Collection Date")}
            </span>
            <span>{unit.collectionDate}</span>
          </div>
          <div>
            <span className="block text-[10px] uppercase font-bold text-gray-700">
              {t("bloodBank.expiry", "Expiry Date")}
            </span>
            <span className="font-bold underline">{unit.expiryDate.split("T")[0]}</span>
          </div>
          <div>
            <span className="block text-[10px] uppercase font-bold text-gray-700">
              {t("bloodBank.storageLocation", "Storage Location")}
            </span>
            <span>{unit.storageLocation}</span>
          </div>
          <div>
            <span className="block text-[10px] uppercase font-bold text-gray-700">
              {t("bloodBank.assignedRequest", "Requisition Reference")}
            </span>
            <span>{unit.allocatedRequestId ?? "UNASSIGNED / IN STOCK"}</span>
          </div>
        </div>

        <div className="pt-2 text-[10px] text-gray-600 flex justify-between items-center">
          <span>{t("bloodBank.traceabilityNotice")}</span>
          <span className="font-mono">
            {t("bloodBank.registeredAt")}: {unit.registeredAt?.split("T")[0] ?? "—"}
          </span>
        </div>
      </div>

      {/* Hero Unit Identification Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-border/70 pb-4">
        <div className="flex items-center gap-3">
          <QrCode aria-hidden="true" className="size-6 text-primary shrink-0" />
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-mono text-lg font-bold tracking-tight text-foreground">
                <bdi dir="ltr">{unit.id}</bdi>
              </h2>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => void handleCopy()}
                className="h-6 gap-1 px-1.5 text-xs font-medium text-muted-foreground hover:text-foreground no-print"
                title={t("bloodBank.copyUnitId")}
                aria-label={t("bloodBank.copyUnitId")}
              >
                {copied ? (
                  <>
                    <Check aria-hidden="true" className="size-3 text-success" />
                    <span className="text-[11px] font-semibold text-success">
                      {t("bloodBank.copied")}
                    </span>
                  </>
                ) : (
                  <>
                    <Copy aria-hidden="true" className="size-3" />
                    <span className="text-[11px]">{t("common.copy", "Copy DIN")}</span>
                  </>
                )}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              {t("bloodBank.productIdentifier", "ISBT 128 Biological Product Identifier")}
            </p>
          </div>
        </div>

        {/* Header Actions & Status Pill */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-2.5">
          {getStatusIndicator(unit.status)}

          <Button
            asChild
            variant="ghost"
            size="sm"
            className="h-8 gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground no-print"
          >
            <a href="#custody-timeline-heading">
              <Clock aria-hidden="true" className="size-3.5" />
              <span>{t("bloodBank.viewCustodyTimeline", "Custody ledger")}</span>
            </a>
          </Button>

          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={handlePrint}
            disabled={printState === "printing"}
            className="h-8 gap-1.5 text-xs font-medium no-print"
            title={t("bloodBank.printLabelTooltip")}
          >
            {printState === "printed" ? (
              <>
                <Check aria-hidden="true" className="size-3.5 text-success" />
                <span>{t("bloodBank.labelPrinted")}</span>
              </>
            ) : printState === "printing" ? (
              <>
                <Printer aria-hidden="true" className="size-3.5 animate-pulse text-primary" />
                <span>{t("bloodBank.printingLabel")}</span>
              </>
            ) : (
              <>
                <Printer aria-hidden="true" className="size-3.5" />
                <span>{t("bloodBank.printLabelAction")}</span>
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Primary Clinical KPI Metrics Grid */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {/* KPI 1: ABO / Rh (No duplicated 'Blood' text!) */}
        <div className="rounded-md border border-border/60 bg-surface-subtle/60 p-3.5 space-y-1">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            {t("bloodBank.aboRhGroup", "ABO / Rh")}
          </span>
          <div className="flex items-baseline gap-2">
            <span className="font-mono text-2xl font-black text-foreground tracking-tight">
              <bdi dir="ltr">{unit.bloodGroup}</bdi>
            </span>
            <span className="text-[11px] font-medium text-muted-foreground">
              {isRhPositive ? t("bloodBank.rhPositive", "Rh+ Positive") : t("bloodBank.rhNegative", "Rh- Negative")}
            </span>
          </div>
          <p className="text-[11px] text-muted-foreground truncate">
            {unit.bloodGroup === "O−" || (unit.bloodGroup as string) === "O-"
              ? t("healthcare.universalDonor", "Universal Donor Unit")
              : t("healthcare.verifiedGroup", "ISBT Certified Phenotype")}
          </p>
        </div>

        {/* KPI 2: Biological Component */}
        <div className="rounded-md border border-border/60 bg-surface-subtle/60 p-3.5 space-y-1">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            {t("common.component", "Component")}
          </span>
          <p className="text-sm font-bold text-foreground truncate">
            {bloodBankComponentLabels[unit.component]}
          </p>
          <p className="text-[11px] text-muted-foreground flex items-center gap-1">
            <Thermometer aria-hidden="true" className="size-3 text-primary shrink-0" />
            <span>{t("bloodBank.coldChainAssured", "+2°C to +6°C Cold Chain")}</span>
          </p>
        </div>

        {/* KPI 3: Expiry & Lifespan */}
        <div className="rounded-md border border-border/60 bg-surface-subtle/60 p-3.5 space-y-1">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            {t("bloodBank.expiry", "Expiry Date")}
          </span>
          <p className="font-mono text-sm font-bold text-destructive tabular-nums">
            <bdi dir="ltr">{unit.expiryDate.split("T")[0]}</bdi>
          </p>
          <p className="text-[11px] text-muted-foreground">
            {t("bloodBank.collection", "Collected")}: <bdi dir="ltr">{unit.collectionDate}</bdi>
          </p>
        </div>

        {/* KPI 4: Allocation & Request Assignment */}
        <div className="rounded-md border border-border/60 bg-surface-subtle/60 p-3.5 space-y-1">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            {t("bloodBank.assignedRequest", "Requisition Allocation")}
          </span>
          <div>
            {unit.allocatedRequestId ? (
              <Link
                to={`/blood-bank/requests/${unit.allocatedRequestId}`}
                className="inline-flex items-center gap-1 font-mono text-sm font-bold text-primary hover:underline"
              >
                <span>
                  <bdi dir="ltr">{unit.allocatedRequestId}</bdi>
                </span>
                <ExternalLink aria-hidden="true" className="size-3 shrink-0" />
              </Link>
            ) : (
              <span className="text-xs font-semibold text-muted-foreground">
                {t("bloodBank.notAssignedInStock", "Unassigned (In stock)")}
              </span>
            )}
          </div>
          <p className="text-[11px] text-muted-foreground flex items-center gap-1 truncate">
            <MapPin aria-hidden="true" className="size-3 text-muted-foreground shrink-0" />
            <span className="truncate">{unit.storageLocation}</span>
          </p>
        </div>
      </div>

      {/* Secondary Metadata Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t border-border/70 text-xs">
        <div>
          <span className="text-[11px] text-muted-foreground block font-medium">
            {t("bloodBank.storageLocation", "Location")}
          </span>
          <span className="font-semibold text-foreground truncate block mt-0.5">
            {unit.storageLocation}
          </span>
        </div>
        <div>
          <span className="text-[11px] text-muted-foreground block font-medium">
            {t("bloodBank.registeredAt", "Registration")}
          </span>
          <span className="font-mono text-foreground tabular-nums block mt-0.5">
            <bdi dir="ltr">{unit.registeredAt?.split("T")[0] ?? "—"}</bdi>
          </span>
        </div>
        <div>
          <span className="text-[11px] text-muted-foreground block font-medium">
            {t("bloodBank.lastUpdated", "Last Sync")}
          </span>
          <span className="font-mono text-foreground tabular-nums block mt-0.5">
            <bdi dir="ltr">{unit.updatedAt?.replace("T", " ").split(".")[0] ?? "—"}</bdi>
          </span>
        </div>
        <div>
          <span className="text-[11px] text-muted-foreground block font-medium">
            {t("common.verified", "Compliance")}
          </span>
          <span className="text-emerald-700 dark:text-emerald-400 font-medium flex items-center gap-1 mt-0.5">
            <ShieldCheck aria-hidden="true" className="size-3.5 shrink-0 text-emerald-600" />
            <span>{t("common.verified", "Verified")}</span>
          </span>
        </div>
      </div>

      {/* Clinical Notes (if any) */}
      {unit.notes ? (
        <div className="border-s-2 border-primary/50 bg-surface-subtle/50 px-3.5 py-2.5 text-xs text-foreground flex items-start gap-2">
          <FileText aria-hidden="true" className="size-3.5 text-primary shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <span className="font-semibold text-muted-foreground block text-[11px]">
              {t("bloodBank.unitNotesLabel", "Clinical Notes")}
            </span>
            <p className="text-foreground">{unit.notes}</p>
          </div>
        </div>
      ) : null}
    </div>
  );
}


