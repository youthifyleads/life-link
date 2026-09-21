import type { ReactNode } from "react";

interface PageHeaderProps {
  title: string;
  description?: string;
  context?: ReactNode;
  actions?: ReactNode;
}

export function PageHeader({
  title,
  description,
  context,
  actions,
}: PageHeaderProps) {
  return (
    <header className="flex flex-col gap-4 border-b border-border pb-5 sm:flex-row sm:items-end sm:justify-between">
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-xl font-semibold leading-tight tracking-[-0.02em] text-foreground sm:text-2xl">
            {title}
          </h1>
          {context}
        </div>
        {description ? (
          <p className="mt-1.5 max-w-[70ch] text-sm leading-6 text-muted-foreground">
            {description}
          </p>
        ) : null}
      </div>
      {actions ? (
        <div className="flex shrink-0 flex-wrap items-center gap-2">
          {actions}
        </div>
      ) : null}
    </header>
  );
}
