import {
  Check,
  CheckCircle2,
  Clock3,
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
import { Button } from "@/shared/components/ui/button";

interface BloodBankDocumentsSectionProps {
  documents: BloodBankSupportingDocument[];
  isPending: boolean;
  onUpdateStatus: (documentId: string, status: DocumentReviewStatus) => void;
}

const reviewBadgeMap: Record<
  DocumentReviewStatus,
  { labelKey: string; defaultLabel: string; icon: typeof Clock3; className: string }
> = {
  pending: {
    labelKey: "bloodBank.reviewPending",
    defaultLabel: "Review pending",
    icon: Clock3,
    className: "border-warning/30 bg-warning-subtle text-[#6f4a00]",
  },
  accepted: {
    labelKey: "bloodBank.accepted",
    defaultLabel: "Accepted",
    icon: CheckCircle2,
    className: "border-success/25 bg-success-subtle text-success",
  },
  changes_requested: {
    labelKey: "bloodBank.changesRequested",
    defaultLabel: "Changes requested",
    icon: MessageSquareWarning,
    className: "border-destructive/25 bg-emergency-subtle text-[#8d1c14]",
  },
};

export function BloodBankDocumentsSection({
  documents,
  isPending,
  onUpdateStatus,
}: BloodBankDocumentsSectionProps) {
  const { t } = useTranslation();
  const [activeDocId, setActiveDocId] = useState<string>();

  const handleAction = (documentId: string, status: DocumentReviewStatus) => {
    setActiveDocId(documentId);
    onUpdateStatus(documentId, status);
  };

  return (
    <section
      aria-labelledby="documents-section-heading"
      className="border border-border bg-surface p-5"
    >
      <div className="mb-4">
        <h2 id="documents-section-heading" className="text-base font-semibold">
          {t("bloodBank.supportingDocs", "Supporting clinical documentation")}
        </h2>
        <p className="mt-0.5 text-xs text-muted-foreground">
          {t("bloodBank.supportingDocsDesc", "Requisition orders, cross-match release authorizations, and compatibility reports.")}
        </p>
      </div>

      {documents.length === 0 ? (
        <div className="rounded border border-dashed border-border p-6 text-center text-xs text-muted-foreground">
          {t("bloodBank.noSupportingDocs", "No supporting documentation uploaded by hospital staff for this requisition.")}
        </div>
      ) : (
        <ul className="divide-y divide-border border border-border">
          {documents.map((doc) => {
            const reviewConfig = reviewBadgeMap[doc.reviewStatus];
            const ReviewIcon = reviewConfig.icon;
            const isDocPending = isPending && activeDocId === doc.id;

            return (
              <li
                key={doc.id}
                className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="flex items-start gap-3">
                  <div className="rounded border border-border bg-surface-subtle p-2">
                    <FileText aria-hidden="true" className="size-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-foreground">
                      {doc.name}
                    </p>
                    <p className="mt-0.5 text-[11px] text-muted-foreground tabular-nums">
                      <bdi dir="ltr">{formatBloodBankFileSize(doc.sizeBytes)}</bdi> ·{" "}
                      <bdi dir="ltr">{formatBloodBankDateTime(doc.uploadedAt)}</bdi>
                    </p>
                    <div className="mt-2">
                      <span
                        className={`inline-flex items-center gap-1 rounded border px-2 py-0.5 text-[11px] font-semibold ${reviewConfig.className}`}
                      >
                        <ReviewIcon aria-hidden="true" className="size-3" />
                        {t(reviewConfig.labelKey, reviewConfig.defaultLabel)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Review Actions */}
                <div className="flex items-center gap-1.5 self-end sm:self-center">
                  <Button
                    type="button"
                    size="sm"
                    variant={doc.reviewStatus === "accepted" ? "secondary" : "default"}
                    className="h-7 px-2.5 text-xs"
                    disabled={isPending || doc.reviewStatus === "accepted"}
                    onClick={() => handleAction(doc.id, "accepted")}
                    aria-label={`${t("bloodBank.accept", "Accept")} ${doc.name}`}
                  >
                    {isDocPending ? (
                      <LoaderCircle aria-hidden="true" className="size-3 animate-spin" />
                    ) : (
                      <Check aria-hidden="true" className="size-3" />
                    )}
                    {t("bloodBank.accept", "Accept")}
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="secondary"
                    className="h-7 px-2.5 text-xs text-destructive hover:text-destructive"
                    disabled={isPending || doc.reviewStatus === "changes_requested"}
                    onClick={() => handleAction(doc.id, "changes_requested")}
                    aria-label={`${t("bloodBank.requestChanges", "Request changes")} ${doc.name}`}
                  >
                    <MessageSquareWarning aria-hidden="true" className="size-3" />
                    {t("bloodBank.requestChanges", "Request changes")}
                  </Button>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
