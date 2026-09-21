import { useTranslation } from "react-i18next";

import { cn } from "@/shared/lib/utils";

export interface BrandWordmarkProps {
  size?: "sm" | "md" | "lg" | "xl";
  variant?: "on-dark" | "on-light";
  showSubtitle?: boolean;
  className?: string;
}

export function BrandWordmark({
  size = "md",
  variant = "on-dark",
  showSubtitle = false,
  className,
}: BrandWordmarkProps) {
  const { t, i18n } = useTranslation();
  const isArabic = i18n.language.startsWith("ar");

  const sizeClasses = {
    sm: "text-base sm:text-lg",
    md: "text-xl sm:text-2xl",
    lg: "text-2xl sm:text-3xl",
    xl: "text-3xl sm:text-4xl",
  }[size];

  const brandName = isArabic ? "لايــــف ليـــنــك" : "Life Link";

  const primaryTextColor =
    variant === "on-dark" ? "text-white" : "text-foreground";

  return (
    <div className={cn("inline-flex flex-col justify-center", className)}>
      <span
        className={cn(
          "font-heading font-black tracking-normal leading-none select-none transition-colors",
          primaryTextColor,
          sizeClasses,
        )}
      >
        {brandName}
      </span>

      {showSubtitle ? (
        <p
          className={cn(
            "mt-1.5 text-xs font-medium tracking-normal",
            variant === "on-dark" ? "text-[#adc1c9]" : "text-muted-foreground",
          )}
        >
          {t("auth.platformSubtitle", "Clinical Blood Coordination Platform")}
        </p>
      ) : null}
    </div>
  );
}
