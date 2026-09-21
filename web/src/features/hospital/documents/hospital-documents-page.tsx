import {
  AlertCircle,
  CheckCircle2,
  ExternalLink,
  Eye,
  FileText,
  Search,
  Upload,
  UploadCloud,
  X,
} from "lucide-react";
import { useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";

import { HospitalPageFrame } from "@/features/hospital/components/hospital-page-frame";
import { formatDateTime } from "@/features/hospital/components/hospital-formatters";
import { formatMimeType, formatShortId } from "@/shared/lib/formatters";
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
import { StatusIndicator } from "@/shared/components/clinical/status-indicator";
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
        <StatusIndicator tone="success">{t("common.verified")}</StatusIndicator>
      );
    case "changes_requested":
      return (
        <StatusIndicator tone="danger">{t("common.rejected")}</StatusIndicator>
      );
    case "pending":
    default:
      return (
        <StatusIndicator tone="pending">
          {t("common.pending")}
        </StatusIndicator>
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
  const [requestSearch, setRequestSearch] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [documentName, setDocumentName] = useState("");
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const handleFileChange = (file?: File) => {
    if (!file) return;
    const allowed = ["application/pdf", "image/jpeg", "image/png"];
    if (!allowed.includes(file.type)) {
      setUploadError(
        t("hospital.uploadTypeError", "Permitted file formats: PDF, JPEG, PNG."),
      );
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setUploadError(
        t("hospital.uploadSizeError", "Maximum permitted file size is 10 MB."),
      );
      return;
    }
    setUploadError(null);
    setSelectedFile(file);
    if (!documentName) {
      setDocumentName(file.name);
    }
  };

  const filteredActiveRequests = useMemo(() => {
    if (!requestSearch.trim()) return activeRequests;
    const q = requestSearch.toLowerCase().trim();
    return activeRequests.filter(
      (r) =>
        r.id.toLowerCase().includes(q) ||
        r.bloodGroup.toLowerCase().includes(q) ||
        (r.targetBloodBank?.name &&
          r.targetBloodBank.name.toLowerCase().includes(q)),
    );
  }, [activeRequests, requestSearch]);

  const selectedRequest = useMemo(
    () => activeRequests.find((r) => r.id === selectedRequestId),
    [activeRequests, selectedRequestId],
  );

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRequestId) {
      setUploadError(
        t("hospital.selectRequestError", "Please select a target blood requisition."),
      );
      return;
    }
    const finalDocName =
      documentName.trim() || selectedFile?.name || "clinical-document.pdf";
    if (!finalDocName) {
      setUploadError(
        t("hospital.documentNameError", "Please provide a document title or upload a file."),
      );
      return;
    }

    setUploadError(null);
    try {
      await uploadMutation.mutateAsync({
        requestId: selectedRequestId,
        file: {
          name: finalDocName,
          mimeType: selectedFile?.type || "application/pdf",
          sizeBytes:
            selectedFile?.size ??
            (154_000 + Math.floor(Math.random() * 800_000)),
        },
      });
      setUploadDialogOpen(false);
      setSelectedFile(null);
      setDocumentName("");
      setSelectedRequestId("");
      setRequestSearch("");
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
          {/* Distinct Separated KPI Cards */}
          <section aria-labelledby="documents-kpis-title">
            <h2 id="documents-kpis-title" className="sr-only">
              {t("hospital.documentMetricsSummary")}
            </h2>
            <dl className="grid grid-cols-2 gap-3.5 sm:grid-cols-4 sm:gap-4">
              <div className="rounded-xl border border-border/80 bg-surface p-4 shadow-2xs transition-all hover:border-border hover:shadow-xs">
                <dt className="text-xs font-medium text-muted-foreground">
                  {t("hospital.documentsRegister")}
                </dt>
                <dd className="mt-1.5 text-2xl font-bold tabular-nums text-foreground">
                  {totalCount}
                </dd>
              </div>
              <div className="rounded-xl border border-border/80 bg-surface p-4 shadow-2xs transition-all hover:border-success/40 hover:shadow-xs">
                <dt className="flex items-center gap-1.5 text-xs font-medium text-success">
                  <span className="size-1.5 rounded-full bg-success" />
                  {t("common.verified")}
                </dt>
                <dd className="mt-1.5 text-2xl font-bold tabular-nums text-success">
                  {acceptedCount}
                </dd>
              </div>
              <div className="rounded-xl border border-border/80 bg-surface p-4 shadow-2xs transition-all hover:border-amber-400/50 hover:shadow-xs">
                <dt className="flex items-center gap-1.5 text-xs font-medium text-amber-700 dark:text-amber-400">
                  <span className="size-1.5 rounded-full bg-amber-500" />
                  {t("common.pending")}
                </dt>
                <dd className="mt-1.5 text-2xl font-bold tabular-nums text-amber-700 dark:text-amber-400">
                  {pendingCount}
                </dd>
              </div>
              <div className="rounded-xl border border-border/80 bg-surface p-4 shadow-2xs transition-all hover:border-destructive/40 hover:shadow-xs">
                <dt className="flex items-center gap-1.5 text-xs font-medium text-emergency">
                  <span className="size-1.5 rounded-full bg-emergency" />
                  {t("common.rejected")}
                </dt>
                <dd className="mt-1.5 text-2xl font-bold tabular-nums text-emergency">
                  {changesCount}
                </dd>
              </div>
            </dl>
          </section>

          {/* Filter Bar */}
          <div className="rounded-lg border border-border/80 bg-surface p-4 shadow-2xs space-y-3 sm:space-y-0 sm:flex sm:items-center sm:justify-between sm:gap-4">
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
                className="w-full rounded-md border border-border bg-surface ps-9 pe-3 py-2 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-medium text-muted-foreground">
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
                  className={`px-2.5 py-1 text-xs font-medium transition-colors ${
                    statusFilter === val
                      ? "rounded-md bg-muted text-foreground"
                      : "text-muted-foreground hover:text-foreground"
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
              className="overflow-x-auto rounded-lg border border-border/80 bg-surface shadow-2xs"
            >
              <table className="clinical-table min-w-[56rem] border-collapse">
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
                        <div className="min-w-0">
                          <span className="block truncate font-semibold">
                            {doc.name}
                          </span>
                          <span className="text-[11px] text-muted-foreground font-mono">
                            {formatFileSize(doc.sizeBytes)} • {formatMimeType(doc.mimeType)}
                          </span>
                        </div>
                      </td>

                      <td className="px-4 py-3">
                        <Link
                          to={`/hospital/requests/${doc.requestId}`}
                          className="font-mono font-semibold text-primary hover:underline"
                          title={doc.requestId}
                        >
                          <bdi dir="ltr">{formatShortId(doc.requestId)}</bdi>
                        </Link>
                      </td>

                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <BloodGroupBadge group={doc.bloodGroup} />
                          <span className="text-muted-foreground truncate">
                            {t(
                              `healthcare.${doc.component}`,
                              bloodComponentLabels[doc.component],
                            )}
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
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="size-8"
                            onClick={() => setPreviewDoc(doc)}
                            title={t("common.view")}
                            aria-label={`${t("common.view")} ${doc.name}`}
                          >
                            <Eye aria-hidden="true" />
                          </Button>
                          <Button
                            asChild
                            variant="ghost"
                            size="icon"
                            className="size-8"
                          >
                            <Link
                              to={`/hospital/requests/${doc.requestId}`}
                              title={t("hospital.openRequisition")}
                              aria-label={`${t("hospital.openRequisition")} ${doc.requestId}`}
                            >
                              <ExternalLink aria-hidden="true" />
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
      <Dialog
        open={uploadDialogOpen}
        onOpenChange={(open) => {
          setUploadDialogOpen(open);
          if (!open) {
            setUploadError(null);
            setSelectedFile(null);
            setDocumentName("");
            setSelectedRequestId("");
            setRequestSearch("");
          }
        }}
      >
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-base font-bold">
              <Upload className="size-4 text-primary" aria-hidden="true" />
              {t("hospital.attachClinicalDocument")}
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              {t("hospital.attachClinicalDocumentDescription")}
            </DialogDescription>
          </DialogHeader>

          <form
            onSubmit={handleUploadSubmit}
            className="space-y-4 py-2 text-xs"
          >
            {uploadError ? (
              <div
                className="flex items-center gap-2 rounded-md border border-destructive/30 bg-emergency-subtle p-3 text-xs text-emergency"
                role="alert"
              >
                <AlertCircle className="size-4 shrink-0" aria-hidden="true" />
                <span>{uploadError}</span>
              </div>
            ) : null}

            {/* Step 1: Target Requisition Selection */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="font-semibold text-foreground text-xs">
                  {t("hospital.selectTargetRequisition")}
                </label>
                {selectedRequest && (
                  <button
                    type="button"
                    onClick={() => setSelectedRequestId("")}
                    className="text-[11px] text-primary hover:underline font-medium"
                  >
                    {t("common.change", "Change")}
                  </button>
                )}
              </div>

              {selectedRequest ? (
                <div className="flex items-center justify-between rounded-lg border border-primary/40 bg-primary/5 p-3 text-xs">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="size-7 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0">
                      <CheckCircle2 className="size-4" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-foreground">
                          {formatShortId(selectedRequest.id)}
                        </span>
                        <BloodGroupBadge
                          group={selectedRequest.bloodGroup}
                          size="compact"
                        />
                        <span className="text-muted-foreground text-[11px]">
                          {selectedRequest.quantity} {t("common.units")}
                        </span>
                      </div>
                      <p className="text-[11px] text-muted-foreground truncate mt-0.5">
                        {selectedRequest.targetBloodBank?.name}
                      </p>
                    </div>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-7 text-xs px-2 text-muted-foreground hover:text-foreground"
                    onClick={() => setSelectedRequestId("")}
                  >
                    <X className="size-3.5" />
                  </Button>
                </div>
              ) : (
                <div className="rounded-lg border border-border bg-surface p-2.5 space-y-2">
                  <div className="relative">
                    <Search className="absolute start-2.5 top-2 size-3.5 text-muted-foreground" />
                    <input
                      type="text"
                      value={requestSearch}
                      onChange={(e) => setRequestSearch(e.target.value)}
                      placeholder={t(
                        "hospital.searchRequisitionsPlaceholder",
                        "Search active requisitions by ID, blood group, or blood bank...",
                      )}
                      className="w-full rounded border border-border bg-surface-subtle ps-8 pe-3 py-1.5 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                  </div>

                  <div className="max-h-36 overflow-y-auto space-y-1 pe-1 divide-y divide-border/40">
                    {filteredActiveRequests.length === 0 ? (
                      <p className="text-center py-4 text-xs text-muted-foreground">
                        {t(
                          "hospital.noActiveRequestsFound",
                          "No matching active blood requisitions found.",
                        )}
                      </p>
                    ) : (
                      filteredActiveRequests.map((r) => (
                        <button
                          key={r.id}
                          type="button"
                          onClick={() => {
                            setSelectedRequestId(r.id);
                            setUploadError(null);
                          }}
                          className="w-full flex items-center justify-between p-2 rounded text-start hover:bg-muted/50 transition-colors group"
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <span className="font-mono text-xs font-semibold text-foreground group-hover:text-primary transition-colors">
                              {formatShortId(r.id)}
                            </span>
                            <BloodGroupBadge
                              group={r.bloodGroup}
                              size="compact"
                            />
                            <span className="text-[11px] text-muted-foreground">
                              {r.quantity} {t("common.units")}
                            </span>
                            <span className="text-[11px] text-muted-foreground truncate max-w-[140px]">
                              • {r.targetBloodBank?.name}
                            </span>
                          </div>
                          <span className="text-[10px] text-primary font-medium shrink-0 px-1.5 py-0.5 rounded bg-primary/10 opacity-0 group-hover:opacity-100 transition-opacity">
                            {t("common.select", "Select")}
                          </span>
                        </button>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Step 2: File Upload (Drag & Drop or Browse) */}
            <div className="space-y-1.5">
              <label className="font-semibold text-foreground text-xs">
                {t("hospital.attachedFile", "Clinical Document File")}
              </label>

              <input
                ref={fileInputRef}
                type="file"
                className="sr-only"
                accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png"
                onChange={(e) => handleFileChange(e.target.files?.[0])}
              />

              {!selectedFile ? (
                <div
                  role="button"
                  tabIndex={0}
                  onClick={() => fileInputRef.current?.click()}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => {
                    e.preventDefault();
                    handleFileChange(e.dataTransfer.files?.[0]);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      fileInputRef.current?.click();
                    }
                  }}
                  className="flex flex-col items-center justify-center border-2 border-dashed border-border hover:border-primary/60 bg-surface-subtle/60 hover:bg-primary/[0.02] p-5 rounded-lg cursor-pointer transition-colors text-center"
                >
                  <div className="size-9 rounded-full bg-primary/10 text-primary flex items-center justify-center mb-2">
                    <UploadCloud className="size-5" />
                  </div>
                  <p className="font-semibold text-xs text-foreground">
                    {t(
                      "hospital.dropFileHere",
                      "Click to browse or drag & drop clinical document",
                    )}
                  </p>
                  <p className="text-[11px] text-muted-foreground mt-0.5">
                    {t(
                      "hospital.permittedFormats",
                      "Permitted formats: PDF, JPEG, PNG (maximum 10 MB)",
                    )}
                  </p>
                </div>
              ) : (
                <div className="flex items-center justify-between rounded-lg border border-border bg-surface p-3 text-xs">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="size-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
                      <FileText className="size-4" />
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold text-xs text-foreground truncate">
                        {selectedFile.name}
                      </p>
                      <p className="text-[11px] text-muted-foreground">
                        {formatFileSize(selectedFile.size)} •{" "}
                        {formatMimeType(
                          selectedFile.type || "application/pdf",
                        )}
                      </p>
                    </div>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-7 text-xs px-2 text-muted-foreground hover:text-destructive"
                    onClick={() => {
                      setSelectedFile(null);
                      if (fileInputRef.current) fileInputRef.current.value = "";
                    }}
                  >
                    <X className="size-3.5" />
                  </Button>
                </div>
              )}
            </div>

            {/* Optional Document Title */}
            <div>
              <label
                htmlFor="upload-doc-name"
                className="font-medium text-muted-foreground text-xs"
              >
                {t(
                  "hospital.documentTitleFileName",
                  "Document display name (optional)",
                )}
              </label>
              <input
                id="upload-doc-name"
                type="text"
                value={documentName}
                onChange={(e) => setDocumentName(e.target.value)}
                placeholder={
                  selectedFile?.name ||
                  t(
                    "hospital.documentNamePlaceholder",
                    "e.g., crossmatch-compatibility-report.pdf",
                  )
                }
                className="mt-1 w-full rounded border border-border bg-surface px-3 py-1.5 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>

            {/* Clinical Privacy Note */}
            <div className="rounded border border-border bg-surface-subtle p-2.5 text-[11px] text-muted-foreground leading-relaxed">
              <span className="font-semibold text-foreground">
                {t("hospital.clinicalPrivacyNote", "Clinical privacy note")}:
              </span>{" "}
              {t(
                "hospital.clinicalPrivacyDescription",
                "Attachments must not contain patient national identifiers or unredacted electronic health records.",
              )}
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
              <Button
                type="submit"
                disabled={
                  uploadMutation.isPending ||
                  !selectedRequestId ||
                  (!selectedFile && !documentName)
                }
              >
                {uploadMutation.isPending
                  ? t("hospital.uploading")
                  : t("hospital.uploadAndAttach")}
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
                  <FileText
                    className="size-4 text-primary"
                    aria-hidden="true"
                  />
                  {previewDoc.name}
                </DialogTitle>
                <DialogDescription className="text-xs text-muted-foreground">
                  {t("hospital.attachmentAuditDescription")}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-3 py-2 text-xs">
                <div className="flex items-center justify-between border-b border-border pb-2">
                  <span className="text-muted-foreground">
                    {t("hospital.verificationStatus")}
                  </span>
                  <ReviewStatusBadge status={previewDoc.reviewStatus} />
                </div>

                <div className="flex items-center justify-between border-b border-border pb-2">
                  <span className="text-muted-foreground">
                    {t("hospital.associatedRequisition")}
                  </span>
                  <Link
                    to={`/hospital/requests/${previewDoc.requestId}`}
                    className="font-mono font-semibold text-primary hover:underline inline-flex items-center gap-1"
                  >
                    {previewDoc.requestId}
                    <ExternalLink className="size-3" aria-hidden="true" />
                  </Link>
                </div>

                <div className="flex items-center justify-between border-b border-border pb-2">
                  <span className="text-muted-foreground">
                    {t("hospital.bloodBankAuthority")}
                  </span>
                  <span className="font-medium text-foreground">
                    {previewDoc.targetBloodBankName}
                  </span>
                </div>

                <div className="flex items-center justify-between border-b border-border pb-2">
                  <span className="text-muted-foreground">
                    {t("hospital.fileSize")}
                  </span>
                  <span className="font-mono font-medium text-foreground">
                    {formatFileSize(previewDoc.sizeBytes)}
                  </span>
                </div>

                <div className="flex items-center justify-between border-b border-border pb-2">
                  <span className="text-muted-foreground">
                    {t("hospital.mimeFormat")}
                  </span>
                  <span className="font-mono font-medium text-foreground">
                    {formatMimeType(previewDoc.mimeType)}
                  </span>
                </div>

                <div className="flex items-center justify-between border-b border-border pb-2">
                  <span className="text-muted-foreground">
                    {t("hospital.uploadedAtLabel")}
                  </span>
                  <span className="tabular-nums text-foreground">
                    {formatDateTime(previewDoc.uploadedAt)}
                  </span>
                </div>

                <div className="rounded border border-border bg-surface-subtle p-3 text-[11px] text-muted-foreground">
                  <span className="font-semibold text-foreground">
                    {t("hospital.complianceSeal")}:
                  </span>{" "}
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
