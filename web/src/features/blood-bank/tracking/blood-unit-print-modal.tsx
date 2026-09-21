import { Check, Printer, QrCode, SlidersHorizontal, Tag } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";

import { BloodUnitLabel } from "@/features/blood-bank/tracking/blood-unit-label";
import type { BloodUnit } from "@/features/blood-bank/types/blood-bank.types";
import { Button } from "@/shared/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog";

interface BloodUnitPrintModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  unit: BloodUnit;
}

export function BloodUnitPrintModal({
  open,
  onOpenChange,
  unit,
}: BloodUnitPrintModalProps) {
  const { t } = useTranslation();
  const [showQr, setShowQr] = useState(true);
  const [printFormat, setPrintFormat] = useState<"thermal" | "standard">("thermal");
  const [isPrinting, setIsPrinting] = useState(false);
  const [hasPrinted, setHasPrinted] = useState(false);

  const handlePrint = () => {
    setIsPrinting(true);
    document.body.classList.add("print-label-mode");

    // Apply thermal sizing class to body if chosen
    if (printFormat === "thermal") {
      document.body.classList.add("print-thermal-mode");
    } else {
      document.body.classList.remove("print-thermal-mode");
    }

    // Give browser brief time to layout before opening OS print dialog
    window.setTimeout(() => {
      try {
        window.print();
        setHasPrinted(true);
      } finally {
        setIsPrinting(false);
        document.body.classList.remove("print-label-mode");
        document.body.classList.remove("print-thermal-mode");
        window.setTimeout(() => setHasPrinted(false), 3000);
      }
    }, 150);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl sm:max-w-3xl overflow-hidden p-0">
        <DialogHeader className="p-5 pb-3 border-b border-border bg-surface-subtle">
          <div className="flex items-center gap-2 text-primary">
            <Tag aria-hidden="true" className="size-5" />
            <DialogTitle className="text-base font-bold">
              {t("bloodBank.printPreviewTitle", "Blood Unit Label Preview (ISBT 128)")}
            </DialogTitle>
          </div>
          <DialogDescription className="text-xs text-muted-foreground mt-1">
            {t(
              "bloodBank.printPreviewDesc",
              "Clinical dispatch label preview with Code 128 linear barcodes and QR verification."
            )}
          </DialogDescription>
        </DialogHeader>

        <div className="p-5 space-y-4 max-h-[75vh] overflow-y-auto">
          {/* Options Toolbar */}
          <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-lg border border-border/70 bg-surface-subtle/50 text-xs">
            <div className="flex items-center gap-2">
              <SlidersHorizontal aria-hidden="true" className="size-4 text-muted-foreground" />
              <span className="font-semibold text-foreground">
                {t("common.format", "Output format")}:
              </span>
              <div className="inline-flex rounded-md border border-border bg-surface p-0.5">
                <button
                  type="button"
                  onClick={() => setPrintFormat("thermal")}
                  className={`px-2.5 py-1 text-xs rounded font-medium transition-colors ${
                    printFormat === "thermal"
                      ? "bg-primary text-primary-foreground shadow-xs"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {t("bloodBank.printFormatThermal", "Thermal (100×100mm)")}
                </button>
                <button
                  type="button"
                  onClick={() => setPrintFormat("standard")}
                  className={`px-2.5 py-1 text-xs rounded font-medium transition-colors ${
                    printFormat === "standard"
                      ? "bg-primary text-primary-foreground shadow-xs"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {t("bloodBank.printFormatA4", "Standard A4")}
                </button>
              </div>
            </div>

            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={showQr}
                onChange={(e) => setShowQr(e.target.checked)}
                className="size-4 rounded border-border text-primary focus:ring-primary"
              />
              <span className="flex items-center gap-1 font-medium text-foreground">
                <QrCode aria-hidden="true" className="size-3.5 text-primary" />
                {t("bloodBank.printIncludeQr", "Include Verification QR")}
              </span>
            </label>
          </div>

          {/* Label Visual Stage */}
          <div className="flex flex-col items-center justify-center p-6 bg-muted/40 rounded-xl border border-dashed border-border/80">
            <div className="shadow-lg rounded-sm overflow-hidden transition-transform duration-200 hover:scale-[1.01]">
              <BloodUnitLabel unit={unit} showQr={showQr} />
            </div>
            <p className="mt-3 text-[11px] text-muted-foreground text-center">
              {t(
                "bloodBank.printLabelNotice",
                "High-contrast Code 128 monochrome bars optimized for clinical barcode imagers."
              )}
            </p>
          </div>
        </div>

        <DialogFooter className="p-4 border-t border-border bg-surface-subtle/80 flex items-center justify-between sm:justify-between">
          <div className="text-xs text-muted-foreground">
            DIN: <span className="font-mono font-bold text-foreground">{unit.id}</span>
          </div>

          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => onOpenChange(false)}
              disabled={isPrinting}
            >
              {t("common.close", "Close")}
            </Button>

            <Button
              type="button"
              variant="default"
              size="sm"
              onClick={handlePrint}
              disabled={isPrinting}
              className="gap-1.5"
            >
              {hasPrinted ? (
                <>
                  <Check aria-hidden="true" className="size-4 text-white" />
                  <span>{t("bloodBank.labelPrinted", "Printed")}</span>
                </>
              ) : isPrinting ? (
                <>
                  <Printer aria-hidden="true" className="size-4 animate-spin" />
                  <span>{t("bloodBank.printingLabel", "Printing…")}</span>
                </>
              ) : (
                <>
                  <Printer aria-hidden="true" className="size-4" />
                  <span>{t("bloodBank.printActionNow", "Print Label Now")}</span>
                </>
              )}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
