import { ArrowRight } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";

import { formatBloodBankStatus } from "@/features/blood-bank/components/blood-bank-formatters";
import { BloodBankPageFrame } from "@/features/blood-bank/components/blood-bank-page-frame";
import { BloodBankDashboardKpi } from "@/features/blood-bank/dashboard/dashboard-kpi";
import {
  useBloodBankOperationalSnapshot,
  useBloodBankRequests,
} from "@/features/blood-bank/hooks/use-blood-bank-requests";
import { RequestQueueTable } from "@/features/blood-bank/requests/request-queue-table";
import type { BloodBankQueueStatus } from "@/features/blood-bank/types/blood-bank.types";
import {
  ErrorState,
  LoadingState,
} from "@/shared/components/feedback/system-states";
import { Button } from "@/shared/components/ui/button";

const overviewStatuses: BloodBankQueueStatus[] = [
  "submitted",
  "acknowledged",
  "confirmed",
  "preparing",
  "completed",
  "cancelled",
];

const terminalStatuses: BloodBankQueueStatus[] = [
  "completed",
  "cancelled",
  "rejected",
];

export function BloodBankDashboardPage() {
  const { t } = useTranslation();
  const requestsQuery = useBloodBankRequests();
  const snapshotQuery = useBloodBankOperationalSnapshot();
  const requests = requestsQuery.data ?? [];

  const completed = requests.filter(
    (request) => request.status === "completed",
  ).length;
  const pending = requests.filter(
    (request) => !terminalStatuses.includes(request.status),
  ).length;
  const urgent = requests.filter(
    (request) =>
      (request.urgency === "urgent" || request.urgency === "emergency") &&
      !terminalStatuses.includes(request.status),
  ).length;

  const isPending = requestsQuery.isPending || snapshotQuery.isPending;
  const isError = requestsQuery.isError || snapshotQuery.isError;

  return (
    <BloodBankPageFrame
      breadcrumbs={[
        { label: t("healthcare.bloodBank"), href: "/blood-bank/dashboard" },
        { label: t("bloodBank.operations") },
      ]}
      title={t("bloodBank.operations")}
      description={t("bloodBank.operationsDesc")}
      actions={
        <Button asChild>
          <Link to="/blood-bank/requests">
            {t("bloodBank.openQueue")}
            <ArrowRight aria-hidden="true" className="size-4 rtl:rotate-180" />
          </Link>
        </Button>
      }
    >
      {isPending ? (
        <LoadingState label={t("bloodBank.loadingOperations")} rows={6} />
      ) : isError ? (
        <ErrorState
          title={t("bloodBank.operationsLoadErrorTitle")}
          description={t("bloodBank.operationsLoadErrorDescription")}
          onRetry={() => {
            void requestsQuery.refetch();
            void snapshotQuery.refetch();
          }}
        />
      ) : (
        <div className="space-y-9">
          <BloodBankDashboardKpi
            availableUnits={snapshotQuery.data?.availableBloodUnits ?? 0}
            pending={pending}
            urgent={urgent}
            completed={completed}
          />

          <section aria-labelledby="blood-bank-status-overview-title">
            <div className="mb-3">
              <h2
                id="blood-bank-status-overview-title"
                className="text-lg font-semibold"
              >
                {t("bloodBank.queueOverview")}
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                {t("bloodBank.queueOverviewDesc")}
              </p>
            </div>
            <dl className="grid grid-cols-2 gap-px border border-border bg-border md:grid-cols-3 xl:grid-cols-6">
              {overviewStatuses.map((status) => (
                <div key={status} className="bg-surface px-4 py-4">
                  <dt className="text-xs font-medium text-muted-foreground">
                    {formatBloodBankStatus(status)}
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

          <section aria-labelledby="recent-incoming-requests-title">
            <div className="mb-3 flex flex-wrap items-end justify-between gap-3">
              <div>
                <h2
                  id="recent-incoming-requests-title"
                  className="text-lg font-semibold"
                >
                  {t("bloodBank.incomingQueue")}
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  {t("bloodBank.incomingQueueDesc")}
                </p>
              </div>
              <Button asChild variant="ghost" size="sm">
                <Link to="/blood-bank/requests">
                  {t("bloodBank.openQueue")}
                </Link>
              </Button>
            </div>
            <RequestQueueTable requests={requests.slice(0, 6)} compact />
          </section>
        </div>
      )}
    </BloodBankPageFrame>
  );
}
