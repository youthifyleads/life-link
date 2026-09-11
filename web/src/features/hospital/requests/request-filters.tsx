import { Search, SlidersHorizontal, X } from "lucide-react";
import { useTranslation } from "react-i18next";

import {
  bloodGroups,
  requestStatuses,
  urgencyLevels,
} from "@/shared/components/clinical/clinical.types";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { formatStatusLabel } from "@/features/hospital/components/hospital-formatters";
import type { RequestFilters as RequestFilterValues } from "@/features/hospital/types/hospital.types";

interface RequestFiltersProps {
  value: RequestFilterValues;
  onChange: (value: RequestFilterValues) => void;
  resultCount: number;
}

const selectClassName =
  "min-h-10 rounded-md border border-input bg-surface px-3 text-sm text-foreground focus-visible:border-ring focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/25";

export function RequestFilters({
  value,
  onChange,
  resultCount,
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
      className="border border-border bg-surface"
    >
      <div className="flex min-h-14 items-center gap-3 border-b border-border px-4">
        <SlidersHorizontal aria-hidden="true" className="size-4 text-primary" />
        <h2 className="text-sm font-semibold">{t("hospital.findRequests")}</h2>
        <span className="ms-auto text-xs text-muted-foreground tabular-nums">
          {resultCount} {resultCount === 1 ? t("hospital.record") : t("hospital.records")}
        </span>
      </div>
      <div className="grid gap-3 p-4 md:grid-cols-2 xl:grid-cols-[minmax(14rem,1.5fr)_repeat(4,minmax(8rem,1fr))]">
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
            <option value="required_soonest">{t("hospital.requiredSoonest")}</option>
          </select>
        </label>
      </div>
      {hasFilters ? (
        <div className="border-t border-border px-4 py-2 text-end">
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
            <X aria-hidden="true" />
            {t("hospital.clearFilters")}
          </Button>
        </div>
      ) : null}
    </section>
  );
}
