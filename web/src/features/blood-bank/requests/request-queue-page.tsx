import {
  AlarmClock,
  AlertTriangle,
  CheckCircle2,
  Layers,
  PackageCheck,
  PackageOpen,
  X,
} from "lucide-react";
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useSearchParams } from "react-router-dom";

import { BloodBankPageFrame } from "@/features/blood-bank/components/blood-bank-page-frame";
import {
  useBloodBankRequests,
  useTransitionBloodBankRequest,
} from "@/features/blood-bank/hooks/use-blood-bank-requests";
import { RequestQueueFilters } from "@/features/blood-bank/requests/request-queue-filters";
import { RequestQueueTable } from "@/features/blood-bank/requests/request-queue-table";
import {
  formatBloodBankComponent,
  formatHospitalName,
} from "@/features/blood-bank/components/blood-bank-formatters";
import {
  bloodBankComponentLabels,
  type BloodBankRequest,
  type BloodBankRequestAction,
  type BloodBankRequestFilters,
} from "@/features/blood-bank/types/blood-bank.types";
import {
  EmptyState,
  ErrorState,
  LoadingState,
  PermissionState,
} from "@/shared/components/feedback/system-states";

const urgencyRank = {
  routine: 0,
  urgent: 1,
  emergency: 2,
} as const;

const defaultBloodBankRequestFilters: BloodBankRequestFilters = {
  search: "",
  status: "all",
  urgency: "all",
  bloodGroup: "all",
  component: "all",
  sort: "newest",
};

const terminalStatuses = ["completed", "cancelled", "rejected"];

