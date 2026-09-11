import {
  AlertCircle,
  Clock,
  ExternalLink,
  Eye,
  FileText,
  Filter,
  Search,
  ShieldAlert,
  ShieldCheck,
  Upload,
} from "lucide-react";
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";

import { HospitalPageFrame } from "@/features/hospital/components/hospital-page-frame";
import { formatDateTime } from "@/features/hospital/components/hospital-formatters";
import {
  useHospitalAllDocuments,
  useHospitalRequests,
  useUploadHospitalDocument,
} from "@/features/hospital/hooks/use-hospital-requests";
import { bloodComponentLabels } from "@/features/hospital/types/hospital.types";
import type {
  DocumentReviewStatus,
  HospitalDocumentItem,
} from "@/features/hospital/types/hospital.types";
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

function ReviewStatusBadge({ status }: { status: DocumentReviewStatus }) {
  const { t } = useTranslation();

  switch (status) {
    case "accepted":
      return (
        <span className="inline-flex items-center gap-1 rounded border border-success/30 bg-success-subtle px-2 py-0.5 text-[11px] font-semibold text-success">
          <ShieldCheck className="size-3" aria-hidden="true" />
          {t("common.verified")}
        </span>
      );
    case "changes_requested":
      return (
        <span className="inline-flex items-center gap-1 rounded border border-destructive/30 bg-emergency-subtle px-2 py-0.5 text-[11px] font-semibold text-emergency">
          <ShieldAlert className="size-3" aria-hidden="true" />
          {t("common.rejected")}
        </span>
      );
    case "pending":
    default:
      return (
        <span className="inline-flex items-center gap-1 rounded border border-amber-500/30 bg-amber-500/10 px-2 py-0.5 text-[11px] font-semibold text-amber-700 dark:text-amber-400">
          <Clock className="size-3" aria-hidden="true" />
          {t("common.pending")}
        </span>
      );
  }
}

