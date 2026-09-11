import {
  ArrowRight,
  Check,
  Clock,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";

import type {
  BloodBankRequest,
  BloodBankRequestAction,
} from "@/features/blood-bank/types/blood-bank.types";
import {
  formatBloodBankComponent,
  formatBloodBankDateTime,
  formatHospitalName,
} from "@/features/blood-bank/components/blood-bank-formatters";
import { RequestActionPanel } from "@/features/blood-bank/components/request-action-panel";
import { BloodGroupBadge } from "@/shared/components/clinical/blood-group-badge";
import { RequestStatusBadge } from "@/shared/components/clinical/request-status-badge";
import { UrgencyBadge } from "@/shared/components/clinical/urgency-badge";
import { Button } from "@/shared/components/ui/button";

interface RequestQueueTableProps {
  requests: BloodBankRequest[];
  compact?: boolean;
  activeRequestId?: string;
  onAction?: (
    request: BloodBankRequest,
    action: BloodBankRequestAction,
  ) => void;
}

export function RequestQueueTable({
  requests,
  compact = false,
  activeRequestId,
  onAction,
}: RequestQueueTableProps) {
  const { t } = useTranslation();
  const showActions = Boolean(onAction) && !compact;

  return (
    <div className="border border-border bg-surface shadow-xs">
      {/* Desktop & Tablet Clinical Dispatch Ledger */}
      <div
        className="hidden overflow-x-auto md:block"
        tabIndex={0}
        role="region"
        aria-label={t("bloodBank.requestsTableLabel")}
      >
        <table className="w-full min-w-[64rem] border-collapse text-start text-xs sm:text-sm">
          <thead>
            <tr className="border-b border-border bg-surface-subtle/80 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
              <th scope="col" className="ps-4 pe-2 py-2.5 text-start w-[14%]">
                {t("hospital.requestId", "Requisition & Urgency")}
              </th>
              <th scope="col" className="px-3 py-2.5 text-start w-[19%]">
                {t("healthcare.hospital", "Hospital & Facility")}
              </th>
              <th scope="col" className="px-3 py-2.5 text-start w-[15%]">
                {t("common.bloodGroup", "Product & Group")}
              </th>
              <th scope="col" className="px-3 py-2.5 text-start w-[12%]">
                {t("common.quantity", "Demanded & Alloc.")}
              </th>
              <th scope="col" className="px-3 py-2.5 text-start w-[12%]">
                {t("common.status", "Workflow Status")}
              </th>
              <th scope="col" className="px-3 py-2.5 text-start w-[14%]">
                {t("bloodBank.requiredBy", "Required & Timeline")}
              </th>
              {showActions ? (
                <th scope="col" className="px-3 pe-4 py-2.5 text-end w-[14%]">
                  {t("common.actions", "Dispatch Actions")}
                </th>
              ) : compact ? (
                <th scope="col" className="px-3 pe-4 py-2.5 text-end w-[6%]">
                  <span className="sr-only">{t("common.view", "View")}</span>
                </th>
              ) : null}
            </tr>
          </thead>
          <tbody className="divide-y divide-border font-normal">
            {requests.map((request) => {
              const allocatedCount = request.allocatedUnitIds.length;
              const isFulfilled = allocatedCount >= request.quantity;
              const isUrgentOrEmergency =
                request.urgency === "emergency" || request.urgency === "urgent";

              // Clinical dispatch urgency styling: subtle tinted surface with high contrast typography
              const triageRowStyle =
                request.urgency === "emergency"
                  ? "bg-destructive/[0.04] hover:bg-destructive/[0.08]"
                  : request.urgency === "urgent"
                    ? "bg-amber-500/[0.03] hover:bg-amber-500/[0.06]"
                    : "hover:bg-surface-subtle/70";

              return (
                <tr
                  key={request.id}
                  className={`transition-colors duration-100 ${triageRowStyle}`}
                >
                  {/* Column 1: ID & Urgency */}
                  <td className="ps-3 pe-2 py-3 align-middle">
                    <div className="flex flex-col gap-1">
                      <Link
                        to={`/blood-bank/requests/${request.id}`}
                        className="font-bold text-primary hover:underline focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary tabular-nums"
                      >
                        <bdi dir="ltr">{request.id}</bdi>
                      </Link>
                      <UrgencyBadge urgency={request.urgency} className="w-fit" />
                    </div>
                  </td>

                  {/* Column 2: Facility */}
                  <td className="px-3 py-3 align-middle">
                    <div className="min-w-0">
                      <span className="block truncate font-semibold text-foreground">
                        {formatHospitalName(request.hospital.name, request.hospital.id)}
                      </span>
                      <span className="mt-0.5 inline-block text-xs text-muted-foreground font-mono tabular-nums">
                        <bdi dir="ltr">{request.hospital.facilityCode}</bdi>
                      </span>
                    </div>
                  </td>

                  {/* Column 3: Blood Group & Component */}
                  <td className="px-3 py-3 align-middle">
                    <div className="flex items-center gap-2">
                      <BloodGroupBadge group={request.bloodGroup} size="compact" />
                      <div className="min-w-0">
                        <span className="block truncate text-xs font-medium text-foreground">
                          {formatBloodBankComponent(request.component)}
                        </span>
                      </div>
                    </div>
                  </td>

                  {/* Column 4: Quantity & Allocation Status */}
                  <td className="px-3 py-3 align-middle">
                    <div className="flex flex-col gap-0.5">
                      <span className="font-bold text-foreground tabular-nums">
                        {request.quantity}{" "}
                        <span className="text-xs font-normal text-muted-foreground">
                          {request.quantity === 1 ? t("common.unit") : t("common.units")}
                        </span>
                      </span>
                      <span
                        className={`inline-flex items-center gap-1 text-[11px] font-medium tabular-nums ${
                          isFulfilled
                            ? "text-success"
                            : allocatedCount > 0
                              ? "text-amber-600 dark:text-amber-400"
                              : "text-muted-foreground"
                        }`}
                      >
                        {isFulfilled ? (
                          <Check aria-hidden="true" className="size-3 shrink-0" />
                        ) : null}
                        <bdi dir="ltr">
                          {allocatedCount}/{request.quantity}
                        </bdi>{" "}
                        {isFulfilled ? t("status.allocated", "Allocated") : t("common.pending", "Alloc.")}
                      </span>
                    </div>
                  </td>

                  {/* Column 5: Status */}
                  <td className="px-3 py-3 align-middle">
                    <RequestStatusBadge status={request.status} />
                  </td>

                  {/* Column 6: Required & Created Timeline */}
                  <td className="px-3 py-3 align-middle">
                    <div className="flex flex-col gap-0.5">
                      <span
                        className={`text-xs font-semibold tabular-nums flex items-center gap-1 ${
                          isUrgentOrEmergency
                            ? "text-destructive font-bold"
                            : "text-foreground"
                        }`}
                      >
                        <Clock aria-hidden="true" className="size-3 shrink-0" />
                        <bdi dir="ltr">{formatBloodBankDateTime(request.requiredAt)}</bdi>
                      </span>
                      <span className="text-[11px] text-muted-foreground tabular-nums">
                        {t("bloodBank.createdOn", "Created:")}{" "}
                        <bdi dir="ltr">{formatBloodBankDateTime(request.createdAt)}</bdi>
                      </span>
                    </div>
                  </td>

                  {/* Column 7: Dispatch Action Dock */}
                  {showActions && onAction ? (
                    <td className="px-3 pe-4 py-3 text-end align-middle">
                      <div className="flex items-center justify-end gap-1.5">
                        {!isFulfilled && request.status !== "completed" && request.status !== "rejected" && (
                          <Button
                            asChild
                            size="sm"
                            variant="secondary"
                            className="h-8 px-2.5 text-xs font-medium border border-border"
                          >
                            <Link to={`/blood-bank/requests/${request.id}`}>
                              {t("bloodBank.allocateUnits", "Allocate")}
                              <ArrowRight aria-hidden="true" className="size-3 rtl:rotate-180" />
                            </Link>
                          </Button>
                        )}
                        <RequestActionPanel
                          request={request}
                          isPending={activeRequestId === request.id}
                          onAction={onAction}
                        />
                      </div>
                    </td>
                  ) : compact ? (
                    <td className="px-3 pe-4 py-3 text-end align-middle">
                      <Button asChild size="sm" variant="ghost" className="size-8 p-0">
                        <Link
                          to={`/blood-bank/requests/${request.id}`}
                          aria-label={`View requisition ${request.id}`}
                        >
                          <ArrowRight aria-hidden="true" className="size-4 rtl:rotate-180" />
                        </Link>
                      </Button>
                    </td>
                  ) : null}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Mobile Responsive Clinical Dispatch Cards */}
      <div className="divide-y divide-border md:hidden">
        {requests.map((request) => {
          const allocatedCount = request.allocatedUnitIds.length;
          const isFulfilled = allocatedCount >= request.quantity;
          const isUrgentOrEmergency =
            request.urgency === "emergency" || request.urgency === "urgent";

          const triageCardBg =
            request.urgency === "emergency"
              ? "bg-destructive/[0.03]"
              : request.urgency === "urgent"
                ? "bg-amber-500/[0.02]"
                : "";

          return (
            <article key={request.id} className={`p-4 transition-colors ${triageCardBg}`}>
              {/* Header: ID, Urgency, and Status */}
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Link
                    to={`/blood-bank/requests/${request.id}`}
                    className="text-sm font-bold text-primary hover:underline tabular-nums"
                  >
                    <bdi dir="ltr">{request.id}</bdi>
                  </Link>
                  <UrgencyBadge urgency={request.urgency} />
                </div>
                <RequestStatusBadge status={request.status} />
              </div>

              {/* Hospital & Facility */}
              <div className="mt-2.5">
                <p className="font-semibold text-sm text-foreground">
                  {formatHospitalName(request.hospital.name, request.hospital.id)}
                </p>
                <p className="text-xs text-muted-foreground font-mono tabular-nums">
                  <bdi dir="ltr">{request.hospital.facilityCode}</bdi>
                </p>
              </div>

              {/* Clinical Specs Grid */}
              <div className="mt-3.5 grid grid-cols-2 gap-2.5 rounded-md border border-border bg-surface-subtle/50 p-2.5 text-xs">
                <div>
                  <span className="text-[11px] text-muted-foreground block mb-1">
                    {t("common.bloodGroup", "Blood Spec")}
                  </span>
                  <div className="flex items-center gap-1.5">
                    <BloodGroupBadge group={request.bloodGroup} size="compact" />
                    <span className="text-xs font-medium truncate">
                      {formatBloodBankComponent(request.component)}
                    </span>
                  </div>
                </div>

                <div>
                  <span className="text-[11px] text-muted-foreground block mb-1">
                    {t("common.quantity", "Demanded")}
                  </span>
                  <div className="flex flex-col">
                    <span className="font-bold tabular-nums">
                      {request.quantity}{" "}
                      {request.quantity === 1 ? t("common.unit") : t("common.units")}
                    </span>
                    <span
                      className={`text-[11px] tabular-nums ${
                        isFulfilled
                          ? "text-success font-medium"
                          : "text-muted-foreground"
                      }`}
                    >
                      <bdi dir="ltr">{allocatedCount}/{request.quantity}</bdi> {t("status.allocated", "Allocated")}
                    </span>
                  </div>
                </div>
              </div>

              {/* Required Timeline */}
              <div className="mt-2.5 flex items-center justify-between text-xs text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Clock aria-hidden="true" className="size-3" />
                  <span>{t("bloodBank.requiredBy", "Required:")}</span>
                  <span className={`font-semibold tabular-nums ${isUrgentOrEmergency ? "text-destructive" : "text-foreground"}`}>
                    <bdi dir="ltr">{formatBloodBankDateTime(request.requiredAt)}</bdi>
                  </span>
                </div>
              </div>

              {/* Actions Dock */}
              {showActions && onAction ? (
                <div className="mt-3.5 flex flex-wrap items-center justify-end gap-2 border-t border-border pt-3">
                  {!isFulfilled && request.status !== "completed" && request.status !== "rejected" && (
                    <Button asChild size="sm" variant="secondary" className="h-8 text-xs flex-1 sm:flex-none">
                      <Link to={`/blood-bank/requests/${request.id}`}>
                        {t("bloodBank.allocateUnits", "Allocate")}
                        <ArrowRight aria-hidden="true" className="size-3 rtl:rotate-180" />
                      </Link>
                    </Button>
                  )}
                  <RequestActionPanel
                    request={request}
                    isPending={activeRequestId === request.id}
                    onAction={onAction}
                  />
                </div>
              ) : compact ? (
                <div className="mt-3 flex justify-end border-t border-border pt-2.5">
                  <Button asChild size="sm" variant="ghost" className="h-7 text-xs">
                    <Link to={`/blood-bank/requests/${request.id}`}>
                      {t("common.details", "View Requisition")}
                      <ArrowRight aria-hidden="true" className="size-3 rtl:rotate-180" />
                    </Link>
                  </Button>
                </div>
              ) : null}
            </article>
          );
        })}
      </div>
    </div>
  );
}
