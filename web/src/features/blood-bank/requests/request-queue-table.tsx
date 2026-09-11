import { ArrowRight, Check, Clock } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";

import {
  formatBloodBankComponent,
  formatBloodBankDateTime,
  formatHospitalName,
} from "@/features/blood-bank/components/blood-bank-formatters";
import { RequestActionPanel } from "@/features/blood-bank/components/request-action-panel";
import type {
  BloodBankRequest,
  BloodBankRequestAction,
} from "@/features/blood-bank/types/blood-bank.types";
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
    <div className="overflow-hidden rounded-md border border-border bg-surface">
      <div
        className={compact ? "hidden overflow-x-auto md:block" : "hidden xl:block"}
        tabIndex={compact ? 0 : undefined}
        role="region"
        aria-label={t("bloodBank.requestsTableLabel")}
      >
        <table
          className={
            compact
              ? "w-full min-w-[64rem] border-collapse text-sm"
              : "w-full table-fixed border-collapse text-sm"
          }
        >
          <thead>
            <tr className="border-b border-border bg-surface-subtle text-xs font-semibold text-muted-foreground">
              <th scope="col" className="w-[14%] px-4 py-3 text-start">
                {t("bloodBank.queueRequestColumn")}
              </th>
              <th scope="col" className="w-[18%] px-4 py-3 text-start">
                {t("bloodBank.queueHospitalColumn")}
              </th>
              <th scope="col" className="w-[22%] px-4 py-3 text-start">
                {t("bloodBank.queueBloodColumn")}
              </th>
              <th scope="col" className="w-[13%] px-4 py-3 text-start">
                {t("common.status")}
              </th>
              <th scope="col" className="w-[17%] px-4 py-3 text-start">
                {t("bloodBank.queueScheduleColumn")}
              </th>
              <th scope="col" className="w-[16%] px-4 py-3 text-end">
                {showActions
                  ? t("bloodBank.queueNextActionColumn")
                  : t("common.actions")}
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {requests.map((request) => {
              const allocatedCount = request.allocatedUnitIds.length;
              const isFulfilled = allocatedCount >= request.quantity;
              const isUrgentOrEmergency =
                request.urgency === "emergency" || request.urgency === "urgent";
              const rowTone =
                request.urgency === "emergency"
                  ? "bg-destructive/[0.035] hover:bg-destructive/[0.065]"
                  : request.urgency === "urgent"
                    ? "bg-amber-500/[0.025] hover:bg-amber-500/[0.05]"
                    : "hover:bg-surface-subtle/70";

              return (
                <tr key={request.id} className={rowTone}>
                  <td className="px-4 py-4 align-top">
                    <div className="flex flex-col items-start gap-2">
                      <Link
                        to={`/blood-bank/requests/${request.id}`}
                        className="font-semibold text-primary underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      >
                        <bdi dir="ltr" className="tabular-nums">
                          {request.id}
                        </bdi>
                      </Link>
                      <UrgencyBadge urgency={request.urgency} />
                    </div>
                  </td>

                  <td className="px-4 py-4 align-top">
                    <span className="block font-semibold leading-5 text-foreground">
                      {formatHospitalName(request.hospital.name, request.hospital.id)}
                    </span>
                    <span className="mt-1 block text-xs text-muted-foreground">
                      <bdi dir="ltr" className="tabular-nums">
                        {request.hospital.facilityCode}
                      </bdi>
                    </span>
                  </td>

                  <td className="px-4 py-4 align-top">
                    <div className="flex items-start gap-2.5">
                      <BloodGroupBadge group={request.bloodGroup} size="compact" />
                      <div className="min-w-0 space-y-1.5">
                        <span className="block font-medium leading-5 text-foreground">
                          {formatBloodBankComponent(request.component)}
                        </span>
                        <span className="block text-xs text-muted-foreground">
                          {t("bloodBank.queueRequestedUnits", {
                            count: request.quantity,
                          })}
                        </span>
                        <span
                          className={`inline-flex items-center gap-1 text-xs font-medium ${
                            isFulfilled
                              ? "text-success"
                              : allocatedCount > 0
                                ? "text-amber-700 dark:text-amber-400"
                                : "text-muted-foreground"
                          }`}
                        >
                          {isFulfilled ? (
                            <Check aria-hidden="true" className="size-3.5" />
                          ) : null}
                          {t("bloodBank.allocatedProgress", {
                            allocated: allocatedCount,
                            total: request.quantity,
                          })}
                        </span>
                      </div>
                    </div>
                  </td>

                  <td className="px-4 py-4 align-top">
                    <RequestStatusBadge status={request.status} />
                  </td>

                  <td className="px-4 py-4 align-top">
                    <div className="space-y-2">
                      <div
                        className={`flex items-start gap-1.5 ${
                          isUrgentOrEmergency
                            ? "font-semibold text-destructive"
                            : "font-medium text-foreground"
                        }`}
                      >
                        <Clock
                          aria-hidden="true"
                          className="mt-0.5 size-3.5 shrink-0"
                        />
                        <time dateTime={request.requiredAt}>
                          <bdi dir="auto">
                            {formatBloodBankDateTime(request.requiredAt)}
                          </bdi>
                        </time>
                      </div>
                      <span className="block text-xs leading-5 text-muted-foreground">
                        {t("bloodBank.createdOn")}: {" "}
                        <time dateTime={request.createdAt}>
                          <bdi dir="auto">
                            {formatBloodBankDateTime(request.createdAt)}
                          </bdi>
                        </time>
                      </span>
                    </div>
                  </td>

                  <td className="px-4 py-4 align-top">
                    {showActions && onAction ? (
                      <div className="ms-auto flex max-w-48 flex-col gap-2">
                        {!isFulfilled &&
                        request.status !== "completed" &&
                        request.status !== "cancelled" &&
                        request.status !== "rejected" ? (
                          <Button
                            asChild
                            size="sm"
                            variant="secondary"
                            className="h-9 w-full justify-center px-3 text-xs"
                          >
                            <Link to={`/blood-bank/requests/${request.id}`}>
                              {t("bloodBank.allocateUnits")}
                              <ArrowRight
                                aria-hidden="true"
                                className="size-3.5 rtl:rotate-180"
                              />
                            </Link>
                          </Button>
                        ) : null}
                        <RequestActionPanel
                          request={request}
                          isPending={activeRequestId === request.id}
                          onAction={onAction}
                          className="w-full flex-col items-stretch [&>button]:w-full [&>button]:justify-center"
                        />
                      </div>
                    ) : (
                      <Button
                        asChild
                        size="sm"
                        variant="ghost"
                        className="ms-auto size-9 p-0"
                      >
                        <Link
                          to={`/blood-bank/requests/${request.id}`}
                          aria-label={t("bloodBank.openRequest", {
                            id: request.id,
                          })}
                        >
                          <ArrowRight
                            aria-hidden="true"
                            className="size-4 rtl:rotate-180"
                          />
                        </Link>
                      </Button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div
        className={compact ? "divide-y divide-border md:hidden" : "divide-y divide-border xl:hidden"}
      >
        {requests.map((request) => {
          const allocatedCount = request.allocatedUnitIds.length;
          const isFulfilled = allocatedCount >= request.quantity;
          const isUrgentOrEmergency =
            request.urgency === "emergency" || request.urgency === "urgent";
          const cardTone =
            request.urgency === "emergency"
              ? "bg-destructive/[0.03]"
              : request.urgency === "urgent"
                ? "bg-amber-500/[0.02]"
                : "";

          return (
            <article key={request.id} className={`p-4 sm:p-5 ${cardTone}`}>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="flex flex-wrap items-center gap-2">
                  <Link
                    to={`/blood-bank/requests/${request.id}`}
                    className="font-semibold text-primary underline-offset-4 hover:underline"
                  >
                    <bdi dir="ltr" className="tabular-nums">
                      {request.id}
                    </bdi>
                  </Link>
                  <UrgencyBadge urgency={request.urgency} />
                </div>
                <RequestStatusBadge status={request.status} />
              </div>

              <div className="mt-3">
                <p className="font-semibold leading-5 text-foreground">
                  {formatHospitalName(request.hospital.name, request.hospital.id)}
                </p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  <bdi dir="ltr" className="tabular-nums">
                    {request.hospital.facilityCode}
                  </bdi>
                </p>
              </div>

              <dl className="mt-4 grid grid-cols-2 gap-x-4 gap-y-3 border-y border-border py-3 text-sm sm:grid-cols-3">
                <div className="min-w-0">
                  <dt className="text-xs text-muted-foreground">
                    {t("bloodBank.queueBloodColumn")}
                  </dt>
                  <dd className="mt-1 flex items-center gap-2">
                    <BloodGroupBadge group={request.bloodGroup} size="compact" />
                    <span className="truncate text-sm font-medium">
                      {formatBloodBankComponent(request.component)}
                    </span>
                  </dd>
                </div>
                <div>
                  <dt className="text-xs text-muted-foreground">
                    {t("bloodBank.queueRequestedLabel")}
                  </dt>
                  <dd className="mt-1 font-semibold tabular-nums">
                    {t("bloodBank.queueRequestedUnits", {
                      count: request.quantity,
                    })}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs text-muted-foreground">
                    {t("bloodBank.queueAllocationLabel")}
                  </dt>
                  <dd
                    className={`mt-1 font-medium ${
                      isFulfilled ? "text-success" : "text-muted-foreground"
                    }`}
                  >
                    {t("bloodBank.allocatedProgress", {
                      allocated: allocatedCount,
                      total: request.quantity,
                    })}
                  </dd>
                </div>
                <div className="col-span-2 sm:col-span-3">
                  <dt className="text-xs text-muted-foreground">
                    {t("bloodBank.requiredBy")}
                  </dt>
                  <dd
                    className={`mt-1 flex flex-wrap items-center gap-x-1.5 gap-y-1 ${
                      isUrgentOrEmergency
                        ? "font-semibold text-destructive"
                        : "font-medium text-foreground"
                    }`}
                  >
                    <Clock aria-hidden="true" className="size-3.5" />
                    <time dateTime={request.requiredAt}>
                      <bdi dir="auto">
                        {formatBloodBankDateTime(request.requiredAt)}
                      </bdi>
                    </time>
                    <span className="text-muted-foreground">·</span>
                    <span className="text-xs font-normal text-muted-foreground">
                      {t("bloodBank.createdOn")}: {" "}
                      <time dateTime={request.createdAt}>
                        <bdi dir="auto">
                          {formatBloodBankDateTime(request.createdAt)}
                        </bdi>
                      </time>
                    </span>
                  </dd>
                </div>
              </dl>

              {showActions && onAction ? (
                <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-end">
                  {!isFulfilled &&
                  request.status !== "completed" &&
                  request.status !== "cancelled" &&
                  request.status !== "rejected" ? (
                    <Button
                      asChild
                      size="sm"
                      variant="secondary"
                      className="h-9 w-full justify-center text-xs sm:w-auto"
                    >
                      <Link to={`/blood-bank/requests/${request.id}`}>
                        {t("bloodBank.allocateUnits")}
                        <ArrowRight
                          aria-hidden="true"
                          className="size-3.5 rtl:rotate-180"
                        />
                      </Link>
                    </Button>
                  ) : null}
                  <RequestActionPanel
                    request={request}
                    isPending={activeRequestId === request.id}
                    onAction={onAction}
                    className="w-full [&>button]:flex-1 [&>button]:justify-center sm:w-auto sm:[&>button]:flex-none"
                  />
                </div>
              ) : (
                <div className="mt-3 flex justify-end">
                  <Button asChild size="sm" variant="ghost" className="h-8 text-xs">
                    <Link to={`/blood-bank/requests/${request.id}`}>
                      {t("common.details")}
                      <ArrowRight
                        aria-hidden="true"
                        className="size-3.5 rtl:rotate-180"
                      />
                    </Link>
                  </Button>
                </div>
              )}
            </article>
          );
        })}
      </div>
    </div>
  );
}
