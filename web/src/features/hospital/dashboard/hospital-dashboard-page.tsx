import { Plus } from "lucide-react";
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";

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
          {/* Operational Workflow Track & Critical Action Cards */}
          <section aria-labelledby="pipeline-overview-title" className="space-y-4">
            <div className="flex flex-wrap items-end justify-between gap-3">
              <div>
                <h2 id="pipeline-overview-title" className="text-base font-semibold text-foreground">
                  {t("hospital.statusOverview", "Requisition Pipeline & Status")}
                </h2>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {t("hospital.statusOverviewDesc", "Real-time distribution of blood requisitions across clinical dispatch stages.")}
                </p>
              </div>
              <div className="flex items-center gap-2">
                {filters.status !== "all" || filters.urgency !== "all" ? (
                  <button
                    type="button"
                    onClick={() => setFilters((prev) => ({ ...prev, status: "all", urgency: "all" }))}
                    className="text-xs font-medium text-primary hover:underline"
                  >
                    {t("hospital.clearFilters", "Reset view")}
                  </button>
                ) : null}
              </div>
            </div>

            {/* Critical Intervention & Summary Cards */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              {/* Card 1: Urgent & Emergency Intervention */}
              <button
                type="button"
                onClick={() =>
                  setFilters((prev) => ({
                    ...prev,
                    urgency: prev.urgency === "urgent" || prev.urgency === "emergency" ? "all" : "urgent",
                    status: "all",
                  }))
                }
                className={`flex items-center justify-between rounded-xl border p-4.5 text-start transition-all shadow-xs ${
                  filters.urgency === "urgent" || filters.urgency === "emergency"
                    ? "border-destructive bg-destructive/10 ring-2 ring-destructive shadow-sm"
                    : urgent > 0
                      ? "border-destructive/40 bg-destructive/[0.04] hover:border-destructive/60 hover:shadow-sm"
                      : "border-border/90 bg-card hover:border-border/70 hover:shadow-sm"
                }`}
              >
                <div>
                  <span className="text-xs font-medium text-destructive flex items-center gap-1.5">
                    <span className="size-2 rounded-full bg-destructive animate-pulse" />
                    {t("hospital.urgentRequests", "Requires Immediate Action")}
                  </span>
                  <div className="mt-1.5 flex items-baseline gap-2">
                    <span className="text-2xl font-bold tabular-nums text-destructive">
                      <bdi dir="ltr">{urgent}</bdi>
                    </span>
                    <span className="text-[11px] text-muted-foreground">
                      {t("hospital.urgentOrEmergency", "STAT & Urgent")}
                    </span>
                  </div>
                </div>
              </button>

              {/* Card 2: Active Pipeline (Pending Dispatch) */}
              <button
                type="button"
                onClick={() =>
                  setFilters((prev) => ({
                    ...prev,
                    status: prev.status === "submitted" ? "all" : "submitted",
                    urgency: "all",
                  }))
                }
                className={`flex items-center justify-between rounded-xl border p-4.5 text-start transition-all shadow-xs ${
                  filters.status === "submitted"
                    ? "border-primary bg-primary/10 ring-2 ring-primary shadow-sm"
                    : "border-border/90 bg-card hover:border-primary/50 hover:shadow-sm"
                }`}
              >
                <div>
                  <span className="text-xs font-medium text-foreground">
                    {t("hospital.pendingRequests", "Active in Pipeline")}
                  </span>
                  <div className="mt-1.5 flex items-baseline gap-2">
                    <span className="text-2xl font-bold tabular-nums text-foreground">
                      <bdi dir="ltr">{pending}</bdi>
                    </span>
                    <span className="text-[11px] text-muted-foreground">
                      {t("hospital.awaitingCompletion", "Pending / In Progress")}
                    </span>
                  </div>
                </div>
              </button>

              {/* Card 3: Completed Transfusions */}
              <button
                type="button"
                onClick={() =>
                  setFilters((prev) => ({
                    ...prev,
                    status: prev.status === "completed" ? "all" : "completed",
                    urgency: "all",
                  }))
                }
                className={`flex items-center justify-between rounded-xl border p-4.5 text-start transition-all shadow-xs ${
                  filters.status === "completed"
                    ? "border-success bg-success/10 ring-2 ring-success shadow-sm"
                    : "border-border/90 bg-card hover:border-success/50 hover:shadow-sm"
                }`}
              >
                <div>
                  <span className="text-xs font-medium text-muted-foreground">
                    {t("hospital.completedRequests", "Completed & Handed Off")}
                  </span>
                  <div className="mt-1.5 flex items-baseline gap-2">
                    <span className="text-2xl font-bold tabular-nums text-foreground">
                      <bdi dir="ltr">{completed}</bdi>
                    </span>
                    <span className="text-[11px] text-muted-foreground">
                      {t("hospital.allRecords", "of {{total}} total", { total: requests.length })}
                    </span>
                  </div>
                </div>
              </button>
            </div>

            {/* Streamlined Workflow Stage Strip (Clickable to Filter) */}
            <div className="rounded-lg border border-border/80 bg-surface p-3 sm:p-4 shadow-2xs">
              <div className="flex items-center justify-between mb-2.5 text-xs">
                <span className="font-medium text-muted-foreground">
                  {t("hospital.operations", "Workflow Stage Distribution")}
                </span>
                <span className="text-muted-foreground tabular-nums">
                  <bdi dir="ltr">{requests.length}</bdi> {t("hospital.records", "total requisitions")}
                </span>
              </div>

              {/* Segmented Distribution Bar */}
              <div className="flex h-2.5 w-full overflow-hidden rounded-full bg-muted/60">
                {overviewStatuses.map((status) => {
                  const count = requests.filter((r) => r.status === status).length;
                  if (count === 0 || requests.length === 0) return null;
                  const pct = (count / requests.length) * 100;
                  const color =
                    status === "confirmed" || status === "preparing" || status === "ready"
                      ? "bg-primary"
                      : status === "completed"
                        ? "bg-success"
                        : status === "cancelled" || status === "rejected"
                          ? "bg-muted-foreground/40"
                          : "bg-amber-500";
                  return (
                    <div
                      key={status}
                      style={{ width: `${pct}%` }}
                      title={`${formatStatusLabel(status)}: ${count} (${pct.toFixed(0)}%)`}
                      className={`${color} transition-all duration-300 first:rounded-s-full last:rounded-e-full`}
                    />
                  );
                })}
              </div>

              {/* Status Chips */}
              <div className="mt-3 flex flex-wrap items-center gap-1.5">
                {overviewStatuses.map((status) => {
                  const count = requests.filter((r) => r.status === status).length;
                  const isSelected = filters.status === status;
                  return (
                    <button
                      key={status}
                      type="button"
                      onClick={() =>
                        setFilters((prev) => ({
                          ...prev,
                          status: isSelected ? "all" : status,
                        }))
                      }
                      className={`inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs transition-colors ${
                        isSelected
                          ? "bg-primary text-primary-foreground font-semibold"
                          : "bg-surface-subtle text-muted-foreground hover:text-foreground border border-border/70"
                      }`}
                    >
                      <span>{formatStatusLabel(status)}</span>
                      <span className={`font-mono text-[11px] tabular-nums font-semibold ${isSelected ? "text-primary-foreground" : "text-foreground"}`}>
                        <bdi dir="ltr">{count}</bdi>
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
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
