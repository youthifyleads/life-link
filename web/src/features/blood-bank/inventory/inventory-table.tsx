import {
  AlertOctagon,
  ClockAlert,
  History,
  ScanLine,
  ShieldAlert,
  ShieldCheck,
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
import { StatusIndicator } from "@/shared/components/clinical/status-indicator";
import { Button } from "@/shared/components/ui/button";

interface InventoryTableProps {
  units: BloodUnit[];
  onUpdateStatus?: (unitId: string, newStatus: BloodUnitStatus) => void;
  onViewHistory?: (unitId: string) => void;
}

export function InventoryTable({
  units,
  onUpdateStatus,
  onViewHistory,
}: InventoryTableProps) {
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
          <StatusIndicator tone="success">
            {t("status.available", "Available")}
          </StatusIndicator>
        );
      case "reserved":
        return (
          <StatusIndicator tone="pending">
            {t("status.reserved", "Reserved")}
          </StatusIndicator>
        );
      case "allocated":
        return (
          <StatusIndicator tone="success">
            {t("status.allocated", "Allocated")}
          </StatusIndicator>
        );
      case "quarantined":
        return (
          <StatusIndicator tone="warning">
            {t("status.quarantined", "Quarantined")}
          </StatusIndicator>
        );
      case "expired":
        return (
          <StatusIndicator tone="danger">
            {t("status.expired", "Expired")}
          </StatusIndicator>
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
            {t(
              "bloodBank.inventorySubtitle",
              "Detailed itemized inventory records for all units stored in the central cold chain.",
            )}
          </p>
        </div>
        <span className="text-xs text-muted-foreground font-medium tabular-nums">
          <bdi dir="ltr">{units.length}</bdi> {t("hospital.records", "records")}
        </span>
      </div>

      {units.length === 0 ? (
        <div className="rounded-lg border border-border/80 bg-surface p-8 text-center text-xs text-muted-foreground shadow-2xs">
          {t(
            "common.noRecordsDesc",
            "No blood units found matching the selected filters or search query.",
          )}
        </div>
      ) : (
        <>
          {/* Desktop & Tablet Table */}
          <div
            tabIndex={0}
            role="region"
            aria-label={t(
              "bloodBank.inventoryOverview",
              "Blood unit inventory ledger table.",
            )}
            className="overflow-x-auto rounded-lg border border-border/80 bg-surface shadow-2xs"
          >
            <table className="clinical-table min-w-[62rem] table-fixed border-collapse">
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
                  const expInfo = getExpiryDisplay(
                    unit.expiryDate,
                    unit.status,
                  );

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
                            title={t(
                              "healthcare.tracking",
                              "Track unit in QR Tracking",
                            )}
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
                                <AlertOctagon
                                  aria-hidden="true"
                                  className="size-3"
                                />
                              ) : (
                                <ClockAlert
                                  aria-hidden="true"
                                  className="size-3"
                                />
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
                        <span className="block truncate text-muted-foreground">
                          {unit.storageLocation}
                        </span>
                      </td>

                      {/* Assigned Request */}
                      <td className="px-3 py-2.5 text-start">
                        {unit.allocatedRequestId ? (
                          <Link
                            to={`/blood-bank/requests/${unit.allocatedRequestId}`}
                            className="font-mono font-semibold text-primary hover:underline"
                          >
                            <bdi dir="ltr">{unit.allocatedRequestId}</bdi>
                          </Link>
                        ) : (
                          <span className="text-muted-foreground/60">—</span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="px-3.5 py-2.5 text-end">
                        <div className="flex items-center justify-end gap-1.5">
                          {onViewHistory ? (
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="size-8"
                              onClick={() => onViewHistory(unit.id)}
                              title={t(
                                "bloodBank.viewCustodyHistory",
                                "View custody history",
                              )}
                              aria-label={`${t("bloodBank.viewCustodyHistory", "View custody history")} ${unit.id}`}
                            >
                              <History aria-hidden="true" />
                            </Button>
                          ) : null}
                          <Button
                            asChild
                            variant="ghost"
                            size="icon"
                            className="size-8"
                          >
                            <Link
                              to={`/blood-bank/tracking?id=${unit.id}`}
                              title={t("healthcare.tracking", "Track unit")}
                              aria-label={`${t("healthcare.tracking", "Track unit")} ${unit.id}`}
                            >
                              <ScanLine aria-hidden="true" />
                            </Link>
                          </Button>
                          {unit.status === "available" && onUpdateStatus ? (
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="size-8 text-warning"
                              onClick={() =>
                                onUpdateStatus(unit.id, "quarantined")
                              }
                              title={t("status.quarantined", "Quarantine")}
                              aria-label={`${t("status.quarantined", "Quarantine")} ${unit.id}`}
                            >
                              <ShieldAlert aria-hidden="true" />
                            </Button>
                          ) : unit.status === "quarantined" &&
                            onUpdateStatus ? (
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="size-8 text-success"
                              onClick={() =>
                                onUpdateStatus(unit.id, "available")
                              }
                              title={t("status.available", "Release")}
                              aria-label={`${t("status.available", "Release")} ${unit.id}`}
                            >
                              <ShieldCheck aria-hidden="true" />
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
          <div className="divide-y divide-border/70 rounded-lg border border-border/80 bg-surface shadow-2xs overflow-hidden md:hidden">
            {units.map((unit) => {
              const expInfo = getExpiryDisplay(unit.expiryDate, unit.status);

              return (
                <div
                  key={unit.id}
                  className="p-3.5 sm:p-4 text-xs space-y-2.5"
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
                        {t("common.bloodGroup", "Group")} &amp;{" "}
                        {t("common.component", "Component")}
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
                          className="mt-1 font-mono font-semibold text-primary hover:underline"
                        >
                          <bdi dir="ltr">{unit.allocatedRequestId}</bdi>
                        </Link>
                      ) : (
                        <span className="mt-1 block text-muted-foreground/60">
                          —
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center justify-end gap-2 border-t border-border pt-2">
                    {onViewHistory ? (
                      <Button
                        type="button"
                        size="icon"
                        variant="ghost"
                        className="size-8"
                        onClick={() => onViewHistory(unit.id)}
                        title={t(
                          "bloodBank.viewCustodyHistory",
                          "View custody history",
                        )}
                        aria-label={`${t("bloodBank.viewCustodyHistory", "View custody history")} ${unit.id}`}
                      >
                        <History aria-hidden="true" />
                      </Button>
                    ) : null}
                    <Button
                      asChild
                      size="icon"
                      variant="secondary"
                      className="size-8"
                    >
                      <Link
                        to={`/blood-bank/tracking?id=${unit.id}`}
                        title={t("healthcare.tracking", "Track unit")}
                        aria-label={`${t("healthcare.tracking", "Track unit")} ${unit.id}`}
                      >
                        <ScanLine aria-hidden="true" />
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
