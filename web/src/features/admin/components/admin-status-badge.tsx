import { useTranslation } from "react-i18next";

import { cn } from "@/shared/lib/utils";

interface AdminStatusBadgeProps {
  status: "active" | "inactive";
  className?: string;
}

export function AdminStatusBadge({ status, className }: AdminStatusBadgeProps) {
  const { t } = useTranslation();
  const isActive = status === "active";

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wider border",
        isActive
          ? "border-emerald-300 bg-emerald-50 text-emerald-900"
          : "border-slate-300 bg-slate-100 text-slate-700",
        className,
      )}
    >
      <span
        className={cn(
          "size-1.5 rounded-full",
          isActive ? "bg-emerald-600" : "bg-slate-400",
        )}
        aria-hidden="true"
      />
      {isActive ? t("common.active") : t("common.inactive")}
    </span>
  );
}
