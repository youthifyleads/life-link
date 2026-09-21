import type { ReactNode } from "react";
import { useTranslation } from "react-i18next";
import {
  AlertTriangle,
  Check,
  CheckCircle2,
  Clock,
  FileEdit,
  Package,
  XCircle,
} from "lucide-react";

import type { RequestStatus } from "@/shared/components/clinical/clinical.types";
import {
  StatusIndicator,
  type StatusTone,
} from "@/shared/components/clinical/status-indicator";
import { cn } from "@/shared/lib/utils";

interface StatusDefinition {
  label: string;
  tone: StatusTone;
}

const statusDefinitions: Record<RequestStatus, StatusDefinition> = {
  draft: { label: "Draft", tone: "neutral" },
  submitted: { label: "Submitted", tone: "pending" },
  acknowledged: { label: "Acknowledged", tone: "success" },
  needs_information: { label: "Needs information", tone: "warning" },
  confirmed: { label: "Confirmed", tone: "success" },
  preparing: { label: "Preparing", tone: "pending" },
  ready: { label: "Ready", tone: "success" },
  completed: { label: "Completed", tone: "neutral" },
  rejected: { label: "Rejected", tone: "danger" },
  cancelled: { label: "Cancelled", tone: "neutral" },
};

export function getRequestStatusIcon(status: RequestStatus): ReactNode {
  switch (status) {
    case "draft":
      return (
        <FileEdit aria-hidden="true" className="size-3.5 shrink-0 text-muted-foreground" />
      );
    case "submitted":
      return (
        <Clock aria-hidden="true" className="size-3.5 shrink-0 text-muted-foreground" />
      );
    case "acknowledged":
      return (
        <Check aria-hidden="true" className="size-3.5 shrink-0 text-success" />
      );
    case "needs_information":
      return (
        <AlertTriangle aria-hidden="true" className="size-3.5 shrink-0 text-amber-600 dark:text-amber-400" />
      );
    case "confirmed":
      return (
        <CheckCircle2 aria-hidden="true" className="size-3.5 shrink-0 text-success" />
      );
    case "preparing":
      return (
        <Package aria-hidden="true" className="size-3.5 shrink-0 text-primary" />
      );
    case "ready":
      return (
        <CheckCircle2 aria-hidden="true" className="size-3.5 shrink-0 text-emerald-600" />
      );
    case "completed":
      return (
        <CheckCircle2 aria-hidden="true" className="size-3.5 shrink-0 text-muted-foreground" />
      );
    case "rejected":
      return (
        <XCircle aria-hidden="true" className="size-3.5 shrink-0 text-destructive" />
      );
    case "cancelled":
      return (
        <XCircle aria-hidden="true" className="size-3.5 shrink-0 text-muted-foreground" />
      );
    default:
      return null;
  }
}

export function getRequestStatusIndicator(status: RequestStatus): ReactNode {
  return getRequestStatusIcon(status);
}

interface RequestStatusBadgeProps {
  status: RequestStatus;
  className?: string;
}

export function RequestStatusBadge({
  status,
  className,
}: RequestStatusBadgeProps) {
  const { t } = useTranslation();
  const definition = statusDefinitions[status] ?? statusDefinitions.draft;

  return (
    <StatusIndicator
      tone={definition.tone}
      indicator={getRequestStatusIcon(status)}
      className={className}
    >
      {t(`status.${status}`, definition.label)}
    </StatusIndicator>
  );
}

export function RequestStatusTimestamp({ children }: { children: string }) {
  return (
    <span
      className={cn(
        "text-xs tabular-nums text-muted-foreground",
        "unicode-isolate",
      )}
    >
      {children}
    </span>
  );
}
