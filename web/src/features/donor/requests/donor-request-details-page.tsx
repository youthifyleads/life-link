import {
  ArrowLeft,
  CheckCircle2,
  Clock,
  HeartHandshake,
  Hospital,
  Info,
  MapPin,
  Phone,
  ShieldCheck,
  XCircle,
} from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Link, useParams } from "react-router-dom";

import { DonorPageFrame } from "@/features/donor/components/donor-page-frame";
import {
  useDonationRequest,
  useRespondToDonationRequest,
} from "@/features/donor/hooks/use-donor";
import type { DonationResponseStatus } from "@/features/donor/types/donor.types";
import { BloodGroupBadge } from "@/shared/components/clinical/blood-group-badge";
import { UrgencyBadge } from "@/shared/components/clinical/urgency-badge";
import {
  ErrorState,
  LoadingState,
} from "@/shared/components/feedback/system-states";
import { Button } from "@/shared/components/ui/button";

export function DonorRequestDetailsPage() {
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);

  const requestQuery = useDonationRequest(id ?? "");
  const respondMutation = useRespondToDonationRequest();

  if (requestQuery.isPending) {
    return (
      <DonorPageFrame
        breadcrumbs={[
          { label: t("nav.donorServices", "Donor services"), href: "/donor/dashboard" },
          { label: t("nav.donationRequests", "Donation requests"), href: "/donor/requests" },
          { label: t("common.details", "Request details") },
        ]}
        title={t("common.details", "Donation Request Details")}
        description={t("donor.portalDesc", "Clinical request context, appointment guidelines, and response management.")}
      >
        <LoadingState label={t("common.loadingRecords", "Loading request details…")} />
      </DonorPageFrame>
    );
  }

  const req = requestQuery.data;

  if (requestQuery.isError || !req) {
    return (
      <DonorPageFrame
        breadcrumbs={[
          { label: t("nav.donorServices", "Donor services"), href: "/donor/dashboard" },
          { label: t("nav.donationRequests", "Donation requests"), href: "/donor/requests" },
          { label: t("common.details", "Request details") },
        ]}
        title={t("common.details", "Donation Request Details")}
        description={t("donor.portalDesc", "Clinical request context, appointment guidelines, and response management.")}
      >
        <ErrorState
          title={t("common.error", "Donation request not found")}
          description={`Could not locate a donation request with identifier "${id}".`}
          onRetry={() => {
            void requestQuery.refetch();
          }}
        />
      </DonorPageFrame>
    );
  }

  const handleResponse = async (status: DonationResponseStatus) => {
    try {
      await respondMutation.mutateAsync({ id: req.id, response: status });
      setFeedbackMessage(
        status === "interested"
          ? t("donor.commitSuccess", "Thank you! Your donation commitment has been recorded.")
          : t("common.success", "You have declined this request. Your status has been updated."),
      );
      setTimeout(() => setFeedbackMessage(null), 5000);
    } catch {
      // Handled by React Query
    }
  };

  return (
    <DonorPageFrame
      breadcrumbs={[
        { label: t("nav.donorServices", "Donor services"), href: "/donor/dashboard" },
        { label: t("nav.donationRequests", "Donation requests"), href: "/donor/requests" },
        { label: req.reference },
      ]}
      title={`${t("healthcare.bloodRequest", "Donation Request")} ${req.reference}`}
      description={t("donor.appealsDescription", "Clinical urgency, department needs, and preparation guidelines. Patient identity is strictly decoupled for privacy.")}
      actions={
        <Button asChild variant="secondary" size="sm">
          <Link to="/donor/requests" className="gap-2">
            <ArrowLeft className="size-4 rtl:rotate-180" />
            <span>{t("common.back", "Back to Requests")}</span>
          </Link>
        </Button>
      }
    >
      <div className="space-y-6">
        {/* Feedback Alert */}
        {feedbackMessage && (
          <div
            role="status"
            className="flex items-center gap-3 rounded-md border border-emerald-500/30 bg-emerald-500/10 p-4 text-sm font-semibold text-emerald-800 dark:text-emerald-200"
          >
            <CheckCircle2 className="size-5 shrink-0 text-emerald-600" />
            <span>{feedbackMessage}</span>
          </div>
        )}

        {/* Header Summary Banner */}
        <section
          aria-labelledby="request-overview-heading"
          className="border border-border bg-surface p-6 sm:p-8"
        >
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-mono text-sm font-bold text-foreground">
                  <bdi dir="ltr">{req.reference}</bdi>
                </span>
                <BloodGroupBadge group={req.bloodGroup} />
                <UrgencyBadge urgency={req.urgency} />
                <span className="rounded bg-muted px-2.5 py-1 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  {req.component.replace("_", " ")}
                </span>
              </div>

              <h2
                id="request-overview-heading"
                className="text-xl font-bold text-foreground sm:text-2xl"
              >
                {req.requestingOrg.name}
              </h2>

              <p className="text-sm text-muted-foreground">
                {t("hospital.clinicalIndication", "Safe Clinical Context")}:{" "}
                <strong className="text-foreground">
                  {req.clinicalContextSafe}
                </strong>
              </p>
            </div>

            {/* Current Response Status Card */}
            <div className="rounded-lg border border-border bg-muted/40 p-4 text-center lg:min-w-[16rem]">
              <span className="text-xs font-medium text-muted-foreground">
                {t("common.status", "Your Current Response")}
              </span>
              <div className="mt-2">
                {req.myResponse === "interested" ? (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-500/15 px-3 py-1 text-xs font-bold text-blue-700 dark:text-blue-300">
                    <CheckCircle2 className="size-4" aria-hidden="true" />
                    {t("status.confirmed", "Interested / Accepted")}
                  </span>
                ) : req.myResponse === "declined" ? (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-destructive/15 px-3 py-1 text-xs font-bold text-destructive">
                    <XCircle className="size-4" aria-hidden="true" />
                    {t("status.rejected", "Declined")}
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-muted px-3 py-1 text-xs font-semibold text-muted-foreground">
                    <Clock className="size-4" aria-hidden="true" />
                    {t("status.pending", "Pending Decision")}
                  </span>
                )}
              </div>
              <p className="mt-2 text-[11px] text-muted-foreground">
                {t("donor.portalDesc", "You may update your response anytime before the appointment window.")}
              </p>
            </div>
          </div>

          {/* Interactive Response Buttons */}
          <div className="mt-6 flex flex-wrap items-center gap-3 border-t border-border pt-6">
            <Button
              size="lg"
              disabled={
                respondMutation.isPending || req.myResponse === "interested"
              }
              onClick={() => void handleResponse("interested")}
              className="gap-2"
            >
              <HeartHandshake className="size-4" aria-hidden="true" />
              <span>
                {req.myResponse === "interested"
                  ? t("status.confirmed", "You have Accepted this Request")
                  : t("donor.commitDonation", "Accept / I'm Interested to Donate")}
              </span>
            </Button>

            <Button
              variant="secondary"
              size="lg"
              disabled={
                respondMutation.isPending || req.myResponse === "declined"
              }
              onClick={() => void handleResponse("declined")}
              className="gap-2 text-destructive hover:bg-destructive/10"
            >
              <XCircle className="size-4" aria-hidden="true" />
              <span>{t("common.cancel", "Decline Request")}</span>
            </Button>
          </div>
        </section>

        {/* Two-Column Details Grid */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Facility & Logistics */}
          <section
            aria-labelledby="facility-logistics-heading"
            className="border border-border bg-surface p-6 space-y-4"
          >
            <div className="flex items-center gap-2 border-b border-border pb-3">
              <Hospital className="size-5 text-primary" aria-hidden="true" />
              <h3
                id="facility-logistics-heading"
                className="text-base font-semibold text-foreground"
              >
                {t("common.facility", "Facility Location & Schedule")}
              </h3>
            </div>

            <dl className="grid grid-cols-1 gap-4 text-xs sm:grid-cols-2">
              <div className="space-y-1">
                <dt className="text-muted-foreground">{t("hospital.created", "Request Date")}</dt>
                <dd className="font-semibold text-foreground font-mono">
                  <bdi dir="ltr">{req.requestDate}</bdi>
                </dd>
              </div>

              <div className="space-y-1">
                <dt className="text-muted-foreground">{t("hospital.requiredBy", "Required By Cutoff")}</dt>
                <dd className="font-semibold text-foreground font-mono">
                  <bdi dir="ltr">{req.requiredByDate}</bdi>
                </dd>
              </div>

              <div className="space-y-1 sm:col-span-2">
                <dt className="text-muted-foreground">{t("common.address", "Facility Address")}</dt>
                <dd className="flex items-start gap-1.5 font-semibold text-foreground">
                  <MapPin className="size-4 shrink-0 text-primary mt-0.5" />
                  <span>
                    {req.location} ({req.requestingOrg.address},{" "}
                    {req.requestingOrg.governorate})
                  </span>
                </dd>
              </div>

              <div className="space-y-1 sm:col-span-2">
                <dt className="text-muted-foreground">{t("common.phone", "Direct Desk Contact")}</dt>
                <dd className="flex items-center gap-1.5 font-semibold text-foreground font-mono">
                  <Phone className="size-4 shrink-0 text-primary" />
                  <span><bdi dir="ltr">{req.requestingOrg.phone}</bdi></span>
                </dd>
              </div>
            </dl>
          </section>

          {/* Clinical Preparation Guidelines */}
          <section
            aria-labelledby="prep-guidelines-heading"
            className="border border-border bg-surface p-6 space-y-4"
          >
            <div className="flex items-center gap-2 border-b border-border pb-3">
              <Info className="size-5 text-primary" aria-hidden="true" />
              <h3
                id="prep-guidelines-heading"
                className="text-base font-semibold text-foreground"
              >
                {t("donor.eligibilityCheck", "Donor Preparation Instructions")}
              </h3>
            </div>

            <div className="rounded-md border border-primary/20 bg-primary/5 p-4 text-xs leading-relaxed text-foreground">
              <p className="font-medium">{req.specialInstructions}</p>
            </div>

            <ul className="space-y-2 text-xs text-muted-foreground">
              <li className="flex items-start gap-2">
                <ShieldCheck className="size-4 shrink-0 text-emerald-600 mt-0.5" />
                <span>
                  {t("healthcare.temperatureAssurance", "Drink at least 500 mL of water or non-caffeinated fluid prior to arrival.")}
                </span>
              </li>
              <li className="flex items-start gap-2">
                <ShieldCheck className="size-4 shrink-0 text-emerald-600 mt-0.5" />
                <span>
                  {t("donor.eligibleNotice", "Have a light, healthy meal within 2-3 hours before donating.")}
                </span>
              </li>
              <li className="flex items-start gap-2">
                <ShieldCheck className="size-4 shrink-0 text-emerald-600 mt-0.5" />
                <span>
                  {t("common.verified", "Bring your national ID or passport for on-site verification.")}
                </span>
              </li>
            </ul>
          </section>
        </div>
      </div>
    </DonorPageFrame>
  );
}

export default DonorRequestDetailsPage;
