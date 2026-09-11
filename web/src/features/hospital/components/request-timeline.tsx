import { CheckCircle2, Circle } from "lucide-react";
import { useTranslation } from "react-i18next";

import { formatDateTime } from "@/features/hospital/components/hospital-formatters";
import type { RequestHistoryEvent } from "@/features/hospital/types/hospital.types";
import { RequestStatusBadge } from "@/shared/components/clinical/request-status-badge";
import { BidiText } from "@/shared/components/i18n/bidi-text";

interface RequestTimelineProps {
  events: RequestHistoryEvent[];
}

export function RequestTimeline({ events }: RequestTimelineProps) {
  const { t } = useTranslation();
  if (events.length === 0) {
    return (
      <p className="border-y border-border py-5 text-sm text-muted-foreground">
        {t("hospital.timelineEmpty")}
      </p>
    );
  }

  return (
    <ol className="relative ms-2 border-s border-border">
      {events.map((event, index) => (
        <li key={event.id} className="relative pb-7 ps-7 last:pb-0">
          <span className="absolute -start-2.5 top-0 flex size-5 items-center justify-center rounded-full bg-background text-primary">
            {index === events.length - 1 ? (
              <CheckCircle2 aria-hidden="true" className="size-5" />
            ) : (
              <Circle aria-hidden="true" className="size-4 fill-surface" />
            )}
          </span>
          <div className="flex flex-wrap items-center gap-2">
            <RequestStatusBadge status={event.status} />
            <time className="text-xs text-muted-foreground tabular-nums">
              <BidiText>{formatDateTime(event.occurredAt)}</BidiText>
            </time>
          </div>
          <p className="mt-2 text-sm font-medium text-foreground">
            <BidiText>{event.actor}</BidiText>
          </p>
          {event.note ? (
            <p className="mt-1 max-w-[65ch] text-sm leading-6 text-muted-foreground">
              <BidiText>{event.note}</BidiText>
            </p>
          ) : null}
        </li>
      ))}
    </ol>
  );
}
