import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Link, useNavigate } from "react-router-dom";
import { ArrowRight, Bell, Check, CheckCheck, ExternalLink, Settings } from "lucide-react";

import type { AuthenticatedUser } from "@/features/authentication/model/auth.types";
import {
  NotificationPriorityBadge,
  NotificationTypeBadge,
} from "@/features/notifications/components/notification-badges";
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
  const navigate = useNavigate();

  // Listen to any background or cross-tab mock events
  useEventBusListener();

  const unreadCountQuery = useUnreadNotificationCount(user.primary_role);
  const notificationsQuery = useNotifications({
    roleView: user.primary_role,
  });

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

  const handleItemClick = (notificationId: string, link?: string) => {
    void markReadMutation.mutateAsync(notificationId);
    setOpen(false);
    if (link) {
      navigate(link);
    }
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
          className="relative"
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
        className="w-80 sm:w-96 p-0 shadow-lg border-border"
        aria-label={t("notifications.quickPreviewTitle", "Notification quick preview")}
      >
        <div className="flex items-center justify-between border-b border-border px-4 py-3 bg-muted/20">
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-semibold text-foreground">
              {t("nav.notifications", "Notifications")}
            </h2>
            {unreadCount > 0 ? (
              <span className="rounded-full bg-emergency/15 px-2 py-0.5 text-xs font-semibold text-emergency">
                <bdi dir="ltr">{unreadCount}</bdi> {t("notifications.unreadBadge", "new")}
              </span>
            ) : null}
          </div>

          {unreadCount > 0 ? (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-7 text-xs gap-1 text-muted-foreground hover:text-foreground"
              onClick={handleMarkAllRead}
              id="header-mark-all-read-btn"
            >
              <CheckCheck className="size-3.5" aria-hidden="true" />
              {t("notifications.markAllRead", "Mark all read")}
            </Button>
          ) : null}
        </div>

        <div className="max-h-[22rem] overflow-y-auto divide-y divide-border/60">
          {previewList.length === 0 ? (
            <div className="py-8 text-center px-4">
              <Bell className="size-8 mx-auto text-muted-foreground/50" />
              <p className="mt-2 text-sm font-medium text-muted-foreground">
                {t("notifications.noNotificationsPreview", "No notifications right now")}
              </p>
              <p className="mt-0.5 text-xs text-muted-foreground">
                {t("notifications.noAlerts", "New workflow updates will appear here automatically.")}
              </p>
            </div>
          ) : (
            previewList.map((item) => (
              <div
                key={item.id}
                role="button"
                tabIndex={0}
                onClick={() => handleItemClick(item.id, item.relatedEntity.link)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    handleItemClick(item.id, item.relatedEntity.link);
                  }
                }}
                className={`group flex items-start gap-3 p-3.5 text-start transition-colors hover:bg-muted/40 cursor-pointer ${
                  !item.isRead ? "bg-primary/5 dark:bg-primary/10" : ""
                }`}
              >
                <span
                  className={`mt-1 size-2 shrink-0 rounded-full ${
                    !item.isRead ? "bg-emergency ring-2 ring-emergency/20" : "bg-transparent"
                  }`}
                  aria-hidden="true"
                />

                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <NotificationPriorityBadge priority={item.priority} />
                    <NotificationTypeBadge type={item.type} />
                  </div>

                  <p className="mt-1 text-xs font-semibold text-foreground leading-snug line-clamp-1">
                    {item.title}
                  </p>

                  <p className="mt-0.5 text-xs text-muted-foreground leading-relaxed line-clamp-2">
                    {item.message}
                  </p>

                  <div className="mt-1.5 flex items-center justify-between text-[11px] text-muted-foreground">
                    <span>
                      <bdi dir="ltr">{formatTime(item.createdAt)}</bdi>
                    </span>
                    {item.relatedEntity.link ? (
                      <span className="inline-flex items-center gap-0.5 font-medium text-primary group-hover:underline">
                        {t("common.inspect", "Inspect")} <ExternalLink className="size-3 rtl:rotate-180" />
                      </span>
                    ) : null}
                  </div>
                </div>

                {!item.isRead ? (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="size-6 shrink-0 opacity-80 hover:opacity-100 hover:bg-muted"
                    aria-label={t("notifications.markAllRead", "Mark as read")}
                    onClick={(e) => {
                      e.stopPropagation();
                      void markReadMutation.mutateAsync(item.id);
                    }}
                  >
                    <Check className="size-3.5" />
                  </Button>
                ) : null}
              </div>
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
            <span>{t("notifications.viewAllNotificationsAction", "View all notifications")}</span>
            <ArrowRight className="size-3 rtl:rotate-180" />
          </Link>
        </div>
      </PopoverContent>
    </Popover>
  );
}
