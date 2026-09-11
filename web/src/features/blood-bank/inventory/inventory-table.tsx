import {
  AlertOctagon,
  ArrowRight,
  BookmarkCheck,
  CheckCircle2,
  ClockAlert,
  ExternalLink,
  Layers,
  MapPin,
  ScanLine,
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

interface InventoryTableProps {
  units: BloodUnit[];
  onUpdateStatus?: (unitId: string, newStatus: BloodUnitStatus) => void;
}

export function InventoryTable({ units, onUpdateStatus }: InventoryTableProps) {
  const { t } = useTranslation();
  const [now] = useState(() => Date.now());

  const getExpiryDisplay = (expiryDateStr: string, status: BloodUnitStatus) => {
    const expTime = new Date(expiryDateStr).getTime();
    const diffMs = expTime - now;

    if (diffMs <= 0 || status === "expired") {
      return {
        label: expiryDateStr.split("T")[0],
        badge: t("status.expired", "Expired"),
        tone: "emergency" as const,
      };
    }

    const hours = Math.round(diffMs / (1000 * 60 * 60));
    if (hours <= 24) {
      return {
        label: expiryDateStr.split("T")[0],
        badge: `< 24h`,
        tone: "warning" as const,
      };
    }
    if (hours <= 48) {
      return {
        label: expiryDateStr.split("T")[0],
        badge: `< 48h`,
        tone: "warning" as const,
      };
    }

    return {
      label: expiryDateStr.split("T")[0],
      badge: null,
      tone: "default" as const,
    };
  };

  const getStatusBadge = (status: BloodUnitStatus) => {
    switch (status) {
      case "available":
        return (
          <span className="inline-flex items-center gap-1 rounded-none border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 text-[11px] font-semibold text-emerald-700 dark:text-emerald-300">
            <CheckCircle2 aria-hidden="true" className="size-3" />
            {t("status.available", "Available")}
          </span>
        );
      case "reserved":
        return (
          <span className="inline-flex items-center gap-1 rounded-none border border-amber-500/30 bg-amber-500/10 px-2 py-0.5 text-[11px] font-semibold text-amber-700 dark:text-amber-400">
            <BookmarkCheck aria-hidden="true" className="size-3" />
            {t("status.reserved", "Reserved")}
          </span>
        );
      case "allocated":
        return (
          <span className="inline-flex items-center gap-1 rounded-none border border-primary/30 bg-primary/10 px-2 py-0.5 text-[11px] font-semibold text-primary">
            <Layers aria-hidden="true" className="size-3" />
            {t("status.allocated", "Allocated")}
          </span>
        );
      case "quarantined":
        return (
          <span className="inline-flex items-center gap-1 rounded-none border border-purple-500/30 bg-purple-500/10 px-2 py-0.5 text-[11px] font-semibold text-purple-700 dark:text-purple-300">
            <ShieldAlert aria-hidden="true" className="size-3" />
            {t("status.quarantined", "Quarantined")}
          </span>
        );
      case "expired":
        return (
          <span className="inline-flex items-center gap-1 rounded-none border border-emergency/30 bg-emergency-subtle px-2 py-0.5 text-[11px] font-semibold text-emergency">
            <AlertOctagon aria-hidden="true" className="size-3" />
            {t("status.expired", "Expired")}
          </span>
        );
      default:
        return <span>{status}</span>;
    }
  };

  return (
    <section aria-labelledby="inventory-ledger-heading" className="space-y-2">
      <div className="flex items-center justify-between">
        <div>
          <h2 id="inventory-ledger-heading" className="text-base font-semibold">
            {t("bloodBank.inventoryOverview", "Blood Unit Inventory Ledger")}
          </h2>
          <p className="mt-0.5 text-xs text-muted-foreground">
            {t("bloodBank.inventorySubtitle", "Detailed itemized inventory records for all units stored in the central cold chain.")}
          </p>
        </div>
        <span className="text-xs text-muted-foreground font-medium tabular-nums">
          <bdi dir="ltr">{units.length}</bdi> {t("hospital.records", "records")}
        </span>
      </div>

      {units.length === 0 ? (
        <div className="border border-border bg-surface p-8 text-center text-xs text-muted-foreground">
          {t("common.noRecordsDesc", "No blood units found matching the selected filters or search query.")}
        </div>
      ) : (
        <>
          {/* Desktop & Tablet Table */}
          <div
            tabIndex={0}
            role="region"
            aria-label={t("bloodBank.inventoryOverview", "Blood unit inventory ledger table.")}
            className="overflow-x-auto border border-border bg-surface"
          >
            <table className="w-full min-w-[62rem] table-fixed border-collapse text-start text-xs">
              <thead className="border-b border-border bg-surface-subtle font-semibold text-muted-foreground">
                <tr>
                  <th scope="col" className="w-[18%] px-3.5 py-2.5 text-start">
                    {t("bloodBank.unitId", "Unit ID")}
                  </th>
                  <th scope="col" className="w-[10%] px-3 py-2.5 text-start">
                    {t("common.bloodGroup", "Group")}
                  </th>
                  <th scope="col" className="w-[15%] px-3 py-2.5 text-start">
                    {t("common.component", "Component")}
                  </th>
                  <th scope="col" className="w-[11%] px-3 py-2.5 text-start">
                    {t("bloodBank.collection", "Collection")}
                  </th>
                  <th scope="col" className="w-[13%] px-3 py-2.5 text-start">
                    {t("bloodBank.expiry", "Expiry Date")}
                  </th>
                  <th scope="col" className="w-[11%] px-3 py-2.5 text-start">
                    {t("common.status", "Status")}
                  </th>
                  <th scope="col" className="w-[16%] px-3 py-2.5 text-start">
                    {t("bloodBank.storageLocation", "Storage Location")}
                  </th>
                  <th scope="col" className="w-[13%] px-3 py-2.5 text-start">
                    {t("hospital.requestId", "Assigned Request")}
                  </th>
                  <th scope="col" className="w-[13%] px-3.5 py-2.5 text-end">
                    {t("common.actions", "Actions")}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border bg-surface">
                {units.map((unit) => {
                  const expInfo = getExpiryDisplay(unit.expiryDate, unit.status);

                  return (
                    <tr
                      key={unit.id}
                      className="hover:bg-surface-subtle/70 transition-colors"
                    >
                      {/* Unit ID */}
                      <td className="px-3.5 py-2.5 text-start">
                        <div className="flex items-center gap-1.5 font-mono font-bold text-foreground">
                          <Link
                            to={`/blood-bank/tracking?id=${unit.id}`}
                            className="hover:text-primary hover:underline"
                            title={t("healthcare.tracking", "Track unit in QR Tracking")}
                          >
                            <bdi dir="ltr">{unit.id}</bdi>
                          </Link>
                        </div>
                      </td>

                      {/* Group */}
                      <td className="px-3 py-2.5 text-start">
                        <BloodGroupBadge group={unit.bloodGroup} />
                      </td>

                      {/* Component */}
                      <td className="px-3 py-2.5 text-start font-medium text-foreground">
                        {bloodBankComponentLabels[unit.component]}
                      </td>

                      {/* Collection Date */}
                      <td className="px-3 py-2.5 text-start tabular-nums text-muted-foreground">
                        <bdi dir="ltr">{unit.collectionDate}</bdi>
                      </td>

                      {/* Expiry Date */}
                      <td className="px-3 py-2.5 text-start">
                        <div className="inline-flex flex-col">
                          <span className="tabular-nums font-medium text-foreground">
                            <bdi dir="ltr">{expInfo.label}</bdi>
                          </span>
                          {expInfo.badge ? (
                            <span
                              className={`mt-0.5 inline-flex items-center gap-0.5 text-[10px] font-semibold ${
                                expInfo.tone === "emergency"
                                  ? "text-emergency"
                                  : "text-amber-600 dark:text-amber-400"
                              }`}
                            >
                              {expInfo.tone === "emergency" ? (
                                <AlertOctagon aria-hidden="true" className="size-3" />
                              ) : (
                                <ClockAlert aria-hidden="true" className="size-3" />
                              )}
                              <bdi dir="ltr">{expInfo.badge}</bdi>
                            </span>
                          ) : null}
                        </div>
                      </td>

                      {/* Status */}
                      <td className="px-3 py-2.5 text-start">
                        {getStatusBadge(unit.status)}
                      </td>

                      {/* Storage Location */}
                      <td className="px-3 py-2.5 text-start">
                        <span className="flex items-center gap-1 text-muted-foreground">
                          <MapPin aria-hidden="true" className="size-3 shrink-0 text-primary" />
                          <span className="truncate">{unit.storageLocation}</span>
                        </span>
                      </td>

                      {/* Assigned Request */}
                      <td className="px-3 py-2.5 text-start">
                        {unit.allocatedRequestId ? (
                          <Link
                            to={`/blood-bank/requests/${unit.allocatedRequestId}`}
                            className="inline-flex items-center gap-1 font-mono font-semibold text-primary hover:underline"
                          >
                            <span><bdi dir="ltr">{unit.allocatedRequestId}</bdi></span>
                            <ExternalLink aria-hidden="true" className="size-3" />
                          </Link>
                        ) : (
                          <span className="text-muted-foreground/60">—</span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="px-3.5 py-2.5 text-end">
                        <div className="flex items-center justify-end gap-1.5">
                          <Button
                            asChild
                            variant="ghost"
                            size="sm"
                            className="h-7 px-2 text-xs"
                          >
                            <Link to={`/blood-bank/tracking?id=${unit.id}`}>
                              <ScanLine aria-hidden="true" className="size-3" />
                              {t("healthcare.tracking", "Track")}
                            </Link>
                          </Button>
                          {unit.status === "available" && onUpdateStatus ? (
                            <Button
                              type="button"
                              variant="secondary"
                              size="sm"
                              className="h-7 px-2 text-[11px]"
                              onClick={() => onUpdateStatus(unit.id, "quarantined")}
                            >
                              {t("status.quarantined", "Quarantine")}
                            </Button>
                          ) : unit.status === "quarantined" && onUpdateStatus ? (
                            <Button
                              type="button"
                              variant="secondary"
                              size="sm"
                              className="h-7 px-2 text-[11px]"
                              onClick={() => onUpdateStatus(unit.id, "available")}
                            >
                              {t("status.available", "Release")}
                            </Button>
                          ) : null}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile Card View (shown below md breakpoint) */}
          <div className="grid grid-cols-1 gap-3 md:hidden">
            {units.map((unit) => {
              const expInfo = getExpiryDisplay(unit.expiryDate, unit.status);

              return (
                <div
                  key={unit.id}
                  className="border border-border bg-surface p-4 text-xs space-y-3"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-mono font-bold text-foreground text-sm">
                      <bdi dir="ltr">{unit.id}</bdi>
                    </span>
                    {getStatusBadge(unit.status)}
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-muted-foreground">
                    <div>
                      <span className="block text-[10px] uppercase tracking-wider">
                        {t("common.bloodGroup", "Group")} &amp; {t("common.component", "Component")}
                      </span>
                      <div className="mt-1 flex items-center gap-1.5">
                        <BloodGroupBadge group={unit.bloodGroup} />
                        <span className="font-medium text-foreground">
                          {bloodBankComponentLabels[unit.component]}
                        </span>
                      </div>
                    </div>

                    <div>
                      <span className="block text-[10px] uppercase tracking-wider">
                        {t("bloodBank.expiry", "Expiry")}
                      </span>
                      <div className="mt-1">
                        <span className="font-medium text-foreground tabular-nums">
                          <bdi dir="ltr">{expInfo.label}</bdi>
                        </span>
                        {expInfo.badge ? (
                          <span className="ms-1.5 text-emergency font-semibold">
                            (<bdi dir="ltr">{expInfo.badge}</bdi>)
                          </span>
                        ) : null}
                      </div>
                    </div>

                    <div>
                      <span className="block text-[10px] uppercase tracking-wider">
                        {t("bloodBank.storageLocation", "Storage Location")}
                      </span>
                      <span className="mt-1 block text-foreground font-medium">
                        {unit.storageLocation}
                      </span>
                    </div>

                    <div>
                      <span className="block text-[10px] uppercase tracking-wider">
                        {t("hospital.requestId", "Assigned Request")}
                      </span>
                      {unit.allocatedRequestId ? (
                        <Link
                          to={`/blood-bank/requests/${unit.allocatedRequestId}`}
                          className="mt-1 inline-flex items-center gap-1 font-mono font-semibold text-primary hover:underline"
                        >
                          <bdi dir="ltr">{unit.allocatedRequestId}</bdi>
                          <ArrowRight aria-hidden="true" className="size-3 rtl:rotate-180" />
                        </Link>
                      ) : (
                        <span className="mt-1 block text-muted-foreground/60">—</span>
                      )}
                    </div>
                  </div>

                  <div className="pt-2 border-t border-border flex items-center justify-end">
                    <Button asChild size="sm" variant="secondary" className="h-7 text-xs">
                      <Link to={`/blood-bank/tracking?id=${unit.id}`}>
                        <ScanLine aria-hidden="true" className="size-3" />
                        {t("healthcare.tracking", "Track Unit")}
                      </Link>
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </section>
  );
}
