import { useTranslation } from "react-i18next";

import type { UrgencyLevel } from "@/shared/components/clinical/clinical.types";
import {
  StatusIndicator,
  type StatusTone,
} from "@/shared/components/clinical/status-indicator";

const urgencyDefinitions = {
  routine: {
    label: "Routine",
    tone: "neutral" as StatusTone,
    indicator: undefined,
  },
  urgent: {
    label: "Urgent",
    tone: "warning" as StatusTone,
    indicator: "⚠️",
  },
  emergency: {
    label: "Emergency",
    tone: "danger" as StatusTone,
    indicator: "🚨",
  },
} as const;

interface UrgencyBadgeProps {
  urgency: UrgencyLevel;
  className?: string;
}

export function UrgencyBadge({ urgency, className }: UrgencyBadgeProps) {
  const { t } = useTranslation();
  const definition = urgencyDefinitions[urgency] ?? urgencyDefinitions.routine;
  const label = t(`urgency.${urgency}`, definition.label);

  return (
    <StatusIndicator
      tone={definition.tone}
      indicator={definition.indicator}
      className={className}
    >
      {label}
    </StatusIndicator>
  );
}
