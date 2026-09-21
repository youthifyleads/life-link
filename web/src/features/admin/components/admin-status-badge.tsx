import { useTranslation } from "react-i18next";

import { StatusIndicator } from "@/shared/components/clinical/status-indicator";
import { cn } from "@/shared/lib/utils";

interface AdminStatusBadgeProps {
  status: "active" | "inactive";
  className?: string;
}

export function AdminStatusBadge({ status, className }: AdminStatusBadgeProps) {
  const { t } = useTranslation();
  const isActive = status === "active";

  return (
    <StatusIndicator
      tone={isActive ? "success" : "neutral"}
      className={cn(className)}
    >
      {isActive ? t("common.active") : t("common.inactive")}
    </StatusIndicator>
  );
}
