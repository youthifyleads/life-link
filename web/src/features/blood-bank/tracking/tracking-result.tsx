import {
  AlertOctagon,
  BookmarkCheck,
  CheckCircle2,
  Copy,
  ExternalLink,
  Layers,
  MapPin,
  Printer,
  QrCode,
  ShieldAlert,
} from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";

import {
  bloodBankComponentLabels,
  type BloodUnit,
  type BloodUnitStatus,
} from "@/features/blood-bank/types/blood-bank.types";
import { BloodGroupBadge } from "@/shared/components/clinical/blood-group-badge";
import { Button } from "@/shared/components/ui/button";

interface TrackingResultProps {
  unit: BloodUnit;
}

export function TrackingResult({ unit }: TrackingResultProps) {
  const { t } = useTranslation();
  const [copied, setCopied] = useState(false);
  const [printSuccess, setPrintSuccess] = useState(false);

  const handleCopy = () => {
    void navigator.clipboard.writeText(unit.id);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    setPrintSuccess(true);
    setTimeout(() => setPrintSuccess(false), 3000);
  };

  const getStatusBadge = (status: BloodUnitStatus) => {
    switch (status) {
      case "available":
        return (
          <span className="inline-flex items-center gap-1 border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1 text-xs font-semibold text-emerald-700 dark:text-emerald-300">
            <CheckCircle2 aria-hidden="true" className="size-3.5" />
            {t("status.available")}
          </span>
        );
      case "reserved":
        return (
          <span className="inline-flex items-center gap-1 border border-amber-500/30 bg-amber-500/10 px-2.5 py-1 text-xs font-semibold text-amber-700 dark:text-amber-400">
            <BookmarkCheck aria-hidden="true" className="size-3.5" />
            {t("status.reserved")}
          </span>
        );
      case "allocated":
        return (
          <span className="inline-flex items-center gap-1 border border-primary/30 bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary">
            <Layers aria-hidden="true" className="size-3.5" />
            {t("caregiver.allocated")}
          </span>
        );
      case "quarantined":
        return (
          <span className="inline-flex items-center gap-1 border border-purple-500/30 bg-purple-500/10 px-2.5 py-1 text-xs font-semibold text-purple-700 dark:text-purple-300">
            <ShieldAlert aria-hidden="true" className="size-3.5" />
            {t("status.quarantined")}
          </span>
        );
      case "expired":
        return (
          <span className="inline-flex items-center gap-1 border border-emergency/30 bg-emergency-subtle px-2.5 py-1 text-xs font-semibold text-emergency">
            <AlertOctagon aria-hidden="true" className="size-3.5" />
            {t("status.expired")}
          </span>
        );
      default:
        return <span>{status}</span>;
    }
  };

  return (
    <div className="border border-border bg-surface p-5 space-y-5">
      {/* Header bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-4">
        <div className="flex items-center gap-3">
          <div className="flex size-11 items-center justify-center border border-primary/20 bg-primary/5 text-primary">
            <QrCode aria-hidden="true" className="size-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-base font-bold text-foreground">
                <bdi dir="ltr">{unit.id}</bdi>
              </span>
              <button
                type="button"
                onClick={handleCopy}
                className="text-muted-foreground hover:text-foreground focus:outline-none"
                title={t("bloodBank.copyUnitId")}
              >
                {copied ? (
                  <span className="text-[10px] font-semibold text-emerald-600">
                    {t("bloodBank.copied")}
                  </span>
                ) : (
                  <Copy aria-hidden="true" className="size-3.5" />
                )}
              </button>
            </div>
            <p className="text-xs text-muted-foreground">
              {t("bloodBank.productIdentifier")}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          {getStatusBadge(unit.status)}
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={handlePrint}
            className="h-8 text-xs"
          >
            <Printer aria-hidden="true" className="size-3.5" />
            {printSuccess ? t("bloodBank.labelSentToPrinter") : t("bloodBank.printLabelAction")}
          </Button>
        </div>
      </div>

      {/* Details Grid */}
      <dl className="grid grid-cols-2 gap-px border border-border bg-border sm:grid-cols-4">
        {/* Blood Group */}
        <div className="bg-surface p-3.5">
          <dt className="text-[11px] font-medium text-muted-foreground">{t("common.bloodGroup")}</dt>
          <dd className="mt-1 flex items-center gap-1.5">
            <BloodGroupBadge group={unit.bloodGroup} />
            <span className="font-semibold text-foreground text-xs">
              <bdi dir="ltr">{unit.bloodGroup}</bdi>
            </span>
          </dd>
        </div>

        {/* Component */}
        <div className="bg-surface p-3.5">
          <dt className="text-[11px] font-medium text-muted-foreground">{t("common.component")}</dt>
          <dd className="mt-1 font-semibold text-foreground text-xs">
            {bloodBankComponentLabels[unit.component]}
          </dd>
        </div>

        {/* Current Location */}
        <div className="bg-surface p-3.5">
          <dt className="text-[11px] font-medium text-muted-foreground">{t("bloodBank.storageLocation")}</dt>
          <dd className="mt-1 flex items-center gap-1.5 text-foreground text-xs font-semibold">
            <MapPin aria-hidden="true" className="size-3.5 text-primary shrink-0" />
            <span className="truncate">{unit.storageLocation}</span>
          </dd>
        </div>

        {/* Assigned Request */}
        <div className="bg-surface p-3.5">
          <dt className="text-[11px] font-medium text-muted-foreground">{t("bloodBank.assignedRequest")}</dt>
          <dd className="mt-1 text-xs">
            {unit.allocatedRequestId ? (
              <Link
                to={`/blood-bank/requests/${unit.allocatedRequestId}`}
                className="inline-flex items-center gap-1 font-mono font-bold text-primary hover:underline"
              >
                <span>
                  <bdi dir="ltr">{unit.allocatedRequestId}</bdi>
                </span>
                <ExternalLink aria-hidden="true" className="size-3" />
              </Link>
            ) : (
              <span className="text-muted-foreground">{t("bloodBank.notAssignedInStock")}</span>
            )}
          </dd>
        </div>

        {/* Collection Date */}
        <div className="bg-surface p-3.5">
          <dt className="text-[11px] font-medium text-muted-foreground">{t("bloodBank.collection")}</dt>
          <dd className="mt-1 font-semibold tabular-nums text-xs">
            <bdi dir="ltr">{unit.collectionDate}</bdi>
          </dd>
        </div>

        {/* Expiry Date */}
        <div className="bg-surface p-3.5">
          <dt className="text-[11px] font-medium text-muted-foreground">{t("bloodBank.expiry")}</dt>
          <dd className="mt-1 font-semibold tabular-nums text-xs text-emergency">
            <bdi dir="ltr">{unit.expiryDate.split("T")[0]}</bdi>
          </dd>
        </div>

        {/* Registered At */}
        <div className="bg-surface p-3.5">
          <dt className="text-[11px] font-medium text-muted-foreground">{t("bloodBank.registeredAt")}</dt>
          <dd className="mt-1 tabular-nums text-xs text-muted-foreground">
            <bdi dir="ltr">{unit.registeredAt ? unit.registeredAt.replace("T", " ").split(".")[0] : "—"}</bdi>
          </dd>
        </div>

        {/* Last Updated */}
        <div className="bg-surface p-3.5">
          <dt className="text-[11px] font-medium text-muted-foreground">{t("bloodBank.lastUpdated")}</dt>
          <dd className="mt-1 tabular-nums text-xs text-foreground font-medium">
            <bdi dir="ltr">{unit.updatedAt ? unit.updatedAt.replace("T", " ").split(".")[0] : "—"}</bdi>
          </dd>
        </div>
      </dl>

      {unit.notes ? (
        <div className="border border-border bg-surface-subtle p-3 text-xs">
          <span className="font-semibold text-muted-foreground">{t("bloodBank.unitNotesLabel")}</span>
          <p className="mt-0.5 text-foreground">{unit.notes}</p>
        </div>
      ) : null}
    </div>
  );
}
