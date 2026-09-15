import { Plus } from "lucide-react";
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link, useSearchParams } from "react-router-dom";

import { HospitalPageFrame } from "@/features/hospital/components/hospital-page-frame";
import { useHospitalRequests } from "@/features/hospital/hooks/use-hospital-requests";
import { RequestFilters } from "@/features/hospital/requests/request-filters";
import { RequestTable } from "@/features/hospital/requests/request-table";
import {
  bloodComponentLabels,
  type RequestFilters as RequestFilterValues,
} from "@/features/hospital/types/hospital.types";
import {
  EmptyState,
  ErrorState,
  LoadingState,
  PermissionState,
} from "@/shared/components/feedback/system-states";
import { Button } from "@/shared/components/ui/button";

const initialFilters: RequestFilterValues = {
  search: "",
  status: "all",
  urgency: "all",
  bloodGroup: "all",
  sort: "newest",
};

export function RequestListPage() {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const state = searchParams.get("state");
  const requestsQuery = useHospitalRequests();
  const [filters, setFilters] = useState(initialFilters);

  const filteredRequests = useMemo(() => {
    const query = filters.search.trim().toLowerCase();
    const requests = state === "empty" ? [] : [...(requestsQuery.data ?? [])];

    return requests
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
  }, [filters, requestsQuery.data, state]);

  return (
    <HospitalPageFrame
      breadcrumbs={[
        { label: t("healthcare.hospital"), href: "/hospital/dashboard" },
        { label: t("nav.bloodRequests") },
      ]}
      title={t("nav.bloodRequests")}
      description={t("hospital.createRequestDescription")}
      actions={
        <Button asChild>
          <Link to="/hospital/requests/create">
            <Plus aria-hidden="true" />
            {t("hospital.createRequest")}
          </Link>
        </Button>
      }
    >
      {state === "permission" ? (
        <PermissionState
          title={t("hospital.permissionTitle")}
          description={t("hospital.permissionDescription")}
        />
      ) : state === "loading" || requestsQuery.isPending ? (
        <LoadingState label={t("hospital.loadingRequests")} rows={7} />
      ) : state === "error" || requestsQuery.isError ? (
        <ErrorState
          title={t("hospital.requestsLoadErrorTitle")}
          description={t("hospital.requestsLoadErrorDescription")}
          onRetry={() => void requestsQuery.refetch()}
        />
      ) : (
        <div className="space-y-4">
          <RequestFilters
            value={filters}
            onChange={setFilters}
            resultCount={filteredRequests.length}
          />
          {filteredRequests.length === 0 ? (
            <EmptyState
              title={t("common.noRecordsTitle")}
              description={t("common.noRecordsDesc")}
              action={
                <Button asChild variant="secondary">
                  <Link to="/hospital/requests/create">
                    {t("hospital.createRequest")}
                  </Link>
                </Button>
              }
            />
          ) : (
            <RequestTable requests={filteredRequests} />
          )}
        </div>
      )}
    </HospitalPageFrame>
  );
}
