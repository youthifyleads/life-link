import { Loader2, ScanBarcode, Search, X } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";

import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";

interface TrackingLookupProps {
  currentQuery: string;
  onSearch: (id: string) => void;
  isScanning?: boolean;
}

export function TrackingLookup({
  currentQuery,
  onSearch,
  isScanning,
}: TrackingLookupProps) {
  const { t } = useTranslation();
  const [inputValue, setInputValue] = useState(currentQuery);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim()) {
      onSearch(inputValue.trim());
    }
  };

  const handleClear = () => {
    setInputValue("");
  };

  return (
    <div className="no-print rounded-lg border border-border/80 bg-surface p-4 sm:p-5 shadow-2xs space-y-4">
      <div>
        <h2 className="text-base font-semibold">
          {t("bloodBank.lookupBarcodeTitle")}
        </h2>
        <p className="mt-0.5 text-xs text-muted-foreground">
          {t("bloodBank.lookupBarcodeDesc")}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-wrap items-center gap-2.5">
        <div className="relative flex-1 min-w-[16rem]">
          <Search
            aria-hidden="true"
            className="pointer-events-none absolute start-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
          />
          <Input
            type="search"
            aria-label={t("bloodBank.scanOrTypePlaceholder")}
            placeholder={t("bloodBank.scanOrTypePlaceholder")}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            className="h-10 ps-9 pe-9 font-mono text-xs"
            dir="ltr"
          />
          {inputValue ? (
            <button
              type="button"
              onClick={handleClear}
              className="absolute end-2.5 top-1/2 -translate-y-1/2 p-1 text-muted-foreground hover:text-foreground focus:outline-none cursor-pointer"
              title={t("bloodBank.clearSearch", "Clear input")}
              aria-label={t("bloodBank.clearSearch", "Clear input")}
            >
              <X aria-hidden="true" className="size-3.5" />
            </button>
          ) : null}
        </div>

        <Button
          type="submit"
          disabled={isScanning || !inputValue.trim()}
          className="h-10 gap-1.5 text-xs font-medium cursor-pointer"
        >
          {isScanning ? (
            <Loader2 aria-hidden="true" className="size-3.5 animate-spin" />
          ) : (
            <ScanBarcode aria-hidden="true" className="size-4" />
          )}
          <span>
            {isScanning
              ? t("common.loading", "Searching…")
              : t("bloodBank.lookupUnitAction", "Track Unit")}
          </span>
        </Button>
      </form>
    </div>
  );
}
