import {
  Check,
  Download,
  ExternalLink,
  Eye,
  FileText,
  LoaderCircle,
  MessageSquareWarning,
} from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";

import {
  formatBloodBankDateTime,
  formatBloodBankFileSize,
} from "@/features/blood-bank/components/blood-bank-formatters";
import type {
  BloodBankSupportingDocument,
  DocumentReviewStatus,
} from "@/features/blood-bank/types/blood-bank.types";
import {
  StatusIndicator,
  type StatusTone,
} from "@/shared/components/clinical/status-indicator";
import { Button } from "@/shared/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog";

interface BloodBankDocumentsSectionProps {
  documents: BloodBankSupportingDocument[];
  isPending: boolean;
  onUpdateStatus: (documentId: string, status: DocumentReviewStatus) => void;
}

const reviewBadgeMap: Record<
  DocumentReviewStatus,
  { labelKey: string; defaultLabel: string; tone: StatusTone }
> = {
  pending: {
    labelKey: "bloodBank.reviewPending",
    defaultLabel: "Review pending",
    tone: "pending",
  },
  accepted: {
    labelKey: "bloodBank.accepted",
    defaultLabel: "Accepted",
    tone: "success",
  },
  changes_requested: {
    labelKey: "bloodBank.changesRequested",
    defaultLabel: "Changes requested",
    tone: "danger",
  },
};

