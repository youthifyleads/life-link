import { QrCode, Search, Sparkles } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";

import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";

interface TrackingLookupProps {
  currentQuery: string;
  onSearch: (id: string) => void;
  isScanning?: boolean;
}

const demoPresets = [
  { id: "UNT-O-NEG-0142", label: "O− Available Unit (UNT-O-NEG-0142)" },
  { id: "UNT-B-POS-0331", label: "B+ Allocated Unit (UNT-B-POS-0331 -> BR-2026-2192)" },
  { id: "UNT-AB-POS-0451", label: "AB+ Allocated Unit (UNT-AB-POS-0451 -> BR-2026-2191)" },
  { id: "UNT-A-POS-0211", label: "A+ Expiring Soon Platelets (UNT-A-POS-0211)" },
  { id: "UNT-O-NEG-0992", label: "O− Quarantined Unit (UNT-O-NEG-0992)" },
  { id: "UNT-O-NEG-0991", label: "O− Expired Unit (UNT-O-NEG-0991)" },
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

  return (
    <div className="border border-border bg-surface p-5 space-y-4">
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
          <span className="text-xs text-muted-foreground font-medium">
            {t("bloodBank.demoPresetsLabel")}
          </span>
          <select
            aria-label={t("bloodBank.demoPresetsLabel")}
            onChange={(e) => {
              if (e.target.value) handleSelectPreset(e.target.value);
            }}
            defaultValue=""
            className="h-8 max-w-[17rem] truncate rounded-none border border-field-stroke bg-surface-subtle px-2 text-xs text-foreground focus:border-primary focus:outline-none"
          >
            <option value="" disabled>
              {t("bloodBank.selectDemoPreset")}
            </option>
            {demoPresets.map((p) => (
              <option key={p.id} value={p.id}>
                {p.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-wrap gap-2.5">
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
            className="h-10 ps-9 font-mono text-xs"
            dir="ltr"
          />
        </div>

        <Button type="submit" disabled={isScanning} className="h-10 text-xs">
          <QrCode aria-hidden="true" className="size-4" />
          {isScanning ? t("common.loading") : t("bloodBank.lookupUnitAction")}
        </Button>

        <Button
          type="button"
          variant="secondary"
          className="h-10 text-xs"
          onClick={() => handleSelectPreset("UNT-B-POS-0331")}
        >
          <Sparkles aria-hidden="true" className="size-3.5" />
          {t("bloodBank.simulateScanAction")}
        </Button>
      </form>
    </div>
  );
}
