import type { ReactNode } from "react";

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
  warning: "text-[#6f4a00] dark:text-warning",
  danger: "text-destructive",
};

const statusIndicators: Partial<Record<StatusTone, string>> = {
  pending: "⏳",
  success: "✅",
  warning: "⚠️",
  danger: "❌",
};

export function StatusIndicator({
  tone,
  children,
  className,
  indicator,
}: StatusIndicatorProps) {
  const visibleIndicator = indicator ?? statusIndicators[tone];

  return (
    <span
      className={cn(
        "inline-flex min-h-6 items-center gap-1 text-xs font-medium leading-4",
        statusStyles[tone],
        className,
      )}
    >
      {visibleIndicator ? (
        <span aria-hidden="true" dir="ltr" className="shrink-0 leading-none">
          {visibleIndicator}
        </span>
      ) : null}
      <span>{children}</span>
    </span>
  );
}
