import {
  CheckCircle2,
  Clock3,
  FileText,
  MessageSquareWarning,
} from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";

import { DocumentUpload } from "@/features/hospital/documents/document-upload";
import {
  formatDateTime,
  formatFileSize,
} from "@/features/hospital/components/hospital-formatters";
import type {
  DocumentReviewStatus,
  SupportingDocument,
} from "@/features/hospital/types/hospital.types";
import { TechnicalText } from "@/shared/components/i18n/bidi-text";

interface SupportingDocumentsProps {
  initialDocuments: SupportingDocument[];
  canUpload?: boolean;
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
  initialDocuments,
  canUpload = true,
}: SupportingDocumentsProps) {
  const { t } = useTranslation();
  const [documents, setDocuments] = useState(initialDocuments);

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
        <div className="border border-border bg-surface">
          <div className="border-b border-border px-5 py-4">
            <h3 className="text-sm font-semibold">{t("hospital.documentRegister")}</h3>
          </div>
          {documents.length === 0 ? (
            <div className="px-5 py-8 text-sm text-muted-foreground">
              {t("hospital.noSupportingDocuments")}
            </div>
          ) : (
            <ul className="divide-y divide-border">
              {documents.map((document) => {
                const review = reviewDefinitions[document.reviewStatus];
                const ReviewIcon = review.icon;
                return (
                  <li key={document.id} className="p-5">
                    <div className="flex items-start gap-3">
                      <FileText
                        aria-hidden="true"
                        className="mt-0.5 size-5 shrink-0 text-primary"
                      />
                      <div className="min-w-0 flex-1">
                        <p className="break-words text-sm font-semibold">
                          <TechnicalText>{document.name}</TechnicalText>
                        </p>
                        <p className="mt-1 text-xs text-muted-foreground">
                          {formatFileSize(document.sizeBytes)} ·{" "}
                          {document.source === "local_preview"
                            ? t("hospital.localPreviewOnly")
                            : t("hospital.uploadedAt", { date: formatDateTime(document.uploadedAt) })}
                        </p>
                        <span
                          className={`mt-3 inline-flex min-h-7 items-center gap-1.5 rounded-md border px-2 py-1 text-xs font-semibold ${review.className}`}
                        >
                          <ReviewIcon aria-hidden="true" className="size-3.5" />
                          {document.source === "local_preview"
                            ? t("hospital.mockReviewPending")
                            : t(review.labelKey)}
                        </span>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        <div className="border border-border bg-surface p-5">
          <h3 className="text-sm font-semibold">{t("hospital.addDocument")}</h3>
          <p className="mt-1 mb-4 text-xs leading-5 text-muted-foreground">
            {t("hospital.removePatientIdentifiers")}
          </p>
          {canUpload ? (
            <DocumentUpload
              onUploaded={(document) =>
                setDocuments((current) => [...current, document])
              }
            />
          ) : (
            <p className="border-y border-border py-5 text-sm text-muted-foreground">
              {t("hospital.uploadUnavailable")}
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