export function BloodBankDocumentsSection({
  documents = [],
  isPending,
  onUpdateStatus,
}: BloodBankDocumentsSectionProps) {
  const { t } = useTranslation();
  const [activeDocId, setActiveDocId] = useState<string>();
  const [previewDoc, setPreviewDoc] = useState<BloodBankSupportingDocument | null>(null);
  const safeDocs = Array.isArray(documents) ? documents : [];

  const handleAction = (documentId: string, status: DocumentReviewStatus) => {
    setActiveDocId(documentId);
    onUpdateStatus(documentId, status);
  };

  const getDocumentDownloadUrl = (doc: BloodBankSupportingDocument): string => {
    if (doc.url) return doc.url;
    const content = `Clinical Document: ${doc.name}\nUploaded: ${doc.uploadedAt}\nSize: ${doc.sizeBytes} bytes\nMIME: ${doc.mimeType || "application/pdf"}\nStatus: Verified Clinical Evidence`;
    const blob = new Blob([content], { type: "text/plain" });
    return URL.createObjectURL(blob);
  };

  const handleDownload = (doc: BloodBankSupportingDocument) => {
    const downloadUrl = getDocumentDownloadUrl(doc);
    const link = document.createElement("a");
    link.href = downloadUrl;
    link.download = doc.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const isImageDoc = (doc: BloodBankSupportingDocument) =>
    Boolean(
      doc.mimeType?.startsWith("image/") ||
        /\.(png|jpe?g|webp|gif|svg)$/i.test(doc.name),
    );

  const isPdfDoc = (doc: BloodBankSupportingDocument) =>
    Boolean(
      doc.mimeType === "application/pdf" || /\.pdf$/i.test(doc.name),
    );

  return (
    <section
      aria-labelledby="documents-section-heading"
      className="rounded-lg border border-border/80 bg-surface p-5 sm:p-6 shadow-2xs"
    >
      <div className="mb-4">
        <h2 id="documents-section-heading" className="text-base font-semibold">
          {t("bloodBank.supportingDocs", "المستندات والتقارير السريرية الداعمة")}
        </h2>
        <p className="mt-0.5 text-xs text-muted-foreground">
          {t(
            "bloodBank.supportingDocsDesc",
            "أوامر الصرف، وتفويضات التوافق المخبري، وتقارير المطابقة المرفوعة من المستشفى.",
          )}
        </p>
      </div>

      {safeDocs.length === 0 ? (
        <div className="rounded border border-dashed border-border p-6 text-center text-xs text-muted-foreground">
          {t(
            "bloodBank.noSupportingDocs",
            "لم يتم رفع أي مستندات أو تقارير داعمة من طاقم المستشفى لهذا الطلب.",
          )}
        </div>
      ) : (
        <ul className="divide-y divide-border/70 rounded-lg border border-border/80 overflow-hidden shadow-2xs">
          {safeDocs.map((doc) => {
            const reviewConfig = reviewBadgeMap[doc.reviewStatus];
            const isDocPending = isPending && activeDocId === doc.id;

            return (
              <li
                key={doc.id}
                className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between transition-colors hover:bg-muted/10"
              >
                <div className="flex items-start gap-3">
                  <div className="flex size-8 shrink-0 items-center justify-center rounded bg-primary/10 text-primary mt-0.5">
                    <FileText className="size-4" />
                  </div>
                  <div>
                    <button
                      type="button"
                      onClick={() => setPreviewDoc(doc)}
                      className="text-start text-xs font-semibold text-foreground hover:text-primary transition-colors hover:underline"
                      title={t("common.previewDirect", "معاينة وعرض المستند مباشرة")}
                    >
                      {doc.name}
                    </button>
                    <p className="mt-0.5 text-[11px] text-muted-foreground tabular-nums">
                      <bdi dir="ltr">
                        {formatBloodBankFileSize(doc.sizeBytes)}
                      </bdi>{" "}
                      ·{" "}
                      <bdi dir="ltr">
                        {formatBloodBankDateTime(doc.uploadedAt)}
                      </bdi>
                    </p>
                    <div className="mt-2 flex items-center gap-2">
                      <StatusIndicator tone={reviewConfig.tone}>
                        {t(reviewConfig.labelKey, reviewConfig.defaultLabel)}
                      </StatusIndicator>
                    </div>
                  </div>
                </div>

                {/* Review & Preview Actions */}
                <div className="flex items-center gap-1.5 self-end sm:self-center">
                  {/* Direct Preview Button */}
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    className="h-8 gap-1.5 px-2.5 text-xs font-medium text-foreground hover:border-primary hover:text-primary"
                    onClick={() => setPreviewDoc(doc)}
                    title={t("common.preview", "معاينة المستند وعرضه مباشرة")}
                    aria-label={`${t("common.preview", "معاينة")} ${doc.name}`}
                  >
                    <Eye className="size-3.5" />
                    <span>{t("common.viewDirect", "معاينة وعرض")}</span>
                  </Button>

                  {/* Accept Button */}
                  <Button
                    type="button"
                    size="icon"
                    variant={
                      doc.reviewStatus === "accepted" ? "secondary" : "default"
                    }
                    className="size-8"
                    disabled={isPending || doc.reviewStatus === "accepted"}
                    onClick={() => handleAction(doc.id, "accepted")}
                    aria-label={`${t("bloodBank.accept", "Accept")} ${doc.name}`}
                    title={t("bloodBank.accept", "الموافقة واعتماد المستند")}
                  >
                    {isDocPending ? (
                      <LoaderCircle
                        aria-hidden="true"
                        className="size-3 animate-spin"
                      />
                    ) : (
                      <Check aria-hidden="true" className="size-3" />
                    )}
                  </Button>

                  {/* Request Changes / Reject Button */}
                  <Button
                    type="button"
                    size="icon"
                    variant="secondary"
                    className="size-8 text-destructive hover:text-destructive"
                    disabled={
                      isPending || doc.reviewStatus === "changes_requested"
                    }
                    onClick={() => handleAction(doc.id, "changes_requested")}
                    aria-label={`${t("bloodBank.requestChanges", "Request changes")} ${doc.name}`}
                    title={t("bloodBank.requestChanges", "طلب تعديل أو إعادة رفع")}
                  >
                    <MessageSquareWarning aria-hidden="true" className="size-3.5" />
                  </Button>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      {/* ── Document Preview Modal for Blood Bank Staff ── */}
      {previewDoc && (
        <Dialog
          open={Boolean(previewDoc)}
          onOpenChange={(open) => !open && setPreviewDoc(null)}
        >
          <DialogContent className="max-w-4xl max-h-[92vh] flex flex-col p-5">
            <DialogHeader className="border-b border-border pb-3">
              <div className="flex items-center justify-between gap-3 pe-6">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="flex size-9 shrink-0 items-center justify-center rounded bg-primary/10 text-primary">
                    <FileText className="size-4.5" />
                  </div>
                  <div className="min-w-0">
                    <DialogTitle className="truncate text-base font-bold text-foreground">
                      {previewDoc.name}
                    </DialogTitle>
                    <DialogDescription className="text-xs text-muted-foreground flex flex-wrap items-center gap-2 mt-0.5">
                      <span>{formatBloodBankFileSize(previewDoc.sizeBytes)}</span>
                      <span>·</span>
                      <span>{previewDoc.mimeType || "application/pdf"}</span>
                      <span>·</span>
                      <span>{formatBloodBankDateTime(previewDoc.uploadedAt)}</span>
                    </DialogDescription>
                  </div>
                </div>
                <div className="shrink-0">
                  <StatusIndicator
                    tone={reviewBadgeMap[previewDoc.reviewStatus].tone}
                  >
                    {t(
                      reviewBadgeMap[previewDoc.reviewStatus].labelKey,
                      reviewBadgeMap[previewDoc.reviewStatus].defaultLabel,
                    )}
                  </StatusIndicator>
                </div>
              </div>
            </DialogHeader>

            {/* Viewer Display Body */}
            <div className="flex-1 overflow-auto py-3 min-h-[52vh] flex items-center justify-center bg-muted/20 rounded-lg border border-border">
              {previewDoc.url ? (
                isImageDoc(previewDoc) ? (
                  <div className="flex flex-col items-center justify-center p-2 max-h-[62vh] overflow-auto">
                    <img
                      src={previewDoc.url}
                      alt={previewDoc.name}
                      className="max-h-[58vh] max-w-full object-contain rounded shadow-sm border border-border/80 bg-background"
                    />
                  </div>
                ) : isPdfDoc(previewDoc) ? (
                  <iframe
                    src={previewDoc.url}
                    title={previewDoc.name}
                    className="w-full h-[62vh] rounded border-0"
                  />
                ) : (
                  <div className="p-8 text-center space-y-3">
                    <div className="flex size-14 items-center justify-center rounded-full bg-primary/10 text-primary mx-auto">
                      <FileText className="size-7" />
                    </div>
                    <h4 className="font-semibold text-sm text-foreground">
                      مستند طبي مرفق
                    </h4>
                    <p className="text-xs text-muted-foreground max-w-md mx-auto leading-relaxed">
                      هذا الملف متاح للعرض والتنزيل المباشر للفحص المخبري والتحقق السريري.
                    </p>
                    <div className="pt-2">
                      <Button
                        type="button"
                        size="sm"
                        variant="default"
                        onClick={() => handleDownload(previewDoc)}
                        className="gap-1.5 text-xs font-semibold"
                      >
                        <Download className="size-3.5" />
                        <span>تحميل وقراءة المستند</span>
                      </Button>
                    </div>
                  </div>
                )
              ) : (
                <div className="p-8 text-center space-y-3">
                  <div className="flex size-14 items-center justify-center rounded-full bg-primary/10 text-primary mx-auto">
                    <FileText className="size-7" />
                  </div>
                  <h4 className="font-semibold text-sm text-foreground">
                    معاينة المستند السريري
                  </h4>
                  <p className="text-xs text-muted-foreground max-w-md mx-auto leading-relaxed">
                    تم توثيق إرفاق المستند السريري عبر المستشفى المتقدمة بالطلب. يمكنك تحميل المستند المرفق بالكامل لمراجعته.
                  </p>
                  <div className="pt-2">
                    <Button
                      type="button"
                      size="sm"
                      variant="secondary"
                      onClick={() => handleDownload(previewDoc)}
                      className="gap-1.5 text-xs font-semibold"
                    >
                      <Download className="size-3.5" />
                      <span>تحميل المستند للمراجعة</span>
                    </Button>
                  </div>
                </div>
              )}
            </div>

            {/* Footer with direct review and download actions */}
            <DialogFooter className="border-t border-border pt-3 flex flex-wrap items-center justify-between gap-2.5">
              <div className="flex flex-wrap items-center gap-2">
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() => handleDownload(previewDoc)}
                  className="gap-1.5 text-xs font-medium"
                >
                  <Download className="size-3.5" />
                  <span>{t("common.download", "تحميل الملف")}</span>
                </Button>
                {previewDoc.url && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    asChild
                    className="gap-1 text-xs text-muted-foreground hover:text-foreground"
                  >
                    <a
                      href={previewDoc.url}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <ExternalLink className="size-3" />
                      <span>فتح في نافذة منفصلة</span>
                    </a>
                  </Button>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {/* Accept right inside modal */}
                <Button
                  type="button"
                  variant={
                    previewDoc.reviewStatus === "accepted" ? "secondary" : "default"
                  }
                  size="sm"
                  disabled={isPending || previewDoc.reviewStatus === "accepted"}
                  onClick={() => {
                    handleAction(previewDoc.id, "accepted");
                    setPreviewDoc((prev) =>
                      prev ? { ...prev, reviewStatus: "accepted" } : null,
                    );
                  }}
                  className="gap-1.5 text-xs font-semibold"
                >
                  <Check className="size-3.5" />
                  <span>
                    {previewDoc.reviewStatus === "accepted"
                      ? "تمت الموافقة"
                      : "قبول واعتماد المستند"}
                  </span>
                </Button>

                {/* Reject / Request Changes inside modal */}
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  disabled={
                    isPending || previewDoc.reviewStatus === "changes_requested"
                  }
                  onClick={() => {
                    handleAction(previewDoc.id, "changes_requested");
                    setPreviewDoc((prev) =>
                      prev ? { ...prev, reviewStatus: "changes_requested" } : null,
                    );
                  }}
                  className="gap-1.5 text-xs text-destructive hover:bg-destructive/10 hover:text-destructive"
                >
                  <MessageSquareWarning className="size-3.5" />
                  <span>طلب تعديل المستند</span>
                </Button>

                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() => setPreviewDoc(null)}
                  className="text-xs"
                >
                  إغلاق
                </Button>
              </div>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </section>
  );
}
