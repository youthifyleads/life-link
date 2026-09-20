import * as DialogPrimitive from "@radix-ui/react-dialog";
import { ShieldAlert, X } from "lucide-react";
import { useTranslation } from "react-i18next";

import { formatBloodBankDateTime } from "@/features/blood-bank/components/blood-bank-formatters";
import type { BloodBagCustodyHistory } from "@/features/blood-bank/custody/blood-bag-custody.types";
import { useBloodBagCustodyHistory } from "@/features/blood-bank/custody/use-blood-bag-custody-history";
import type { BloodUnitStatus } from "@/features/blood-bank/types/blood-bank.types";
import { BloodGroupBadge } from "@/shared/components/clinical/blood-group-badge";
import { StatusIndicator } from "@/shared/components/clinical/status-indicator";
import {
  ErrorState,
  LoadingState,
} from "@/shared/components/feedback/system-states";

interface BloodBagCustodyHistoryDrawerProps {
  bagId?: string;
  onClose: () => void;
}

const statusTone: Record<
  BloodUnitStatus,
  "success" | "pending" | "warning" | "danger"
> = {
  available: "success",
  allocated: "success",
  reserved: "pending",
  quarantined: "warning",
  expired: "danger",
};

function formatDate(value: string, language: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return new Intl.DateTimeFormat(
    language.startsWith("ar") ? "ar-EG" : "en-GB",
    {
      day: "2-digit",
      month: "short",
      year: "numeric",
    },
  ).format(date);
}

function StatusBadge({ status }: { status: BloodUnitStatus }) {
  const { t } = useTranslation();

  return (
    <StatusIndicator tone={statusTone[status]}>
      {t(`status.${status}`, status)}
    </StatusIndicator>
  );
}

function Summary({ data }: { data: BloodBagCustodyHistory }) {
  const { i18n, t } = useTranslation();
  const facts = [
    {
      label: t("bloodBank.barcode", "Barcode"),
      value: <bdi dir="ltr">{data.barcode}</bdi>,
    },
    {
      label: t("bloodBank.collectionDate", "Collection date"),
      value: (
        <bdi dir="auto">{formatDate(data.collection_date, i18n.language)}</bdi>
      ),
    },
    {
      label: t("bloodBank.expiryDate", "Expiry date"),
      value: (
        <bdi dir="auto">{formatDate(data.expiry_date, i18n.language)}</bdi>
      ),
    },
    {
      label: t("bloodBank.daysRemaining", "Days remaining"),
      value: (
        <bdi dir="auto">
          {new Intl.NumberFormat(i18n.language).format(data.days_remaining)}
        </bdi>
      ),
    },
  ];

  return (
    <section
      aria-label={t("bloodBank.bagSummary", "Blood bag summary")}
      className="space-y-4"
    >
      <div className="flex flex-wrap items-center gap-3 rounded-lg border border-border/80 bg-surface-subtle p-4 shadow-2xs">
        <BloodGroupBadge group={data.blood_group} />
        <span className="text-sm font-semibold text-foreground">
          {t(
            `healthcare.${data.component}`,
            data.component.replaceAll("_", " "),
          )}
        </span>
        <div className="ms-auto text-end">
          <p className="mb-1 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
            {t("bloodBank.currentStatus", "Current status")}
          </p>
          <StatusBadge status={data.current_status} />
        </div>
      </div>

      <dl className="grid grid-cols-1 overflow-hidden rounded-lg border border-border/80 bg-surface shadow-2xs divide-y divide-border/70 sm:grid-cols-2 sm:divide-y-0 sm:divide-x sm:divide-border/70 rtl:sm:divide-x-reverse">
        {facts.map(({ label, value }) => (
          <div
            key={label}
            className="p-3.5"
          >
            <dt className="text-xs font-medium text-muted-foreground">
              {label}
            </dt>
            <dd className="mt-1.5 text-sm font-semibold text-foreground">
              {value}
            </dd>
          </div>
        ))}
      </dl>

      <div className="rounded-lg border border-border/80 bg-surface p-4 shadow-2xs">
        <div>
          <p className="text-xs font-medium text-muted-foreground">
            {t("bloodBank.currentLocation", "Current location")}
          </p>
          <p className="mt-1 text-sm font-semibold text-foreground">
            {data.location}
          </p>
        </div>
      </div>
    </section>
  );
}

