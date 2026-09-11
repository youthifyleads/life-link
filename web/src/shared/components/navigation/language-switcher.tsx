import { useState } from "react";
import { Check, Globe } from "lucide-react";
import { useTranslation } from "react-i18next";

import { getCurrentLanguage, setAppLanguage } from "@/app/i18n/i18n";
import { Button } from "@/shared/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/shared/components/ui/popover";
import { cn } from "@/shared/lib/utils";

interface LanguageSwitcherProps {
  compact?: boolean;
  className?: string;
}

const languages = [
  { code: "en" as const, nativeName: "English (US)" },
  { code: "ar" as const, nativeName: "العربية" },
];

export function LanguageSwitcher({ compact = false, className }: LanguageSwitcherProps) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const currentLang = getCurrentLanguage();
  const activeLabel = t(`common.languages.${currentLang}`);

  const handleSelectLanguage = (language: "en" | "ar") => {
    void setAppLanguage(language);
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size={compact ? "icon" : "default"}
          className={cn(
            "min-h-9 gap-2 px-2.5 text-sm font-medium transition-colors hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring",
            className,
          )}
          aria-label={t("common.changeLanguageCurrent", { language: activeLabel })}
          id="language-switcher-trigger"
        >
          <Globe aria-hidden="true" className="size-4 shrink-0 text-muted-foreground" />
          {!compact ? <span className="font-medium text-foreground">{currentLang === "ar" ? "العربية" : "EN"}</span> : null}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-52 border border-border bg-popover p-1.5 text-popover-foreground shadow-lg" id="language-switcher-popover">
        <div className="border-b border-border px-2.5 py-1.5 text-xs font-semibold text-muted-foreground">
          {t("common.selectLanguage")}
        </div>
        <div className="mt-1 space-y-0.5" role="menu">
          {languages.map((language) => {
            const isSelected = language.code === currentLang;
            return (
              <button
                key={language.code}
                type="button"
                role="menuitemradio"
                aria-checked={isSelected}
                onClick={() => handleSelectLanguage(language.code)}
                className={cn(
                  "flex w-full items-center justify-between gap-3 rounded-md px-2.5 py-2 text-start text-sm transition-colors",
                  isSelected ? "bg-secondary font-semibold text-secondary-foreground" : "text-foreground hover:bg-muted",
                )}
                id={`language-option-${language.code}`}
              >
                <span className="flex min-w-0 flex-col">
                  <span dir={language.code === "ar" ? "rtl" : "ltr"} className="text-sm leading-6">{language.nativeName}</span>
                  <span className="text-xs text-muted-foreground">{t(`common.languages.${language.code}`)}</span>
                </span>
                {isSelected ? <Check aria-hidden="true" className="size-4 shrink-0 text-primary" /> : null}
              </button>
            );
          })}
        </div>
      </PopoverContent>
    </Popover>
  );
}
