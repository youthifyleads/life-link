import {
  Inbox,
  RefreshCw,
  ShieldX,
  TriangleAlert,
  type LucideIcon,
} from "lucide-react";
import type { ReactNode } from "react";

import { Button } from "@/shared/components/ui/button";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { cn } from "@/shared/lib/utils";

interface BaseStateProps {
  title: string;
  description: string;
  className?: string;
  action?: ReactNode;
}

interface StateFrameProps extends BaseStateProps {
  icon: LucideIcon;
  tone?: "neutral" | "error" | "permission";
}

function StateFrame({
  title,
  description,
  icon: Icon,
  tone = "neutral",
  action,
  className,
}: StateFrameProps) {
  return (
    <section
      className={cn(
        "flex min-h-36 flex-col justify-between gap-5 border border-border bg-surface p-5 sm:flex-row sm:items-center sm:p-6",
        tone === "error" && "border-destructive/25 bg-emergency-subtle",
        tone === "permission" && "bg-surface-subtle",
        className,
      )}
    >
      <div className="flex min-w-0 items-start gap-4">
        <span
          className={cn(
            "mt-0.5 flex size-10 shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground",
            tone === "error" && "bg-white/70 text-destructive",
            tone === "permission" && "bg-secondary text-primary",
          )}
        >
          <Icon aria-hidden="true" className="size-5" />
        </span>
        <div>
          <h2 className="text-base font-semibold text-foreground">{title}</h2>
          <p className="mt-1.5 max-w-[65ch] text-sm leading-6 text-muted-foreground">
            {description}
          </p>
        </div>
      </div>
      {action ? <div className="shrink-0 ps-14 sm:ps-0">{action}</div> : null}
    </section>
  );
}

import { useTranslation } from "react-i18next";

export function EmptyState(props: BaseStateProps) {
  return <StateFrame icon={Inbox} {...props} />;
}

interface ErrorStateProps extends Omit<BaseStateProps, "action"> {
  onRetry?: () => void;
}

export function ErrorState({ onRetry, ...props }: ErrorStateProps) {
  const { t } = useTranslation();
  return (
    <StateFrame
      icon={TriangleAlert}
      tone="error"
      action={
        onRetry ? (
          <Button type="button" variant="secondary" onClick={onRetry}>
            <RefreshCw aria-hidden="true" />
            {t("common.tryAgain", "Try again")}
          </Button>
        ) : undefined
      }
      {...props}
    />
  );
}

export function PermissionState(props: BaseStateProps) {
  return <StateFrame icon={ShieldX} tone="permission" {...props} />;
}

interface LoadingStateProps {
  label?: string;
  rows?: number;
  className?: string;
}

export function LoadingState({
  label,
  rows = 4,
  className,
}: LoadingStateProps) {
  const { t } = useTranslation();
  const displayLabel = label ?? t("common.loadingRecords", "Loading clinical records…");

  return (
    <section
      className={cn("border border-border bg-surface", className)}
      role="status"
      aria-busy="true"
      aria-label={displayLabel}
    >
      <div className="flex min-h-14 items-center border-b border-border px-5">
        <Skeleton className="h-4 w-40" />
      </div>
      <div className="divide-y divide-border">
        {Array.from({ length: rows }, (_, index) => (
          <div
            key={index}
            className="grid min-h-14 grid-cols-[minmax(8rem,1.4fr)_1fr_5rem] items-center gap-4 px-5"
          >
            <Skeleton className="h-3.5 w-4/5" />
            <Skeleton className="h-3.5 w-3/5" />
            <Skeleton className="h-7 w-full rounded-md" />
          </div>
        ))}
      </div>
      <span className="sr-only">{label}</span>
    </section>
  );
}
