import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import {
  Bell,
  Check,
  CheckCheck,
  ExternalLink,
  RefreshCw,
  Search,
  SlidersHorizontal,
} from "lucide-react";

import { useAuth } from "@/features/authentication/model/use-auth";
import type { UserRole } from "@/features/authentication/model/auth.types";
import {
  NotificationPriorityBadge,
  NotificationTypeBadge,
} from "@/features/notifications/components/notification-badges";
import {
  formatDateTime,
  getLocalizedNotificationMessage,
  getLocalizedNotificationTitle,
  getLocalizedRoleName,
  getLocalizedSourceModuleName,
} from "@/features/notifications/components/notifications-formatters";
import { WorkflowEventSimulator } from "@/features/notifications/components/workflow-event-simulator";
import {
  useEventBusListener,
  useMarkAllNotificationsRead,
  useMarkNotificationRead,
  useNotifications,
} from "@/features/notifications/hooks/use-notifications";
import type {
  NotificationPriority,
  NotificationType,
} from "@/features/notifications/types/notifications.types";
import {
  EmptyState,
  ErrorState,
  LoadingState,
} from "@/shared/components/feedback/system-states";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";

export function NotificationsPage() {
  const { t, i18n } = useTranslation();
  const isAr = i18n.language.startsWith("ar");
  const { user } = useAuth();
  useEventBusListener();

  const userRole = user?.primary_role;
  const isAdmin = userRole === "admin";

  const [search, setSearch] = useState("");
  const [unreadOnly, setUnreadOnly] = useState(false);
  const [typeFilter, setTypeFilter] = useState<NotificationType | "all">("all");
  const [priorityFilter, setPriorityFilter] = useState<NotificationPriority | "all">("all");
  const [rolePerspective, setRolePerspective] = useState<UserRole | "all">(
    isAdmin ? "admin" : (userRole ?? "hospital_staff"),
  );

  const activeRole: UserRole | undefined = isAdmin
    ? (rolePerspective !== "all" ? rolePerspective : undefined)
    : userRole;

  const notificationsQuery = useNotifications({
    search: search || undefined,
    unreadOnly,
    type: typeFilter !== "all" ? typeFilter : undefined,
    priority: priorityFilter !== "all" ? priorityFilter : undefined,
    roleView: activeRole,
  });

  const markReadMutation = useMarkNotificationRead();
  const markAllMutation = useMarkAllNotificationsRead();

  const notifications = notificationsQuery.data ?? [];
  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const handleMarkAllRead = () => {
    void markAllMutation.mutateAsync(activeRole);
  };

  const handleResetFilters = () => {
    setSearch("");
    setUnreadOnly(false);
    setTypeFilter("all");
    setPriorityFilter("all");
    if (isAdmin) {
      setRolePerspective("admin");
    }
  };

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8 text-start">
      {/* Header & Breadcrumb */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-border pb-6">
        <div>
          <nav className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1">
            <Link to="/" className="hover:underline">
              {t("nav.workspace", "Workspace")}
            </Link>
            <span className="rtl:rotate-180">/</span>
            <span className="text-foreground font-medium">
              {t("notifications.centerTitle", "Notification Center")}
            </span>
          </nav>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              {t("notifications.centerTitle", "Notification Center")}
            </h1>
            {unreadCount > 0 ? (
              <Badge variant="destructive" className="text-xs">
                <bdi dir="ltr">{unreadCount}</bdi>{" "}
                {t("notifications.unreadBadge", "Unread")}
              </Badge>
            ) : (
              <Badge variant="secondary" className="text-xs">
                {t("notifications.allReadBadge", "All Read")}
              </Badge>
            )}
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            {t(
              "notifications.centerSubtitle",
              "Unified multi-role communication layer tracking requests, allocations, custody milestones, and system notices.",
            )}
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <WorkflowEventSimulator />
          <Button
            variant="secondary"
            size="sm"
            onClick={handleMarkAllRead}
            disabled={unreadCount === 0 || markAllMutation.isPending}
            className="gap-1.5 text-xs"
            id="mark-all-read-page-btn"
          >
            <CheckCheck className="size-3.5 rtl:rotate-180" />
            <span>{t("notifications.markAllAsReadAction", "Mark all as read")}</span>
          </Button>
          <Link to="/settings/notifications">
            <Button variant="ghost" size="sm" className="gap-1.5 text-xs">
              <SlidersHorizontal className="size-3.5" />
              <span>{t("notifications.preferencesAction", "Preferences")}</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* Role View Perspectives Bar */}
      <div className="mt-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        {isAdmin ? (
          <div className="flex items-center gap-1.5 overflow-x-auto pb-2 lg:pb-0 text-xs">
            <span className="text-muted-foreground font-medium shrink-0 me-1">
              {t("notifications.roleViewLabel", "Role View:")}
            </span>
            <Button
              type="button"
              size="sm"
              variant={rolePerspective === "admin" ? "default" : "secondary"}
              className="h-7 text-xs rounded-full"
              onClick={() => setRolePerspective("admin")}
            >
              {t("notifications.myInbox", "My Inbox")} ({getLocalizedRoleName("admin")})
            </Button>
            <Button
              type="button"
              size="sm"
              variant={rolePerspective === "all" ? "default" : "secondary"}
              className="h-7 text-xs rounded-full"
              onClick={() => setRolePerspective("all")}
            >
              {t("notifications.allRoles", "All Roles")}
            </Button>
            <Button
              type="button"
              size="sm"
              variant={rolePerspective === "hospital_staff" ? "default" : "secondary"}
              className="h-7 text-xs rounded-full"
              onClick={() => setRolePerspective("hospital_staff")}
            >
              {getLocalizedRoleName("hospital_staff")}
            </Button>
            <Button
              type="button"
              size="sm"
              variant={rolePerspective === "blood_bank_staff" ? "default" : "secondary"}
              className="h-7 text-xs rounded-full"
              onClick={() => setRolePerspective("blood_bank_staff")}
            >
              {getLocalizedRoleName("blood_bank_staff")}
            </Button>
            <Button
              type="button"
              size="sm"
              variant={rolePerspective === "donor" ? "default" : "secondary"}
              className="h-7 text-xs rounded-full"
              onClick={() => setRolePerspective("donor")}
            >
              {getLocalizedRoleName("donor")}
            </Button>
            <Button
              type="button"
              size="sm"
              variant={rolePerspective === "caregiver" ? "default" : "secondary"}
              className="h-7 text-xs rounded-full"
              onClick={() => setRolePerspective("caregiver")}
            >
              {getLocalizedRoleName("caregiver")}
            </Button>
          </div>
        ) : (
          <div className="flex items-center gap-2 pb-2 lg:pb-0 text-xs">
            <span className="text-muted-foreground font-medium">
              {t("notifications.roleViewLabel", "Role View:")}
            </span>
            <Badge variant="secondary" className="text-xs font-medium">
              {getLocalizedRoleName(userRole ?? "")}
            </Badge>
          </div>
        )}

        {/* Unread toggle */}
        <div className="flex items-center gap-2 shrink-0">
          <Button
            type="button"
            size="sm"
            variant={unreadOnly ? "default" : "secondary"}
            className="h-8 gap-1.5 text-xs"
            onClick={() => setUnreadOnly(!unreadOnly)}
            id="toggle-unread-only-btn"
          >
            <Bell className="size-3.5" />
            <span>{t("notifications.unreadOnly", "Unread Only")}</span>
            {unreadCount > 0 ? (
              <span className="ms-1 rounded-full bg-background/20 px-1.5 py-0.2 text-[10px] font-bold">
                <bdi dir="ltr">{unreadCount}</bdi>
              </span>
            ) : null}
          </Button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-12 rounded-lg border border-border bg-card p-3 shadow-sm">
        <div className="relative lg:col-span-6">
          <Search className="absolute start-3 top-2.5 size-4 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t(
              "notifications.searchPlaceholder",
              "Search by title, message, ID (e.g. BR-2026, UNT-...)",
            )}
            className="ps-9 h-9 text-xs text-start"
            id="notification-search-input"
          />
        </div>

        <div className="lg:col-span-3">
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value as NotificationType | "all")}
            className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-ring text-start"
            aria-label={t("notifications.filterByType", "Filter by notification type")}
            id="notification-type-filter"
          >
            <option value="all">{t("notifications.allTypes", "All Types")}</option>
            <option value="request_update">{t("notifications.typeRequestUpdate", "Request Update")}</option>
            <option value="inventory_alert">{t("notifications.typeInventoryAlert", "Inventory Alert")}</option>
            <option value="allocation_update">{t("notifications.typeAllocationUpdate", "Allocation Update")}</option>
            <option value="donation_update">{t("notifications.typeDonationUpdate", "Donation Update")}</option>
            <option value="tracking_update">{t("notifications.typeTrackingUpdate", "Tracking Update")}</option>
            <option value="system_announcement">{t("notifications.typeSystemAnnouncement", "System Announcement")}</option>
          </select>
        </div>

        <div className="lg:col-span-2">
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value as NotificationPriority | "all")}
            className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-ring text-start"
            aria-label={t("notifications.filterByPriority", "Filter by priority")}
            id="notification-priority-filter"
          >
            <option value="all">{t("notifications.allPriorities", "All Priorities")}</option>
            <option value="urgent">{t("notifications.priorityUrgent", "Urgent")}</option>
            <option value="high">{t("notifications.priorityHigh", "High")}</option>
            <option value="normal">{t("notifications.priorityNormal", "Normal")}</option>
            <option value="low">{t("notifications.priorityLow", "Low")}</option>
          </select>
        </div>

        <div className="lg:col-span-1 flex justify-end">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-9 w-9"
            title={t("notifications.resetFilters", "Reset filters")}
            onClick={handleResetFilters}
          >
            <RefreshCw className="size-4 text-muted-foreground" />
          </Button>
        </div>
      </div>

      {/* Notifications List Content */}
      <div className="mt-6">
        {notificationsQuery.isLoading ? (
          <LoadingState label={t("notifications.loadingLedger", "Loading notification ledger")} />
        ) : notificationsQuery.isError ? (
          <ErrorState
            title={t("notifications.failedToLoad", "Failed to load notifications")}
            description={t(
              "notifications.failedToLoadDesc",
              "An error occurred while retrieving your notification records.",
            )}
            onRetry={() => void notificationsQuery.refetch()}
          />
        ) : notifications.length === 0 ? (
          <EmptyState
            title={t("notifications.noNotificationsFound", "No notifications found")}
            description={t(
              "notifications.noNotificationsFoundDesc",
              "There are no records matching your current filter criteria.",
            )}
            action={
              <Button variant="secondary" size="sm" onClick={handleResetFilters}>
                {t("notifications.resetFilters", "Reset filters")}
              </Button>
            }
          />
        ) : (
          <div className="divide-y divide-border rounded-lg border border-border bg-card shadow-sm overflow-hidden">
            {notifications.map((item) => (
              <div
                key={item.id}
                className={`flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between transition-colors hover:bg-muted/30 ${
                  !item.isRead ? "bg-primary/[0.03] dark:bg-primary/[0.06]" : ""
                }`}
              >
                <div className="flex items-start gap-3.5 min-w-0 flex-1">
                  <span
                    className={`mt-1.5 size-2.5 shrink-0 rounded-full ${
                      !item.isRead
                        ? "bg-emergency ring-4 ring-emergency/20"
                        : "bg-muted-foreground/30"
                    }`}
                    aria-hidden="true"
                  />
                  <span className="sr-only">
                    {!item.isRead
                      ? t("notifications.unreadStatus", "Unread")
                      : t("notifications.readStatus", "Read")}
                  </span>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className="font-mono text-[11px] text-muted-foreground">
                        <bdi dir="ltr">{item.id}</bdi>
                      </span>
                      <NotificationPriorityBadge priority={item.priority} />
                      <NotificationTypeBadge type={item.type} />
                      <span className="text-xs text-muted-foreground">
                        • {formatDateTime(item.createdAt)}
                      </span>
                    </div>

                    <h2 className="text-sm font-semibold text-foreground">
                      {getLocalizedNotificationTitle(item)}
                    </h2>

                    <p className="mt-0.5 text-xs text-muted-foreground leading-relaxed">
                      {getLocalizedNotificationMessage(item)}
                    </p>

                    <div className="mt-2 flex items-center gap-3 text-xs text-muted-foreground flex-wrap">
                      {item.relatedEntity.label ? (
                        <span className="inline-flex items-center gap-1 font-mono text-[11px] rounded bg-muted px-2 py-0.5 text-foreground">
                          {t("notifications.targetLabel", "Target")}:{" "}
                          <bdi dir="ltr">{item.relatedEntity.label}</bdi>
                        </span>
                      ) : null}

                      {item.sourceModule ? (
                        <span className="text-[11px] text-muted-foreground">
                          {t("notifications.originLabel", "Origin")}:{" "}
                          {getLocalizedSourceModuleName(item.sourceModule)}
                        </span>
                      ) : null}

                      <span className="text-[11px] text-muted-foreground">
                        {t("notifications.audienceLabel", "Audience")}:{" "}
                        {item.recipientRoles
                          .map((r) => getLocalizedRoleName(r))
                          .join(isAr ? "، " : ", ")}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-center shrink-0 pt-2 sm:pt-0">
                  {item.relatedEntity.link ? (
                    <Link to={item.relatedEntity.link}>
                      <Button
                        size="sm"
                        variant="secondary"
                        className="h-8 gap-1 text-xs"
                        onClick={() => {
                          if (!item.isRead) {
                            void markReadMutation.mutateAsync(item.id);
                          }
                        }}
                      >
                        <span>{t("notifications.inspect", "Inspect")}</span>
                        <ExternalLink className="size-3 rtl:rotate-180" />
                      </Button>
                    </Link>
                  ) : null}

                  {!item.isRead ? (
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-8 gap-1 text-xs text-muted-foreground hover:text-foreground"
                      onClick={() => void markReadMutation.mutateAsync(item.id)}
                      disabled={markReadMutation.isPending}
                      aria-label={t("notifications.markRead", "Mark read")}
                    >
                      <Check className="size-3.5" />
                      <span>{t("notifications.markRead", "Mark read")}</span>
                    </Button>
                  ) : (
                    <span className="text-[11px] text-muted-foreground px-2">
                      {t("notifications.readStatus", "Read")}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
