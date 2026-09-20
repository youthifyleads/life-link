import { useTranslation } from "react-i18next";

import type { BloodGroup } from "@/shared/components/clinical/clinical.types";
import { cn } from "@/shared/lib/utils";

interface BloodGroupBadgeProps {
  group: BloodGroup;
  className?: string;
  size?: "default" | "compact";
}

export function BloodGroupBadge({
  group,
  className,
  size = "default",
}: BloodGroupBadgeProps) {
  const { t } = useTranslation();
  return (
    <span
      aria-label={t("healthcare.bloodGroupValue", { group })}
      className={cn(
        "inline-flex items-center font-bold text-emergency tabular-nums",
        size === "default" ? "text-sm" : "text-xs",
        className,
      )}
    >
      <bdi dir="ltr" className="unicode-isolate">
        {group}
      </bdi>
    </span>
  );
}
