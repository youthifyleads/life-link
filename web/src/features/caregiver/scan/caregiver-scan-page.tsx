import {
  ArrowLeft,
  QrCode,
  ScanLine,
  Search,
  Sparkles,
} from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Link, useNavigate } from "react-router-dom";

import { CaregiverPageFrame } from "@/features/caregiver/components/caregiver-page-frame";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";

const demoTrackingPresets = [
  {
    ref: "UNT-B-POS-0331",
    label: "UNT-B-POS-0331 (B+ Plasma · Cairo University Hospital)",
  },
  {
    ref: "UNT-AB-POS-0451",
    label: "UNT-AB-POS-0451 (AB+ Red Cells · Al-Galaa Hospital)",
  },
  {
    ref: "UNT-O-NEG-0142",
    label: "UNT-O-NEG-0142 (O− Universal Donor · Central Reserve)",
  },
];

export function CaregiverScanPage() {
  const { t } = useTranslation();
  const [referenceInput, setReferenceInput] = useState("");
  const [isSimulatingScan, setIsSimulatingScan] = useState(false);
  const [scanNotice, setScanNotice] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (referenceInput.trim()) {
      navigate(`/caregiver/tracking/${encodeURIComponent(referenceInput.trim())}`);
    }
  };

  const handleSimulateScan = (ref: string) => {
    setIsSimulatingScan(true);
    setScanNotice(`Simulating optical barcode scan for "${ref}"…`);
    setTimeout(() => {
      setIsSimulatingScan(false);
      navigate(`/caregiver/tracking/${encodeURIComponent(ref)}`);
    }, 1200);
  };

  return (
    <CaregiverPageFrame
      breadcrumbs={[
        { label: t("nav.caregiverTracking", "Caregiver tracking"), href: "/caregiver/dashboard" },
        { label: t("nav.qrScanLookup", "Scan & lookup") },
      ]}
      title={t("caregiver.scanBarcodeButton", "Scan Blood Bag QR / Barcode")}
      description={t("caregiver.scanPrompt", "Point your device camera at the blood bag label or enter the bag reference code.")}
      actions={
        <Button asChild variant="secondary" size="sm">
          <Link to="/caregiver/dashboard" className="gap-2">
            <ArrowLeft className="size-4 rtl:rotate-180" />
            <span>{t("common.back", "Back to Dashboard")}</span>
          </Link>
        </Button>
      }
    >
      <div className="space-y-6">
        {/* Simulated Scanner Viewport */}
        <section
          aria-labelledby="scanner-view-heading"
          className="relative overflow-hidden border-2 border-dashed border-primary/40 bg-clinical-navy p-8 text-center text-white rounded-lg"
        >
          <div className="mx-auto flex max-w-sm flex-col items-center justify-center space-y-4">
            <div className="relative flex size-24 items-center justify-center rounded-2xl border-2 border-primary/60 bg-white/10 shadow-inner">
              <QrCode className="size-12 text-primary animate-pulse" aria-hidden="true" />
              <ScanLine className="absolute inset-x-2 top-1/2 size-8 -translate-y-1/2 text-white/70" />
            </div>

            <div className="space-y-1">
              <h2
                id="scanner-view-heading"
                className="text-lg font-bold text-white"
              >
                {isSimulatingScan ? t("bloodBank.scanningLedger", "Decoding Barcode…") : t("bloodBank.qrTracking", "Optical QR Viewfinder")}
              </h2>
              <p className="text-xs text-white/70 leading-relaxed">
                {scanNotice ||
                  t("bloodBank.lookupBarcodeDesc", "Hold bag label steadily in frame. In this demonstration environment, tap any quick preset below to simulate an immediate barcode capture.")}
              </p>
            </div>
          </div>
        </section>

        {/* Quick Demo Scan Presets */}
        <section
          aria-labelledby="simulation-presets-heading"
          className="border border-border bg-surface p-5 space-y-3"
        >
          <div className="flex items-center gap-2">
            <Sparkles className="size-4 text-primary" aria-hidden="true" />
            <h3
              id="simulation-presets-heading"
              className="text-sm font-semibold text-foreground"
            >
              {t("bloodBank.demoPresetsLabel", "Simulate Scan with Active Demo Bags")}
            </h3>
          </div>
          <p className="text-xs text-muted-foreground">
            {t("bloodBank.selectDemoPreset", "Select one of the live dispatch units to test the real-time custody lookup:")}
          </p>
          <div className="flex flex-col gap-2 pt-1">
            {demoTrackingPresets.map((preset) => (
              <Button
                key={preset.ref}
                variant="secondary"
                size="lg"
                disabled={isSimulatingScan}
                onClick={() => handleSimulateScan(preset.ref)}
                className="h-auto py-2.5 px-3 justify-start text-xs font-mono text-start hover:border-primary/70 gap-2"
              >
                <QrCode className="size-4 shrink-0 text-primary" />
                <span className="truncate" dir="ltr"><bdi dir="ltr">{preset.label}</bdi></span>
              </Button>
            ))}
          </div>
        </section>

        {/* Manual Code Input Form */}
        <section
          aria-labelledby="manual-input-heading"
          className="border border-border bg-surface p-5 space-y-3"
        >
          <h3
            id="manual-input-heading"
            className="text-sm font-semibold text-foreground"
          >
            {t("bloodBank.scanOrTypePlaceholder", "Or Enter Reference Code Manually")}
          </h3>
          <p className="text-xs text-muted-foreground">
            {t("caregiver.trackingCode", "Type the 12-character bag reference identifier (printed under the barcode).")}
          </p>

          <form onSubmit={handleManualSubmit} className="flex flex-col gap-2.5 sm:flex-row">
            <div className="relative flex-1">
              <Search
                aria-hidden="true"
                className="pointer-events-none absolute start-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
              />
              <Input
                type="text"
                aria-label={t("caregiver.manualReferenceCode")}
                placeholder={t("caregiver.referencePlaceholder")}
                value={referenceInput}
                onChange={(e) => setReferenceInput(e.target.value)}
                className="h-11 ps-9 font-mono text-xs text-start"
              />
            </div>
            <Button
              type="submit"
              size="lg"
              disabled={isSimulatingScan || !referenceInput.trim()}
              className="h-11 text-xs shrink-0"
            >
              {t("bloodBank.lookupUnitAction", "Resolve Reference")}
            </Button>
          </form>
        </section>
      </div>
    </CaregiverPageFrame>
  );
}

export default CaregiverScanPage;
