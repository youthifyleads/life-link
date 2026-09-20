import { useTranslation } from "react-i18next";

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
  completed: { label: "Completed", tone: "success" },
  rejected: { label: "Rejected", tone: "danger" },
  cancelled: { label: "Cancelled", tone: "danger" },
};

const requestStatusIndicators: Record<RequestStatus, string> = {
  draft: "📝",
  submitted: "🕒",
  acknowledged: "✅",
  needs_information: "⚠️",
  confirmed: "✅",
  preparing: "⚙️",
  ready: "✅",
  completed: "✔️",
  rejected: "❌",
  cancelled: "❌",
};

export function getRequestStatusIndicator(status: RequestStatus) {
  return requestStatusIndicators[status];
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
  const definition = statusDefinitions[status];

  return (
    <StatusIndicator
      tone={definition.tone}
      indicator={getRequestStatusIndicator(status)}
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
