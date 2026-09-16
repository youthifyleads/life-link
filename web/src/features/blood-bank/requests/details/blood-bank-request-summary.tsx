import {
  AlertCircle,
  Building2,
  Calendar,
  Clock,
  Droplets,
  FileText,
} from "lucide-react";
import { useTranslation } from "react-i18next";

import { formatBloodBankDateTime } from "@/features/blood-bank/components/blood-bank-formatters";
import { bloodBankComponentLabels } from "@/features/blood-bank/types/blood-bank.types";
import type {
  BloodBankComponent,
  BloodBankRequest,
} from "@/features/blood-bank/types/blood-bank.types";
import { BloodGroupBadge } from "@/shared/components/clinical/blood-group-badge";
import type { BloodGroup } from "@/shared/components/clinical/clinical.types";
import { RequestStatusBadge } from "@/shared/components/clinical/request-status-badge";
import { UrgencyBadge } from "@/shared/components/clinical/urgency-badge";

interface BloodBankRequestSummaryProps {
  request: BloodBankRequest;
}

export function BloodBankRequestSummary({
  request,
}: BloodBankRequestSummaryProps) {
  const { t } = useTranslation();

  return (
    <section
      aria-labelledby="request-summary-heading"
      className="border border-border bg-surface p-5"
    >
      <div className="flex flex-wrap items-start justify-between gap-3 border-b border-border pb-4">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            {t("common.overview", "Requisition summary")}
          </span>
          <h2
            id="request-summary-heading"
            className="mt-1 text-xl font-bold tracking-tight text-foreground tabular-nums"
          >
            <bdi dir="ltr">{request.id}</bdi>
          </h2>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <UrgencyBadge urgency={request.urgency} />
          <RequestStatusBadge status={request.status} />
        </div>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <span className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
            <Building2 aria-hidden="true" className="size-3.5" />
            {t("hospital.facility", "Requesting hospital")}
          </span>
          <p className="mt-1 text-sm font-semibold text-foreground">
            {request.hospital.name}
          </p>
          <p className="text-xs text-muted-foreground tabular-nums">
            {t("common.facility", "Facility ID")}: <bdi dir="ltr">{request.hospital.facilityCode}</bdi>
          </p>
        </div>

        <div>
          <span className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
            <Calendar aria-hidden="true" className="size-3.5" />
            {t("hospital.created", "Submitted at")}
          </span>
          <p className="mt-1 text-sm font-medium text-foreground tabular-nums">
            <bdi dir="ltr">{formatBloodBankDateTime(request.createdAt)}</bdi>
          </p>
        </div>

        <div>
          <span className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
            <Clock aria-hidden="true" className="size-3.5 text-emergency" />
            {t("hospital.requiredBy", "Required by")}
          </span>
          <p className="mt-1 text-sm font-semibold text-emergency tabular-nums">
            <bdi dir="ltr">{formatBloodBankDateTime(request.requiredAt)}</bdi>
          </p>
        </div>

        <div>
          <span className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
            <Droplets aria-hidden="true" className="size-3.5" />
            {t("hospital.unitsRequested", "Required volume")}
          </span>
          <p className="mt-1 text-sm font-bold text-foreground tabular-nums">
            <bdi dir="ltr">{request.quantity}</bdi> {request.quantity === 1 ? t("common.unit", "unit") : t("common.units", "units")}
          </p>
        </div>
      </div>

      {/* Blood Requirements Banner */}
      <div className="mt-5 rounded border border-border bg-surface-subtle/70 p-4">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          {t("hospital.step1", "Clinical blood requirements")}
        </h3>
        <div className="mt-3 flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">{t("common.bloodGroup", "Target group")}:</span>
            <BloodGroupBadge group={request.bloodGroup as BloodGroup} />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">{t("common.component", "Component")}:</span>
            <span className="text-xs font-semibold text-foreground">
              {bloodBankComponentLabels[request.component as BloodBankComponent]}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">{t("common.urgency", "Urgency")}:</span>
            <span className="text-xs font-semibold uppercase text-foreground">
              {t(`urgency.${request.urgency}`, request.urgency)}
            </span>
          </div>
        </div>

        {/* Clinical Reason and Notes */}
        <div className="mt-3.5 grid gap-3 border-t border-border/80 pt-3 text-xs sm:grid-cols-2">
          <div>
            <span className="font-semibold text-muted-foreground flex items-center gap-1">
              <FileText aria-hidden="true" className="size-3" />
              {t("hospital.clinicalIndication", "Clinical indication")}
            </span>
            <p className="mt-1 text-foreground leading-relaxed">
              {request.clinicalReason ?? request.reasonCategory}
            </p>
          </div>
          {request.notes ? (
            <div>
              <span className="font-semibold text-muted-foreground flex items-center gap-1">
                <AlertCircle aria-hidden="true" className="size-3" />
                {t("hospital.operationalNotes", "Special handling instructions")}
              </span>
              <p className="mt-1 text-foreground leading-relaxed">
                {request.notes}
              </p>
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}
