import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import {
  Activity,
  ExternalLink,
  Eye,
  RefreshCw,
  Search,
} from "lucide-react";

import type { UserRole } from "@/features/authentication/model/auth.types";
import { ActivityResultBadge } from "@/features/notifications/components/notification-badges";
import {
  formatDate,
  formatDateTime,
  formatTimeShort,
  getLocalizedRoleName,
} from "@/features/notifications/components/notifications-formatters";
import { WorkflowEventSimulator } from "@/features/notifications/components/workflow-event-simulator";
import {
  useActivityTimeline,
  useEventBusListener,
} from "@/features/notifications/hooks/use-notifications";
import type {
  ActivityEvent,
  ActivityResult,
} from "@/features/notifications/types/notifications.types";
import {
  EmptyState,
  ErrorState,
  LoadingState,
} from "@/shared/components/feedback/system-states";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog";
import { Input } from "@/shared/components/ui/input";

export function ActivityPage() {
  const { t } = useTranslation();
  useEventBusListener();

  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<UserRole | "all">("all");
  const [resultFilter, setResultFilter] = useState<ActivityResult | "all">("all");
  const [timeRange, setTimeRange] = useState<"all" | "today" | "week" | "month">("all");
  const [selectedEvent, setSelectedEvent] = useState<ActivityEvent | null>(null);

  const activityQuery = useActivityTimeline({
    search: search || undefined,
    role: roleFilter !== "all" ? roleFilter : undefined,
    result: resultFilter !== "all" ? resultFilter : undefined,
    timeRange: timeRange !== "all" ? timeRange : undefined,
  });

  const events = activityQuery.data ?? [];

  const handleResetFilters = () => {
    setSearch("");
    setRoleFilter("all");
    setResultFilter("all");
    setTimeRange("all");
  };

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8 text-start">
      {/* Header & Breadcrumbs */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-border pb-6">
        <div>
          <nav className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1">
            <Link to="/" className="hover:underline">
              {t("nav.workspace", "Workspace")}
            </Link>
            <span className="rtl:rotate-180">/</span>
            <span className="text-foreground font-medium">
              {t("activity.ledgerTitle", "System Activity Ledger")}
            </span>
          </nav>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              {t("activity.ledgerTitle", "System Activity Ledger")}
            </h1>
            <Badge variant="secondary" className="text-xs">
              <bdi dir="ltr">{events.length}</bdi>{" "}
              {t("activity.eventsLogged", {
                count: events.length,
                defaultValue: "Events Logged",
              })}
            </Badge>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            {t(
              "activity.ledgerSubtitle",
              "Immutable, cross-role audit trail documenting clinical requisitions, unit allocations, dispatches, and governance events.",
            )}
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <WorkflowEventSimulator />
          <Link to="/notifications">
            <Button variant="secondary" size="sm" className="gap-1.5 text-xs">
              <Activity className="size-3.5" />
              <span>
                {t("activity.notificationCenterAction", "Notification Center")}
              </span>
            </Button>
          </Link>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-12 rounded-lg border border-border bg-card p-3 shadow-sm">
        <div className="relative lg:col-span-5">
          <Search className="absolute start-3 top-2.5 size-4 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t(
              "activity.searchPlaceholder",
              "Search by actor, action, entity, organization...",
            )}
            className="ps-9 h-9 text-xs text-start"
            id="activity-search-input"
          />
        </div>

        <div className="lg:col-span-3">
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value as UserRole | "all")}
            className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-ring text-start"
            aria-label={t("activity.filterByRole", "Filter by actor role")}
            id="activity-role-filter"
          >
            <option value="all">{t("activity.allRoles", "All Roles")}</option>
            <option value="hospital_staff">
              {getLocalizedRoleName("hospital_staff")}
            </option>
            <option value="blood_bank_staff">
              {getLocalizedRoleName("blood_bank_staff")}
            </option>
            <option value="donor">{getLocalizedRoleName("donor")}</option>
            <option value="caregiver">{getLocalizedRoleName("caregiver")}</option>
            <option value="admin">{getLocalizedRoleName("admin")}</option>
          </select>
        </div>

        <div className="lg:col-span-2">
          <select
            value={resultFilter}
            onChange={(e) => setResultFilter(e.target.value as ActivityResult | "all")}
            className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-ring text-start"
            aria-label={t("activity.filterByResult", "Filter by result")}
            id="activity-result-filter"
          >
            <option value="all">{t("activity.allResults", "All Results")}</option>
            <option value="success">{t("activity.resultSuccess", "Success")}</option>
            <option value="warning">{t("activity.resultWarning", "Warning")}</option>
            <option value="failure">{t("activity.resultFailure", "Failure")}</option>
          </select>
        </div>

        <div className="lg:col-span-2 flex items-center gap-2">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value as "all" | "today" | "week" | "month")}
            className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-ring text-start"
            aria-label={t("activity.filterByTime", "Filter by time range")}
            id="activity-time-filter"
          >
            <option value="all">{t("activity.allTime", "All Time")}</option>
            <option value="today">{t("activity.past24h", "Past 24h")}</option>
            <option value="week">{t("activity.past7days", "Past 7 Days")}</option>
            <option value="month">{t("activity.past30days", "Past 30 Days")}</option>
          </select>

          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-9 w-9 shrink-0"
            title={t("common.reset", "Reset filters")}
            onClick={handleResetFilters}
          >
            <RefreshCw className="size-4 text-muted-foreground" />
          </Button>
        </div>
      </div>

      {/* Ledger Table */}
      <div className="mt-6">
        {activityQuery.isLoading ? (
          <LoadingState label={t("activity.loadingLedger", "Loading system activity ledger")} />
        ) : activityQuery.isError ? (
          <ErrorState
            title={t("activity.failedToLoadLedger", "Failed to load activity ledger")}
            description={t(
              "activity.failedToLoadLedgerDesc",
              "An error occurred while retrieving system activity events.",
            )}
            onRetry={() => void activityQuery.refetch()}
          />
        ) : events.length === 0 ? (
          <EmptyState
            title={t("activity.noEventsFound", "No activity events found")}
            description={t(
              "activity.noEventsFoundDesc",
              "No system events match your specified filter parameters.",
            )}
            action={
              <Button variant="secondary" size="sm" onClick={handleResetFilters}>
                {t("common.reset", "Reset filters")}
              </Button>
            }
          />
        ) : (
          <div className="rounded-lg border border-border bg-card shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-start text-xs border-collapse">
                <thead>
                  <tr className="border-b border-border bg-muted/40 text-muted-foreground font-semibold uppercase tracking-wider text-[11px]">
                    <th scope="col" className="py-3 px-4 text-start">
                      {t("activity.colTimestamp", "Timestamp")}
                    </th>
                    <th scope="col" className="py-3 px-4 text-start">
                      {t("activity.colActorOrg", "Actor & Organization")}
                    </th>
                    <th scope="col" className="py-3 px-4 text-start">
                      {t("activity.colAction", "Action")}
                    </th>
                    <th scope="col" className="py-3 px-4 text-start">
                      {t("activity.colTargetEntity", "Target Entity")}
                    </th>
                    <th scope="col" className="py-3 px-4 text-start">
                      {t("activity.colResult", "Result")}
                    </th>
                    <th scope="col" className="py-3 px-4 text-end">
                      {t("activity.colInspect", "Inspect")}
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border font-normal">
                  {events.map((event) => (
                    <tr
                      key={event.id}
                      className="hover:bg-muted/20 transition-colors"
                    >
                      <td className="py-3.5 px-4 whitespace-nowrap text-muted-foreground text-[11px]">
                        <div>{formatDate(event.timestamp)}</div>
                        <div className="text-[10px] font-medium text-muted-foreground">
                          {formatTimeShort(event.timestamp)}
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-foreground">
                          {event.actor.name}
                        </div>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <span className="text-[10px] text-muted-foreground rounded bg-muted px-1.5 py-0.2">
                            {getLocalizedRoleName(event.actor.role)}
                          </span>
                          <span className="text-[11px] text-muted-foreground truncate max-w-40">
                            {event.organization}
                          </span>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 max-w-xs">
                        <p className="text-foreground leading-relaxed">
                          {event.action}
                        </p>
                      </td>

                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className="font-mono text-xs font-semibold text-foreground">
                          <bdi dir="ltr">{event.entityId}</bdi>
                        </span>
                        <div className="text-[10px] text-muted-foreground">
                          {event.entityType}
                        </div>
                      </td>

                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <ActivityResultBadge result={event.result} />
                      </td>

                      <td className="py-3.5 px-4 text-end whitespace-nowrap">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 gap-1 text-xs"
                          onClick={() => setSelectedEvent(event)}
                        >
                          <Eye className="size-3.5" />
                          <span>{t("activity.btnDetails", "Details")}</span>
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Event Details Dialog */}
      <Dialog open={!!selectedEvent} onOpenChange={(open) => !open && setSelectedEvent(null)}>
        {selectedEvent ? (
          <DialogContent className="max-w-xl text-start">
            <DialogHeader className="text-start">
              <div className="flex items-center gap-2 mb-1">
                <span className="font-mono text-xs text-muted-foreground">
                  <bdi dir="ltr">{selectedEvent.id}</bdi>
                </span>
                <ActivityResultBadge result={selectedEvent.result} />
              </div>
              <DialogTitle className="text-lg">
                {selectedEvent.action}
              </DialogTitle>
              <DialogDescription className="text-start">
                {t("activity.recordedAt", {
                  time: formatDateTime(selectedEvent.timestamp),
                  defaultValue: `Recorded at ${formatDateTime(selectedEvent.timestamp)}`,
                })}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 pt-2 text-xs">
              <div className="grid grid-cols-2 gap-3 rounded-lg border border-border bg-muted/20 p-3.5">
                <div>
                  <span className="text-muted-foreground font-medium">
                    {t("activity.actorLabel", "Actor:")}
                  </span>
                  <p className="font-semibold text-foreground mt-0.5">
                    {selectedEvent.actor.name}
                  </p>
                  <p className="text-muted-foreground text-[11px]">
                    {getLocalizedRoleName(selectedEvent.actor.role)}
                  </p>
                </div>
                <div>
                  <span className="text-muted-foreground font-medium">
                    {t("activity.organizationLabel", "Organization:")}
                  </span>
                  <p className="font-semibold text-foreground mt-0.5">
                    {selectedEvent.organization}
                  </p>
                </div>
              </div>

              <div className="rounded-lg border border-border p-3.5 space-y-2">
                <div>
                  <span className="text-muted-foreground font-medium">
                    {t("activity.targetEntityLabel", "Target Entity:")}
                  </span>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="font-mono text-xs font-semibold text-foreground">
                      <bdi dir="ltr">{selectedEvent.entityId}</bdi>
                    </span>
                    <Badge variant="secondary" className="text-[10px]">
                      {selectedEvent.entityType}
                    </Badge>
                  </div>
                </div>

                {selectedEvent.details ? (
                  <div className="pt-2 border-t border-border">
                    <span className="text-muted-foreground font-medium">
                      {t("activity.eventDescLabel", "Event Description:")}
                    </span>
                    <p className="mt-1 text-foreground leading-relaxed">
                      {selectedEvent.details}
                    </p>
                  </div>
                ) : null}
              </div>

              {selectedEvent.metadata ? (
                <div>
                  <span className="text-muted-foreground font-medium block mb-1">
                    {t("activity.operationalMetadataJson", "Operational Metadata (JSON):")}
                  </span>
                  <pre className="rounded bg-muted p-3 text-[11px] font-mono overflow-x-auto text-foreground text-start" dir="ltr">
                    {JSON.stringify(selectedEvent.metadata, null, 2)}
                  </pre>
                </div>
              ) : null}

              {selectedEvent.link ? (
                <div className="pt-2 flex justify-end">
                  <Link to={selectedEvent.link} onClick={() => setSelectedEvent(null)}>
                    <Button size="sm" className="gap-1.5 text-xs">
                      <span>{t("activity.navigateToEntity", "Navigate to Related Entity")}</span>
                      <ExternalLink className="size-3.5 rtl:rotate-180" />
                    </Button>
                  </Link>
                </div>
              ) : null}
            </div>
          </DialogContent>
        ) : null}
      </Dialog>
    </div>
  );
}
