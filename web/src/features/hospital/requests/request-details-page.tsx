import {
  AlertOctagon,
  Ban,
  Building2,
  CopyPlus,
  FileText,
  MapPin,
  Phone,
  RefreshCw,
  ScanLine,
  ShieldCheck,
} from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Link, useParams } from "react-router-dom";

import { formatDateTime } from "@/features/hospital/components/hospital-formatters";
import { HospitalPageFrame } from "@/features/hospital/components/hospital-page-frame";
import { RequestTimeline } from "@/features/hospital/components/request-timeline";
import { SupportingDocuments } from "@/features/hospital/documents/supporting-documents";
import { useHospitalRequest } from "@/features/hospital/hooks/use-hospital-requests";
import { RerouteRequestDialog } from "@/features/hospital/requests/reroute-request-dialog";
import { bloodComponentLabels } from "@/features/hospital/types/hospital.types";
import type { RequestHistoryEvent } from "@/features/hospital/types/hospital.types";
import { BloodGroupBadge } from "@/shared/components/clinical/blood-group-badge";
import type { RequestStatus } from "@/shared/components/clinical/clinical.types";
import { RequestStatusBadge } from "@/shared/components/clinical/request-status-badge";
import { UrgencyBadge } from "@/shared/components/clinical/urgency-badge";
import {
  EmptyState,
  ErrorState,
  LoadingState,
} from "@/shared/components/feedback/system-states";
import { Button } from "@/shared/components/ui/button";
import { BidiText, TechnicalText } from "@/shared/components/i18n/bidi-text";

