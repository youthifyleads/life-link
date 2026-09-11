import {
  CheckCircle2,
  FileCheck2,
  ShieldAlert,
  ShieldCheck,
  XCircle,
} from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";

import { formatDate } from "@/features/donor/components/donor-formatters";
import { DonorPageFrame } from "@/features/donor/components/donor-page-frame";
import {
  useDonorConsents,
  useGrantConsent,
  useRevokeConsent,
} from "@/features/donor/hooks/use-donor";
import type { DonorConsent } from "@/features/donor/types/donor.types";
import {
  EmptyState,
  ErrorState,
  LoadingState,
} from "@/shared/components/feedback/system-states";
import { Button } from "@/shared/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog";

export function DonorConsentsPage() {
  const { t } = useTranslation();
  const consentsQuery = useDonorConsents();
  const grantMutation = useGrantConsent();
  const revokeMutation = useRevokeConsent();

  const [consentToRevoke, setConsentToRevoke] = useState<DonorConsent | null>(
    null,
  );
  const [consentToGrant, setConsentToGrant] = useState<DonorConsent | null>(
    null,
  );
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);

  if (consentsQuery.isPending) {
    return (
      <DonorPageFrame
        breadcrumbs={[
          { label: t("nav.donorServices", "Donor services"), href: "/donor/dashboard" },
          { label: t("nav.consentsAndRights", "Consents & authorizations") },
        ]}
        title={t("donor.consentsTitle", "Donor Consents & Authorizations")}
        description={t("donor.consentsTitle", "Review and manage your healthcare data processing, biological testing, and emergency communication authorizations.")}
      >
        <LoadingState label={t("common.loadingRecords", "Loading legal and medical consents…")} />
      </DonorPageFrame>
    );
  }

  if (consentsQuery.isError || !consentsQuery.data) {
    return (
      <DonorPageFrame
        breadcrumbs={[
          { label: t("nav.donorServices", "Donor services"), href: "/donor/dashboard" },
          { label: t("nav.consentsAndRights", "Consents & authorizations") },
        ]}
        title={t("donor.consentsTitle", "Donor Consents & Authorizations")}
        description={t("donor.consentsTitle", "Review and manage your healthcare data processing, biological testing, and emergency communication authorizations.")}
      >
        <ErrorState
          title={t("common.error", "Could not load consent records")}
          description={t("donor.consentsLoadErrorDescription")}
          onRetry={() => void consentsQuery.refetch()}
        />
      </DonorPageFrame>
    );
  }

  const consents = consentsQuery.data;

  const handleConfirmRevoke = async () => {
    if (!consentToRevoke) return;
    try {
      await revokeMutation.mutateAsync(consentToRevoke.id);
      setFeedbackMessage(t("donor.revokeNotice", `Consent for "${consentToRevoke.title}" has been revoked.`));
      setConsentToRevoke(null);
    } catch {
      // Handled by query state
    }
  };

  const handleConfirmGrant = async () => {
    if (!consentToGrant) return;
    try {
      await grantMutation.mutateAsync(consentToGrant.id);
      setFeedbackMessage(t("common.success", `Consent for "${consentToGrant.title}" has been successfully granted.`));
      setConsentToGrant(null);
    } catch {
      // Handled by query state
    }
  };

  return (
    <DonorPageFrame
      breadcrumbs={[
        { label: t("nav.donorServices", "Donor services"), href: "/donor/dashboard" },
        { label: t("nav.consentsAndRights", "Consents & authorizations") },
      ]}
      title={t("donor.consentsTitle", "Donor Consents & Authorizations")}
      description={t("donor.consentsTitle", "Review and manage your healthcare data processing, biological testing, and emergency communication authorizations.")}
    >
      {/* Informational Guidance Banner */}
      <div className="mb-6 flex items-start gap-3 border border-primary/20 bg-primary/5 p-4 text-sm leading-6">
        <ShieldCheck className="mt-0.5 size-5 shrink-0 text-primary" aria-hidden="true" />
        <div>
          <p className="font-semibold text-foreground">
            {t("donor.consentsTitle", "Informed Donor Rights & Autonomy")}
          </p>
          <p className="mt-1 text-muted-foreground">
            {t("donor.consentsTitle", "In compliance with national transfusion regulatory governance, you have full authority to grant or revoke non-mandatory communication authorizations at any time.")}
          </p>
        </div>
      </div>

      {feedbackMessage && (
        <div
          role="status"
          className="mb-6 flex items-center justify-between gap-3 border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-800 dark:text-emerald-200"
        >
          <div className="flex items-center gap-2">
            <CheckCircle2 className="size-4 shrink-0 text-emerald-600" aria-hidden="true" />
            <p>{feedbackMessage}</p>
          </div>
          <button
            type="button"
            onClick={() => setFeedbackMessage(null)}
            className="text-xs font-semibold hover:underline"
          >
            {t("common.dismiss", "Dismiss")}
          </button>
        </div>
      )}

      {consents.length === 0 ? (
        <EmptyState
          title={t("hospital.noRecordsTitle", "No consent agreements found")}
          description={t("hospital.noRecordsDesc", "There are currently no consent records registered for your donor account.")}
        />
      ) : (
        <div className="space-y-4">
          {consents.map((consent) => {
            const isGranted = consent.status === "granted";

            return (
              <article
                key={consent.id}
                className="border border-border bg-surface p-5 transition-colors sm:p-6"
                aria-labelledby={`consent-title-${consent.id}`}
              >
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div className="space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono text-xs font-medium uppercase tracking-wider text-muted-foreground">
                        {t(`donor.consentTypes.${consent.consentType}`, consent.consentType.replace(/_/g, " "))}
                      </span>
                      <span className="text-muted-foreground">•</span>
                      <span className="font-mono text-xs text-muted-foreground">
                        {t("donor.reference")}: <bdi dir="ltr">{consent.id}</bdi>
                      </span>
                    </div>

                    <h2
                      id={`consent-title-${consent.id}`}
                      className="text-base font-semibold text-foreground sm:text-lg"
                    >
                      {consent.title}
                    </h2>

                    <p className="text-sm leading-6 text-muted-foreground">
                      {consent.description}
                    </p>

                    <div className="rounded border border-border/70 bg-surface-subtle p-3 text-xs leading-5 text-muted-foreground">
                      <strong className="text-foreground">{t("common.details", "Regulatory Notice")}: </strong>
                      {consent.legalNotice}
                    </div>

                    <div className="flex flex-wrap items-center gap-x-6 gap-y-1 text-xs text-muted-foreground pt-1">
                      <span className="flex items-center gap-1.5">
                        <CheckCircle2 className="size-3.5 text-emerald-600" />
                        {t("donor.consentStatus", "Granted")}: <bdi dir="ltr">{formatDate(consent.grantedAt)}</bdi>
                      </span>
                      {consent.revokedAt && (
                        <span className="flex items-center gap-1.5 text-destructive">
                          <XCircle className="size-3.5" />
                          {t("status.revoked", "Revoked")}: <bdi dir="ltr">{formatDate(consent.revokedAt)}</bdi>
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Status & Actions Column */}
                  <div className="flex shrink-0 flex-row items-center justify-between gap-3 border-t border-border pt-3 sm:flex-col sm:items-end sm:border-0 sm:pt-0">
                    <div>
                      {isGranted ? (
                        <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-700 dark:text-emerald-300">
                          <ShieldCheck className="size-3.5" />
                          {t("donor.consentStatus", "Active & Granted")}
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 rounded-full border border-muted bg-muted px-3 py-1 text-xs font-semibold text-muted-foreground">
                          <ShieldAlert className="size-3.5" />
                          {t("status.revoked", "Authorization Revoked")}
                        </span>
                      )}
                    </div>

                    <div>
                      {isGranted ? (
                        <Button
                          variant="secondary"
                          size="sm"
                          disabled={revokeMutation.isPending}
                          onClick={() => setConsentToRevoke(consent)}
                          className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                        >
                          {t("donor.revokeConsent", "Revoke Consent")}
                        </Button>
                      ) : (
                        <Button
                          variant="default"
                          size="sm"
                          disabled={grantMutation.isPending}
                          onClick={() => setConsentToGrant(consent)}
                        >
                          {t("common.confirm", "Grant Consent")}
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}

      {/* Revocation Confirmation Dialog */}
      <Dialog
        open={Boolean(consentToRevoke)}
        onOpenChange={(open) => {
          if (!open) setConsentToRevoke(null);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <div className="mb-2 flex size-10 items-center justify-center rounded-full bg-destructive/10 text-destructive">
              <ShieldAlert className="size-5" />
            </div>
            <DialogTitle>{t("donor.revokeConsent", "Revoke Consent Agreement?")}</DialogTitle>
            <DialogDescription>
              {t("donor.revokeNotice", "Are you sure you want to revoke authorization for")}{" "}
              <strong className="text-foreground">
                {consentToRevoke?.title}
              </strong>
              ?
            </DialogDescription>
          </DialogHeader>

          <div className="my-2 rounded border border-border bg-surface-subtle p-3 text-xs leading-5 text-muted-foreground">
            {consentToRevoke?.legalNotice}
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="secondary"
              onClick={() => setConsentToRevoke(null)}
              disabled={revokeMutation.isPending}
            >
              {t("common.cancel", "Keep Active")}
            </Button>
            <Button
              variant="destructive"
              onClick={() => void handleConfirmRevoke()}
              disabled={revokeMutation.isPending}
            >
              {revokeMutation.isPending ? t("common.loading", "Revoking…") : t("donor.revokeConsent", "Confirm Revocation")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Grant Confirmation Dialog */}
      <Dialog
        open={Boolean(consentToGrant)}
        onOpenChange={(open) => {
          if (!open) setConsentToGrant(null);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <div className="mb-2 flex size-10 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-600">
              <FileCheck2 className="size-5" />
            </div>
            <DialogTitle>{t("common.confirm", "Grant Consent Authorization")}</DialogTitle>
            <DialogDescription>
              {t("donor.consentsTitle", "By granting authorization, your decision will be recorded in the official donor ledger.")} (
              <strong className="text-foreground">
                {consentToGrant?.title}
              </strong>)
            </DialogDescription>
          </DialogHeader>

          <div className="my-2 space-y-2 text-xs leading-5 text-muted-foreground">
            <p>{consentToGrant?.description}</p>
            <div className="rounded border border-border bg-surface-subtle p-3">
              <strong className="text-foreground">{t("common.details", "Regulatory Notice")}: </strong>
              {consentToGrant?.legalNotice}
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="secondary"
              onClick={() => setConsentToGrant(null)}
              disabled={grantMutation.isPending}
            >
              {t("common.cancel", "Cancel")}
            </Button>
            <Button
              variant="default"
              onClick={() => void handleConfirmGrant()}
              disabled={grantMutation.isPending}
            >
              {grantMutation.isPending ? t("common.loading", "Authorizing…") : t("common.confirm", "Confirm & Grant Consent")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DonorPageFrame>
  );
}

export default DonorConsentsPage;
