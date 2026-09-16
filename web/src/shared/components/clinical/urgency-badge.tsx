import { AlarmClock, AlertTriangle, Clock3 } from "lucide-react";
import { useTranslation } from "react-i18next";

import type { UrgencyLevel } from "@/shared/components/clinical/clinical.types";
import { cn } from "@/shared/lib/utils";

const urgencyDefinitions = {
  routine: {
    label: "Routine",
    icon: Clock3,
    className: "border-border bg-surface text-muted-foreground",
  },
  urgent: {
    label: "Urgent",
    icon: AlarmClock,
    className: "border-warning/30 bg-warning-subtle text-[#6f4a00]",
  },
  emergency: {
    label: "Emergency",
    icon: AlertTriangle,
    className: "border-destructive/30 bg-emergency-subtle text-[#8d1c14]",
  },
} as const;

interface UrgencyBadgeProps {
  urgency: UrgencyLevel;
  className?: string;
}

export function UrgencyBadge({ urgency, className }: UrgencyBadgeProps) {
  const { t } = useTranslation();
  const definition = urgencyDefinitions[urgency];
  const Icon = definition.icon;
  const label = t(`urgency.${urgency}`, definition.label);

  return (
    <span
      className={cn(
        "inline-flex min-h-7 items-center gap-1.5 rounded-md border px-2 py-1 text-xs font-semibold leading-none",
        definition.className,
        className,
      )}
    >
      <Icon aria-hidden="true" className="size-3.5" />
      {label}
    </span>
  );
}
