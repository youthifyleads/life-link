import {
  Boxes,
  Clock,
  HeartHandshake,
  Layers,
  LucideIcon,
  Radio,
  ScanLine,
  ShieldAlert,
} from "lucide-react";
import { useTranslation } from "react-i18next";

import type {
  ActivityResult,
  NotificationPriority,
  NotificationType,
} from "@/features/notifications/types/notifications.types";
import { Badge } from "@/shared/components/ui/badge";

export function NotificationPriorityBadge({
  priority,
}: {
  priority: NotificationPriority;
}) {
  const { t } = useTranslation();

  switch (priority) {
    case "urgent":
      return (
        <Badge
          variant="destructive"
          className="gap-1 font-semibold text-[10px]"
        >
          <span aria-hidden="true">🚨</span>
          {t("notifications.priorityUrgent", "Urgent")}
        </Badge>
      );
    case "high":
      return (
        <Badge
          variant="secondary"
          className="gap-1 bg-amber-500/10 text-amber-700 dark:text-amber-400 font-semibold text-[10px]"
        >
          <span aria-hidden="true">⚠️</span>
          {t("notifications.priorityHigh", "High")}
        </Badge>
      );
    case "normal":
      return (
        <Badge
          variant="secondary"
          className="bg-blue-500/10 text-blue-700 dark:text-blue-400 text-[10px]"
        >
          {t("notifications.priorityNormal", "Normal")}
        </Badge>
      );
    case "low":
      return (
        <Badge
          variant="secondary"
          className="bg-muted/30 text-muted-foreground text-[10px]"
        >
          {t("notifications.priorityLow", "Low")}
        </Badge>
      );
  }
}

export function NotificationTypeBadge({ type }: { type: NotificationType }) {
  const { t } = useTranslation();
  let label = t("common.overview", "General");
  let icon: LucideIcon = Radio;
  let colorClass = "text-primary";

  switch (type) {
    case "request_update":
      label = t("notifications.typeRequestUpdate", "Request Update");
      icon = Clock;
      colorClass = "text-sky-700 dark:text-sky-400";
      break;
    case "inventory_alert":
      label = t("notifications.typeInventoryAlert", "Inventory Alert");
      icon = Boxes;
      colorClass = "text-orange-700 dark:text-orange-400";
      break;
    case "allocation_update":
      label = t("notifications.typeAllocationUpdate", "Allocation");
      icon = Layers;
      colorClass = "text-indigo-700 dark:text-indigo-400";
      break;
    case "donation_update":
      label = t("notifications.typeDonationUpdate", "Donation");
      icon = HeartHandshake;
      colorClass = "text-emerald-700 dark:text-emerald-400";
      break;
    case "tracking_update":
      label = t("notifications.typeTrackingUpdate", "Tracking / Cold Chain");
      icon = ScanLine;
      colorClass = "text-cyan-700 dark:text-cyan-400";
      break;
    case "system_announcement":
      label = t("notifications.typeGovernanceAudit", "System");
      icon = ShieldAlert;
      colorClass = "text-purple-700 dark:text-purple-400";
      break;
  }

  const IconComp = icon;

  return (
    <span
      className={`inline-flex items-center gap-1 text-xs font-medium ${colorClass}`}
    >
      <IconComp className="size-3 shrink-0" aria-hidden="true" />
      {label}
    </span>
  );
}

export function ActivityResultBadge({ result }: { result: ActivityResult }) {
  const { t } = useTranslation();

  switch (result) {
    case "success":
      return (
        <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-700 dark:text-emerald-400">
          <span aria-hidden="true">✅</span>
          {t("common.success", "Success")}
        </span>
      );
    case "warning":
      return (
        <span className="inline-flex items-center gap-1 text-xs font-medium text-amber-700 dark:text-amber-400">
          <span aria-hidden="true">⚠️</span>
          {t("common.warning", "Warning")}
        </span>
      );
    case "failure":
      return (
        <span className="inline-flex items-center gap-1 text-xs font-medium text-destructive">
          <span aria-hidden="true">❌</span>
          {t("common.error", "Failure")}
        </span>
      );
  }
}
