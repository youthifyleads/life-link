import {
  AlertTriangle,
  Boxes,
  CheckCircle2,
  Clock,
  HeartHandshake,
  Layers,
  LucideIcon,
  Radio,
  ScanLine,
  ShieldAlert,
  XCircle,
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
          className="gap-1 font-semibold uppercase tracking-wider text-[10px]"
        >
          <span className="size-1.5 rounded-full bg-white animate-pulse" />
          {t("notifications.priorityUrgent", "Urgent")}
        </Badge>
      );
    case "high":
      return (
        <Badge
          variant="secondary"
          className="gap-1 border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-400 font-semibold text-[10px]"
        >
          {t("notifications.priorityHigh", "High")}
        </Badge>
      );
    case "normal":
      return (
        <Badge
          variant="secondary"
          className="border-blue-500/30 bg-blue-500/10 text-blue-700 dark:text-blue-400 text-[10px]"
        >
          {t("notifications.priorityNormal", "Normal")}
        </Badge>
      );
    case "low":
      return (
        <Badge
          variant="secondary"
          className="border-muted bg-muted/30 text-muted-foreground text-[10px]"
        >
          {t("notifications.priorityLow", "Low")}
        </Badge>
      );
  }
}

export function NotificationTypeBadge({
  type,
}: {
  type: NotificationType;
}) {
  const { t } = useTranslation();
  let label = t("common.overview", "General");
  let icon: LucideIcon = Radio;
  let colorClass = "bg-primary/10 text-primary border-primary/20";

  switch (type) {
    case "request_update":
      label = t("notifications.typeRequestUpdate", "Request Update");
      icon = Clock;
      colorClass = "bg-sky-500/10 text-sky-700 dark:text-sky-400 border-sky-500/20";
      break;
    case "inventory_alert":
      label = t("notifications.typeInventoryAlert", "Inventory Alert");
      icon = Boxes;
      colorClass = "bg-orange-500/10 text-orange-700 dark:text-orange-400 border-orange-500/20";
      break;
    case "allocation_update":
      label = t("notifications.typeAllocationUpdate", "Allocation");
      icon = Layers;
      colorClass = "bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 border-indigo-500/20";
      break;
    case "donation_update":
      label = t("notifications.typeDonationUpdate", "Donation");
      icon = HeartHandshake;
      colorClass = "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20";
      break;
    case "tracking_update":
      label = t("notifications.typeTrackingUpdate", "Tracking / Cold Chain");
      icon = ScanLine;
      colorClass = "bg-cyan-500/10 text-cyan-700 dark:text-cyan-400 border-cyan-500/20";
      break;
    case "system_announcement":
      label = t("notifications.typeGovernanceAudit", "System");
      icon = ShieldAlert;
      colorClass = "bg-purple-500/10 text-purple-700 dark:text-purple-400 border-purple-500/20";
      break;
  }

  const IconComp = icon;

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-xs font-medium ${colorClass}`}
    >
      <IconComp className="size-3 shrink-0" aria-hidden="true" />
      {label}
    </span>
  );
}

export function ActivityResultBadge({
  result,
}: {
  result: ActivityResult;
}) {
  const { t } = useTranslation();

  switch (result) {
    case "success":
      return (
        <span className="inline-flex items-center gap-1 rounded-md border border-emerald-500/20 bg-emerald-500/10 px-2 py-0.5 text-xs font-medium text-emerald-700 dark:text-emerald-400">
          <CheckCircle2 className="size-3" aria-hidden="true" />
          {t("common.success", "Success")}
        </span>
      );
    case "warning":
      return (
        <span className="inline-flex items-center gap-1 rounded-md border border-amber-500/20 bg-amber-500/10 px-2 py-0.5 text-xs font-medium text-amber-700 dark:text-amber-400">
          <AlertTriangle className="size-3" aria-hidden="true" />
          {t("common.warning", "Warning")}
        </span>
      );
    case "failure":
      return (
        <span className="inline-flex items-center gap-1 rounded-md border border-destructive/20 bg-destructive/10 px-2 py-0.5 text-xs font-medium text-destructive">
          <XCircle className="size-3" aria-hidden="true" />
          {t("common.error", "Failure")}
        </span>
      );
  }
}
