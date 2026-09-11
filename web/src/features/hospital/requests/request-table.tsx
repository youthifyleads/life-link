import { ArrowUpRight, Building2 } from "lucide-react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

import { formatDateTime } from "@/features/hospital/components/hospital-formatters";
import {
  bloodComponentLabels,
  type HospitalRequest,
} from "@/features/hospital/types/hospital.types";
import { BloodGroupBadge } from "@/shared/components/clinical/blood-group-badge";
import { RequestStatusBadge } from "@/shared/components/clinical/request-status-badge";
import { UrgencyBadge } from "@/shared/components/clinical/urgency-badge";

interface RequestTableProps {
  requests: HospitalRequest[];
  compact?: boolean;
}

export function RequestTable({ requests, compact = false }: RequestTableProps) {
  const { t } = useTranslation();

  return (
    <div className="border border-border bg-surface">
      <div className="hidden overflow-x-auto md:block">
        <table className="w-full min-w-[62rem] border-collapse text-start text-sm">
          <thead className="bg-surface-subtle text-xs font-semibold text-muted-foreground">
            <tr className="border-b border-border">
              <th scope="col" className="px-4 py-3 text-start">
                {t("hospital.requestId", "Request ID")}
              </th>
              <th scope="col" className="px-4 py-3 text-start">
                {t("hospital.recipientBank", "Recipient Bank")}
              </th>
              <th scope="col" className="px-4 py-3 text-start">
                {t("common.bloodGroup", "Blood group")}
              </th>
              <th scope="col" className="px-4 py-3 text-start">
                {t("common.component", "Component")}
              </th>
              <th scope="col" className="px-4 py-3 text-end">
                {t("common.quantity", "Quantity")}
              </th>
              <th scope="col" className="px-4 py-3 text-start">
                {t("common.urgency", "Urgency")}
              </th>
              <th scope="col" className="px-4 py-3 text-start">
                {t("common.status", "Status")}
              </th>
              <th scope="col" className="px-4 py-3 text-start">
                {t("hospital.created", "Created")}
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {requests.map((request) => (
              <tr key={request.id} className="hover:bg-surface-subtle">
                <th scope="row" className="px-4 py-3 text-start">
                  <Link
                    to={`/hospital/requests/${request.id}`}
                    className="inline-flex min-h-8 items-center gap-1 font-semibold text-primary hover:underline"
                  >
                    <bdi dir="ltr">{request.id}</bdi>
                    <ArrowUpRight aria-hidden="true" className="size-3.5 rtl:-rotate-90" />
                  </Link>
                </th>
                <td className="px-4 py-3">
                  <div className="font-medium text-foreground">
                    {request.targetBloodBank?.name ?? "Regional Blood Bank"}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {request.targetBloodBank?.governorate ?? "Cairo"}
                  </div>
                </td>
                <td className="px-4 py-3">
                  <BloodGroupBadge group={request.bloodGroup} />
                </td>
                <td className="px-4 py-3 font-medium">
                  {t(`healthcare.${request.component}`, bloodComponentLabels[request.component])}
                </td>
                <td className="px-4 py-3 text-end font-semibold tabular-nums">
                  {request.quantity} {request.quantity === 1 ? t("common.unit", "unit") : t("common.units", "units")}
                </td>
                <td className="px-4 py-3">
                  <UrgencyBadge urgency={request.urgency} />
                </td>
                <td className="px-4 py-3">
                  <RequestStatusBadge status={request.status} />
                </td>
                <td className="whitespace-nowrap px-4 py-3 text-muted-foreground">
                  {formatDateTime(request.createdAt)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="divide-y divide-border md:hidden">
        {requests.map((request) => (
          <article key={request.id} className="p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <Link
                  to={`/hospital/requests/${request.id}`}
                  className="inline-flex min-h-8 items-center gap-1 text-sm font-semibold text-primary hover:underline"
                >
                  <bdi dir="ltr">{request.id}</bdi>
                  <ArrowUpRight aria-hidden="true" className="size-3.5 rtl:-rotate-90" />
                </Link>
                <div className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground">
                  <Building2 className="size-3" />
                  <span>{request.targetBloodBank?.name ?? "Regional Blood Bank"}</span>
                </div>
                <p className="mt-1 text-sm font-medium text-foreground">
                  {t(`healthcare.${request.component}`, bloodComponentLabels[request.component])}
                </p>
              </div>
              <BloodGroupBadge group={request.bloodGroup} />
            </div>
            <div className="mt-4 flex flex-wrap items-center gap-2">
              <UrgencyBadge urgency={request.urgency} />
              <RequestStatusBadge status={request.status} />
            </div>
            <dl className="mt-4 grid grid-cols-2 gap-4 border-t border-border pt-3 text-xs">
              <div>
                <dt className="text-muted-foreground">{t("common.quantity", "Quantity")}</dt>
                <dd className="mt-1 font-semibold tabular-nums">
                  {request.quantity} {request.quantity === 1 ? t("common.unit", "unit") : t("common.units", "units")}
                </dd>
              </div>
              <div>
                <dt className="text-muted-foreground">{t("hospital.created", "Created")}</dt>
                <dd className="mt-1 font-medium">
                  {formatDateTime(request.createdAt)}
                </dd>
              </div>
            </dl>
          </article>
        ))}
      </div>

      {compact && requests.length > 0 ? (
        <div className="border-t border-border bg-surface-subtle px-4 py-3 text-end">
          <Link
            to="/hospital/requests"
            className="inline-flex min-h-8 items-center text-sm font-semibold text-primary hover:underline"
          >
            {t("common.view", "View")} {t("nav.bloodRequests", "all requests")}
          </Link>
        </div>
      ) : null}
    </div>
  );
}
