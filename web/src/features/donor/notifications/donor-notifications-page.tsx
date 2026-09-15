import {
  Check,
  CheckCircle2,
  HeartHandshake,
  Info,
  Ticket,
} from "lucide-react";
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";

import { formatDateTime } from "@/features/donor/components/donor-formatters";
import { DonorPageFrame } from "@/features/donor/components/donor-page-frame";
import {
  useDonorNotifications,
  useMarkNotificationRead,
} from "@/features/donor/hooks/use-donor";
import type { DonorNotificationCategory } from "@/features/donor/types/donor.types";
import {
  EmptyState,
  ErrorState,
  LoadingState,
} from "@/shared/components/feedback/system-states";
import { Button } from "@/shared/components/ui/button";

export function DonorNotificationsPage() {
  const { t } = useTranslation();
  const [categoryFilter, setCategoryFilter] = useState<string>("all");

  const notificationsQuery = useDonorNotifications();
  const markReadMutation = useMarkNotificationRead();

  const notifications = notificationsQuery.data ?? [];

  const filteredNotifications = useMemo(() => {
    const list = notificationsQuery.data ?? [];
    if (categoryFilter === "all") return list;
    return list.filter((n) => n.category === categoryFilter);
  }, [notificationsQuery.data, categoryFilter]);

  const getCategoryIcon = (category: DonorNotificationCategory) => {
    switch (category) {
      case "request":
        return <HeartHandshake className="size-4 text-emergency" aria-hidden="true" />;
      case "response":
        return <CheckCircle2 className="size-4 text-blue-600 dark:text-blue-400" aria-hidden="true" />;
      case "voucher":
        return <Ticket className="size-4 text-emerald-600 dark:text-emerald-400" aria-hidden="true" />;
      default:
        return <Info className="size-4 text-primary" aria-hidden="true" />;
    }
  };

  return (
    <DonorPageFrame
      breadcrumbs={[
        { label: t("nav.donorServices", "Donor services"), href: "/donor/dashboard" },
        { label: t("nav.notifications", "Notifications") },
      ]}
      title={t("nav.notifications", "Donor Notifications")}
      description={t("donor.portalDesc", "Updates on community shortages, response confirmations, and voucher availability.")}
    >
      <div className="space-y-6">
        {/* Category Filter Tabs */}
        <div className="flex flex-wrap items-center gap-2 border-b border-border pb-4">
          <Button
            variant={categoryFilter === "all" ? "default" : "secondary"}
            size="sm"
            onClick={() => setCategoryFilter("all")}
            className="text-xs"
          >
            {t("common.all", "All Updates")} (<bdi dir="ltr">{notifications.length}</bdi>)
          </Button>
          <Button
            variant={categoryFilter === "request" ? "default" : "secondary"}
            size="sm"
            onClick={() => setCategoryFilter("request")}
            className="text-xs"
          >
            {t("donor.appealsTitle", "Shortage Requests")}
          </Button>
          <Button
            variant={categoryFilter === "response" ? "default" : "secondary"}
            size="sm"
            onClick={() => setCategoryFilter("response")}
            className="text-xs"
          >
            {t("status.confirmed", "My Responses")}
          </Button>
          <Button
            variant={categoryFilter === "voucher" ? "default" : "secondary"}
            size="sm"
            onClick={() => setCategoryFilter("voucher")}
            className="text-xs"
          >
            {t("donor.vouchers", "Vouchers")}
          </Button>
          <Button
            variant={categoryFilter === "general" ? "default" : "secondary"}
            size="sm"
            onClick={() => setCategoryFilter("general")}
            className="text-xs"
          >
            {t("common.overview", "General")}
          </Button>
        </div>

        {/* Notifications Feed */}
        {notificationsQuery.isPending ? (
          <LoadingState label={t("common.loadingRecords", "Loading notifications…")} />
        ) : notificationsQuery.isError ? (
          <ErrorState
            title={t("common.error", "Could not load notifications")}
            description={t("donor.notificationsLoadErrorDescription")}
            onRetry={() => {
              void notificationsQuery.refetch();
            }}
          />
        ) : filteredNotifications.length === 0 ? (
          <EmptyState
            title={t("notifications.noAlerts", "No notifications in this category")}
            description={t("notifications.noAlerts", "You are completely caught up.")}
          />
        ) : (
          <div className="space-y-3">
            {filteredNotifications.map((notif) => (
              <article
                key={notif.id}
                className={`flex flex-col gap-3 border p-4 sm:flex-row sm:items-center sm:justify-between transition-colors ${
                  !notif.read
                    ? "border-primary/40 bg-surface shadow-xs"
                    : "border-border bg-surface/70"
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-md bg-muted">
                    {getCategoryIcon(notif.category)}
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-semibold text-foreground">
                        {notif.title}
                      </h3>
                      {!notif.read && (
                        <span className="rounded bg-primary/10 px-1.5 py-0.5 text-[10px] font-bold text-primary">
                          {t("notifications.unreadBadge", "New")}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      {notif.message}
                    </p>
                    <time className="block text-[11px] font-medium text-muted-foreground">
                      <bdi dir="auto">{formatDateTime(notif.timestamp)}</bdi>
                    </time>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                  {notif.link && (
                    <Button asChild variant="secondary" size="sm" className="text-xs">
                      <Link to={notif.link}>{t("common.view", "Open")}</Link>
                    </Button>
                  )}

                  {!notif.read && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => markReadMutation.mutate(notif.id)}
                      title={t("notifications.markAllRead", "Mark as read")}
                      className="text-xs gap-1"
                    >
                      <Check className="size-3.5" aria-hidden="true" />
                      <span>{t("common.verified", "Read")}</span>
                    </Button>
                  )}
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </DonorPageFrame>
  );
}

export default DonorNotificationsPage;
