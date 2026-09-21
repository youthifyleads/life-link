import { Check, LoaderCircle, MessageSquareWarning } from "lucide-react";
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
      className="rounded-lg border border-border/80 bg-surface p-5 sm:p-6 shadow-2xs"
    >
      <div className="mb-4">
        <h2 id="documents-section-heading" className="text-base font-semibold">
          {t("bloodBank.supportingDocs", "Supporting clinical documentation")}
        </h2>
        <p className="mt-0.5 text-xs text-muted-foreground">
          {t(
            "bloodBank.supportingDocsDesc",
            "Requisition orders, cross-match release authorizations, and compatibility reports.",
          )}
        </p>
      </div>

      {documents.length === 0 ? (
        <div className="rounded border border-dashed border-border p-6 text-center text-xs text-muted-foreground">
          {t(
            "bloodBank.noSupportingDocs",
            "No supporting documentation uploaded by hospital staff for this requisition.",
          )}
        </div>
      ) : (
        <ul className="divide-y divide-border/70 rounded-lg border border-border/80 overflow-hidden shadow-2xs">
          {documents.map((doc) => {
            const reviewConfig = reviewBadgeMap[doc.reviewStatus];
            const isDocPending = isPending && activeDocId === doc.id;

            return (
              <li
                key={doc.id}
                className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="flex items-start gap-3">
                  <div>
                    <p className="text-xs font-semibold text-foreground">
                      {doc.name}
                    </p>
                    <p className="mt-0.5 text-[11px] text-muted-foreground tabular-nums">
                      <bdi dir="ltr">
                        {formatBloodBankFileSize(doc.sizeBytes)}
                      </bdi>{" "}
                      ·{" "}
                      <bdi dir="ltr">
                        {formatBloodBankDateTime(doc.uploadedAt)}
                      </bdi>
                    </p>
                    <div className="mt-2">
                      <StatusIndicator tone={reviewConfig.tone}>
                        {t(reviewConfig.labelKey, reviewConfig.defaultLabel)}
                      </StatusIndicator>
                    </div>
                  </div>
                </div>

                {/* Review Actions */}
                <div className="flex items-center gap-1.5 self-end sm:self-center">
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
                    title={t("bloodBank.accept", "Accept")}
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
                    title={t("bloodBank.requestChanges", "Request changes")}
                  >
                    <MessageSquareWarning aria-hidden="true" />
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