export function BloodBagCustodyHistoryDrawer({
  bagId,
  onClose,
}: BloodBagCustodyHistoryDrawerProps) {
  const { i18n, t } = useTranslation();
  const historyQuery = useBloodBagCustodyHistory(bagId);

  return (
    <DialogPrimitive.Root
      open={Boolean(bagId)}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-[#071a26]/45 data-[state=closed]:animate-out data-[state=open]:animate-in data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
        <DialogPrimitive.Content
          dir={i18n.dir()}
          className="fixed inset-y-0 end-0 z-50 flex w-full flex-col border-s border-border bg-background shadow-[var(--shadow-overlay)] outline-none sm:max-w-xl data-[state=closed]:animate-out data-[state=open]:animate-in data-[state=closed]:slide-out-to-right data-[state=open]:slide-in-from-right rtl:data-[state=closed]:slide-out-to-left rtl:data-[state=open]:slide-in-from-left"
        >
          <header className="shrink-0 border-b border-border bg-surface px-5 py-5 pe-16 sm:px-6 sm:pe-16">
            <div className="text-xs font-semibold uppercase tracking-[0.12em] text-primary">
              {t("bloodBank.custodyLedger", "Custody ledger")}
            </div>
            <DialogPrimitive.Title className="mt-2 text-xl font-semibold text-foreground">
              {t("bloodBank.custodyHistoryTitle", "Blood bag custody history")}
            </DialogPrimitive.Title>
            <DialogPrimitive.Description className="mt-1.5 text-sm leading-6 text-muted-foreground">
              {t("bloodBank.custodyHistoryDescription", {
                id: bagId,
                defaultValue: `Trace every recorded handling and location event for blood bag ${bagId}.`,
              })}
            </DialogPrimitive.Description>
            <DialogPrimitive.Close className="absolute end-4 top-4 flex size-10 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-surface-subtle hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary">
              <X aria-hidden="true" className="size-5" />
              <span className="sr-only">{t("common.close", "Close")}</span>
            </DialogPrimitive.Close>
          </header>

          <div className="min-h-0 flex-1 overflow-y-auto p-5 sm:p-6">
            {historyQuery.isPending ? (
              <LoadingState
                rows={5}
                label={t(
                  "bloodBank.loadingCustodyHistory",
                  "Loading blood bag custody history…",
                )}
              />
            ) : historyQuery.isError ? (
              <ErrorState
                title={t(
                  "bloodBank.custodyHistoryLoadErrorTitle",
                  "Could not load custody history",
                )}
                description={t(
                  "bloodBank.custodyHistoryLoadErrorDescription",
                  "The blood bag custody record could not be retrieved. Try again.",
                )}
                onRetry={() => void historyQuery.refetch()}
              />
            ) : historyQuery.data ? (
              <div className="space-y-7">
                <Summary data={historyQuery.data} />

                <section aria-labelledby="custody-timeline-heading">
                  <div className="mb-4">
                    <h2
                      id="custody-timeline-heading"
                      className="text-base font-semibold text-foreground"
                    >
                      {t(
                        "bloodBank.custodyTimeline",
                        "Custody and handling timeline",
                      )}
                    </h2>
                    <p className="mt-1 text-xs leading-5 text-muted-foreground">
                      {t(
                        "bloodBank.custodyTimelineDescription",
                        "Recorded staff handoffs, status changes, and controlled storage locations.",
                      )}
                    </p>
                  </div>

                  {historyQuery.data.history.length === 0 ? (
                    <p className="border border-dashed border-border p-5 text-center text-sm text-muted-foreground">
                      {t(
                        "bloodBank.noCustodyEvents",
                        "No custody events have been recorded for this blood bag.",
                      )}
                    </p>
                  ) : (
                    <ol className="ms-2 border-s border-border ps-5">
                      {historyQuery.data.history.map((event) => (
                        <li key={event.id} className="relative pb-5 last:pb-0">
                          <span className="absolute -start-[1.56rem] top-1.5 size-2.5 rounded-full border-2 border-background bg-primary" />
                          <article className="border-b border-border bg-surface py-4 last:border-b-0">
                            <h3 className="text-sm font-semibold text-foreground">
                              {t(
                                `custodyEvent.${event.event}`,
                                event.event.replaceAll("_", " "),
                              )}
                            </h3>

                            <dl className="mt-3 grid gap-3 border-t border-border pt-3 sm:grid-cols-2">
                              <div>
                                <dt className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                                  {t("bloodBank.location", "Location")}
                                </dt>
                                <dd className="mt-1 text-sm text-foreground">
                                  {event.location}
                                </dd>
                              </div>
                              <div>
                                <dt className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                                  {t("bloodBank.staffMember", "Staff member")}
                                </dt>
                                <dd className="mt-1 text-sm text-foreground">
                                  {event.staff_member}
                                </dd>
                              </div>
                              <div>
                                <dt className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                                  {t("bloodBank.staffRole", "Role")}
                                </dt>
                                <dd className="mt-1 text-sm text-foreground">
                                  {t(
                                    `roles.${event.staff_role}`,
                                    event.staff_role,
                                  )}
                                </dd>
                              </div>
                              <div>
                                <dt className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                                  {t("bloodBank.eventTimestamp", "Timestamp")}
                                </dt>
                                <dd className="mt-1 text-sm tabular-nums text-foreground">
                                  <time dateTime={event.timestamp}>
                                    <bdi dir="auto">
                                      {formatBloodBankDateTime(event.timestamp)}
                                    </bdi>
                                  </time>
                                </dd>
                              </div>
                            </dl>

                            {event.quarantine_reason ? (
                              <div className="mt-3 flex items-start gap-2 border border-warning/30 bg-warning-subtle p-3 text-sm text-[#6f4a00]">
                                <ShieldAlert
                                  aria-hidden="true"
                                  className="mt-0.5 size-4 shrink-0"
                                />
                                <div>
                                  <p className="text-xs font-semibold">
                                    {t(
                                      "bloodBank.quarantineReason",
                                      "Quarantine reason",
                                    )}
                                  </p>
                                  <p className="mt-1 leading-5">
                                    {event.quarantine_reason}
                                  </p>
                                </div>
                              </div>
                            ) : null}
                          </article>
                        </li>
                      ))}
                    </ol>
                  )}
                </section>
              </div>
            ) : null}
          </div>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
