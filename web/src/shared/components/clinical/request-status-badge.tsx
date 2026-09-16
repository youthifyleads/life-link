import {
  AlertCircle,
  CheckCircle2,
  CircleDot,
  Clock3,
  FileEdit,
  PackageCheck,
  PackageOpen,
  XCircle,
  type LucideIcon,
} from "lucide-react";

import type { RequestStatus } from "@/shared/components/clinical/clinical.types";
import { cn } from "@/shared/lib/utils";

interface StatusDefinition {
  label: string;
  icon: LucideIcon;
  className: string;
}

const statusDefinitions: Record<RequestStatus, StatusDefinition> = {
  draft: {
    label: "Draft",
    icon: FileEdit,
    className: "border-border bg-surface text-muted-foreground",
  },
  submitted: {
    label: "Submitted",
    icon: CircleDot,
    className: "border-primary/25 bg-secondary text-secondary-foreground",
  },
  acknowledged: {
    label: "Acknowledged",
    icon: CheckCircle2,
    className: "border-primary/25 bg-secondary text-secondary-foreground",
  },
  needs_information: {
    label: "Needs information",
    icon: AlertCircle,
    className: "border-warning/30 bg-warning-subtle text-[#6f4a00]",
  },
  confirmed: {
    label: "Confirmed",
    icon: CheckCircle2,
    className: "border-primary/25 bg-secondary text-secondary-foreground",
  },
  preparing: {
    label: "Preparing",
    icon: PackageOpen,
    className: "border-primary/25 bg-secondary text-secondary-foreground",
  },
  ready: {
    label: "Ready",
    icon: PackageCheck,
    className: "border-success/25 bg-success-subtle text-success",
  },
  completed: {
    label: "Completed",
    icon: CheckCircle2,
    className: "border-success/25 bg-success-subtle text-success",
  },
  rejected: {
    label: "Rejected",
    icon: XCircle,
    className: "border-destructive/25 bg-emergency-subtle text-[#8d1c14]",
  },
  cancelled: {
    label: "Cancelled",
    icon: XCircle,
    className: "border-border bg-muted text-muted-foreground",
  },
};

import { useTranslation } from "react-i18next";

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
  const Icon = definition.icon;
  const label = t(`status.${status}`, definition.label);

  return (
    <span
      className={cn(
        "inline-flex min-h-7 items-center gap-1.5 rounded-md border px-2 py-1 text-xs font-semibold leading-none",
        definition.className,
        className,
      )}
    >
      <Icon aria-hidden="true" className="size-3.5" strokeWidth={2} />
      {label}
    </span>
  );
}

export function RequestStatusTimestamp({ children }: { children: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
      <Clock3 aria-hidden="true" className="size-3.5" />
      <span className="tabular-nums">{children}</span>
    </span>
  );
}
