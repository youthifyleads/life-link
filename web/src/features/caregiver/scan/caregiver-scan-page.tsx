import { ArrowLeft, ScanBarcode } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Link, useNavigate } from "react-router-dom";

import { CaregiverPageFrame } from "@/features/caregiver/components/caregiver-page-frame";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";

export function CaregiverScanPage() {
  const { t } = useTranslation();
  const [referenceInput, setReferenceInput] = useState("");
  const navigate = useNavigate();

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (referenceInput.trim()) {
      navigate(
        `/caregiver/tracking/${encodeURIComponent(referenceInput.trim())}`,
      );
    }
  };

  return (
    <CaregiverPageFrame
      breadcrumbs={[
        {
          label: t("nav.caregiverTracking", "Caregiver tracking"),
          href: "/caregiver/dashboard",
        },
        { label: t("nav.qrScanLookup", "Scan & lookup") },
      ]}
      title={t("caregiver.scanBarcodeButton", "Scan Blood Bag QR / Barcode")}
      description={t(
        "caregiver.scanPrompt",
        "Point your device camera at the blood bag label or enter the bag reference code.",
      )}
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
        <section
          aria-labelledby="manual-input-heading"
          className="rounded-lg border border-border/80 bg-surface p-5 sm:p-6 shadow-2xs space-y-3"
        >
          <div className="flex items-center gap-2">
            <ScanBarcode
              aria-hidden="true"
              className="size-4 shrink-0 text-primary"
            />
            <h2
              id="manual-input-heading"
              className="text-sm font-semibold text-foreground"
            >
              {t("bloodBank.scanOrTypePlaceholder", "Enter Reference Code")}
            </h2>
          </div>
          <p className="text-xs text-muted-foreground">
            {t(
              "caregiver.trackingCode",
              "Type the 12-character bag reference identifier (printed under the barcode).",
            )}
          </p>

          <form
            onSubmit={handleManualSubmit}
            className="flex flex-col gap-2.5 sm:flex-row"
          >
            <div className="relative flex-1">
              <ScanBarcode
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
              disabled={!referenceInput.trim()}
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
