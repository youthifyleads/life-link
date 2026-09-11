import {
  AlertCircle,
  Building2,
  Check,
  Clock,
  ExternalLink,
  Eye,
  FileText,
  Filter,
  LoaderCircle,
  Search,
  ShieldAlert,
  ShieldCheck,
  X,
} from "lucide-react";
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";

import { BloodBankPageFrame } from "@/features/blood-bank/components/blood-bank-page-frame";
import {
  useBloodBankAllDocuments,
  useUpdateDocumentReviewStatus,
} from "@/features/blood-bank/hooks/use-blood-bank-requests";
import {
  bloodBankComponentLabels,
  type BloodBankDocumentItem,
  type DocumentReviewStatus,
} from "@/features/blood-bank/types/blood-bank.types";
import { BloodGroupBadge } from "@/shared/components/clinical/blood-group-badge";
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

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function formatDocDate(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString(i18n.language.startsWith("ar") ? "ar-EG" : "en-GB", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function ReviewStatusBadge({ status }: { status: DocumentReviewStatus }) {
  const { t } = useTranslation();
  switch (status) {
    case "accepted":
      return (
        <span className="inline-flex items-center gap-1 rounded border border-success/30 bg-success-subtle px-2 py-0.5 text-[11px] font-semibold text-success">
          <ShieldCheck className="size-3" aria-hidden="true" />
          {t("status.accepted")}
        </span>
      );
    case "changes_requested":
      return (
        <span className="inline-flex items-center gap-1 rounded border border-destructive/30 bg-emergency-subtle px-2 py-0.5 text-[11px] font-semibold text-emergency">
          <ShieldAlert className="size-3" aria-hidden="true" />
          {t("status.changes_requested")}
        </span>
      );
    case "pending":
    default:
      return (
        <span className="inline-flex items-center gap-1 rounded border border-amber-500/30 bg-amber-500/10 px-2 py-0.5 text-[11px] font-semibold text-amber-700 dark:text-amber-400">
          <Clock className="size-3" aria-hidden="true" />
          {t("status.pending_review")}
        </span>
      );
  }
}

const rejectionPresets = [
  "Document is illegible or has low scanning resolution.",
  "Missing physician clinical signature or licensing stamp.",
  "Patient serological cross-match details are incomplete.",
  "Discrepancy detected between patient blood group and requisition details.",
  "Emergency justification letter is expired or superseded.",
];

export function BloodBankDocumentsPage() {
  const { t } = useTranslation();
  const documentsQuery = useBloodBankAllDocuments();
  const updateDocMutation = useUpdateDocumentReviewStatus();

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<
    DocumentReviewStatus | "all"
  >("all");
  const [hospitalFilter, setHospitalFilter] = useState<string>("all");

  const [inspectDoc, setInspectDoc] = useState<BloodBankDocumentItem | null>(
    null,
  );
  const [rejectDocTarget, setRejectDocTarget] =
    useState<BloodBankDocumentItem | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [rejectionError, setRejectionError] = useState<string | null>(null);
  const [actionFeedback, setActionFeedback] = useState<string | null>(null);

  const allDocuments = useMemo(
    () => documentsQuery.data ?? [],
    [documentsQuery.data],
  );

  // Extract distinct hospitals
  const hospitalOptions = useMemo(() => {
    const map = new Map<string, string>();
    for (const doc of allDocuments) {
      map.set(doc.hospital.id, doc.hospital.name);
    }
    return Array.from(map.entries()).map(([id, name]) => ({ id, name }));
  }, [allDocuments]);

  const filteredDocuments = useMemo(() => {
    return allDocuments.filter((doc) => {
      if (statusFilter !== "all" && doc.reviewStatus !== statusFilter) {
        return false;
      }
      if (hospitalFilter !== "all" && doc.hospital.id !== hospitalFilter) {
        return false;
      }
      if (search.trim()) {
        const q = search.toLowerCase();
        const matchName = doc.name.toLowerCase().includes(q);
        const matchReq = doc.requestId.toLowerCase().includes(q);
        const matchHosp = doc.hospital.name.toLowerCase().includes(q);
        if (!matchName && !matchReq && !matchHosp) return false;
      }
      return true;
    });
  }, [allDocuments, statusFilter, hospitalFilter, search]);

  const totalCount = allDocuments.length;
  const acceptedCount = allDocuments.filter(
    (d) => d.reviewStatus === "accepted",
  ).length;
  const pendingCount = allDocuments.filter(
    (d) => d.reviewStatus === "pending",
  ).length;
  const changesCount = allDocuments.filter(
    (d) => d.reviewStatus === "changes_requested",
  ).length;

  const handleQuickApprove = async (doc: BloodBankDocumentItem) => {
    setActionFeedback(null);
    try {
      await updateDocMutation.mutateAsync({
        requestId: doc.requestId,
        documentId: doc.id,
        status: "accepted",
      });
      setActionFeedback(t("bloodBank.quickVerifySuccess", { name: doc.name }));
    } catch (err) {
      setActionFeedback(
        err instanceof Error ? err.message : "Failed to update document status.",
      );
    }
  };

  const handleConfirmRejection = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rejectDocTarget) return;
    if (!rejectionReason.trim()) {
      setRejectionError(t("bloodBank.rejectionReasonRequired"));
      return;
    }

    setRejectionError(null);
    try {
      await updateDocMutation.mutateAsync({
        requestId: rejectDocTarget.requestId,
        documentId: rejectDocTarget.id,
        status: "changes_requested",
      });
      setActionFeedback(
        t("bloodBank.rejectionSavedSuccess", { name: rejectDocTarget.name }),
      );
      setRejectDocTarget(null);
      setRejectionReason("");
    } catch (err) {
      setRejectionError(
        err instanceof Error ? err.message : t("bloodBank.recordRejectionFailed"),
      );
    }
  };

  return (
    <BloodBankPageFrame
      breadcrumbs={[
        { label: t("healthcare.bloodBank"), href: "/blood-bank/dashboard" },
        { label: t("bloodBank.documentsTriageTitle") },
      ]}
      title={t("bloodBank.documentsTriageTitle")}
      description={t("bloodBank.documentsTriageDesc")}
      actions={
        <Button asChild variant="secondary" size="sm" className="h-9 text-xs">
          <Link to="/blood-bank/requests">
            {t("bloodBank.openQueue")}
            <ExternalLink className="size-3.5 rtl:rotate-180" aria-hidden="true" />
          </Link>
        </Button>
      }
    >
      {documentsQuery.isPending ? (
        <LoadingState label={t("bloodBank.loadingDocumentsTriage")} rows={6} />
      ) : documentsQuery.isError ? (
        <ErrorState
          title={t("bloodBank.documentsLoadErrorTitle")}
          description={t("bloodBank.documentsLoadErrorDescription")}
          onRetry={() => void documentsQuery.refetch()}
        />
      ) : (
        <div className="space-y-6">
          {actionFeedback ? (
            <div
              className="flex items-center gap-2 border border-success/30 bg-success-subtle p-3 text-xs text-success"
              role="status"
            >
              <ShieldCheck className="size-4 shrink-0" aria-hidden="true" />
              <span>{actionFeedback}</span>
            </div>
          ) : null}

          {/* Connected KPI Register */}
          <section aria-labelledby="bb-docs-kpi-heading">
            <h2 id="bb-docs-kpi-heading" className="sr-only">
              {t("bloodBank.documentTriageMetrics")}
            </h2>
            <dl className="grid grid-cols-2 border border-border bg-border sm:grid-cols-4">
              <div className="bg-surface p-4">
                <dt className="text-xs font-medium text-muted-foreground">
                  {t("bloodBank.totalDocuments")}
                </dt>
                <dd className="mt-1 text-2xl font-bold tabular-nums text-foreground">
                  <bdi dir="ltr">{totalCount}</bdi>
                </dd>
              </div>
              <div className="bg-surface p-4">
                <dt className="text-xs font-medium text-amber-700 dark:text-amber-400">
                  {t("bloodBank.pendingVerification")}
                </dt>
                <dd className="mt-1 text-2xl font-bold tabular-nums text-amber-700 dark:text-amber-400">
                  <bdi dir="ltr">{pendingCount}</bdi>
                </dd>
              </div>
              <div className="bg-surface p-4">
                <dt className="text-xs font-medium text-success">
                  {t("bloodBank.verifiedAccepted")}
                </dt>
                <dd className="mt-1 text-2xl font-bold tabular-nums text-success">
                  <bdi dir="ltr">{acceptedCount}</bdi>
                </dd>
              </div>
              <div className="bg-surface p-4">
                <dt className="text-xs font-medium text-emergency">
                  {t("status.changes_requested")}
                </dt>
                <dd className="mt-1 text-2xl font-bold tabular-nums text-emergency">
                  <bdi dir="ltr">{changesCount}</bdi>
                </dd>
              </div>
            </dl>
          </section>

          {/* Filters Bar */}
          <div className="border border-border bg-surface p-4 space-y-3 sm:space-y-0 sm:flex sm:items-center sm:justify-between sm:gap-4">
            <div className="relative flex-1 max-w-md">
              <Search
                className="absolute start-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground"
                aria-hidden="true"
              />
              <input
                type="text"
                placeholder={t("bloodBank.searchDocumentsPlaceholder")}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full border border-border bg-surface ps-9 pe-3 py-2 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                <Filter className="size-3.5" aria-hidden="true" />
                {t("bloodBank.statusFilterLabel")}
              </span>
              {(
                [
                  ["all", t("common.all")],
                  ["pending", t("common.pending")],
                  ["accepted", t("status.accepted")],
                  ["changes_requested", t("bloodBank.deficientFilter")],
                ] as const
              ).map(([val, label]) => (
                <button
                  key={val}
                  type="button"
                  onClick={() => setStatusFilter(val)}
                  className={`px-2.5 py-1 text-xs font-medium rounded border transition-colors ${
                    statusFilter === val
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border bg-surface hover:bg-surface-subtle text-muted-foreground"
                  }`}
                >
                  {label}
                </button>
              ))}

              <select
                value={hospitalFilter}
                onChange={(e) => setHospitalFilter(e.target.value)}
                aria-label={t("bloodBank.allHospitals")}
                className="border border-border bg-surface px-2.5 py-1 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              >
                <option value="all">{t("bloodBank.allHospitals")}</option>
                {hospitalOptions.map((h) => (
                  <option key={h.id} value={h.id}>
                    {h.name}
                  </option>
                ))}
              </select>

              {(search || statusFilter !== "all" || hospitalFilter !== "all") && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setSearch("");
                    setStatusFilter("all");
                    setHospitalFilter("all");
                  }}
                  className="h-7 text-xs px-2"
                >
                  {t("common.reset")}
                </Button>
              )}
            </div>
          </div>

          {/* Table */}
          {filteredDocuments.length === 0 ? (
            <EmptyState
              title={t("bloodBank.noDocsLocated")}
              description={t("bloodBank.noDocsLocatedDesc")}
              action={
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => {
                    setSearch("");
                    setStatusFilter("all");
                    setHospitalFilter("all");
                  }}
                >
                  {t("hospital.clearFilters")}
                </Button>
              }
            />
          ) : (
            <div
              tabIndex={0}
              role="region"
              aria-label={t("bloodBank.documentsTableLabel")}
              className="overflow-x-auto border border-border bg-surface"
            >
              <table className="w-full min-w-[58rem] border-collapse text-start text-xs">
                <thead className="border-b border-border bg-surface-subtle font-semibold text-muted-foreground">
                  <tr>
                    <th scope="col" className="px-4 py-3 text-start">
                      {t("bloodBank.documentFileCol")}
                    </th>
                    <th scope="col" className="px-4 py-3 text-start">
                      {t("bloodBank.hospitalCol")}
                    </th>
                    <th scope="col" className="px-4 py-3 text-start">
                      {t("bloodBank.requisitionCol")}
                    </th>
                    <th scope="col" className="px-4 py-3 text-start">
                      {t("bloodBank.transfusionProfileCol")}
                    </th>
                    <th scope="col" className="px-4 py-3 text-start">
                      {t("bloodBank.uploadedCol")}
                    </th>
                    <th scope="col" className="px-4 py-3 text-start">
                      {t("bloodBank.reviewStatusCol")}
                    </th>
                    <th scope="col" className="px-4 py-3 text-end">
                      {t("bloodBank.reviewActionsCol")}
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filteredDocuments.map((doc) => {
                    const isPending = doc.reviewStatus === "pending";

                    return (
                      <tr
                        key={`${doc.requestId}-${doc.id}`}
                        className="hover:bg-surface-subtle/70 transition-colors"
                      >
                        <td className="px-4 py-3 font-medium text-foreground">
                          <div className="flex items-center gap-2">
                            <FileText
                              className="size-4 text-primary shrink-0"
                              aria-hidden="true"
                            />
                            <div className="min-w-0">
                              <span className="block truncate font-semibold">
                                {doc.name}
                              </span>
                              <span className="text-[11px] text-muted-foreground font-mono">
                                <bdi dir="ltr">{formatFileSize(doc.sizeBytes)} • {doc.mimeType}</bdi>
                              </span>
                            </div>
                          </div>
                        </td>

                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1.5 text-foreground font-medium">
                            <Building2 className="size-3.5 text-primary shrink-0" aria-hidden="true" />
                            <span>{doc.hospital.name}</span>
                          </div>
                          <span className="font-mono text-[10px] text-muted-foreground">
                            <bdi dir="ltr">{doc.hospital.facilityCode}</bdi>
                          </span>
                        </td>

                        <td className="px-4 py-3">
                          <Link
                            to={`/blood-bank/requests/${doc.requestId}`}
                            className="inline-flex items-center gap-1 font-mono font-semibold text-primary hover:underline"
                          >
                            <bdi dir="ltr">{doc.requestId}</bdi>
                            <ExternalLink className="size-3 rtl:rotate-180" aria-hidden="true" />
                          </Link>
                        </td>

                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <BloodGroupBadge group={doc.bloodGroup} />
                            <span className="text-muted-foreground truncate">
                              {bloodBankComponentLabels[doc.component]}
                            </span>
                          </div>
                        </td>

                        <td className="px-4 py-3 text-muted-foreground tabular-nums">
                          <bdi dir="ltr">{formatDocDate(doc.uploadedAt)}</bdi>
                        </td>

                        <td className="px-4 py-3">
                          <ReviewStatusBadge status={doc.reviewStatus} />
                        </td>

                        <td className="px-4 py-3 text-end">
                          <div className="flex items-center justify-end gap-1.5">
                            {isPending ? (
                              <>
                                <Button
                                  type="button"
                                  size="sm"
                                  className="h-7 px-2 text-xs"
                                  disabled={updateDocMutation.isPending}
                                  onClick={() => void handleQuickApprove(doc)}
                                >
                                  <Check className="size-3" aria-hidden="true" />
                                  {t("bloodBank.acceptAction")}
                                </Button>
                                <Button
                                  type="button"
                                  variant="secondary"
                                  size="sm"
                                  className="h-7 px-2 text-xs text-destructive hover:text-destructive"
                                  disabled={updateDocMutation.isPending}
                                  onClick={() => {
                                    setRejectDocTarget(doc);
                                    setRejectionReason("");
                                    setRejectionError(null);
                                  }}
                                >
                                  <X className="size-3" aria-hidden="true" />
                                  {t("common.rejected")}
                                </Button>
                              </>
                            ) : null}
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="h-7 px-2 text-xs"
                              onClick={() => setInspectDoc(doc)}
                            >
                              <Eye className="size-3.5" aria-hidden="true" />
                              {t("bloodBank.inspectDocAction")}
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Document Inspection Dialog */}
      <Dialog
        open={Boolean(inspectDoc)}
        onOpenChange={(open) => {
          if (!open) setInspectDoc(null);
        }}
      >
        <DialogContent className="max-w-md">
          {inspectDoc ? (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2 text-base">
                  <FileText className="size-4 text-primary" aria-hidden="true" />
                  {inspectDoc.name}
                </DialogTitle>
                <DialogDescription className="text-xs text-muted-foreground">
                  {t("bloodBank.documentsTriageDesc")}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-3 py-2 text-xs">
                <div className="flex items-center justify-between border-b border-border pb-2">
                  <span className="text-muted-foreground">{t("bloodBank.reviewStatusCol")}</span>
                  <ReviewStatusBadge status={inspectDoc.reviewStatus} />
                </div>
                <div className="flex items-center justify-between border-b border-border pb-2">
                  <span className="text-muted-foreground">{t("bloodBank.hospitalCol")}</span>
                  <span className="font-medium text-foreground">
                    {inspectDoc.hospital.name} (<bdi dir="ltr">{inspectDoc.hospital.facilityCode}</bdi>)
                  </span>
                </div>
                <div className="flex items-center justify-between border-b border-border pb-2">
                  <span className="text-muted-foreground">{t("bloodBank.requisitionCol")}</span>
                  <Link
                    to={`/blood-bank/requests/${inspectDoc.requestId}`}
                    className="font-mono font-semibold text-primary hover:underline inline-flex items-center gap-1"
                  >
                    <bdi dir="ltr">{inspectDoc.requestId}</bdi>
                    <ExternalLink className="size-3 rtl:rotate-180" aria-hidden="true" />
                  </Link>
                </div>
                <div className="flex items-center justify-between border-b border-border pb-2">
                  <span className="text-muted-foreground">{t("bloodBank.transfusionProfileCol")}</span>
                  <div className="flex items-center gap-1.5">
                    <BloodGroupBadge group={inspectDoc.bloodGroup} />
                    <span>{bloodBankComponentLabels[inspectDoc.component]}</span>
                  </div>
                </div>
                <div className="flex items-center justify-between border-b border-border pb-2">
                  <span className="text-muted-foreground">{t("common.quantity")}</span>
                  <span className="font-mono text-foreground">
                    <bdi dir="ltr">{formatFileSize(inspectDoc.sizeBytes)} ({inspectDoc.mimeType})</bdi>
                  </span>
                </div>
                <div className="flex items-center justify-between border-b border-border pb-2">
                  <span className="text-muted-foreground">{t("bloodBank.uploadedCol")}</span>
                  <span className="tabular-nums text-foreground">
                    <bdi dir="ltr">{formatDocDate(inspectDoc.uploadedAt)}</bdi>
                  </span>
                </div>

                <div className="rounded border border-border bg-surface-subtle p-3 text-[11px] text-muted-foreground">
                  <span className="font-semibold text-foreground">{t("activity.eventDetails")}:</span>{" "}
                  {t("bloodBank.traceabilityNotice")}
                </div>
              </div>

              <DialogFooter>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => setInspectDoc(null)}
                >
                  {t("common.close")}
                </Button>
                <Button asChild>
                  <Link to={`/blood-bank/requests/${inspectDoc.requestId}`}>
                    {t("common.viewDetails")}
                  </Link>
                </Button>
              </DialogFooter>
            </>
          ) : null}
        </DialogContent>
      </Dialog>

      {/* Reject / Request Changes Dialog (Section 12: Reason is mandatory) */}
      <Dialog
        open={Boolean(rejectDocTarget)}
        onOpenChange={(open) => {
          if (!open) setRejectDocTarget(null);
        }}
      >
        <DialogContent className="max-w-md">
          {rejectDocTarget ? (
            <form onSubmit={handleConfirmRejection}>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2 text-base text-emergency">
                  <ShieldAlert className="size-4" aria-hidden="true" />
                  {t("bloodBank.rejectModalTitle")}
                </DialogTitle>
                <DialogDescription className="text-xs text-muted-foreground">
                  {t("bloodBank.rejectionReasonRequired")}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4 py-3 text-xs">
                {rejectionError ? (
                  <div
                    className="flex items-center gap-2 border border-destructive/30 bg-emergency-subtle p-3 text-emergency"
                    role="alert"
                  >
                    <AlertCircle className="size-4 shrink-0" aria-hidden="true" />
                    <span>{rejectionError}</span>
                  </div>
                ) : null}

                <div className="border border-border bg-surface-subtle p-3">
                  <span className="font-semibold text-foreground">
                    {t("bloodBank.documentFileCol")}:
                  </span>{" "}
                  {rejectDocTarget.name} • {t("bloodBank.requisitionCol")}:{" "}
                  <span className="font-mono font-semibold text-foreground">
                    <bdi dir="ltr">{rejectDocTarget.requestId}</bdi>
                  </span>
                </div>

                <div>
                  <label className="font-semibold text-foreground">
                    {t("bloodBank.rejectionReasonLabel")}
                  </label>
                  <div className="mt-1.5 space-y-1.5">
                    {rejectionPresets.map((preset) => (
                      <button
                        key={preset}
                        type="button"
                        onClick={() => setRejectionReason(preset)}
                        className="w-full text-start p-2 text-[11px] border border-border bg-surface hover:bg-surface-subtle transition-colors"
                      >
                        {preset}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="rejection-reason-textarea"
                    className="font-semibold text-foreground"
                  >
                    {t("bloodBank.rejectionReasonLabel")}
                  </label>
                  <textarea
                    id="rejection-reason-textarea"
                    rows={3}
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    placeholder={t("bloodBank.rejectionPlaceholder")}
                    className="mt-1 w-full border border-border bg-surface px-3 py-2 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-destructive"
                  />
                </div>
              </div>

              <DialogFooter className="gap-2 sm:gap-0">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => setRejectDocTarget(null)}
                  disabled={updateDocMutation.isPending}
                >
                  {t("common.cancel")}
                </Button>
                <Button
                  type="submit"
                  variant="destructive"
                  disabled={updateDocMutation.isPending || !rejectionReason.trim()}
                >
                  {updateDocMutation.isPending ? (
                    <LoaderCircle className="size-3.5 animate-spin" aria-hidden="true" />
                  ) : null}
                  {t("bloodBank.confirmRejection")}
                </Button>
              </DialogFooter>
            </form>
          ) : null}
        </DialogContent>
      </Dialog>
    </BloodBankPageFrame>
  );
}
export default BloodBankDocumentsPage;
import { i18n } from "@/app/i18n/i18n";
