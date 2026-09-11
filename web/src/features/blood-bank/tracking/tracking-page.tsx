import { Boxes, QrCode, SearchX } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Link, useSearchParams } from "react-router-dom";

import { BloodBankPageFrame } from "@/features/blood-bank/components/blood-bank-page-frame";
import { useLookupBloodUnit } from "@/features/blood-bank/hooks/use-blood-bank-inventory";
import { CustodyTimeline } from "@/features/blood-bank/tracking/custody-timeline";
import { TrackingLookup } from "@/features/blood-bank/tracking/tracking-lookup";
import { TrackingResult } from "@/features/blood-bank/tracking/tracking-result";
import {
  ErrorState,
  LoadingState,
} from "@/shared/components/feedback/system-states";
import { Button } from "@/shared/components/ui/button";

export function BloodBankTrackingPage() {
  const { t } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();
  const urlId = searchParams.get("id");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const activeId = urlId ?? selectedId ?? "UNT-B-POS-0331";

  const lookupQuery = useLookupBloodUnit(activeId);
  const foundUnit = lookupQuery.data;

  const handleSearch = (newId: string) => {
    setSelectedId(newId);
    setSearchParams({ id: newId });
  };

  return (
    <BloodBankPageFrame
      breadcrumbs={[
        { label: t("healthcare.bloodBank"), href: "/blood-bank/dashboard" },
        { label: t("nav.qrTracking") },
      ]}
      title={t("bloodBank.trackingTitle")}
      description={t("bloodBank.trackingSubtitle")}
      actions={
        <Button asChild variant="secondary" size="sm" className="h-9 text-xs">
          <Link to="/blood-bank/inventory">
            <Boxes aria-hidden="true" className="size-3.5" />
            {t("bloodBank.centralInventoryAction")}
          </Link>
        </Button>
      }
    >
      <div className="space-y-6">
        {/* Lookup / Scan Input */}
        <TrackingLookup
          currentQuery={activeId}
          onSearch={handleSearch}
          isScanning={lookupQuery.isFetching}
        />

        {/* Status / Results Section */}
        {lookupQuery.isPending && activeId ? (
          <LoadingState label={t("bloodBank.scanningLedger")} />
        ) : lookupQuery.isError ? (
          <ErrorState
            title={t("bloodBank.trackingLookupFailed")}
            description={t("bloodBank.trackingLookupFailedDesc")}
            onRetry={() => {
              void lookupQuery.refetch();
            }}
          />
        ) : !activeId ? (
          /* Empty / Unscanned State */
          <div className="border border-border bg-surface p-12 text-center">
            <div className="mx-auto flex size-12 items-center justify-center border border-border bg-surface-subtle text-muted-foreground">
              <QrCode aria-hidden="true" className="size-6" />
            </div>
            <h3 className="mt-3 text-sm font-semibold text-foreground">
              {t("bloodBank.noUnitScannedTitle")}
            </h3>
            <p className="mt-1 text-xs text-muted-foreground max-w-sm mx-auto">
              {t("bloodBank.noUnitScannedDesc")}
            </p>
          </div>
        ) : !foundUnit ? (
          /* Unit Not Found Alert */
          <div className="border border-destructive/30 bg-emergency-subtle p-6 text-xs text-foreground space-y-3">
            <div className="flex items-center gap-2 font-semibold text-emergency text-sm">
              <SearchX aria-hidden="true" className="size-5" />
              <span>
                {t("bloodBank.unitNotFoundTitle", { id: activeId })}
              </span>
            </div>
            <p className="text-muted-foreground">
              {t("bloodBank.unitNotFoundDesc")}
            </p>
            <div className="flex flex-wrap gap-2 pt-1">
              {["UNT-O-NEG-0142", "UNT-B-POS-0331", "UNT-AB-POS-0451", "UNT-A-POS-0211"].map(
                (demoId) => (
                  <button
                    key={demoId}
                    type="button"
                    onClick={() => handleSearch(demoId)}
                    className="border border-emergency/40 bg-surface px-2.5 py-1 font-mono text-xs font-semibold text-emergency hover:bg-emergency/10 focus:outline-none"
                  >
                    <bdi dir="ltr">{demoId}</bdi>
                  </button>
                ),
              )}
            </div>
          </div>
        ) : (
          /* Found Unit Display */
          <div className="space-y-6">
            <TrackingResult unit={foundUnit} />
            <CustodyTimeline events={foundUnit.custodyEvents} />
          </div>
        )}
      </div>
    </BloodBankPageFrame>
  );
}
export { BloodBankTrackingPage as default };
