import { ArrowDown, CheckCircle2 } from "lucide-react";
import { useTranslation } from "react-i18next";

import { BloodGroupBadge } from "@/shared/components/clinical/blood-group-badge";
import {
  bloodGroups,
  requestStatuses,
  urgencyLevels,
} from "@/shared/components/clinical/clinical.types";
import { RequestStatusBadge } from "@/shared/components/clinical/request-status-badge";
import { UrgencyBadge } from "@/shared/components/clinical/urgency-badge";
import {
  EmptyState,
  ErrorState,
  LoadingState,
  PermissionState,
} from "@/shared/components/feedback/system-states";
import { PageHeader } from "@/shared/components/layout/page-header";
import { Breadcrumbs } from "@/shared/components/navigation/breadcrumbs";
import { Button } from "@/shared/components/ui/button";

export function ShellPreviewPage() {
  const { t } = useTranslation();
  return (
    <div className="mx-auto max-w-[100rem] px-4 py-6 sm:px-6 sm:py-8">
      <div className="mb-5 flex items-center gap-2 border border-primary/20 bg-secondary px-3 py-2 text-xs text-secondary-foreground">
        <CheckCircle2 aria-hidden="true" className="size-4 shrink-0" />
        {t("system.previewNotice")}
      </div>

      <Breadcrumbs
        items={[
          { label: t("system.workspace"), href: "/ui-preview" },
          { label: t("system.operationalFoundation") },
        ]}
      />

      <div className="mt-5">
        <PageHeader
          title={t("system.operationalFoundation")}
          description={t("system.foundationDescription")}
          context={
            <span className="rounded-md border border-primary/25 bg-secondary px-2 py-1 text-xs font-semibold text-secondary-foreground">
              {t("system.phaseTwo")}
            </span>
          }
          actions={
            <Button asChild variant="secondary">
              <a href="#state-examples">
                {t("system.reviewStates")}
                <ArrowDown aria-hidden="true" />
              </a>
            </Button>
          }
        />
      </div>

      <div className="mt-8 space-y-8">
        <section aria-labelledby="clinical-identifiers-title">
          <div className="mb-3">
            <h2
              id="clinical-identifiers-title"
              className="text-lg font-semibold"
            >
              {t("system.clinicalIdentifiers")}
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {t("system.identifierDescription")}
            </p>
          </div>
          <div className="divide-y divide-border border border-border bg-surface">
            <div className="grid gap-4 p-5 md:grid-cols-[11rem_1fr] md:items-start">
              <div>
                <h3 className="text-sm font-semibold">{t("system.requestStatus")}</h3>
                <p className="mt-1 text-xs leading-5 text-muted-foreground">
                  {t("system.lifecycleVocabulary")}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                {requestStatuses.map((status) => (
                  <RequestStatusBadge key={status} status={status} />
                ))}
              </div>
            </div>
            <div className="grid gap-4 p-5 md:grid-cols-[11rem_1fr] md:items-start">
              <div>
                <h3 className="text-sm font-semibold">{t("common.urgency")}</h3>
                <p className="mt-1 text-xs leading-5 text-muted-foreground">
                  {t("system.emergencyRedOnly")}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                {urgencyLevels.map((urgency) => (
                  <UrgencyBadge key={urgency} urgency={urgency} />
                ))}
              </div>
            </div>
            <div className="grid gap-4 p-5 md:grid-cols-[11rem_1fr] md:items-start">
              <div>
                <h3 className="text-sm font-semibold">{t("common.bloodGroup")}</h3>
                <p className="mt-1 text-xs leading-5 text-muted-foreground">
                  {t("system.bloodGroupDescription")}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                {bloodGroups.map((group) => (
                  <BloodGroupBadge key={group} group={group} />
                ))}
              </div>
            </div>
          </div>
        </section>

        <section
          id="state-examples"
          aria-labelledby="state-examples-title"
          className="scroll-mt-24"
        >
          <div className="mb-3">
            <h2 id="state-examples-title" className="text-lg font-semibold">
              {t("system.feedback")}
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {t("system.feedbackDescription")}
            </p>
          </div>
          <div className="space-y-4">
            <LoadingState label={t("system.loadingRequests")} rows={3} />
            <EmptyState
              title={t("system.noRequestsTitle")}
              description={t("system.noRequestsDescription")}
            />
            <ErrorState
              title={t("system.requestLoadErrorTitle")}
              description={t("system.requestLoadErrorDescription")}
              onRetry={() => undefined}
            />
            <PermissionState
              title={t("system.permissionTitle")}
              description={t("system.permissionDescription")}
            />
          </div>
        </section>
      </div>
    </div>
  );
}
