import { Plus } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";

import { DashboardKpi } from "@/features/hospital/dashboard/dashboard-kpi";
import { HospitalPageFrame } from "@/features/hospital/components/hospital-page-frame";
import { formatStatusLabel } from "@/features/hospital/components/hospital-formatters";
import { useHospitalRequests } from "@/features/hospital/hooks/use-hospital-requests";
import { RequestTable } from "@/features/hospital/requests/request-table";
import type { RequestStatus } from "@/shared/components/clinical/clinical.types";
import {
  ErrorState,
  LoadingState,
} from "@/shared/components/feedback/system-states";
import { Button } from "@/shared/components/ui/button";

const overviewStatuses: RequestStatus[] = [
  "draft",
  "submitted",
  "acknowledged",
  "confirmed",
  "preparing",
  "completed",
  "cancelled",
];

export function HospitalDashboardPage() {
  const { t } = useTranslation();
  const requestsQuery = useHospitalRequests();
  const requests = requestsQuery.data ?? [];

  const completed = requests.filter(
    (request) => request.status === "completed",
  ).length;
  const pending = requests.filter(
    (request) =>
      !["completed", "cancelled", "rejected"].includes(request.status),
  ).length;
  const urgent = requests.filter(
    (request) =>
      (request.urgency === "urgent" || request.urgency === "emergency") &&
      !["completed", "cancelled", "rejected"].includes(request.status),
  ).length;

  return (
    <HospitalPageFrame
      breadcrumbs={[
        { label: t("healthcare.hospital"), href: "/hospital/dashboard" },
        { label: t("hospital.operations") },
      ]}
      title={t("hospital.operations")}
      description={t("hospital.operationsDesc")}
      actions={
        <Button asChild>
          <Link to="/hospital/requests/create">
            <Plus aria-hidden="true" />
            {t("hospital.createRequest")}
          </Link>
        </Button>
      }
    >
      {requestsQuery.isPending ? (
        <LoadingState label={t("hospital.loadingOperations")} rows={5} />
      ) : requestsQuery.isError ? (
        <ErrorState
          title={t("hospital.operationsLoadErrorTitle")}
          description={t("hospital.operationsLoadErrorDescription")}
          onRetry={() => void requestsQuery.refetch()}
        />
      ) : (
        <div className="space-y-9">
          <DashboardKpi
            total={requests.length}
            pending={pending}
            urgent={urgent}
            completed={completed}
          />

          <section aria-labelledby="status-overview-title">
            <div className="mb-3">
              <h2 id="status-overview-title" className="text-lg font-semibold">
                {t("hospital.statusOverview")}
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                {t("hospital.statusOverviewDesc")}
              </p>
            </div>
            <dl className="grid grid-cols-2 gap-px border border-border bg-border md:grid-cols-4 xl:grid-cols-7">
              {overviewStatuses.map((status) => (
                <div
                  key={status}
                  className="bg-surface px-4 py-4 last:col-span-2 xl:last:col-span-1"
                >
                  <dt className="text-xs font-medium text-muted-foreground">
                    {formatStatusLabel(status)}
                  </dt>
                  <dd className="mt-2 text-2xl font-semibold tabular-nums">
                    {
                      requests.filter((request) => request.status === status)
                        .length
                    }
                  </dd>
                </div>
              ))}
            </dl>
          </section>

          <section aria-labelledby="recent-requests-title">
            <div className="mb-3 flex flex-wrap items-end justify-between gap-3">
              <div>
                <h2
                  id="recent-requests-title"
                  className="text-lg font-semibold"
                >
                  {t("hospital.recentRequests")}
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  {t("hospital.recentRequestsDesc")}
                </p>
              </div>
              <Button asChild variant="ghost" size="sm">
                <Link to="/hospital/requests">
                  {t("hospital.viewAllRequests")}
                </Link>
              </Button>
            </div>
            <RequestTable requests={requests.slice(0, 6)} compact />
          </section>
        </div>
      )}
    </HospitalPageFrame>
  );
}
