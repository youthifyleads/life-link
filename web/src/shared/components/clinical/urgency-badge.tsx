import { useTranslation } from "react-i18next";
import { AlertOctagon, AlertTriangle } from "lucide-react";

import type { UrgencyLevel } from "@/shared/components/clinical/clinical.types";
import {
  StatusIndicator,
  type StatusTone,
} from "@/shared/components/clinical/status-indicator";

interface UrgencyDefinition {
  label: string;
  tone: StatusTone;
  indicator?: React.ReactNode;
}

const urgencyDefinitions: Record<UrgencyLevel, UrgencyDefinition> = {
  routine: {
    label: "Routine",
    tone: "neutral",
    indicator: undefined,
  },
  urgent: {
    label: "Urgent",
    tone: "warning",
    indicator: (
      <AlertTriangle aria-hidden="true" className="size-3.5 shrink-0 text-amber-600 dark:text-amber-400" />
    ),
  },
  emergency: {
    label: "Emergency",
    tone: "danger",
    indicator: (
      <AlertOctagon aria-hidden="true" className="size-3.5 shrink-0 text-destructive" />
    ),
  },
};

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
