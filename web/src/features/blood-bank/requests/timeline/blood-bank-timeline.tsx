import { CheckCircle2, Circle, XCircle } from "lucide-react";
import { useTranslation } from "react-i18next";

import { formatBloodBankDateTime } from "@/features/blood-bank/components/blood-bank-formatters";
import type {
  BloodBankQueueStatus,
  BloodBankRequestHistoryEvent,
} from "@/features/blood-bank/types/blood-bank.types";
import { RequestStatusBadge } from "@/shared/components/clinical/request-status-badge";
import { BidiText } from "@/shared/components/i18n/bidi-text";

interface BloodBankTimelineProps {
  currentStatus: BloodBankQueueStatus;
  events: BloodBankRequestHistoryEvent[];
}

const standardWorkflowStages: { status: BloodBankQueueStatus; labelKey: string }[] = [
  { status: "submitted", labelKey: "status.submitted" },
  { status: "acknowledged", labelKey: "status.acknowledged" },
  { status: "confirmed", labelKey: "status.confirmed" },
  { status: "preparing", labelKey: "status.preparing" },
  { status: "completed", labelKey: "status.completed" },
];

export function BloodBankTimeline({
  currentStatus,
  events,
}: BloodBankTimelineProps) {
  const { t } = useTranslation();
  const isRejected = currentStatus === "rejected";
  const isCancelled = currentStatus === "cancelled";

  // Determine stage progress
  const currentStageIndex = standardWorkflowStages.findIndex(
    (s) => s.status === currentStatus,
  );

  return (
    <section
      aria-labelledby="blood-bank-timeline-heading"
      className="border border-border bg-surface p-5"
    >
      <div className="mb-4">
        <h2 id="blood-bank-timeline-heading" className="text-base font-semibold">
          {t("bloodBank.timelineAudit", "Operational timeline & audit log")}
        </h2>
        <p className="mt-0.5 text-xs text-muted-foreground">
          {t("bloodBank.timelineAuditDesc", "Track lifecycle state transitions, technician handoffs, and dispatch checkpoints.")}
        </p>
      </div>

      {/* Stage progress track */}
      {!isRejected && !isCancelled ? (
        <div className="mb-6 border-b border-border pb-5">
          <p className="mb-2 text-xs font-semibold text-muted-foreground">
            {t("bloodBank.workflowPipeline", "Workflow pipeline")}
          </p>
          <div className="grid grid-cols-2 gap-3 text-center sm:grid-cols-5 sm:gap-1">
            {standardWorkflowStages.map((stage, idx) => {
              const isPassed = idx <= currentStageIndex;
              const isCurrent = idx === currentStageIndex;
              return (
                <div key={stage.status} className="flex flex-col items-center">
                  <div
                    className={`flex size-6 items-center justify-center rounded-full text-xs font-semibold transition-colors ${
                      isCurrent
                        ? "border-2 border-primary bg-primary text-primary-foreground"
                        : isPassed
                          ? "bg-primary/20 text-primary"
                          : "bg-surface-subtle text-muted-foreground"
                    }`}
                  >
                    {isPassed ? (
                      <CheckCircle2 aria-hidden="true" className="size-4" />
                    ) : (
                      idx + 1
                    )}
                  </div>
                  <span
                    className={`mt-1.5 text-[11px] leading-tight font-medium ${
                      isCurrent
                        ? "text-primary font-bold"
                        : isPassed
                          ? "text-foreground"
                          : "text-muted-foreground"
                    }`}
                  >
                    {t(stage.labelKey, stage.status)}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div
          role="status"
          className="mb-6 flex items-center gap-2 border border-destructive/25 bg-emergency-subtle p-3 text-xs font-medium text-[#7a1a13]"
        >
          <XCircle aria-hidden="true" className="size-4 shrink-0" />
          <span>
            {t("bloodBank.terminalNotice", {
              status: isRejected ? t("status.rejected", "rejected") : t("status.cancelled", "cancelled"),
              defaultValue: `This request was ${isRejected ? "rejected" : "cancelled"} and is in a terminal state.`,
            })}
          </span>
        </div>
      )}

      {/* Chronological event trail */}
      <ol className="relative ms-2 border-s border-border">
        {events.map((event, index) => {
          const isLatest = index === events.length - 1;
          return (
            <li key={event.id} className="relative pb-6 ps-6 last:pb-0">
              <span className="absolute -start-2.5 top-0.5 flex size-5 items-center justify-center rounded-full bg-surface text-primary">
                {isLatest ? (
                  <CheckCircle2 aria-hidden="true" className="size-4 text-primary" />
                ) : (
                  <Circle aria-hidden="true" className="size-3 text-muted-foreground" />
                )}
              </span>
              <div className="flex flex-wrap items-center gap-2">
                <RequestStatusBadge status={event.status} />
                <time className="text-xs text-muted-foreground tabular-nums">
                  <BidiText>{formatBloodBankDateTime(event.occurredAt)}</BidiText>
                </time>
              </div>
              <p className="mt-1.5 text-xs font-semibold text-foreground">
                <BidiText>{event.actor}</BidiText>
              </p>
              {event.note ? (
                <p className="mt-1 rounded bg-surface-subtle/70 px-2.5 py-1.5 text-xs leading-relaxed text-muted-foreground">
                  <BidiText>{event.note}</BidiText>
                </p>
              ) : null}
            </li>
          );
        })}
      </ol>
    </section>
  );
}
