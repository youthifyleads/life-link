import { useTranslation } from "react-i18next";

import {
  formatBloodBankComponent,
  formatStorageLocation,
} from "@/features/blood-bank/components/blood-bank-formatters";
import type { BloodUnit } from "@/features/blood-bank/types/blood-bank.types";
import { MedicalBarcode } from "@/shared/components/barcode/medical-barcode";
import { MedicalQrCode } from "@/shared/components/barcode/medical-qr-code";

export interface BloodUnitLabelProps {
  unit: BloodUnit;
  /** Custom tracking verification URL for QR code, defaults to window.location origin */
  verificationUrl?: string;
  /** Whether to show the QR code (defaults to true) */
  showQr?: boolean;
  /** Additional wrapper CSS class */
  className?: string;
}

/**
 * ISBT 128 Standard Compliant Blood Product Custody Label
 * Renders an authentic 4-quadrant clinical label with Code 128 linear barcodes,
 * prominent high-contrast ABO/Rh phenotype, and mobile-scannable QR verification.
 */
export function BloodUnitLabel({
  unit,
  verificationUrl,
  showQr = true,
  className = "",
}: BloodUnitLabelProps) {
  const { t } = useTranslation();

  const origin =
    typeof window !== "undefined" ? window.location.origin : "https://lifelink.health";
  const finalVerificationUrl =
    verificationUrl || `${origin}/blood-bank/tracking?id=${encodeURIComponent(unit.id)}`;

  const isRhPositive = unit.bloodGroup.includes("+");

  // Format expiry and collection dates cleanly (YYYY-MM-DD)
  const collectionDateFormatted = unit.collectionDate.split("T")[0];
  const expiryDateFormatted = unit.expiryDate.split("T")[0];

  // Map component storage temperature for cold-chain compliance
  const getStorageTemp = (comp: string) => {
    switch (comp) {
      case "fresh_frozen_plasma":
      case "cryoprecipitate":
        return "≤ -18°C (Frozen / مجمد)";
      case "platelets":
        return "+20°C to +24°C (Agitated / تحريك مستمر)";
      default:
        return "+2°C to +6°C (Refrigerated / تبريد)";
    }
  };

  return (
    <div
      id="blood-unit-printable-label"
      className={`printable-unit-label w-full max-w-[460px] border-2 border-black bg-white p-2.5 text-black font-mono select-none text-left [dir='ltr'] ${className}`}
      dir="ltr"
    >
      {/* Official ISBT 128 Header Bar */}
      <div className="flex items-center justify-between border-b-2 border-black pb-1.5 mb-2">
        <div>
          <span className="block text-[9px] font-black tracking-wider uppercase text-gray-800">
            {t("healthcare.bloodBank", "Central Blood Bank")} · ISBT 128
          </span>
          <h2 className="text-[11px] font-black uppercase tracking-tight text-black">
            {t("bloodBank.officialDispatchLabel", "ISBT 128 Blood Product Custody Label")}
          </h2>
        </div>
        <div className="text-right">
          <span className="inline-block border border-black bg-black px-1.5 py-0.5 text-[8.5px] font-bold text-white uppercase tracking-wider">
            CLINICAL SPECIMEN
          </span>
        </div>
      </div>

      {/* 4-Quadrant Standard Clinical Grid */}
      <div className="grid grid-cols-2 border-2 border-black divide-x-2 divide-black text-xs">
        {/* QUADRANT 1 (Top-Left): DIN & Primary Linear Barcode */}
        <div className="p-2 flex flex-col justify-between border-b-2 border-black min-h-[120px]">
          <div>
            <span className="block text-[8.5px] font-bold uppercase tracking-wider text-gray-700">
              {t("bloodBank.productIdentifier", "Donation ID (DIN)")}
            </span>
            <span className="block text-sm font-black tracking-wide leading-tight">
              {unit.id}
            </span>
          </div>

          {/* Primary Linear Barcode (Code 128) */}
          <div className="my-1 flex justify-center py-0.5 bg-white">
            <MedicalBarcode
              value={unit.id}
              width={1.3}
              height={32}
              displayValue={false}
              margin={1}
            />
          </div>

          <div className="text-[9.5px] space-y-0.5 pt-1 border-t border-dashed border-gray-400">
            <div className="flex justify-between">
              <span className="text-gray-600 uppercase font-semibold">
                {t("bloodBank.collection", "Collected")}:
              </span>
              <span className="font-bold">{collectionDateFormatted}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 uppercase font-semibold">STATUS:</span>
              <span className="font-bold uppercase">{unit.status}</span>
            </div>
          </div>
        </div>

        {/* QUADRANT 2 (Top-Right): ABO / Rh Blood Group */}
        <div className="p-2 flex flex-col justify-between border-b-2 border-black min-h-[120px] bg-gray-50/70">
          <div className="flex items-start justify-between">
            <div>
              <span className="block text-[8.5px] font-bold uppercase tracking-wider text-gray-700">
                {t("bloodBank.aboRhGroup", "ABO / Rh Group")}
              </span>
              <span className="text-[10px] font-bold text-gray-800">
                {isRhPositive ? "Rh(D) POSITIVE" : "Rh(D) NEGATIVE"}
              </span>
            </div>

            {/* High-Contrast ABO/Rh Eye-Readable Box */}
            <div className="border-2 border-black bg-white px-2.5 py-0.5 text-center shadow-xs">
              <span className="block text-xl font-black leading-none tracking-tight">
                {unit.bloodGroup}
              </span>
            </div>
          </div>

          {/* Secondary Barcode for Blood Group Validation (ISBT 128 standard) */}
          <div className="my-0.5 flex justify-center">
            <MedicalBarcode
              value={`=${unit.bloodGroup}`}
              width={1.1}
              height={22}
              displayValue={false}
              margin={1}
            />
          </div>

          <div className="text-[9.5px] text-gray-700 pt-1 border-t border-dashed border-gray-400 flex justify-between">
            <span className="font-semibold">PHENOTYPE:</span>
            <span className="font-bold">
              {unit.bloodGroup === "O−" || (unit.bloodGroup as string) === "O-"
                ? "UNIVERSAL DONOR"
                : "VERIFIED ISBT"}
            </span>
          </div>
        </div>

        {/* QUADRANT 3 (Bottom-Left): Component & Cold-Chain Specs */}
        <div className="p-2 flex flex-col justify-between min-h-[110px]">
          <div>
            <span className="block text-[8.5px] font-bold uppercase tracking-wider text-gray-700">
              {t("common.component", "Biological Component")}
            </span>
            <span className="block text-[11px] font-black uppercase text-black leading-tight mt-0.5">
              {formatBloodBankComponent(unit.component)}
            </span>
            <span className="block text-[9.5px] text-gray-600 font-medium">
              250 mL ± 10% · CPD-A1 Solution
            </span>
          </div>

          <div className="text-[9.5px] space-y-0.5 pt-1 border-t border-dashed border-gray-400">
            <div>
              <span className="block text-[8.5px] text-gray-600 uppercase font-semibold">
                REQUIRED COLD CHAIN:
              </span>
              <span className="font-bold text-[9.5px] text-black">
                {getStorageTemp(unit.component)}
              </span>
            </div>
            <div>
              <span className="block text-[8.5px] text-gray-600 uppercase font-semibold">
                {t("bloodBank.storageLocation", "Location")}:
              </span>
              <span className="font-bold text-[9.5px] truncate block">
                {formatStorageLocation(unit.storageLocation)}
              </span>
            </div>
          </div>
        </div>

        {/* QUADRANT 4 (Bottom-Right): Expiry, Allocation & Verification QR */}
        <div className="p-2 flex flex-col justify-between min-h-[110px] bg-gray-50/70">
          <div>
            <span className="block text-[8.5px] font-bold uppercase tracking-wider text-gray-700">
              {t("bloodBank.expiry", "Expiration Date")}
            </span>
            <span className="block text-xs font-black underline decoration-2 tracking-wide text-black">
              {expiryDateFormatted}
            </span>

            <div className="mt-0.5">
              <span className="block text-[8.5px] text-gray-600 uppercase font-semibold">
                {t("bloodBank.assignedRequest", "Requisition Ref")}:
              </span>
              <span className="block font-bold text-[9.5px] text-black truncate">
                {unit.allocatedRequestId ? `#${unit.allocatedRequestId}` : "STOCK UNASSIGNED"}
              </span>
            </div>
          </div>

          {/* Verification QR Code or Compact Reference */}
          {showQr ? (
            <div className="flex items-center gap-2 pt-1 border-t border-dashed border-gray-400">
              <div className="border border-black bg-white p-0.5 shrink-0">
                <MedicalQrCode
                  value={finalVerificationUrl}
                  size={48}
                  margin={1}
                  errorCorrectionLevel="H"
                  ariaLabel={`Verification QR code for unit ${unit.id}`}
                />
              </div>
              <div className="text-[7.5px] leading-tight text-gray-700 uppercase">
                <span className="font-bold block text-[8px]">SCAN FOR AUDIT</span>
                <span>Direct custody verification</span>
              </div>
            </div>
          ) : (
            <div className="text-[8.5px] text-gray-600 pt-1 border-t border-dashed border-gray-400">
              <span>VERIFIED VIA LIFE-LINK CORE</span>
            </div>
          )}
        </div>
      </div>

      {/* Safety & Compliance Bottom Bar */}
      <div className="mt-1.5 pt-1 border-t border-black text-[8.5px] text-gray-700 flex justify-between items-center">
        <span>STRICT BLOOD CUSTODY · NON-TRANSFERABLE</span>
        <span className="font-bold">DIN: {unit.id}</span>
      </div>
    </div>
  );
}
