import { ArrowRight } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";

import type {
  BloodBankRequest,
  BloodBankRequestAction,
} from "@/features/blood-bank/types/blood-bank.types";
import { formatBloodBankDateTime } from "@/features/blood-bank/components/blood-bank-formatters";
import { RequestActionPanel } from "@/features/blood-bank/components/request-action-panel";
import { bloodBankComponentLabels } from "@/features/blood-bank/types/blood-bank.types";
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
    <div className="border border-border bg-surface">
      <div
        className="hidden overflow-x-auto md:block"
        tabIndex={0}
        role="region"
        aria-label={t("bloodBank.requestsTableLabel")}
      >
        <table className="w-full min-w-[60rem] table-fixed border-collapse text-start text-sm">
          <colgroup>
            <col className="w-[11%]" />
            <col className="w-[19%]" />
            <col className="w-[10%]" />
            <col className="w-[16%]" />
            <col className="w-[9%]" />
            <col className="w-[11%]" />
            <col className="w-[12%]" />
            <col className="w-[12%]" />
          </colgroup>
          <thead className="bg-surface-subtle text-xs font-semibold text-muted-foreground">
            <tr className="border-b border-border">
              <th scope="col" className="px-4 py-3 text-start">
                {t("hospital.requestId")}
              </th>
              <th scope="col" className="px-4 py-3 text-start">
                {t("healthcare.hospital")}
              </th>
              <th scope="col" className="px-4 py-3 text-start">
                {t("common.bloodGroup")}
              </th>
              <th scope="col" className="px-4 py-3 text-start">
                {t("common.component")}
              </th>
              <th scope="col" className="px-4 py-3 text-end">
                {t("common.quantity")}
              </th>
              <th scope="col" className="px-4 py-3 text-start">
                {t("common.urgency")}
              </th>
              <th scope="col" className="px-4 py-3 text-start">
                {t("common.status")}
              </th>
              <th scope="col" className="px-4 py-3 text-start">
                {t("common.date")}
              </th>
            </tr>
          </thead>
          {requests.map((request) => (
            <tbody
              key={request.id}
              className="border-b border-border last:border-b-0"
            >
              <tr className="align-top hover:bg-surface-subtle">
                <th
                  scope="row"
                  className="whitespace-nowrap px-4 py-3 text-start font-semibold text-foreground tabular-nums"
                >
                  <Link
                    to={`/blood-bank/requests/${request.id}`}
                    className="text-primary hover:underline focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary"
                  >
                    <bdi dir="ltr">{request.id}</bdi>
                  </Link>
                </th>
                <td className="px-4 py-3">
                  <span className="block font-medium text-foreground">
                    {request.hospital.name}
                  </span>
                  <span className="mt-0.5 block text-xs text-muted-foreground tabular-nums">
                    <bdi dir="ltr">{request.hospital.facilityCode}</bdi>
                  </span>
                </td>
                <td className="px-4 py-3">
                  <BloodGroupBadge group={request.bloodGroup} />
                </td>
                <td className="px-4 py-3 font-medium">
                  {bloodBankComponentLabels[request.component]}
                </td>
                <td className="px-4 py-3 text-end font-semibold tabular-nums">
                  {request.quantity} {request.quantity === 1 ? t("common.unit") : t("common.units")}
                </td>
                <td className="px-4 py-3">
                  <UrgencyBadge urgency={request.urgency} />
                </td>
                <td className="px-4 py-3">
                  <RequestStatusBadge status={request.status} />
                </td>
                <td className="px-4 py-3 leading-5 text-muted-foreground">
                  <bdi dir="ltr">{formatBloodBankDateTime(request.createdAt)}</bdi>
                </td>
              </tr>
              {showActions && onAction ? (
                <tr className="bg-surface-subtle/60">
                  <td colSpan={8} className="border-t border-border px-4 py-2">
                    <div className="flex items-center justify-between gap-4">
                      <span className="text-xs font-medium text-muted-foreground">
                        {t("common.next")}
                      </span>
                      <div className="flex items-center gap-2">
                        <Button asChild size="sm" variant="secondary" className="h-7 text-xs">
                          <Link to={`/blood-bank/requests/${request.id}`}>
                            {t("bloodBank.allocateUnits")}
                            <ArrowRight aria-hidden="true" className="size-3 rtl:rotate-180" />
                          </Link>
                        </Button>
                        <RequestActionPanel
                          request={request}
                          isPending={activeRequestId === request.id}
                          onAction={onAction}
                        />
                      </div>
                    </div>
                  </td>
                </tr>
              ) : null}
            </tbody>
          ))}
        </table>
      </div>

      <div className="divide-y divide-border md:hidden">
        {requests.map((request) => (
          <article key={request.id} className="p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <Link
                  to={`/blood-bank/requests/${request.id}`}
                  className="text-sm font-semibold text-primary hover:underline tabular-nums"
                >
                  <bdi dir="ltr">{request.id}</bdi>
                </Link>
                <p className="mt-1 truncate text-sm font-medium text-foreground">
                  {request.hospital.name}
                </p>
                <p className="mt-0.5 text-xs text-muted-foreground tabular-nums">
                  <bdi dir="ltr">{request.hospital.facilityCode}</bdi>
                </p>
              </div>
              <BloodGroupBadge group={request.bloodGroup} />
            </div>

            <p className="mt-4 text-sm font-medium">
              {bloodBankComponentLabels[request.component]}
            </p>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <UrgencyBadge urgency={request.urgency} />
              <RequestStatusBadge status={request.status} />
            </div>

            <dl className="mt-4 grid grid-cols-2 gap-4 border-t border-border pt-3 text-xs">
              <div>
                <dt className="text-muted-foreground">{t("common.quantity")}</dt>
                <dd className="mt-1 font-semibold tabular-nums">
                  {request.quantity} {request.quantity === 1 ? t("common.unit") : t("common.units")}
                </dd>
              </div>
              <div>
                <dt className="text-muted-foreground">{t("common.date")}</dt>
                <dd className="mt-1 font-medium">
                  <bdi dir="ltr">{formatBloodBankDateTime(request.createdAt)}</bdi>
                </dd>
              </div>
            </dl>

            {showActions && onAction ? (
              <div className="mt-4 border-t border-border pt-4">
                <p className="mb-2 text-xs font-medium text-muted-foreground">
                  {t("common.actions")}
                </p>
                <div className="space-y-2">
                  <Button asChild size="sm" variant="secondary" className="w-full text-xs">
                    <Link to={`/blood-bank/requests/${request.id}`}>
                      {t("bloodBank.allocateUnits")}
                      <ArrowRight aria-hidden="true" className="size-3 rtl:rotate-180" />
                    </Link>
                  </Button>
                  <RequestActionPanel
                    request={request}
                    isPending={activeRequestId === request.id}
                    onAction={onAction}
                  />
                </div>
              </div>
            ) : null}
          </article>
        ))}
      </div>
    </div>
  );
}