export function RequestDetailsPage() {
  const { t } = useTranslation();
  const { id = "" } = useParams();
  const requestQuery = useHospitalRequest(id);
  const request = requestQuery.data;
  const [statusOverride, setStatusOverride] = useState<RequestStatus | null>(
    null,
  );
  const [actionMessage, setActionMessage] = useState<string | null>(null);
  const [localCancellation, setLocalCancellation] =
    useState<RequestHistoryEvent | null>(null);
  const [rerouteOpen, setRerouteOpen] = useState(false);

  if (requestQuery.isPending) {
    return (
      <HospitalPageFrame
        breadcrumbs={[
          { label: t("healthcare.hospital"), href: "/hospital/dashboard" },
          { label: t("nav.bloodRequests"), href: "/hospital/requests" },
          { label: id },
        ]}
        title={t("common.loading")}
      >
        <LoadingState label={`${t("common.loading")} ${id}`} rows={6} />
      </HospitalPageFrame>
    );
  }

  if (requestQuery.isError) {
    return (
      <HospitalPageFrame
        breadcrumbs={[
          { label: t("healthcare.hospital"), href: "/hospital/dashboard" },
          { label: t("nav.bloodRequests"), href: "/hospital/requests" },
          { label: id },
        ]}
        title={t("hospital.requestUnavailable")}
      >
        <ErrorState
          title={t("hospital.requestLoadErrorTitle")}
          description={t("hospital.requestLoadErrorDescription")}
          onRetry={() => void requestQuery.refetch()}
        />
      </HospitalPageFrame>
    );
  }

  if (!request) {
    return (
      <HospitalPageFrame
        breadcrumbs={[
          { label: t("healthcare.hospital"), href: "/hospital/dashboard" },
          { label: t("nav.bloodRequests"), href: "/hospital/requests" },
          { label: id },
        ]}
        title={t("hospital.requestNotFound")}
      >
        <EmptyState
          title={t("hospital.noMatchingRequest")}
          description={t("hospital.noMatchingRequestDescription")}
          action={
            <Button asChild variant="secondary">
              <Link to="/hospital/requests">{t("hospital.returnToRequests")}</Link>
            </Button>
          }
        />
      </HospitalPageFrame>
    );
  }

  const currentStatus = statusOverride ?? request.status;
  const canCancel = ["draft", "submitted", "acknowledged"].includes(
    currentStatus,
  );
  const canReroute = currentStatus === "rejected";
  const canTrack = ["confirmed", "preparing", "completed"].includes(currentStatus);
  const displayedHistory = localCancellation
    ? [...request.history, localCancellation]
    : request.history;

  const cancelRequest = () => {
    const occurredAt = new Date().toISOString();
    setStatusOverride("cancelled");
    setLocalCancellation({
      id: `evt-local-cancel-${request.id}`,
      status: "cancelled",
      occurredAt,
      actor: t("auth.hospitalStaffName"),
      note: t("hospital.localCancellationNote"),
    });
    setActionMessage(
      t("hospital.localCancellationMessage"),
    );
  };

  const handleRerouteSuccess = (updated: typeof request) => {
    setStatusOverride(null);
    setLocalCancellation(null);
    setActionMessage(
      t("hospital.rerouteSuccessMessage", { name: updated.targetBloodBank?.name }),
    );
    void requestQuery.refetch();
  };

  return (
    <HospitalPageFrame
      breadcrumbs={[
        { label: t("healthcare.hospital"), href: "/hospital/dashboard" },
        { label: t("nav.bloodRequests"), href: "/hospital/requests" },
        { label: request.id },
      ]}
      title={request.id}
      description={`${t("hospital.created")} ${formatDateTime(request.createdAt)} — ${request.createdBy}`}
      context={<RequestStatusBadge status={currentStatus} />}
      actions={
        <Button asChild variant="secondary">
          <Link to="/hospital/requests/create">
            <CopyPlus aria-hidden="true" />
            {t("hospital.createRequest")}
          </Link>
        </Button>
      }
    >
      {actionMessage ? (
        <div
          className="mb-5 flex items-start gap-3 border border-success/25 bg-success-subtle px-4 py-3 text-sm text-success"
          role="status"
        >
          <ShieldCheck aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
          <p>{actionMessage}</p>
        </div>
      ) : null}

      {/* Operational Rejection Alert Banner */}
      {currentStatus === "rejected" ? (
        <div
          className="mb-6 border border-destructive/30 bg-emergency-subtle p-4 sm:p-5 text-xs text-foreground space-y-3"
          role="alert"
        >
          <div className="flex items-center gap-2 font-semibold text-emergency text-sm">
            <AlertOctagon className="size-5 shrink-0" aria-hidden="true" />
            <span>{t("hospital.rejectionBannerTitle")}</span>
          </div>
          <p className="text-muted-foreground leading-relaxed">
            {t("hospital.rejectionNotice")}
          </p>
          <div className="pt-1 flex flex-wrap items-center gap-2.5">
            <Button
              type="button"
              size="sm"
              onClick={() => setRerouteOpen(true)}
            >
              <RefreshCw className="size-3.5 rtl:rotate-180" aria-hidden="true" />
              {t("hospital.rerouteAlternative")}
            </Button>
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={cancelRequest}
            >
              <Ban className="size-3.5" aria-hidden="true" />
              {t("hospital.cancelRequisition")}
            </Button>
          </div>
        </div>
      ) : null}

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_22rem]">
        <div className="space-y-8">
          {request.targetBloodBank ? (
            <section
              aria-labelledby="target-bank-title"
              className="border border-border bg-surface p-4 sm:p-5"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <Building2 className="size-4 text-primary" aria-hidden="true" />
                    <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      {t("hospital.recipientBank")}
                    </span>
                  </div>
                  <h3 id="target-bank-title" className="mt-1 text-base font-semibold text-foreground">
                    <BidiText>{request.targetBloodBank.name}</BidiText>
                  </h3>
                  <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <MapPin className="size-3.5" aria-hidden="true" />
                      <BidiText>{request.targetBloodBank.governorate} — {request.targetBloodBank.address}</BidiText>
                    </span>
                    <span className="flex items-center gap-1">
                      <Phone className="size-3.5" aria-hidden="true" />
                      <bdi dir="ltr">{request.targetBloodBank.phone}</bdi>
                    </span>
                  </div>
                </div>
                <span className="rounded bg-muted px-2.5 py-1 text-xs font-mono font-medium text-muted-foreground">
                  <TechnicalText>{request.targetBloodBank.facilityCode}</TechnicalText>
                </span>
              </div>
            </section>
          ) : null}

          <section aria-labelledby="blood-information-title">
            <div className="mb-3">
              <h2
                id="blood-information-title"
                className="text-lg font-semibold"
              >
                {t("common.overview")}
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                {t("hospital.createRequestDescription")}
              </p>
            </div>
            <dl className="grid border border-border bg-surface sm:grid-cols-2 lg:grid-cols-3">
              <SummaryItem label={t("common.bloodGroup")}>
                <BloodGroupBadge group={request.bloodGroup} />
              </SummaryItem>
              <SummaryItem label={t("common.component")}>
                {t(`healthcare.${request.component}`, bloodComponentLabels[request.component])}
              </SummaryItem>
              <SummaryItem label={t("common.quantity")}>
                <span className="font-semibold tabular-nums">
                  {request.quantity} {request.quantity === 1 ? t("common.unit") : t("common.units")}
                </span>
              </SummaryItem>
              <SummaryItem label={t("common.urgency")}>
                <UrgencyBadge urgency={request.urgency} />
              </SummaryItem>
              <SummaryItem label={t("hospital.requiredBy")}>
                <BidiText>{formatDateTime(request.requiredAt)}</BidiText>
              </SummaryItem>
              <SummaryItem label={t("common.status")}>
                <RequestStatusBadge status={currentStatus} />
              </SummaryItem>
              <SummaryItem
                label={t("hospital.diagnosis")}
                className="sm:col-span-2 lg:col-span-3"
              >
                <BidiText>{request.reason}</BidiText>
              </SummaryItem>
              {request.notes ? (
                <SummaryItem
                  label={t("hospital.operationalNotes")}
                  className="sm:col-span-2 lg:col-span-3"
                >
                  <BidiText>{request.notes}</BidiText>
                </SummaryItem>
              ) : null}
            </dl>
          </section>

          <div className="xl:hidden">
            <RequestActions
              canCancel={canCancel}
              canReroute={canReroute}
              canTrack={canTrack}
              onCancel={cancelRequest}
              onReroute={() => setRerouteOpen(true)}
            />
          </div>

          <section aria-labelledby="timeline-title">
            <div className="mb-4">
              <h2 id="timeline-title" className="text-lg font-semibold">
                {t("hospital.trackingTimeline")}
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                {t("hospital.operationsDesc")}
              </p>
            </div>
            <div className="border border-border bg-surface p-5 sm:p-6">
              <RequestTimeline events={displayedHistory} />
            </div>
          </section>

          <SupportingDocuments
            initialDocuments={request.documents}
            canUpload={
              !["completed", "cancelled", "rejected"].includes(currentStatus)
            }
          />
        </div>

        <div className="hidden self-start xl:sticky xl:top-24 xl:block">
          <RequestActions
            canCancel={canCancel}
            canReroute={canReroute}
            canTrack={canTrack}
            onCancel={cancelRequest}
            onReroute={() => setRerouteOpen(true)}
          />
        </div>
      </div>

      <RerouteRequestDialog
        open={rerouteOpen}
        onOpenChange={setRerouteOpen}
        request={request}
        onSuccess={handleRerouteSuccess}
      />
    </HospitalPageFrame>
  );
}

