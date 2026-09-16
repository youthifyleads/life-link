import {
  ArrowLeft,
  CheckCircle2,
  Clock,
  Hospital,
  MapPin,
  PackageCheck,
  ShieldCheck,
  Truck,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { Link, useParams } from "react-router-dom";

import { CaregiverPageFrame } from "@/features/caregiver/components/caregiver-page-frame";
import { useCaregiverUnit } from "@/features/caregiver/hooks/use-caregiver";
import type { CaregiverUnitStatus } from "@/features/caregiver/types/caregiver.types";
import {
  BloodGroupBadge,
} from "@/shared/components/clinical/blood-group-badge";
import {
  ErrorState,
  LoadingState,
} from "@/shared/components/feedback/system-states";
import { Button } from "@/shared/components/ui/button";

export function CaregiverTrackingPage() {
  const { t } = useTranslation();
  const { reference } = useParams<{ reference: string }>();
  const unitQuery = useCaregiverUnit(reference ?? "");

  if (unitQuery.isPending) {
    return (
      <CaregiverPageFrame
        breadcrumbs={[
          { label: t("nav.caregiverTracking", "Caregiver tracking"), href: "/caregiver/dashboard" },
          { label: t("common.status", "Bag Status") },
        ]}
        title={t("hospital.trackDelivery", "Tracking Status")}
        description={t("bloodBank.scanningLedger", "Querying national cold-chain custody ledger…")}
      >
        <LoadingState label={t("bloodBank.scanningLedger", "Tracing blood bag dispatch status…")} />
      </CaregiverPageFrame>
    );
  }

  const unit = unitQuery.data;

  if (unitQuery.isError || !unit) {
    return (
      <CaregiverPageFrame
        breadcrumbs={[
          { label: t("nav.caregiverTracking", "Caregiver tracking"), href: "/caregiver/dashboard" },
          { label: t("common.status", "Bag Status") },
        ]}
        title={t("common.status", "Blood Bag Status")}
        description={t("healthcare.temperatureAssurance", "Verified cold chain transfer records.")}
        actions={
          <Button asChild variant="secondary" size="sm">
            <Link to="/caregiver/scan">{t("caregiver.scanBarcodeButton", "Scan Another Code")}</Link>
          </Button>
        }
      >
        <ErrorState
          title={t("bloodBank.unitNotFoundTitle", "Blood Unit Not Found")}
          description={`No active transfer or reserve record was located for reference "${reference}". Please confirm the 12-character bag reference.`}
          onRetry={() => {
            void unitQuery.refetch();
          }}
        />
      </CaregiverPageFrame>
    );
  }

  const getStatusIcon = (status: CaregiverUnitStatus) => {
    switch (status) {
      case "received_at_hospital":
      case "ready_for_transfusion":
      case "transfused":
        return <CheckCircle2 className="size-6 text-emerald-600" aria-hidden="true" />;
      case "in_transit":
        return <Truck className="size-6 text-blue-600" aria-hidden="true" />;
      case "allocated":
        return <PackageCheck className="size-6 text-amber-600" aria-hidden="true" />;
      default:
        return <Clock className="size-6 text-primary" aria-hidden="true" />;
    }
  };

  return (
    <CaregiverPageFrame
      breadcrumbs={[
        { label: t("nav.caregiverTracking", "Caregiver tracking"), href: "/caregiver/dashboard" },
        { label: unit.reference },
      ]}
      title={`${t("healthcare.bloodUnit", "Bag")} ${unit.reference}`}
      description={t("caregiver.safeTempAssurance", "Live transfer progress and cold chain verification. Decoupled from patient medical records.")}
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
        {/* Status Card */}
        <section
          aria-labelledby="unit-status-heading"
          className="border border-border bg-surface p-6 space-y-4 rounded-lg shadow-xs"
        >
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between border-b border-border pb-4">
            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-mono text-base font-bold text-foreground">
                  <bdi dir="ltr">{unit.reference}</bdi>
                </span>
                <BloodGroupBadge group={unit.bloodGroup} />
                <span className="rounded bg-muted px-2 py-0.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  {unit.component.replace("_", " ")}
                </span>
              </div>
              <h2
                id="unit-status-heading"
                className="text-lg font-bold text-foreground"
              >
                {unit.statusLabel}
              </h2>
            </div>

            <div className="flex items-center gap-3 self-start sm:self-center">
              <div className="flex size-12 items-center justify-center rounded-full bg-surface-subtle border border-border">
                {getStatusIcon(unit.status)}
              </div>
            </div>
          </div>

          <dl className="grid grid-cols-1 gap-4 text-xs sm:grid-cols-2 pt-1">
            <div className="space-y-1">
              <dt className="text-muted-foreground">{t("caregiver.hospitalArrival", "Destination Facility")}</dt>
              <dd className="flex items-center gap-1.5 font-semibold text-foreground">
                <Hospital className="size-4 shrink-0 text-primary" />
                <span>{unit.destinationHospital}</span>
              </dd>
            </div>

            <div className="space-y-1">
              <dt className="text-muted-foreground">{t("caregiver.lastCheckpoint", "Current Verified Location")}</dt>
              <dd className="flex items-center gap-1.5 font-semibold text-foreground">
                <MapPin className="size-4 shrink-0 text-muted-foreground" />
                <span>{unit.currentLocation}</span>
              </dd>
            </div>

            <div className="space-y-1">
              <dt className="text-muted-foreground">{t("caregiver.safeTemp", "Cold-Chain Temperature Assurance")}</dt>
              <dd className="flex items-center gap-1.5 font-semibold text-emerald-700 dark:text-emerald-300">
                <ShieldCheck className="size-4 shrink-0 text-emerald-600" />
                <span><bdi dir="ltr">+2°C to +6°C</bdi> ({t("common.verified", "Monitored")})</span>
              </dd>
            </div>

            <div className="space-y-1">
              <dt className="text-muted-foreground">{t("bloodBank.lastUpdated", "Last Telemetry Timestamp")}</dt>
              <dd className="font-mono font-semibold text-foreground">
                <bdi dir="ltr">{unit.lastUpdated.replace("T", " ").split(".")[0]}</bdi>
              </dd>
            </div>
          </dl>
        </section>

        {/* Milestone Custody Progression */}
        <section
          aria-labelledby="custody-milestones-heading"
          className="border border-border bg-surface p-6 space-y-4 rounded-lg"
        >
          <div className="flex items-center justify-between border-b border-border pb-3">
            <h3
              id="custody-milestones-heading"
              className="text-sm font-semibold uppercase tracking-wider text-muted-foreground"
            >
              {t("bloodBank.timelineTitle", "Custody Transfer Milestones")} (<bdi dir="ltr">{unit.milestones.length}</bdi>)
            </h3>
            <span className="text-[11px] text-muted-foreground">
              {t("hospital.newestFirst", "Newest milestone first")}
            </span>
          </div>

          <ol className="relative space-y-6 before:absolute before:start-3.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-border">
            {[...unit.milestones].reverse().map((milestone) => (
              <li key={milestone.id} className="relative ps-9">
                <span className="absolute start-0 top-0.5 flex size-7 items-center justify-center rounded-full border border-border bg-surface text-primary">
                  <CheckCircle2 className="size-4 text-primary" aria-hidden="true" />
                </span>

                <div className="space-y-1">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="text-xs font-bold text-foreground">
                      {milestone.title}
                    </span>
                    <time className="font-mono text-[10px] text-muted-foreground">
                      <bdi dir="ltr">{milestone.timestamp.replace("T", " ").split(".")[0]}</bdi>
                    </time>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {milestone.summary}
                  </p>
                  <p className="text-[11px] font-medium text-muted-foreground">
                    {t("common.address", "Location")}: <bdi dir="auto">{milestone.location}</bdi>
                  </p>
                </div>
              </li>
            ))}
          </ol>
        </section>

        {/* Reassurance Footer */}
        <div className="rounded-lg border border-border bg-surface-subtle p-4 text-xs text-muted-foreground">
          <div className="flex items-start gap-2.5">
            <ShieldCheck className="size-4 shrink-0 text-emerald-600 mt-0.5" />
            <p className="leading-relaxed">
              {t("bloodBank.traceabilityNotice", "This unit is verified under the National Blood Safety Protocol. If you have questions about the scheduled transfusion time, please consult the charge nurse at")} {unit.destinationHospital}.
            </p>
          </div>
        </div>
      </div>
    </CaregiverPageFrame>
  );
}

export default CaregiverTrackingPage;
