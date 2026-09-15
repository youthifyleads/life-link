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

  const filteredRequests = useMemo(() => {
    const query = filters.search.trim().toLowerCase();
    const source =
      previewState === "empty" ? [] : [...(requestsQuery.data ?? [])];

    return source
      .filter(
        (request) =>
          !query ||
          request.id.toLowerCase().includes(query) ||
          request.hospital.name.toLowerCase().includes(query) ||
          request.hospital.facilityCode.toLowerCase().includes(query) ||
          bloodBankComponentLabels[request.component]
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
  }, [filters, previewState, requestsQuery.data]);

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
          {feedback ? (
            <div
              role={feedback.tone === "error" ? "alert" : "status"}
              className={
                feedback.tone === "error"
                  ? "border border-destructive/25 bg-emergency-subtle px-4 py-3 text-sm leading-6 text-[#7a1a13]"
                  : "border border-success/25 bg-success-subtle px-4 py-3 text-sm leading-6 text-success"
              }
            >
              {feedback.message}
            </div>
          ) : null}

          <RequestQueueFilters
            value={filters}
            onChange={setFilters}
            resultCount={filteredRequests.length}
          />

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
