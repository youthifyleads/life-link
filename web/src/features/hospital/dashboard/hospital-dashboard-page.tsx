import { Plus } from "lucide-react";
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";

import { DashboardKpi } from "@/features/hospital/dashboard/dashboard-kpi";
import { HospitalPageFrame } from "@/features/hospital/components/hospital-page-frame";
import { formatStatusLabel } from "@/features/hospital/components/hospital-formatters";
import { useHospitalRequests } from "@/features/hospital/hooks/use-hospital-requests";
import { RequestFilters } from "@/features/hospital/requests/request-filters";
import { RequestTable } from "@/features/hospital/requests/request-table";
import {
  bloodComponentLabels,
  type RequestFilters as RequestFilterValues,
} from "@/features/hospital/types/hospital.types";
import type { RequestStatus } from "@/shared/components/clinical/clinical.types";
import {
  EmptyState,
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

const initialFilters: RequestFilterValues = {
  search: "",
  status: "all",
  urgency: "all",
  bloodGroup: "all",
  sort: "newest",
};

export function HospitalDashboardPage() {
  const { t } = useTranslation();
  const requestsQuery = useHospitalRequests();
  const requests = requestsQuery.data ?? [];
  const [filters, setFilters] = useState(initialFilters);

  const filteredRequests = useMemo(() => {
    const query = filters.search.trim().toLowerCase();

    return [...requests]
      .filter(
        (request) =>
          !query ||
          request.id.toLowerCase().includes(query) ||
          request.reason.toLowerCase().includes(query) ||
          bloodComponentLabels[request.component].toLowerCase().includes(query),
      )
      .filter(
        (request) =>
          filters.status === "all" || request.status === filters.status,
      )
      .filter(
        (request) =>
          filters.urgency === "all" || request.urgency === filters.urgency,
      )
      .filter(
        (request) =>
          filters.bloodGroup === "all" ||
          request.bloodGroup === filters.bloodGroup,
      )
      .sort((left, right) => {
        if (filters.sort === "oldest") {
          return Date.parse(left.createdAt) - Date.parse(right.createdAt);
        }
        if (filters.sort === "required_soonest") {
          return Date.parse(left.requiredAt) - Date.parse(right.requiredAt);
        }
        return Date.parse(right.createdAt) - Date.parse(left.createdAt);
      });
  }, [filters, requests]);

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
            <dl className="grid grid-cols-2 gap-px rounded-lg border border-border/80 bg-border shadow-2xs overflow-hidden md:grid-cols-4 xl:grid-cols-7">
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
            <div className="space-y-3">
              <RequestFilters
                value={filters}
                onChange={setFilters}
                resultCount={filteredRequests.length}
                statusPresentation="tags"
              />
              {filteredRequests.length === 0 ? (
                <EmptyState
                  title={t("common.noRecordsTitle")}
                  description={t("common.noRecordsDesc")}
                />
              ) : (
                <RequestTable requests={filteredRequests.slice(0, 6)} compact />
              )}
            </div>
          </section>
        </div>
      )}
    </HospitalPageFrame>
  );
}
