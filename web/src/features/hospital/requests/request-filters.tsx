import { Search } from "lucide-react";
import { useTranslation } from "react-i18next";

import {
  bloodGroups,
  requestStatuses,
  urgencyLevels,
} from "@/shared/components/clinical/clinical.types";
import { getRequestStatusIndicator } from "@/shared/components/clinical/request-status-badge";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { formatStatusLabel } from "@/features/hospital/components/hospital-formatters";
import type { RequestFilters as RequestFilterValues } from "@/features/hospital/types/hospital.types";

interface RequestFiltersProps {
  value: RequestFilterValues;
  onChange: (value: RequestFilterValues) => void;
  resultCount: number;
  statusPresentation?: "select" | "tags";
}

const selectClassName =
  "min-h-10 rounded-md border border-input bg-surface px-3 text-sm text-foreground focus-visible:border-ring focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/25";

export function RequestFilters({
  value,
  onChange,
  resultCount,
  statusPresentation = "select",
}: RequestFiltersProps) {
  const { t } = useTranslation();

  const hasFilters =
    value.search ||
    value.status !== "all" ||
    value.urgency !== "all" ||
    value.bloodGroup !== "all" ||
    value.sort !== "newest";

  const update = <Key extends keyof RequestFilterValues>(
    key: Key,
    nextValue: RequestFilterValues[Key],
  ) => onChange({ ...value, [key]: nextValue });

  return (
    <section
      aria-label={t("hospital.requestFilters")}
      className="rounded-lg border border-border/80 bg-surface shadow-2xs overflow-hidden"
    >
      <div className="flex min-h-12 items-center gap-3 border-b border-border px-3.5">
        <h2 className="text-sm font-semibold">{t("hospital.findRequests")}</h2>
        <span className="ms-auto text-xs text-muted-foreground tabular-nums">
          {resultCount}{" "}
          {resultCount === 1 ? t("hospital.record") : t("hospital.records")}
        </span>
      </div>
      <div
        className={`grid gap-2.5 p-3.5 md:grid-cols-2 ${
          statusPresentation === "tags"
            ? "xl:grid-cols-[minmax(14rem,1.5fr)_repeat(3,minmax(8rem,1fr))]"
            : "xl:grid-cols-[minmax(14rem,1.5fr)_repeat(4,minmax(8rem,1fr))]"
        }`}
      >
        <label className="relative">
          <span className="sr-only">{t("common.search")}</span>
          <Search
            aria-hidden="true"
            className="pointer-events-none absolute start-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
          />
          <Input
            value={value.search}
            onChange={(event) => update("search", event.target.value)}
            placeholder={t("hospital.searchPlaceholder")}
            className="ps-9"
          />
        </label>

        {statusPresentation === "select" ? (
          <label>
            <span className="sr-only">{t("common.status")}</span>
            <select
              className={`${selectClassName} w-full`}
              value={value.status}
              onChange={(event) =>
                update(
                  "status",
                  event.target.value as RequestFilterValues["status"],
                )
              }
            >
              <option value="all">{t("hospital.allStatuses")}</option>
              {requestStatuses.map((status) => (
                <option key={status} value={status}>
                  {formatStatusLabel(status)}
                </option>
              ))}
            </select>
          </label>
        ) : null}

        <label>
          <span className="sr-only">{t("common.urgency")}</span>
          <select
            className={`${selectClassName} w-full`}
            value={value.urgency}
            onChange={(event) =>
              update(
                "urgency",
                event.target.value as RequestFilterValues["urgency"],
              )
            }
          >
            <option value="all">{t("hospital.allUrgencies")}</option>
            {urgencyLevels.map((urgency) => (
              <option key={urgency} value={urgency}>
                {t(`urgency.${urgency}`)}
              </option>
            ))}
          </select>
        </label>

        <label>
          <span className="sr-only">{t("common.bloodGroup")}</span>
          <select
            className={`${selectClassName} w-full`}
            value={value.bloodGroup}
            onChange={(event) =>
              update(
                "bloodGroup",
                event.target.value as RequestFilterValues["bloodGroup"],
              )
            }
          >
            <option value="all">{t("hospital.allBloodGroups")}</option>
            {bloodGroups.map((group) => (
              <option key={group} value={group}>
                {group}
              </option>
            ))}
          </select>
        </label>

        <label>
          <span className="sr-only">{t("hospital.statusOverview")}</span>
          <select
            className={`${selectClassName} w-full`}
            value={value.sort}
            onChange={(event) =>
              update("sort", event.target.value as RequestFilterValues["sort"])
            }
          >
            <option value="newest">{t("hospital.newestFirst")}</option>
            <option value="oldest">{t("hospital.oldestFirst")}</option>
            <option value="required_soonest">
              {t("hospital.requiredSoonest")}
            </option>
          </select>
        </label>

        {statusPresentation === "tags" ? (
          <div className="md:col-span-2 xl:col-span-4">
            <span className="mb-2 block text-xs font-medium text-muted-foreground">
              {t("common.status")}
            </span>
            <div
              className="flex flex-wrap gap-2"
              role="group"
              aria-label={t("common.status")}
            >
              <button
                type="button"
                aria-pressed={value.status === "all"}
                onClick={() => update("status", "all")}
                className={`inline-flex min-h-7 items-center px-2.5 py-1 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/30 ${
                  value.status === "all"
                    ? "rounded-md bg-muted text-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {t("hospital.allStatuses")}
              </button>
              {requestStatuses.map((status) => {
                return (
                  <button
                    key={status}
                    type="button"
                    aria-pressed={value.status === status}
                    onClick={() => update("status", status)}
                    className={`inline-flex min-h-7 items-center gap-1 px-2 py-1 text-[11px] font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/30 ${
                      value.status === status
                        ? "rounded-md bg-muted text-foreground"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    <span
                      aria-hidden="true"
                      dir="ltr"
                      className="shrink-0 leading-none"
                    >
                      {getRequestStatusIndicator(status)}
                    </span>
                    <span>{formatStatusLabel(status)}</span>
                  </button>
                );
              })}
            </div>
          </div>
        ) : null}
      </div>
      {hasFilters ? (
        <div className="border-t border-border px-3.5 py-1.5 text-end">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() =>
              onChange({
                search: "",
                status: "all",
                urgency: "all",
                bloodGroup: "all",
                sort: "newest",
              })
            }
          >
            {t("hospital.clearFilters")}
          </Button>
        </div>
      ) : null}
    </section>
  );
}
