import {
  AlertOctagon,
  ArrowRight,
  BookmarkCheck,
  Building2,
  CheckCircle2,
  Clock,
  ExternalLink,
  Layers,
  MapPin,
  PackagePlus,
  RotateCcw,
  ShieldAlert,
  ShieldCheck,
  UserCheck,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";

import type {
  CustodyEvent,
  CustodyEventType,
} from "@/features/blood-bank/types/blood-bank.types";

interface CustodyTimelineProps {
  events?: CustodyEvent[];
}

function getEventIcon(eventType: CustodyEventType) {
  switch (eventType) {
    case "registered":
      return <PackagePlus aria-hidden="true" className="size-4 text-primary" />;
    case "reserved":
      return <BookmarkCheck aria-hidden="true" className="size-4 text-amber-600 dark:text-amber-400" />;
    case "allocated":
      return <Layers aria-hidden="true" className="size-4 text-primary" />;
    case "deallocated":
      return <RotateCcw aria-hidden="true" className="size-4 text-muted-foreground rtl:rotate-180" />;
    case "prepared":
      return <CheckCircle2 aria-hidden="true" className="size-4 text-emerald-600 dark:text-emerald-400" />;
    case "released":
      return <ArrowRight aria-hidden="true" className="size-4 text-primary rtl:rotate-180" />;
    case "handoff_completed":
      return <ShieldCheck aria-hidden="true" className="size-4 text-emerald-600 dark:text-emerald-400" />;
    case "quarantined":
      return <ShieldAlert aria-hidden="true" className="size-4 text-purple-600 dark:text-purple-400" />;
    case "expired":
      return <AlertOctagon aria-hidden="true" className="size-4 text-emergency" />;
    default:
      return <Clock aria-hidden="true" className="size-4 text-primary" />;
  }
}

export function CustodyTimeline({ events = [] }: CustodyTimelineProps) {
  const { t } = useTranslation();

  if (events.length === 0) {
    return (
      <div className="border border-border bg-surface p-6 text-center text-xs text-muted-foreground">
        {t("bloodBank.noCustodyRecords")}
      </div>
    );
  }

  // Display events in reverse chronological order (newest first)
  const sortedEvents = [...events].reverse();

  return (
    <section aria-labelledby="custody-timeline-heading" className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 id="custody-timeline-heading" className="text-base font-semibold">
            {t("bloodBank.timelineTitle")}
          </h2>
          <p className="mt-0.5 text-xs text-muted-foreground">
            {t("bloodBank.timelineSubtitle")}
          </p>
        </div>
        <span className="text-xs text-muted-foreground font-medium tabular-nums">
          {t("bloodBank.verifiedCustodyEvents", { count: events.length })}
        </span>
      </div>

      <div className="relative border border-border bg-surface p-5 sm:p-6">
        <ol className="relative space-y-6 before:absolute before:start-4 before:top-2 before:bottom-2 before:w-0.5 before:bg-border">
          {sortedEvents.map((evt, idx) => (
            <li key={evt.id || idx} className="relative ps-10">
              {/* Event Icon Pin */}
              <span className="absolute start-0 top-0.5 flex size-8 items-center justify-center border border-border bg-surface">
                {getEventIcon(evt.event)}
              </span>

              {/* Event Content Box */}
              <div className="space-y-1.5">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="text-xs font-bold text-foreground">
                    {evt.title}
                  </span>
                  <time className="font-mono text-[11px] text-muted-foreground">
                    <bdi dir="ltr">{evt.timestamp.replace("T", " ").split(".")[0]}</bdi>
                  </time>
                </div>

                {/* Actor, Role & Facility Location */}
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <UserCheck aria-hidden="true" className="size-3 text-primary shrink-0" />
                    <span>
                      {evt.actor} ({evt.role})
                    </span>
                  </span>

                  <span className="flex items-center gap-1">
                    <MapPin aria-hidden="true" className="size-3 text-primary shrink-0" />
                    <span>{evt.location}</span>
                  </span>

                  {evt.relatedRequestId ? (
                    <span className="flex items-center gap-1 font-mono font-semibold text-primary">
                      <Building2 aria-hidden="true" className="size-3 shrink-0" />
                      <Link
                        to={`/blood-bank/requests/${evt.relatedRequestId}`}
                        className="inline-flex items-center gap-1 hover:underline"
                      >
                        <bdi dir="ltr">{evt.relatedRequestId}</bdi>
                        <ExternalLink aria-hidden="true" className="size-3" />
                      </Link>
                    </span>
                  ) : null}
                </div>

                {/* Audit Notes */}
                {evt.notes ? (
                  <p className="mt-1 border-s-2 border-primary/40 bg-surface-subtle py-1 ps-2.5 text-xs text-foreground">
                    {evt.notes}
                  </p>
                ) : null}
              </div>
            </li>
          ))}
        </ol>

        <div className="mt-6 border-t border-border pt-4 text-[11px] text-muted-foreground flex items-center gap-2">
          <ShieldCheck aria-hidden="true" className="size-4 text-emerald-600 shrink-0" />
          <span>
            {t("bloodBank.traceabilityNotice")}
          </span>
        </div>
      </div>
    </section>
  );
}
