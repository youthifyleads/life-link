import {
  CheckCircle2,
  ExternalLink,
  Filter,
  HeartHandshake,
  Search,
  XCircle,
} from "lucide-react";
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";

import { DonorPageFrame } from "@/features/donor/components/donor-page-frame";
import {
  useDonationRequests,
  useRespondToDonationRequest,
} from "@/features/donor/hooks/use-donor";
import type {
  DonationResponseStatus,
} from "@/features/donor/types/donor.types";
import { BloodGroupBadge } from "@/shared/components/clinical/blood-group-badge";
import { UrgencyBadge } from "@/shared/components/clinical/urgency-badge";
import {
  EmptyState,
  ErrorState,
  LoadingState,
} from "@/shared/components/feedback/system-states";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";

export function DonorRequestsPage() {
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState("");
  const [urgencyFilter, setUrgencyFilter] = useState("all");
  const [responseFilter, setResponseFilter] = useState("all");

  const requestsQuery = useDonationRequests();
  const respondMutation = useRespondToDonationRequest();

  const filteredRequests = useMemo(() => {
    const list = requestsQuery.data ?? [];
    return list.filter((r) => {
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const match =
          r.reference.toLowerCase().includes(q) ||
          r.requestingOrg.name.toLowerCase().includes(q) ||
          r.clinicalContextSafe.toLowerCase().includes(q) ||
          r.location.toLowerCase().includes(q);
        if (!match) return false;
      }
      if (urgencyFilter !== "all" && r.urgency !== urgencyFilter) {
        return false;
      }
      if (responseFilter !== "all" && r.myResponse !== responseFilter) {
        return false;
      }
      return true;
    });
  }, [requestsQuery.data, searchQuery, urgencyFilter, responseFilter]);

  const handleQuickRespond = (
    id: string,
    response: DonationResponseStatus,
    e: React.MouseEvent,
  ) => {
    e.preventDefault();
    e.stopPropagation();
    respondMutation.mutate({ id, response });
  };

  return (
    <DonorPageFrame
      breadcrumbs={[
        { label: t("nav.donorServices", "Donor services"), href: "/donor/dashboard" },
        { label: t("nav.donationRequests", "Donation requests") },
      ]}
      title={t("donor.appealsTitle", "Donation Requests")}
      description={t(
        "donor.appealsDescription",
        "Active community blood and platelet shortage calls from certified healthcare facilities in your region.",
      )}
    >
      <div className="space-y-6">
        {/* Filter Controls Bar */}
        <div className="flex flex-col gap-4 border border-border bg-surface p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative flex-1 min-w-[16rem]">
            <Search
              aria-hidden="true"
              className="pointer-events-none absolute start-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
            />
            <Input
              type="search"
              aria-label={t("common.search", "Search donation requests")}
              placeholder={t("hospital.searchPlaceholder", "Search by request reference, hospital name, or department…")}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-10 ps-9 text-xs"
            />
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-1.5">
              <Filter className="size-3.5 text-muted-foreground" />
              <span className="text-xs font-medium text-muted-foreground">
                {t("common.urgency", "Urgency")}:
              </span>
              <select
                aria-label={t("common.urgency", "Filter by urgency")}
                value={urgencyFilter}
                onChange={(e) => setUrgencyFilter(e.target.value)}
                className="h-9 rounded-md border border-input bg-background px-2.5 text-xs text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <option value="all">{t("hospital.allUrgencies", "All Urgencies")}</option>
                <option value="emergency">{t("urgency.emergency", "Emergency")}</option>
                <option value="urgent">{t("urgency.urgent", "Urgent")}</option>
                <option value="routine">{t("urgency.routine", "Routine")}</option>
              </select>
            </div>

            <div className="flex items-center gap-1.5">
              <span className="text-xs font-medium text-muted-foreground">
                {t("common.status", "My Response")}:
              </span>
              <select
                aria-label={t("common.status", "Filter by response status")}
                value={responseFilter}
                onChange={(e) => setResponseFilter(e.target.value)}
                className="h-9 rounded-md border border-input bg-background px-2.5 text-xs text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <option value="all">{t("common.allStatuses", "All Statuses")}</option>
                <option value="pending">{t("status.pending", "Pending")}</option>
                <option value="interested">{t("status.confirmed", "Interested")}</option>
                <option value="declined">{t("status.rejected", "Declined")}</option>
              </select>
            </div>
          </div>
        </div>

        {/* Requests Table / Cards */}
        {requestsQuery.isPending ? (
          <LoadingState label={t("common.loadingRecords", "Loading donation requests…")} />
        ) : requestsQuery.isError ? (
          <ErrorState
            title={t("common.error", "Could not load donation requests")}
            description={t("donor.requestsLoadErrorDescription")}
            onRetry={() => {
              void requestsQuery.refetch();
            }}
          />
        ) : filteredRequests.length === 0 ? (
          <EmptyState
            title={t("hospital.noRecordsTitle", "No donation requests match your filters")}
            description={t("hospital.noRecordsDesc", "Try adjusting your search criteria or checking back later for new shortage calls.")}
            action={
              <Button
                variant="secondary"
                size="sm"
                onClick={() => {
                  setSearchQuery("");
                  setUrgencyFilter("all");
                  setResponseFilter("all");
                }}
              >
                {t("common.reset", "Reset Filters")}
              </Button>
            }
          />
        ) : (
          <div className="space-y-4">
            {filteredRequests.map((req) => (
              <article
                key={req.id}
                className="border border-border bg-surface p-5 transition-colors hover:border-primary/50 sm:p-6"
              >
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div className="space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono text-xs font-bold text-foreground">
                        <bdi dir="ltr">{req.reference}</bdi>
                      </span>
                      <BloodGroupBadge group={req.bloodGroup} />
                      <UrgencyBadge urgency={req.urgency} />
                      <span className="rounded bg-muted px-2 py-0.5 text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
                        {req.component.replace("_", " ")}
                      </span>
                      {req.myResponse === "interested" ? (
                        <span className="inline-flex items-center gap-1 rounded bg-blue-500/10 px-2 py-0.5 text-[11px] font-semibold text-blue-700 dark:text-blue-300">
                          <CheckCircle2 className="size-3" aria-hidden="true" />
                          {t("status.confirmed", "Interested / Accepted")}
                        </span>
                      ) : req.myResponse === "declined" ? (
                        <span className="inline-flex items-center gap-1 rounded bg-destructive/10 px-2 py-0.5 text-[11px] font-semibold text-destructive">
                          <XCircle className="size-3" aria-hidden="true" />
                          {t("status.rejected", "Declined")}
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded bg-muted px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
                          {t("status.pending", "Pending Response")}
                        </span>
                      )}
                    </div>

                    <h3 className="text-base font-semibold text-foreground">
                      {req.requestingOrg.name}
                    </h3>

                    <p className="text-xs text-muted-foreground">
                      <strong className="text-foreground">{t("hospital.clinicalIndication", "Clinical Purpose")}:</strong>{" "}
                      {req.clinicalContextSafe} · {t("hospital.created", "Requested on")}{" "}
                      <bdi dir="ltr">{req.requestDate}</bdi> · {t("hospital.requiredBy", "Target")}:{" "}
                      <strong className="text-foreground">
                        <bdi dir="ltr">{req.requiredByDate}</bdi>
                      </strong>
                    </p>

                    <p className="text-xs text-muted-foreground">
                      <strong className="text-foreground">{t("common.facility", "Donation Facility")}:</strong>{" "}
                      {req.location}
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-wrap items-center gap-2 shrink-0 pt-2 lg:pt-0">
                    {req.myResponse !== "interested" ? (
                      <Button
                        size="sm"
                        disabled={respondMutation.isPending}
                        onClick={(e) =>
                          handleQuickRespond(req.id, "interested", e)
                        }
                        className="gap-1.5"
                      >
                        <HeartHandshake className="size-3.5" aria-hidden="true" />
                        <span>{t("donor.commitDonation", "I'm Interested")}</span>
                      </Button>
                    ) : (
                      <Button
                        variant="secondary"
                        size="sm"
                        disabled={respondMutation.isPending}
                        onClick={(e) =>
                          handleQuickRespond(req.id, "declined", e)
                        }
                        className="gap-1.5"
                      >
                        <XCircle className="size-3.5" aria-hidden="true" />
                        <span>{t("common.cancel", "Decline")}</span>
                      </Button>
                    )}

                    <Button asChild variant="secondary" size="sm">
                      <Link to={`/donor/requests/${req.id}`} className="gap-1.5">
                        <span>{t("common.viewDetails", "View Details")}</span>
                        <ExternalLink className="size-3.5 rtl:rotate-180" aria-hidden="true" />
                      </Link>
                    </Button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </DonorPageFrame>
  );
}

export default DonorRequestsPage;
