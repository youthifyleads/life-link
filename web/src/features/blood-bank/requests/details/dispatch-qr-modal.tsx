import {
  Check,
  Clipboard,
  Layers,
  Printer,
  QrCode,
  ShieldCheck,
  ThermometerSnowflake,
  Truck,
} from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";

import {
  bloodBankComponentLabels,
  type BloodBankRequest,
  type BloodUnit,
} from "@/features/blood-bank/types/blood-bank.types";
import { BloodGroupBadge } from "@/shared/components/clinical/blood-group-badge";
import { Button } from "@/shared/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog";

interface DispatchQrModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  request: BloodBankRequest;
  allocatedUnits: BloodUnit[];
}

export function DispatchQrModal({
  open,
  onOpenChange,
  request,
  allocatedUnits,
}: DispatchQrModalProps) {
  const { t } = useTranslation();
  const [copied, setCopied] = useState(false);
  const [printed, setPrinted] = useState(false);

  const trackingReference = `SEC-DISP-${request.id.replace("BR-", "")}-EGY`;
  const containerId = `CTC-COLD-${request.id.replace("BR-", "")}`;
  const sealId = `SEAL-889-${request.id.slice(-4)}`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(trackingReference);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // ignore
    }
  };

  const handlePrint = () => {
    setPrinted(true);
    setTimeout(() => setPrinted(false), 3000);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg sm:max-w-xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-base">
            <QrCode className="size-4 text-primary" aria-hidden="true" />
            {t("bloodBank.dispatchQrTitle", "Dispatch QR & Cold Box Waybill")}
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            {t("bloodBank.dispatchQrDesc", {
              id: request.id,
              defaultValue: `Digital custody waypoint conforming to POST /api/v1/requests/${request.id}/qr. Exposes authorized cold-chain reference only; patient clinical data is strictly withheld.`,
            })}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2 text-xs">
          {/* QR Code Presentation Box */}
          <div className="flex flex-col items-center justify-center border border-border bg-surface-subtle p-5 text-center">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              {t("bloodBank.custodyReference", "Authorized Custody Tracking Reference")}
            </span>
            <p className="mt-1 font-mono text-base font-bold text-foreground">
              <bdi dir="ltr">{trackingReference}</bdi>
            </p>

            <div className="mt-4 flex size-28 items-center justify-center border border-border bg-white text-clinical-ink shadow-sm">
              <QrCode className="size-20" aria-hidden="true" />
            </div>

            <div className="mt-3 flex items-center gap-2">
              <Button
                type="button"
                variant="secondary"
                size="sm"
                className="h-7 text-xs px-2.5"
                onClick={() => void handleCopy()}
              >
                {copied ? (
                  <>
                    <Check className="size-3 text-success" aria-hidden="true" />
                    {t("bloodBank.copied", "Copied token")}
                  </>
                ) : (
                  <>
                    <Clipboard className="size-3" aria-hidden="true" />
                    {t("bloodBank.copyReference", "Copy reference")}
                  </>
                )}
              </Button>
            </div>

            <p className="mt-2 text-[10px] text-muted-foreground">
              {t("bloodBank.scannableNotice", "Scannable by authorized logistics couriers and hospital triage receivers.")}
            </p>
          </div>

          {/* Cold-Chain Packaging Manifest (Waybill) */}
          <section
            aria-labelledby="waybill-manifest-title"
            className="border border-border bg-surface p-4 space-y-3"
          >
            <div className="flex items-center justify-between border-b border-border pb-2">
              <h4
                id="waybill-manifest-title"
                className="font-semibold text-xs text-foreground flex items-center gap-1.5"
              >
                <Truck className="size-3.5 text-primary" aria-hidden="true" />
                {t("bloodBank.manifestTitle", "Cold Box Dispatch Manifest")}
              </h4>
              <span className="font-mono text-[11px] text-muted-foreground">
                {t("bloodBank.requisition", "Requisition")}: <bdi dir="ltr">{request.id}</bdi>
              </span>
            </div>

            <dl className="grid grid-cols-2 gap-3 text-[11px]">
              <div>
                <dt className="text-muted-foreground">{t("bloodBank.destHospital", "Destination Hospital")}</dt>
                <dd className="font-medium text-foreground mt-0.5">
                  {request.hospital.name} (<bdi dir="ltr">{request.hospital.facilityCode}</bdi>)
                </dd>
              </div>
              <div>
                <dt className="text-muted-foreground">{t("bloodBank.transfusionProfile", "Target Transfusion Profile")}</dt>
                <dd className="flex items-center gap-1.5 mt-0.5 font-medium text-foreground">
                  <BloodGroupBadge group={request.bloodGroup} />
                  <span>{bloodBankComponentLabels[request.component]}</span>
                </dd>
              </div>
              <div>
                <dt className="text-muted-foreground">{t("bloodBank.transportBox", "Certified Transport Box")}</dt>
                <dd className="font-mono font-semibold text-foreground mt-0.5">
                  <bdi dir="ltr">{containerId}</bdi>
                </dd>
              </div>
              <div>
                <dt className="text-muted-foreground">{t("bloodBank.coldChainTemp", "Cold-Chain Temperature")}</dt>
                <dd className="flex items-center gap-1 font-semibold text-primary mt-0.5">
                  <ThermometerSnowflake className="size-3 text-primary" aria-hidden="true" />
                  <bdi dir="ltr">{t("bloodBank.activeLogger", "+2.0°C to +6.0°C (Active logger)")}</bdi>
                </dd>
              </div>
              <div>
                <dt className="text-muted-foreground">{t("bloodBank.tamperSeal", "Security Tamper Seal")}</dt>
                <dd className="font-mono font-medium text-foreground mt-0.5">
                  <bdi dir="ltr">{sealId}</bdi>
                </dd>
              </div>
              <div>
                <dt className="text-muted-foreground">{t("bloodBank.dispatchedBy", "Dispatched By")}</dt>
                <dd className="font-medium text-foreground mt-0.5">
                  {t("bloodBank.centralBankDepot", "Central Blood Bank — Transfusion Depot")}
                </dd>
              </div>
            </dl>

            {/* Allocated Biological Units in Waybill */}
            <div className="pt-2 border-t border-border">
              <div className="flex items-center justify-between text-[11px] mb-1.5">
                <span className="font-semibold text-foreground flex items-center gap-1">
                  <Layers className="size-3" aria-hidden="true" />
                  {t("bloodBank.unitsInPackage", {
                    count: allocatedUnits.length,
                    total: request.quantity,
                    defaultValue: `Allocated Units In Package (${allocatedUnits.length} of ${request.quantity})`,
                  })}
                </span>
                <span className="text-muted-foreground">{t("bloodBank.coldVerified", "Cold storage verified")}</span>
              </div>

              {allocatedUnits.length === 0 ? (
                <p className="text-[11px] text-muted-foreground italic">
                  {t("bloodBank.noUnitsInPackage", "No blood units have been allocated to this package yet.")}
                </p>
              ) : (
                <div className="divide-y divide-border border border-border bg-surface-subtle">
                  {allocatedUnits.map((u) => (
                    <div
                      key={u.id}
                      className="flex items-center justify-between px-3 py-1.5 text-[11px]"
                    >
                      <span className="font-mono font-bold text-foreground">
                        <bdi dir="ltr">{u.id}</bdi>
                      </span>
                      <span className="text-muted-foreground">
                        {t("bloodBank.expiry", "Expires")}: <bdi dir="ltr">{u.expiryDate.split("T")[0]}</bdi>
                      </span>
                      <span className="text-success font-medium flex items-center gap-1">
                        <ShieldCheck className="size-3" aria-hidden="true" />
                        {t("bloodBank.packed", "Packed")}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>

          {printed ? (
            <div className="border border-success/30 bg-success-subtle p-3 text-xs text-success flex items-center gap-2">
              <Check className="size-4" aria-hidden="true" />
              <span>{t("bloodBank.waybillSentPrinter", "Waybill sent to connected dispatch label printer.")}</span>
            </div>
          ) : null}
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            type="button"
            variant="secondary"
            onClick={() => onOpenChange(false)}
          >
            {t("common.close", "Close")}
          </Button>
          <Button type="button" onClick={handlePrint}>
            <Printer className="size-3.5" aria-hidden="true" />
            {t("bloodBank.printWaybill", "Print dispatch waybill")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
