import {
  ArrowRight,
  CheckCircle2,
  Clock,
  Hospital,
  MapPin,
  QrCode,
  Search,
  ShieldCheck,
  Truck,
} from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Link, useNavigate } from "react-router-dom";

import { CaregiverPageFrame } from "@/features/caregiver/components/caregiver-page-frame";
import { useCaregiverDashboardUnits } from "@/features/caregiver/hooks/use-caregiver";
import type { CaregiverUnitStatus } from "@/features/caregiver/types/caregiver.types";
import { BloodGroupBadge } from "@/shared/components/clinical/blood-group-badge";
import {
  EmptyState,
  ErrorState,
  LoadingState,
} from "@/shared/components/feedback/system-states";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";

export function CaregiverDashboardPage() {
  const { t } = useTranslation();
  const [quickReference, setQuickReference] = useState("");
  const navigate = useNavigate();
  const unitsQuery = useCaregiverDashboardUnits();

  const handleLookupSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (quickReference.trim()) {
      navigate(`/caregiver/tracking/${encodeURIComponent(quickReference.trim())}`);
    }
  };

  const getStatusBadge = (status: CaregiverUnitStatus) => {
    switch (status) {
      case "received_at_hospital":
      case "ready_for_transfusion":
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-bold text-emerald-700 dark:text-emerald-300">
            <CheckCircle2 className="size-3.5" aria-hidden="true" />
            {t("caregiver.atHospital", "At Hospital")}
          </span>
        );
      case "in_transit":
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-500/10 px-3 py-1 text-xs font-bold text-blue-700 dark:text-blue-300">
            <Truck className="size-3.5" aria-hidden="true" />
            {t("caregiver.inTransit", "In Transit")}
          </span>
        );
      case "allocated":
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/10 px-3 py-1 text-xs font-bold text-amber-700 dark:text-amber-300">
            <Clock className="size-3.5" aria-hidden="true" />
            {t("caregiver.allocated", "Allocated")}
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-muted px-3 py-1 text-xs font-medium text-muted-foreground">
            {status}
          </span>
        );
    }
  };

  return (
    <CaregiverPageFrame
      breadcrumbs={[
        { label: t("nav.caregiverTracking", "Caregiver tracking") },
        { label: t("nav.dashboard", "Dashboard") },
      ]}
      title={t("caregiver.dashboardTitle", "Blood Unit Tracking")}
      description={t("caregiver.portalDesc", "Track the real-time transfer progress and cold-chain status of assigned blood units for your patient.")}
      actions={
        <Button asChild size="sm" className="gap-2">
          <Link to="/caregiver/scan">
            <QrCode className="size-4" aria-hidden="true" />
            <span>{t("caregiver.scanBarcodeButton", "Scan QR Code")}</span>
          </Link>
        </Button>
      }
    >
      <div className="space-y-6">
        {/* Quick Reference Lookup Box */}
        <section
          aria-labelledby="tracking-lookup-heading"
          className="border border-border bg-surface p-5 sm:p-6"
        >
          <div className="space-y-1.5 mb-4">
            <h2
              id="tracking-lookup-heading"
              className="text-base font-semibold text-foreground"
            >
              {t("caregiver.scanPrompt", "Enter Blood Bag Tracking Reference")}
            </h2>
            <p className="text-xs text-muted-foreground">
              {t("caregiver.privacyNotice", "Type the code found on your hospital dispatch notification or scan the container barcode.")}
            </p>
          </div>

          <form onSubmit={handleLookupSubmit} className="flex flex-col gap-2.5 sm:flex-row">
            <div className="relative flex-1">
              <Search
                aria-hidden="true"
                className="pointer-events-none absolute start-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
              />
              <Input
                type="search"
                aria-label={t("caregiver.trackingCode", "Enter Blood Unit Reference")}
                placeholder={t("caregiver.referencePlaceholder")}
                value={quickReference}
                onChange={(e) => setQuickReference(e.target.value)}
                className="h-11 ps-9 font-mono text-xs text-start"
              />
            </div>
            <Button type="submit" size="lg" className="h-11 text-xs shrink-0">
              {t("caregiver.trackConsignment", "Track Blood Unit")}
            </Button>
          </form>
        </section>

        {/* Assigned Units Section */}
        <section
          aria-labelledby="assigned-units-heading"
          className="space-y-4"
        >
          <div className="flex items-center justify-between border-b border-border pb-2">
            <h2
              id="assigned-units-heading"
              className="text-sm font-semibold uppercase tracking-wider text-muted-foreground"
            >
              {t("caregiver.activeConsignments", "Active Assigned Units")}
            </h2>
            <span className="text-xs text-muted-foreground">
              {t("caregiver.transitNotice", "Auto-refreshes with dispatch updates")}
            </span>
          </div>

          {unitsQuery.isPending ? (
            <LoadingState label={t("common.loadingRecords", "Checking unit dispatch status…")} />
          ) : unitsQuery.isError ? (
            <ErrorState
              title={t("common.error", "Could not load tracked units")}
              description={t("caregiver.loadErrorDescription")}
              onRetry={() => {
                void unitsQuery.refetch();
              }}
            />
          ) : (unitsQuery.data?.length ?? 0) === 0 ? (
            <EmptyState
              title={t("hospital.noRecordsTitle", "No active blood units assigned")}
              description={t("hospital.noRecordsDesc", "When a blood unit is allocated for your family member, it will automatically appear here.")}
              action={
                <Button asChild size="sm">
                  <Link to="/caregiver/scan">{t("caregiver.scanBarcodeButton", "Scan Unit Barcode")}</Link>
                </Button>
              }
            />
          ) : (
            <div className="space-y-3">
              {unitsQuery.data?.map((unit) => (
                <article
                  key={unit.reference}
                  className="border border-border bg-surface p-5 transition-colors hover:border-primary/60"
                >
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="space-y-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-mono text-sm font-bold text-foreground">
                          <bdi dir="ltr">{unit.reference}</bdi>
                        </span>
                        <BloodGroupBadge group={unit.bloodGroup} />
                        {getStatusBadge(unit.status)}
                      </div>

                      <div className="space-y-1 text-xs">
                        <p className="font-semibold text-foreground">
                          {unit.statusLabel}
                        </p>
                        <p className="flex items-center gap-1.5 text-muted-foreground">
                          <Hospital className="size-3.5 shrink-0 text-primary" />
                          <span>{t("caregiver.hospitalArrival", "Destination")}: {unit.destinationHospital}</span>
                        </p>
                        <p className="flex items-center gap-1.5 text-muted-foreground">
                          <MapPin className="size-3.5 shrink-0 text-muted-foreground" />
                          <span>{t("caregiver.lastCheckpoint", "Current")}: {unit.currentLocation}</span>
                        </p>
                      </div>
                    </div>

                    <Button asChild size="lg" className="h-11 sm:h-9 shrink-0 gap-2">
                      <Link to={`/caregiver/tracking/${encodeURIComponent(unit.reference)}`}>
                        <span>{t("hospital.trackDelivery", "View Live Status")}</span>
                        <ArrowRight className="size-4 rtl:rotate-180" aria-hidden="true" />
                      </Link>
                    </Button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>

        {/* Privacy & Cold Chain Assurance Note */}
        <div className="rounded-lg border border-border bg-surface-subtle p-4 text-xs text-muted-foreground">
          <div className="flex items-start gap-2.5">
            <ShieldCheck className="size-4 shrink-0 text-emerald-600 mt-0.5" />
            <p className="leading-relaxed">
              <strong>{t("caregiver.privacyNotice", "Patient Privacy Protected")}:</strong>{" "}
              {t("caregiver.safeTempAssurance", "This tracking workspace displays verified temperature-control events and location transitions only. Patient clinical diagnoses and donor identities are decoupled in adherence to medical privacy regulations.")}
            </p>
          </div>
        </div>
      </div>
    </CaregiverPageFrame>
  );
}

export default CaregiverDashboardPage;
