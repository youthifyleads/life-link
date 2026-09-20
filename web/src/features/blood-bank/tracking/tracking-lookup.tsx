import { Layers, Loader2, ScanBarcode, Search, X } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";

import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";

interface TrackingLookupProps {
  currentQuery: string;
  onSearch: (id: string) => void;
  isScanning?: boolean;
}

const registeredUnitOptions = [
  { id: "UNT-O-NEG-0142", label: "UNT-O-NEG-0142 · O− Available (In Stock)" },
  {
    id: "UNT-B-POS-0331",
    label: "UNT-B-POS-0331 · B+ Allocated (Req BR-2026-2192)",
  },
  {
    id: "UNT-AB-POS-0451",
    label: "UNT-AB-POS-0451 · AB+ Allocated (Req BR-2026-2191)",
  },
  {
    id: "UNT-A-POS-0211",
    label: "UNT-A-POS-0211 · A+ Platelets (Expiring Soon)",
  },
  { id: "UNT-O-NEG-0992", label: "UNT-O-NEG-0992 · O− Quarantined" },
  { id: "UNT-O-NEG-0991", label: "UNT-O-NEG-0991 · O− Expired" },
];

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

  const handleSelectPreset = (id: string) => {
    setInputValue(id);
    onSearch(id);
  };

  const handleClear = () => {
    setInputValue("");
  };

  return (
    <div className="no-print rounded-lg border border-border/80 bg-surface p-4 sm:p-5 shadow-2xs space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold">
            {t("bloodBank.lookupBarcodeTitle")}
          </h2>
          <p className="mt-0.5 text-xs text-muted-foreground">
            {t("bloodBank.lookupBarcodeDesc")}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground font-medium flex items-center gap-1.5">
            <Layers aria-hidden="true" className="size-3.5 text-primary shrink-0" />
            {t("bloodBank.registeredUnitsLabel")}
          </span>
          <select
            aria-label={t("bloodBank.registeredUnitsLabel")}
            onChange={(e) => {
              if (e.target.value) handleSelectPreset(e.target.value);
            }}
            value=""
            className="h-8 max-w-[17rem] truncate rounded-md border border-field-stroke bg-surface-subtle px-2 text-xs text-foreground focus:border-primary focus:outline-none"
          >
            <option value="" disabled>
              {t("bloodBank.selectRegisteredUnit")}
            </option>
            {registeredUnitOptions.map((p) => (
              <option key={p.id} value={p.id}>
                {p.label}
              </option>
            ))}
          </select>
        </div>
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
              className="absolute end-2.5 top-1/2 -translate-y-1/2 p-1 text-muted-foreground hover:text-foreground focus:outline-none"
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
          className="h-10 gap-1.5 text-xs font-medium"
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

