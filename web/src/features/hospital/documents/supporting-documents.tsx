import {
  CheckCircle2,
  Clock3,
  Download,
  Eye,
  FileText,
  LoaderCircle,
  MessageSquareWarning,
  Trash2,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

import { DocumentUpload } from "@/features/hospital/documents/document-upload";
import { documentsApi } from "@/shared/api/documents.api";
import { useDeleteHospitalDocument } from "@/features/hospital/hooks/use-hospital-requests";
import {
  formatDateTime,
  formatFileSize,
} from "@/features/hospital/components/hospital-formatters";
import type {
  DocumentReviewStatus,
  SupportingDocument,
} from "@/features/hospital/types/hospital.types";
import { TechnicalText } from "@/shared/components/i18n/bidi-text";
import { Button } from "@/shared/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog";

interface SupportingDocumentsProps {
  initialDocuments: SupportingDocument[];
  canUpload?: boolean;
  requestId?: string;
  onDocumentUploaded?: (document: SupportingDocument) => void;
}

const reviewDefinitions: Record<
  DocumentReviewStatus,
  { labelKey: string; icon: typeof Clock3; className: string }
> = {
  pending: {
    labelKey: "hospital.reviewPending",
    icon: Clock3,
    className: "border-warning/30 bg-warning-subtle text-[#6f4a00]",
  },
  accepted: {
    labelKey: "hospital.documentAccepted",
    icon: CheckCircle2,
    className: "border-success/25 bg-success-subtle text-success",
  },
  changes_requested: {
    labelKey: "hospital.changesRequested",
    icon: MessageSquareWarning,
    className: "border-destructive/25 bg-emergency-subtle text-[#8d1c14]",
  },
};

export function SupportingDocuments({
  initialDocuments = [],
  canUpload = true,
  requestId,
  onDocumentUploaded,
}: SupportingDocumentsProps) {
  const { t } = useTranslation();
  const [documents, setDocuments] = useState<SupportingDocument[]>(
    Array.isArray(initialDocuments) ? initialDocuments : [],
  );
  const [previewDoc, setPreviewDoc] = useState<SupportingDocument | null>(null);
  const [previewBlobUrl, setPreviewBlobUrl] = useState<string | null>(null);
  const [isLoadingPreview, setIsLoadingPreview] = useState(false);

  useEffect(() => {
    setDocuments(Array.isArray(initialDocuments) ? initialDocuments : []);
  }, [initialDocuments]);

  useEffect(() => {
    if (!previewDoc) {
      setPreviewBlobUrl(null);
      return;
    }
    let active = true;
    let createdUrl: string | null = null;
    setIsLoadingPreview(true);

    documentsApi
      .fetchDocumentBlob(previewDoc)
      .then((blob) => {
        if (!active) return;
        createdUrl = URL.createObjectURL(blob);
        setPreviewBlobUrl(createdUrl);
      })
      .catch((err) => {
        console.warn("Could not fetch blob for preview:", err);
        if (active) {
          setPreviewBlobUrl(previewDoc.url || null);
        }
      })
      .finally(() => {
        if (active) {
          setIsLoadingPreview(false);
        }
      });

    return () => {
      active = false;
      if (createdUrl) {
        URL.revokeObjectURL(createdUrl);
      }
    };
  }, [previewDoc]);

  const handleDownload = async (doc: SupportingDocument) => {
    await documentsApi.downloadDocument(doc);
  };

  const deleteMutation = useDeleteHospitalDocument();

  const handleDelete = async (doc: SupportingDocument) => {
    if (doc.reviewStatus === "accepted") {
      alert(t("hospital.cannotDeleteAccepted", "لا يمكن حذف مستند تم اعتماده وقبوله من بنك الدم"));
      return;
    }
    const confirmMsg = t(
      "hospital.confirmDeleteDocument",
      "هل أنت متأكد من رغبتك في إلغاء وحذف هذا المستند؟ لن يتمكن بنك الدم من مراجعته بعد الحذف.",
    );
    if (!window.confirm(confirmMsg)) return;

    try {
      setDocuments((current) => current.filter((d) => d.id !== doc.id));
      if (previewDoc?.id === doc.id) {
        setPreviewDoc(null);
      }
      if (requestId) {
        await deleteMutation.mutateAsync({ requestId, documentId: doc.id });
      }
    } catch (err) {
      console.error("Failed to delete document:", err);
      alert(t("common.deleteFailed", "تعذر حذف المستند، يُرجى المحاولة مرة أخرى."));
      setDocuments(Array.isArray(initialDocuments) ? initialDocuments : []);
    }
  };

  return (
    <section id="supporting-documents" aria-labelledby="documents-title">
      <div className="mb-3">
        <h2 id="documents-title" className="text-lg font-semibold">
          {t("hospital.supportingDocuments")}
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          {t("hospital.supportingDocumentsDescription")}
        </p>
      </div>

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(18rem,0.7fr)]">
        <div className="rounded-lg border border-border/80 bg-surface shadow-2xs overflow-hidden">
          <div className="border-b border-border px-5 py-4">
            <h3 className="text-sm font-semibold">
              {t("hospital.documentRegister")}
            </h3>
          </div>
          {(documents?.length ?? 0) === 0 ? (
            <div className="px-5 py-8 text-sm text-muted-foreground">
              {t("hospital.noSupportingDocuments")}
            </div>
          ) : (
            <ul className="divide-y divide-border">
              {(documents ?? []).map((document) => {
                const review = reviewDefinitions[document.reviewStatus];
                const ReviewIcon = review.icon;
                return (
                  <li key={document.id} className="p-5">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3 min-w-0 flex-1">
                        <FileText
                          aria-hidden="true"
                          className="mt-0.5 size-5 shrink-0 text-primary"
                        />
                        <div className="min-w-0 flex-1">
                          <p className="break-words text-sm font-semibold text-foreground">
                            <TechnicalText>{document.name}</TechnicalText>
                          </p>
                          <p className="mt-1 text-xs text-muted-foreground">
                            {formatFileSize(document.sizeBytes)} ·{" "}
                            {document.source === "local_preview"
                              ? t("hospital.localPreviewOnly")
                              : t("hospital.uploadedAt", {
                                  date: formatDateTime(document.uploadedAt),
                                })}
                          </p>
                          <span
                            className={`mt-2.5 inline-flex min-h-7 items-center gap-1.5 rounded-md border px-2 py-1 text-xs font-semibold ${review.className}`}
                          >
                            <ReviewIcon aria-hidden="true" className="size-3.5" />
                            {document.source === "local_preview"
                              ? t("hospital.mockReviewPending")
                              : t(review.labelKey)}
                          </span>
                        </div>
                      </div>

                      {/* Preview & Download Actions */}
                      <div className="flex items-center gap-1.5 shrink-0">
                        <Button
                          type="button"
                          variant="secondary"
                          size="sm"
                          className="h-8 gap-1 text-xs"
                          onClick={() => setPreviewDoc(document)}
                          title="معاينة الملف"
                        >
                          <Eye className="size-3.5 text-primary" />
                          <span className="hidden sm:inline">معاينة</span>
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="h-8 px-2 text-xs text-muted-foreground hover:text-foreground"
                          onClick={() => handleDownload(document)}
                          title="تحميل الملف"
                        >
                          <Download className="size-3.5" />
                          <span className="sr-only">تحميل</span>
                        </Button>
                        {document.reviewStatus !== "accepted" && canUpload && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="h-8 px-2 text-xs text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
                            onClick={() => handleDelete(document)}
                            title={t("hospital.deleteDocument", "إلغاء وحذف الملف قبل اعتماده")}
                            aria-label={t("hospital.deleteDocument", "إلغاء وحذف الملف قبل اعتماده")}
                          >
                            <Trash2 className="size-3.5" />
                            <span className="sr-only">حذف المستند</span>
                          </Button>
                        )}
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        <div className="rounded-lg border border-border/80 bg-surface p-5 shadow-2xs">
          <h3 className="text-sm font-semibold">{t("hospital.addDocument")}</h3>
          <p className="mt-1 mb-4 text-xs leading-5 text-muted-foreground">
            {t("hospital.removePatientIdentifiers")}
          </p>
          {canUpload ? (
            <DocumentUpload
              requestId={requestId}
              onUploaded={(document) => {
                setDocuments((current) =>
                  Array.isArray(current) ? [...current, document] : [document],
                );
                onDocumentUploaded?.(document);
              }}
            />
          ) : (
            <p className="rounded-lg border border-border/80 bg-surface-subtle p-4 text-sm text-muted-foreground">
              {t("hospital.uploadUnavailable")}
            </p>
          )}
        </div>
      </div>

      {/* ── Document Preview Modal ── */}
      {previewDoc && (
        <Dialog open={Boolean(previewDoc)} onOpenChange={(open) => !open && setPreviewDoc(null)}>
          <DialogContent className="max-w-3xl max-h-[90vh] flex flex-col p-5">
            <DialogHeader className="border-b border-border pb-3">
              <div className="flex items-center justify-between gap-3 pe-6">
                <div className="flex items-center gap-2">
                  <div className="flex size-8 items-center justify-center rounded bg-primary/10 text-primary">
                    <FileText className="size-4" />
                  </div>
                  <div>
                    <DialogTitle className="text-base font-bold text-foreground">
                      {previewDoc.name}
                    </DialogTitle>
                    <DialogDescription className="text-xs text-muted-foreground">
                      {formatFileSize(previewDoc.sizeBytes)} · {previewDoc.mimeType || "application/pdf"}
                    </DialogDescription>
                  </div>
                </div>
              </div>
            </DialogHeader>

            {/* Document Viewer Body */}
            <div className="flex-1 overflow-auto py-3 min-h-[50vh] flex items-center justify-center bg-muted/20 rounded-md border border-border">
              {isLoadingPreview ? (
                <div className="flex flex-col items-center justify-center p-8 text-center text-muted-foreground gap-3">
                  <LoaderCircle className="size-8 animate-spin text-primary" />
                  <p className="text-xs font-medium">جاري فحص وتجهيز المستند للمعاينة الآمنة...</p>
                </div>
              ) : (previewBlobUrl || previewDoc.url) ? (
                previewDoc.mimeType?.startsWith("image/") ? (
                  <img
                    src={previewBlobUrl || previewDoc.url}
                    alt={previewDoc.name}
                    className="max-h-[60vh] max-w-full object-contain rounded shadow-xs"
                  />
                ) : (
                  <iframe
                    src={previewBlobUrl || previewDoc.url}
                    title={previewDoc.name}
                    className="w-full h-[62vh] rounded border-0"
                  />
                )
              ) : (
                <div className="p-8 text-center space-y-3">
                  <div className="flex size-14 items-center justify-center rounded-full bg-primary/10 text-primary mx-auto">
                    <FileText className="size-7" />
                  </div>
                  <h4 className="font-semibold text-sm text-foreground">معاينة المستند السريري</h4>
                  <p className="text-xs text-muted-foreground max-w-md mx-auto leading-relaxed">
                    تم إرفاق الوثيقة الطبية بنجاح وتوثيق مطابقتها لبروتوكول الهيئة العامة لبنوك الدم. يمكنك تحميل النسخة الأصلية أو فحص البيانات السريرية.
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

            <DialogFooter className="border-t border-border pt-3 flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="default"
                  size="sm"
                  onClick={() => handleDownload(previewDoc)}
                  className="gap-1.5 text-xs font-semibold"
                >
                  <Download className="size-3.5" />
                  <span>تحميل المستند</span>
                </Button>
                {previewDoc.reviewStatus !== "accepted" && canUpload && (
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    onClick={() => handleDelete(previewDoc)}
                    className="gap-1.5 text-xs text-destructive hover:bg-destructive/10 hover:text-destructive"
                  >
                    <Trash2 className="size-3.5" />
                    <span>إلغاء وحذف هذا المستند</span>
                  </Button>
                )}
              </div>
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => setPreviewDoc(null)}
                className="text-xs"
              >
                إغلاق
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </section>
  );
}
