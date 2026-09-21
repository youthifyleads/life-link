import type { ReactNode } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  XCircle,
} from "lucide-react";

import { cn } from "@/shared/lib/utils";

export type StatusTone =
  "neutral" | "pending" | "success" | "warning" | "danger";

interface StatusIndicatorProps {
  tone: StatusTone;
  children: ReactNode;
  className?: string;
  indicator?: ReactNode;
}

const statusStyles: Record<StatusTone, string> = {
  neutral: "text-muted-foreground",
  pending: "text-foreground",
  success: "text-success",
  warning: "text-amber-700 dark:text-amber-400",
  danger: "text-destructive",
};

export function StatusIndicator({
  tone,
  children,
  className,
  indicator,
}: StatusIndicatorProps) {
  const renderDefaultIndicator = () => {
    switch (tone) {
      case "pending":
        return (
          <Clock aria-hidden="true" className="size-3.5 shrink-0 text-muted-foreground" />
        );
      case "success":
        return (
          <CheckCircle2 aria-hidden="true" className="size-3.5 shrink-0 text-success" />
        );
      case "warning":
        return (
          <AlertTriangle aria-hidden="true" className="size-3.5 shrink-0 text-amber-600 dark:text-amber-400" />
        );
      case "danger":
        return (
          <XCircle aria-hidden="true" className="size-3.5 shrink-0 text-destructive" />
        );
      case "neutral":
      default:
        return (
          <span aria-hidden="true" className="size-1.5 rounded-full bg-muted-foreground/60 shrink-0" />
        );
    }
  };

  const visibleIndicator = indicator !== undefined ? indicator : renderDefaultIndicator();

  return (
    <span
      className={cn(
        "inline-flex min-h-6 items-center gap-1.5 text-xs font-medium leading-4",
        statusStyles[tone],
        className,
      )}
    >
      {visibleIndicator ? (
        <span aria-hidden="true" className="shrink-0 flex items-center justify-center">
          {visibleIndicator}
        </span>
      ) : null}
      <span>{children}</span>
    </span>
  );
}