export function HospitalDocumentsPage() {
  const { t } = useTranslation();
  const documentsQuery = useHospitalAllDocuments();
  const requestsQuery = useHospitalRequests();
  const uploadMutation = useUploadHospitalDocument();

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<
    DocumentReviewStatus | "all"
  >("all");
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [previewDoc, setPreviewDoc] = useState<HospitalDocumentItem | null>(
    null,
  );

  // Upload modal state
  const [selectedRequestId, setSelectedRequestId] = useState("");
  const [documentName, setDocumentName] = useState("");
  const [documentType, setDocumentType] = useState("application/pdf");
  const [uploadError, setUploadError] = useState<string | null>(null);

  const allDocuments = useMemo(
    () => documentsQuery.data ?? [],
    [documentsQuery.data],
  );
  const activeRequests = requestsQuery.data ?? [];

  const filteredDocuments = useMemo(() => {
    return allDocuments.filter((doc) => {
      const matchesStatus =
        statusFilter === "all" || doc.reviewStatus === statusFilter;
      const q = search.toLowerCase().trim();
      const matchesSearch =
        !q ||
        doc.name.toLowerCase().includes(q) ||
        doc.requestId.toLowerCase().includes(q) ||
        doc.targetBloodBankName.toLowerCase().includes(q);
      return matchesStatus && matchesSearch;
    });
  }, [allDocuments, search, statusFilter]);

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

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRequestId) {
      setUploadError(t("hospital.selectRequestError"));
      return;
    }
    if (!documentName.trim()) {
      setUploadError(t("hospital.documentNameError"));
      return;
    }

    setUploadError(null);
    try {
      await uploadMutation.mutateAsync({
        requestId: selectedRequestId,
        file: {
          name: documentName.trim(),
          mimeType: documentType,
          sizeBytes: 154_000 + Math.floor(Math.random() * 800_000),
        },
      });
      setUploadDialogOpen(false);
      setDocumentName("");
      setSelectedRequestId("");
    } catch (err) {
      setUploadError(
        err instanceof Error ? err.message : t("hospital.attachDocumentFailed"),
      );
    }
  };

  return (
    <HospitalPageFrame
      breadcrumbs={[
        { label: t("healthcare.hospital"), href: "/hospital/dashboard" },
        { label: t("hospital.documentsRegister") },
      ]}
      title={t("hospital.documentsRegister")}
      description={t("hospital.operationsDesc")}
      actions={
        <Button
          type="button"
          onClick={() => {
            setSelectedRequestId(activeRequests[0]?.id ?? "");
            setUploadDialogOpen(true);
          }}
        >
          <Upload className="size-4" aria-hidden="true" />
          {t("hospital.uploadDocument")}
        </Button>
      }
    >
      {documentsQuery.isPending ? (
        <LoadingState label={t("hospital.loadingDocuments")} rows={6} />
      ) : documentsQuery.isError ? (
        <ErrorState
          title={t("hospital.documentsLoadError")}
          description={t("hospital.documentsLoadErrorDescription")}
          onRetry={() => void documentsQuery.refetch()}
        />
      ) : (
        <div className="space-y-6">
          {/* Connected Metrics Definition List Register */}
          <section aria-labelledby="documents-kpis-title">
            <h2 id="documents-kpis-title" className="sr-only">
              {t("hospital.documentMetricsSummary")}
            </h2>
            <dl className="grid grid-cols-2 border border-border bg-border sm:grid-cols-4">
              <div className="bg-surface p-4">
                <dt className="text-xs font-medium text-muted-foreground">
                  {t("hospital.documentsRegister")}
                </dt>
                <dd className="mt-1 text-2xl font-bold tabular-nums text-foreground">
                  {totalCount}
                </dd>
              </div>
              <div className="bg-surface p-4">
                <dt className="text-xs font-medium text-success">
                  {t("common.verified")}
                </dt>
                <dd className="mt-1 text-2xl font-bold tabular-nums text-success">
                  {acceptedCount}
                </dd>
              </div>
              <div className="bg-surface p-4">
                <dt className="text-xs font-medium text-amber-700 dark:text-amber-400">
                  {t("common.pending")}
                </dt>
                <dd className="mt-1 text-2xl font-bold tabular-nums text-amber-700 dark:text-amber-400">
                  {pendingCount}
                </dd>
              </div>
              <div className="bg-surface p-4">
                <dt className="text-xs font-medium text-emergency">
                  {t("common.rejected")}
                </dt>
                <dd className="mt-1 text-2xl font-bold tabular-nums text-emergency">
                  {changesCount}
                </dd>
              </div>
            </dl>
          </section>

          {/* Filter Bar */}
          <div className="border border-border bg-surface p-4 space-y-3 sm:space-y-0 sm:flex sm:items-center sm:justify-between sm:gap-4">
            <div className="relative flex-1 max-w-md">
              <Search
                className="absolute start-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground"
                aria-hidden="true"
              />
              <input
                type="text"
                placeholder={t("hospital.searchPlaceholder")}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full border border-border bg-surface ps-9 pe-3 py-2 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                <Filter className="size-3.5" aria-hidden="true" />
                {t("common.status")}:
              </span>
              {(
                [
                  ["all", t("common.all")],
                  ["pending", t("common.pending")],
                  ["accepted", t("common.verified")],
                  ["changes_requested", t("common.rejected")],
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

              {(search || statusFilter !== "all") && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setSearch("");
                    setStatusFilter("all");
                  }}
                  className="h-7 text-xs px-2"
                >
                  {t("hospital.clearFilters")}
                </Button>
              )}
            </div>
          </div>

          {/* Documents Table */}
          {filteredDocuments.length === 0 ? (
            <EmptyState
              title={t("common.noRecordsTitle")}
              description={t("common.noRecordsDesc")}
              action={
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => {
                    setSearch("");
                    setStatusFilter("all");
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
              aria-label={t("hospital.documentsTableLabel")}
              className="overflow-x-auto border border-border bg-surface"
            >
              <table className="w-full min-w-[56rem] border-collapse text-start text-xs">
                <thead className="border-b border-border bg-surface-subtle font-semibold text-muted-foreground">
                  <tr>
                    <th scope="col" className="px-4 py-3 text-start">
                      {t("hospital.documentType")}
                    </th>
                    <th scope="col" className="px-4 py-3 text-start">
                      {t("hospital.requestId")}
                    </th>
                    <th scope="col" className="px-4 py-3 text-start">
                      {t("common.component")}
                    </th>
                    <th scope="col" className="px-4 py-3 text-start">
                      {t("hospital.recipientBank")}
                    </th>
                    <th scope="col" className="px-4 py-3 text-start">
                      {t("common.date")}
                    </th>
                    <th scope="col" className="px-4 py-3 text-start">
                      {t("common.status")}
                    </th>
                    <th scope="col" className="px-4 py-3 text-end">
                      {t("common.actions")}
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filteredDocuments.map((doc) => (
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
                              {formatFileSize(doc.sizeBytes)} • {doc.mimeType}
                            </span>
                          </div>
                        </div>
                      </td>

                      <td className="px-4 py-3">
                        <Link
                          to={`/hospital/requests/${doc.requestId}`}
                          className="inline-flex items-center gap-1 font-mono font-semibold text-primary hover:underline"
                        >
                          {doc.requestId}
                          <ExternalLink className="size-3" aria-hidden="true" />
                        </Link>
                      </td>

                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <BloodGroupBadge group={doc.bloodGroup} />
                          <span className="text-muted-foreground truncate">
                            {t(`healthcare.${doc.component}`, bloodComponentLabels[doc.component])}
                          </span>
                        </div>
                      </td>

                      <td className="px-4 py-3 text-muted-foreground">
                        {doc.targetBloodBankName}
                      </td>

                      <td className="px-4 py-3 text-muted-foreground tabular-nums">
                        {formatDateTime(doc.uploadedAt)}
                      </td>

                      <td className="px-4 py-3">
                        <ReviewStatusBadge status={doc.reviewStatus} />
                      </td>

                      <td className="px-4 py-3 text-end">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="h-7 px-2 text-xs"
                            onClick={() => setPreviewDoc(doc)}
                          >
                            <Eye className="size-3.5" aria-hidden="true" />
                            {t("common.view")}
                          </Button>
                          <Button
                            asChild
                            variant="secondary"
                            size="sm"
                            className="h-7 px-2 text-xs"
                          >
                            <Link to={`/hospital/requests/${doc.requestId}`}>
                              {t("hospital.openRequisition")}
                            </Link>
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Upload Document Modal */}
      <Dialog open={uploadDialogOpen} onOpenChange={setUploadDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-base">
              <Upload className="size-4 text-primary" aria-hidden="true" />
              {t("hospital.attachClinicalDocument")}
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              {t("hospital.attachClinicalDocumentDescription")}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleUploadSubmit} className="space-y-4 py-2 text-xs">
            {uploadError ? (
              <div
                className="flex items-center gap-2 border border-destructive/30 bg-emergency-subtle p-3 text-emergency"
                role="alert"
              >
                <AlertCircle className="size-4 shrink-0" aria-hidden="true" />
                <span>{uploadError}</span>
              </div>
            ) : null}

            <div>
              <label
                htmlFor="upload-req-select"
                className="font-semibold text-foreground"
              >
                {t("hospital.selectTargetRequisition")}
              </label>
              <select
                id="upload-req-select"
                value={selectedRequestId}
                onChange={(e) => setSelectedRequestId(e.target.value)}
                className="mt-1 w-full border border-border bg-surface px-3 py-2 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              >
                <option value="">— {t("hospital.selectActiveRequisition")} —</option>
                {activeRequests.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.id} • {r.bloodGroup} {r.quantity} {t("common.units")} • {r.targetBloodBank?.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                htmlFor="upload-doc-name"
                className="font-semibold text-foreground"
              >
                {t("hospital.documentTitleFileName")}
              </label>
              <input
                id="upload-doc-name"
                type="text"
                value={documentName}
                onChange={(e) => setDocumentName(e.target.value)}
                placeholder={t("hospital.documentNamePlaceholder")}
                className="mt-1 w-full border border-border bg-surface px-3 py-2 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              />
              <p className="mt-1 text-[11px] text-muted-foreground">
                {t("hospital.permittedFormats")}
              </p>
            </div>

            <div>
              <label
                htmlFor="upload-doc-type"
                className="font-semibold text-foreground"
              >
                {t("hospital.mimeFileFormat")}
              </label>
              <select
                id="upload-doc-type"
                value={documentType}
                onChange={(e) => setDocumentType(e.target.value)}
                className="mt-1 w-full border border-border bg-surface px-3 py-2 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              >
                <option value="application/pdf">Adobe PDF (.pdf)</option>
                <option value="image/jpeg">JPEG Image (.jpg, .jpeg)</option>
                <option value="image/png">PNG Image (.png)</option>
              </select>
            </div>

            <div className="rounded border border-border bg-surface-subtle p-3 text-[11px] text-muted-foreground">
              <span className="font-semibold text-foreground">{t("hospital.clinicalPrivacyNote")}:</span>{" "}
              {t("hospital.clinicalPrivacyDescription")}
            </div>

            <DialogFooter className="gap-2 sm:gap-0 pt-2">
              <Button
                type="button"
                variant="secondary"
                onClick={() => setUploadDialogOpen(false)}
                disabled={uploadMutation.isPending}
              >
                {t("common.cancel")}
              </Button>
              <Button type="submit" disabled={uploadMutation.isPending}>
                {uploadMutation.isPending ? t("hospital.uploading") : t("hospital.uploadAndAttach")}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Document Details & Audit Preview Dialog */}
      <Dialog
        open={Boolean(previewDoc)}
        onOpenChange={(open) => {
          if (!open) setPreviewDoc(null);
        }}
      >
        <DialogContent className="max-w-md">
          {previewDoc ? (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2 text-base">
                  <FileText className="size-4 text-primary" aria-hidden="true" />
                  {previewDoc.name}
                </DialogTitle>
                <DialogDescription className="text-xs text-muted-foreground">
                  {t("hospital.attachmentAuditDescription")}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-3 py-2 text-xs">
                <div className="flex items-center justify-between border-b border-border pb-2">
                  <span className="text-muted-foreground">{t("hospital.verificationStatus")}</span>
                  <ReviewStatusBadge status={previewDoc.reviewStatus} />
                </div>

                <div className="flex items-center justify-between border-b border-border pb-2">
                  <span className="text-muted-foreground">{t("hospital.associatedRequisition")}</span>
                  <Link
                    to={`/hospital/requests/${previewDoc.requestId}`}
                    className="font-mono font-semibold text-primary hover:underline inline-flex items-center gap-1"
                  >
                    {previewDoc.requestId}
                    <ExternalLink className="size-3" aria-hidden="true" />
                  </Link>
                </div>

                <div className="flex items-center justify-between border-b border-border pb-2">
                  <span className="text-muted-foreground">{t("hospital.bloodBankAuthority")}</span>
                  <span className="font-medium text-foreground">
                    {previewDoc.targetBloodBankName}
                  </span>
                </div>

                <div className="flex items-center justify-between border-b border-border pb-2">
                  <span className="text-muted-foreground">{t("hospital.fileSize")}</span>
                  <span className="font-mono font-medium text-foreground">
                    {formatFileSize(previewDoc.sizeBytes)}
                  </span>
                </div>

                <div className="flex items-center justify-between border-b border-border pb-2">
                  <span className="text-muted-foreground">{t("hospital.mimeFormat")}</span>
                  <span className="font-mono font-medium text-foreground">
                    {previewDoc.mimeType}
                  </span>
                </div>

                <div className="flex items-center justify-between border-b border-border pb-2">
                  <span className="text-muted-foreground">{t("hospital.uploadedAtLabel")}</span>
                  <span className="tabular-nums text-foreground">
                    {formatDateTime(previewDoc.uploadedAt)}
                  </span>
                </div>

                <div className="rounded border border-border bg-surface-subtle p-3 text-[11px] text-muted-foreground">
                  <span className="font-semibold text-foreground">{t("hospital.complianceSeal")}:</span>{" "}
                  {t("hospital.complianceSealDescription")}
                </div>
              </div>

              <DialogFooter>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => setPreviewDoc(null)}
                >
                  {t("common.close")}
                </Button>
                <Button asChild>
                  <Link to={`/hospital/requests/${previewDoc.requestId}`}>
                    {t("hospital.goToRequisition")}
                  </Link>
                </Button>
              </DialogFooter>
            </>
          ) : null}
        </DialogContent>
      </Dialog>
    </HospitalPageFrame>
  );
}
export default HospitalDocumentsPage;