export function RequestQueuePage() {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const previewState = searchParams.get("state");
  const requestsQuery = useBloodBankRequests();
  const transitionMutation = useTransitionBloodBankRequest();
  const [filters, setFilters] = useState<BloodBankRequestFilters>(
    defaultBloodBankRequestFilters,
  );
  const [activeRequestId, setActiveRequestId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{
    message: string;
    tone: "success" | "error";
  } | null>(null);

  const allRequests = useMemo(
    () => (previewState === "empty" ? [] : [...(requestsQuery.data ?? [])]),
    [previewState, requestsQuery.data],
  );

  // Operational Dispatch Cadence Telemetry
  const telemetry = useMemo(() => {
    const active = allRequests.filter(
      (request) => !terminalStatuses.includes(request.status),
    );
    const emergency = active.filter((request) => request.urgency === "emergency");
    const urgent = active.filter((request) => request.urgency === "urgent");
    const needsAllocation = active.filter(
      (request) =>
        request.status === "submitted" || request.status === "acknowledged",
    );
    const readyOrPreparing = active.filter(
      (request) =>
        request.status === "confirmed" ||
        request.status === "preparing",
    );

    return {
      activeCount: active.length,
      emergencyCount: emergency.length,
      urgentCount: urgent.length,
      needsAllocationCount: needsAllocation.length,
      readyOrPreparingCount: readyOrPreparing.length,
    };
  }, [allRequests]);

  const filteredRequests = useMemo(() => {
    const query = filters.search.trim().toLowerCase();

    return allRequests
      .filter(
        (request) =>
          !query ||
          request.id.toLowerCase().includes(query) ||
          request.hospital.name.toLowerCase().includes(query) ||
          formatHospitalName(request.hospital.name, request.hospital.id).toLowerCase().includes(query) ||
          request.hospital.facilityCode.toLowerCase().includes(query) ||
          bloodBankComponentLabels[request.component]
            .toLowerCase()
            .includes(query) ||
          formatBloodBankComponent(request.component)
            .toLowerCase()
            .includes(query),
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
      .filter(
        (request) =>
          filters.component === "all" ||
          request.component === filters.component,
      )
      .sort((left, right) => {
        if (filters.sort === "oldest") {
          return Date.parse(left.createdAt) - Date.parse(right.createdAt);
        }
        if (filters.sort === "required_soonest") {
          return Date.parse(left.requiredAt) - Date.parse(right.requiredAt);
        }
        if (filters.sort === "highest_urgency") {
          return urgencyRank[right.urgency] - urgencyRank[left.urgency];
        }
        return Date.parse(right.createdAt) - Date.parse(left.createdAt);
      });
  }, [allRequests, filters]);

  const handleAction = (
    request: BloodBankRequest,
    action: BloodBankRequestAction,
  ) => {
    setActiveRequestId(request.id);
    setFeedback(null);

    transitionMutation.mutate(
      { requestId: request.id, action },
      {
        onSuccess: (updated) => {
          setActiveRequestId(null);
          setFeedback({
            message: `Request ${updated.id} is now ${updated.status}.`,
            tone: "success",
          });
        },
        onError: (error) => {
          setActiveRequestId(null);
          setFeedback({
            message: error.message,
            tone: "error",
          });
        },
      },
    );
  };

  return (
    <BloodBankPageFrame
      breadcrumbs={[
        { label: t("healthcare.bloodBank"), href: "/blood-bank/dashboard" },
        { label: t("nav.requestQueue") },
      ]}
      title={t("nav.requestQueue")}
      description={t("bloodBank.queueDescription")}
    >
      {previewState === "permission" ? (
        <PermissionState
          title={t("bloodBank.queuePermissionTitle")}
          description={t("bloodBank.queuePermissionDescription")}
        />
      ) : previewState === "loading" || requestsQuery.isPending ? (
        <LoadingState label={t("bloodBank.loadingIncomingRequests")} rows={8} />
      ) : previewState === "error" || requestsQuery.isError ? (
        <ErrorState
          title={t("bloodBank.queueLoadErrorTitle")}
          description={t("bloodBank.queueLoadErrorDescription")}
          onRetry={() => void requestsQuery.refetch()}
        />
      ) : (
        <div className="space-y-4">
          {/* Operational Dispatch Cadence Tiles */}
          <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-5">
            {/* Tile 1: Total Active */}
            <button
              type="button"
              onClick={() =>
                setFilters((prev) => ({
                  ...prev,
                  status: "all",
                  urgency: "all",
                }))
              }
              className={`flex flex-col justify-between rounded-md border p-3 text-start transition-colors ${
                filters.status === "all" && filters.urgency === "all"
                  ? "border-primary bg-primary/5 ring-1 ring-primary/30"
                  : "border-border bg-surface hover:border-border-hover hover:bg-surface-subtle"
              }`}
            >
              <div className="flex items-center justify-between gap-2 text-xs font-medium text-muted-foreground">
                <span>{t("bloodBank.queueActiveRequisitions", "Active in Queue")}</span>
                <Layers aria-hidden="true" className="size-3.5 text-primary" />
              </div>
              <span className="mt-1.5 text-xl font-bold tracking-tight text-foreground tabular-nums">
                {telemetry.activeCount}
              </span>
            </button>

            {/* Tile 2: STAT Emergency */}
            <button
              type="button"
              onClick={() =>
                setFilters((prev) => ({
                  ...prev,
                  urgency: prev.urgency === "emergency" ? "all" : "emergency",
                  status: "all",
                }))
              }
              className={`flex flex-col justify-between rounded-md border p-3 text-start transition-colors ${
                filters.urgency === "emergency"
                  ? "border-destructive bg-destructive/10 ring-1 ring-destructive/40"
                  : "border-border bg-surface hover:border-destructive/40 hover:bg-destructive/[0.03]"
              }`}
            >
              <div className="flex items-center justify-between gap-2 text-xs font-semibold text-destructive">
                <span>{t("bloodBank.queueStatEmergency", "STAT Emergency")}</span>
                <AlertTriangle aria-hidden="true" className="size-3.5" />
              </div>
              <span className="mt-1.5 text-xl font-bold tracking-tight text-destructive tabular-nums">
                {telemetry.emergencyCount}
              </span>
            </button>

            {/* Tile 3: Urgent */}
            <button
              type="button"
              onClick={() =>
                setFilters((prev) => ({
                  ...prev,
                  urgency: prev.urgency === "urgent" ? "all" : "urgent",
                  status: "all",
                }))
              }
              className={`flex flex-col justify-between rounded-md border p-3 text-start transition-colors ${
                filters.urgency === "urgent"
                  ? "border-amber-600 bg-amber-500/15 ring-1 ring-amber-500/40"
                  : "border-border bg-surface hover:border-amber-500/40 hover:bg-amber-500/[0.03]"
              }`}
            >
              <div className="flex items-center justify-between gap-2 text-xs font-medium text-amber-700 dark:text-amber-400">
                <span>{t("bloodBank.queueUrgentTriage", "Urgent Triage")}</span>
                <AlarmClock aria-hidden="true" className="size-3.5" />
              </div>
              <span className="mt-1.5 text-xl font-bold tracking-tight text-amber-700 dark:text-amber-400 tabular-nums">
                {telemetry.urgentCount}
              </span>
            </button>

            {/* Tile 4: Needs Allocation */}
            <button
              type="button"
              onClick={() =>
                setFilters((prev) => ({
                  ...prev,
                  status: prev.status === "submitted" ? "all" : "submitted",
                  urgency: "all",
                }))
              }
              className={`flex flex-col justify-between rounded-md border p-3 text-start transition-colors ${
                filters.status === "submitted"
                  ? "border-secondary-foreground bg-secondary ring-1 ring-secondary-foreground/30"
                  : "border-border bg-surface hover:border-border-hover hover:bg-surface-subtle"
              }`}
            >
              <div className="flex items-center justify-between gap-2 text-xs font-medium text-muted-foreground">
                <span>{t("bloodBank.queueNeedsAllocation", "Needs Allocation")}</span>
                <PackageOpen aria-hidden="true" className="size-3.5 text-secondary-foreground" />
              </div>
              <span className="mt-1.5 text-xl font-bold tracking-tight text-foreground tabular-nums">
                {telemetry.needsAllocationCount}
              </span>
            </button>

            {/* Tile 5: Preparing & Ready */}
            <button
              type="button"
              onClick={() =>
                setFilters((prev) => ({
                  ...prev,
                  status: prev.status === "preparing" ? "all" : "preparing",
                  urgency: "all",
                }))
              }
              className={`flex flex-col justify-between rounded-md border p-3 text-start transition-colors col-span-2 sm:col-span-1 ${
                filters.status === "preparing"
                  ? "border-success bg-success/10 ring-1 ring-success/40"
                  : "border-border bg-surface hover:border-success/40 hover:bg-success/[0.03]"
              }`}
            >
              <div className="flex items-center justify-between gap-2 text-xs font-medium text-success">
                <span>{t("bloodBank.queueReadyOrPreparing", "Preparing & Ready")}</span>
                <PackageCheck aria-hidden="true" className="size-3.5" />
              </div>
              <span className="mt-1.5 text-xl font-bold tracking-tight text-success tabular-nums">
                {telemetry.readyOrPreparingCount}
              </span>
            </button>
          </div>

          {/* Feedback Transaction Receipt Banner */}
          {feedback ? (
            <div
              role={feedback.tone === "error" ? "alert" : "status"}
              className={`flex items-center justify-between gap-3 rounded-md border px-4 py-2.5 text-xs font-medium shadow-xs animate-in fade-in-50 duration-150 ${
                feedback.tone === "error"
                  ? "border-destructive/30 bg-emergency-subtle text-destructive"
                  : "border-success/30 bg-success-subtle text-success"
              }`}
            >
              <div className="flex items-center gap-2">
                {feedback.tone === "error" ? (
                  <AlertTriangle aria-hidden="true" className="size-4 shrink-0" />
                ) : (
                  <CheckCircle2 aria-hidden="true" className="size-4 shrink-0" />
                )}
                <span>{feedback.message}</span>
              </div>
              <button
                type="button"
                onClick={() => setFeedback(null)}
                className="text-muted-foreground hover:text-foreground"
                aria-label={t("common.dismiss", "Dismiss")}
              >
                <X aria-hidden="true" className="size-3.5" />
              </button>
            </div>
          ) : null}

          {/* Filter Bar with Command Hierarchy */}
          <RequestQueueFilters
            value={filters}
            onChange={setFilters}
            resultCount={filteredRequests.length}
            totalCount={allRequests.length}
          />

          {/* Clinical Dispatch Ledger Table */}
          {filteredRequests.length === 0 ? (
            <EmptyState
              title={t("common.noRecordsTitle")}
              description={t("common.noRecordsDesc")}
            />
          ) : (
            <RequestQueueTable
              requests={filteredRequests}
              activeRequestId={activeRequestId ?? undefined}
              onAction={handleAction}
            />
          )}
        </div>
      )}
    </BloodBankPageFrame>
  );
}
