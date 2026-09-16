import { Droplet } from "lucide-react";
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
        "inline-flex items-center justify-center gap-1.5 rounded-md border border-primary/30 bg-surface font-bold text-clinical-navy tabular-nums",
        size === "default"
          ? "min-h-9 min-w-14 px-2.5 text-sm"
          : "min-h-7 min-w-11 px-2 text-xs",
        className,
      )}
    >
      <Droplet
        aria-hidden="true"
        className="size-3.5 fill-secondary text-primary shrink-0"
      />
      <bdi dir="ltr" className="unicode-isolate">{group}</bdi>
    </span>
  );
}