function RequestActions({
  canCancel,
  canReroute,
  canTrack,
  onCancel,
  onReroute,
}: {
  canCancel: boolean;
  canReroute: boolean;
  canTrack: boolean;
  onCancel: () => void;
  onReroute: () => void;
}) {
  const { t } = useTranslation();

  return (
    <aside className="border border-border bg-surface">
      <div className="border-b border-border px-5 py-4">
        <h2 className="text-sm font-semibold">{t("common.actions")}</h2>
        <p className="mt-1 text-xs leading-5 text-muted-foreground">
          {t("hospital.operations")}
        </p>
      </div>
      <div className="space-y-3 p-5">
        {canReroute ? (
          <Button
            type="button"
            className="w-full justify-start"
            onClick={onReroute}
          >
            <RefreshCw aria-hidden="true" className="size-4 rtl:rotate-180" />
            {t("hospital.rerouteAlternative")}
          </Button>
        ) : null}

        {canTrack ? (
          <Button
            asChild
            variant="secondary"
            className="w-full justify-start text-xs"
          >
            <Link to="/caregiver/dashboard">
              <ScanLine aria-hidden="true" className="size-4 text-primary" />
              {t("hospital.trackDelivery")}
            </Link>
          </Button>
        ) : null}

        {canCancel ? (
          <Button
            type="button"
            variant="secondary"
            className="w-full justify-start"
            onClick={onCancel}
          >
            <Ban aria-hidden="true" />
            {t("hospital.cancelRequisition")}
          </Button>
        ) : !canReroute ? (
          <p className="text-sm leading-6 text-muted-foreground">
            {t("common.none")}
          </p>
        ) : null}
        <Button asChild variant="ghost" className="w-full justify-start">
          <a href="#supporting-documents">
            <FileText aria-hidden="true" />
            {t("hospital.documentsRegister")}
          </a>
        </Button>
      </div>
      <div className="border-t border-border bg-surface-subtle px-5 py-4 text-xs leading-5 text-muted-foreground">
        {t("common.secureWorkspace")}
      </div>
    </aside>
  );
}

function SummaryItem({
  label,
  children,
  className,
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`border-b border-border p-4 sm:border-e ${className ?? ""}`}
    >
      <dt className="text-xs font-medium text-muted-foreground">{label}</dt>
      <dd className="mt-2 text-sm leading-6 text-foreground">{children}</dd>
    </div>
  );
}
