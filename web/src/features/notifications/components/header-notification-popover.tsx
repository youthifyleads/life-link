import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { ArrowRight, Bell, Check, CheckCheck, Settings } from "lucide-react";

import type { AuthenticatedUser } from "@/features/authentication/model/auth.types";
import { NotificationPriorityBadge } from "@/features/notifications/components/notification-badges";
import {
  getLocalizedNotificationMessage,
  getLocalizedNotificationTitle,
} from "@/features/notifications/components/notifications-formatters";
import {
  useEventBusListener,
  useMarkAllNotificationsRead,
  useMarkNotificationRead,
  useNotifications,
  useUnreadNotificationCount,
} from "@/features/notifications/hooks/use-notifications";
import { Button } from "@/shared/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/shared/components/ui/popover";

interface HeaderNotificationPopoverProps {
  user: AuthenticatedUser;
}

export function HeaderNotificationPopover({
  user,
}: HeaderNotificationPopoverProps) {
  const { t, i18n } = useTranslation();
  const [open, setOpen] = useState(false);

  // Listen to any background or cross-tab mock events
  useEventBusListener();

  const unreadCountQuery = useUnreadNotificationCount(user.primary_role);
  const notificationsQuery = useNotifications(
    { roleView: user.primary_role },
    { enabled: open },
  );

  const markReadMutation = useMarkNotificationRead();
  const markAllMutation = useMarkAllNotificationsRead();

  const unreadCount = unreadCountQuery.data ?? 0;
  const notifications = notificationsQuery.data ?? [];
  const previewList = notifications.slice(0, 5);

  const formatTime = (dateStr: string) => {
    try {
      const locale = i18n.language.startsWith("ar") ? "ar-EG" : "en-US";
      return new Intl.DateTimeFormat(locale, {
        hour: "2-digit",
        minute: "2-digit",
      }).format(new Date(dateStr));
    } catch {
      return dateStr;
    }
  };

  const handleDetailsClick = (notificationId: string, isRead: boolean) => {
    if (!isRead) {
      void markReadMutation.mutateAsync(notificationId);
    }
    setOpen(false);
  };

  const handleMarkAllRead = (e: React.MouseEvent) => {
    e.stopPropagation();
    void markAllMutation.mutateAsync(user.primary_role);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="relative text-header-muted hover:bg-white/[0.06] hover:text-white"
          id="header-notification-bell-btn"
          aria-label={
            unreadCount > 0
              ? `${unreadCount} ${t("notifications.unreadBadge", "unread notifications")}`
              : t("nav.notifications", "Notifications")
          }
        >
          <Bell className="size-5" aria-hidden="true" />
          {unreadCount > 0 ? (
            <span
              className="absolute end-1 top-1 flex min-w-4 items-center justify-center rounded-full bg-emergency px-1 text-[11px] font-bold leading-4 text-white shadow-sm"
              id="header-notification-unread-badge"
            >
              <bdi dir="ltr">{unreadCount > 99 ? "99+" : unreadCount}</bdi>
            </span>
          ) : null}
        </Button>
      </PopoverTrigger>

      <PopoverContent
        align="end"
        className="w-80 border-border p-0 shadow-lg sm:w-96"
        aria-label={t(
          "notifications.quickPreviewTitle",
          "Notification quick preview",
        )}
      >
        <div className="flex items-center justify-between border-b border-border bg-muted/20 px-4 py-3">
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-semibold text-foreground">
              {t("nav.notifications", "Notifications")}
            </h2>
            {unreadCount > 0 ? (
              <span className="rounded-full bg-emergency/15 px-2 py-0.5 text-xs font-semibold text-emergency">
                <bdi dir="ltr">{unreadCount}</bdi>{" "}
                {t("notifications.unreadBadge", "new")}
              </span>
            ) : null}
          </div>

          {unreadCount > 0 ? (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-7 gap-1 text-xs text-muted-foreground hover:text-foreground"
              onClick={handleMarkAllRead}
              id="header-mark-all-read-btn"
            >
              <CheckCheck className="size-3.5" aria-hidden="true" />
              {t("notifications.markAllRead", "Mark all read")}
            </Button>
          ) : null}
        </div>

        <div className="max-h-[22rem] divide-y divide-border/70 overflow-y-auto px-2">
          {previewList.length === 0 ? (
            <div className="px-4 py-8 text-center">
              <Bell className="mx-auto size-8 text-muted-foreground/50" />
              <p className="mt-2 text-sm font-medium text-muted-foreground">
                {t(
                  "notifications.noNotificationsPreview",
                  "No notifications right now",
                )}
              </p>
            </div>
          ) : (
            previewList.map((item) => (
              <article
                key={item.id}
                className={`px-2 py-3 text-start ${
                  !item.isRead ? "bg-primary/[0.04]" : "bg-surface"
                }`}
              >
                <div className="flex items-start gap-2.5">
                  <span
                    className={`mt-1.5 size-1.5 shrink-0 rounded-full ${
                      !item.isRead ? "bg-primary" : "bg-muted-foreground/30"
                    }`}
                    aria-hidden="true"
                  />
                  <span className="sr-only">
                    {!item.isRead
                      ? t("notifications.unreadStatus", "Unread")
                      : t("notifications.readStatus", "Read")}
                  </span>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-3">
                      <p className="line-clamp-1 text-xs font-semibold leading-5 text-foreground">
                        {getLocalizedNotificationTitle(item)}
                      </p>
                      <time className="shrink-0 text-[11px] leading-5 text-muted-foreground">
                        <bdi dir="ltr">{formatTime(item.createdAt)}</bdi>
                      </time>
                    </div>

                    <p className="line-clamp-1 text-xs leading-5 text-muted-foreground">
                      {getLocalizedNotificationMessage(item)}
                    </p>

                    <div className="mt-1.5 flex min-h-7 items-center justify-between gap-2">
                      <div>
                        {item.priority === "urgent" ||
                        item.priority === "high" ? (
                          <NotificationPriorityBadge priority={item.priority} />
                        ) : null}
                      </div>

                      <div className="flex items-center gap-1">
                        {item.relatedEntity.link ? (
                          <Button
                            asChild
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="h-7 gap-1 px-2 text-xs"
                          >
                            <Link
                              to={item.relatedEntity.link}
                              onClick={() =>
                                handleDetailsClick(item.id, item.isRead)
                              }
                            >
                              <span>
                                {t("common.viewDetails", "View details")}
                              </span>
                              <ArrowRight
                                aria-hidden="true"
                                className="size-3 rtl:rotate-180"
                              />
                            </Link>
                          </Button>
                        ) : null}

                        {!item.isRead ? (
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="size-7 text-muted-foreground hover:text-foreground"
                            aria-label={t(
                              "notifications.markRead",
                              "Mark as read",
                            )}
                            title={t("notifications.markRead", "Mark as read")}
                            onClick={() =>
                              void markReadMutation.mutateAsync(item.id)
                            }
                          >
                            <Check aria-hidden="true" className="size-3.5" />
                          </Button>
                        ) : null}
                      </div>
                    </div>
                  </div>
                </div>
              </article>
            ))
          )}
        </div>

        <div className="flex items-center justify-between border-t border-border bg-muted/20 px-4 py-2.5">
          <Link
            to="/settings/notifications"
            className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
            onClick={() => setOpen(false)}
          >
            <Settings className="size-3.5" />
            {t("notifications.preferencesAction", "Preferences")}
          </Link>

          <Link
            to="/notifications"
            className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
            onClick={() => setOpen(false)}
            id="header-view-all-notifications-link"
          >
            <span>
              {t(
                "notifications.viewAllNotificationsAction",
                "View all notifications",
              )}
            </span>
            <ArrowRight className="size-3 rtl:rotate-180" />
          </Link>
        </div>
      </PopoverContent>
    </Popover>
  );
}
