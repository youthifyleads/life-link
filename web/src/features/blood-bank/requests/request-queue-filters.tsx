import { ChevronDown, ListFilter, Search, X } from "lucide-react";
import type { ReactNode } from "react";
import { useTranslation } from "react-i18next";

import {
  formatBloodBankComponent,
  formatBloodBankStatus,
} from "@/features/blood-bank/components/blood-bank-formatters";
import {
  bloodBankComponents,
  bloodBankQueueStatuses,
  type BloodBankRequestFilters as RequestFilterValues,
} from "@/features/blood-bank/types/blood-bank.types";
import {
  bloodGroups,
  urgencyLevels,
} from "@/shared/components/clinical/clinical.types";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";

interface RequestQueueFiltersProps {
  value: RequestFilterValues;
  onChange: (value: RequestFilterValues) => void;
  resultCount: number;
  totalCount?: number;
}

const defaultFilters: RequestFilterValues = {
  search: "",
  status: "all",
  urgency: "all",
  bloodGroup: "all",
  component: "all",
  sort: "newest",
};

const selectClassName =
  "h-10 w-full appearance-none rounded-md border border-border bg-surface ps-3 pe-9 text-sm font-medium text-foreground hover:border-border-hover focus-visible:border-ring focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/20";

export function RequestQueueFilters({
  value,
  onChange,
  resultCount,
  totalCount,
}: RequestQueueFiltersProps) {
  const { t } = useTranslation();

  const hasActiveFilters = Object.entries(defaultFilters).some(
    ([key, defaultValue]) =>
      value[key as keyof RequestFilterValues] !== defaultValue,
  );

  const update = <Key extends keyof RequestFilterValues>(
    key: Key,
    nextValue: RequestFilterValues[Key],
  ) => onChange({ ...value, [key]: nextValue });

  return (
    <section
      aria-labelledby="request-queue-filters-title"
      className="overflow-hidden rounded-md border border-border bg-surface"
    >
      <div className="flex flex-col gap-3 border-b border-border px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 flex-wrap items-center gap-x-2.5 gap-y-1">
          <ListFilter
            aria-hidden="true"
            className="size-4 shrink-0 text-primary"
          />
          <h2
            id="request-queue-filters-title"
            className="text-sm font-semibold text-foreground"
          >
            {t("bloodBank.findQueueRequests")}
          </h2>
          <span className="text-sm text-muted-foreground tabular-nums">
            {t("bloodBank.showingOf", {
              shown: resultCount,
              total: totalCount ?? resultCount,
            })}
          </span>
        </div>

        {hasActiveFilters ? (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-8 self-start px-2.5 text-xs text-muted-foreground sm:self-auto"
            onClick={() => onChange(defaultFilters)}
          >
            <X aria-hidden="true" className="size-3.5" />
            {t("bloodBank.resetAllFilters")}
          </Button>
        ) : null}
      </div>

      <div className="space-y-4 p-4">
        <div className="relative max-w-2xl">
          <Search
            aria-hidden="true"
            className="pointer-events-none absolute start-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
          />
          <Input
            value={value.search}
            onChange={(event) => update("search", event.target.value)}
            placeholder={t("bloodBank.searchQueuePlaceholder")}
            aria-label={t("bloodBank.searchQueueLabel")}
            className="h-10 w-full bg-surface-subtle/40 ps-9 pe-10 text-sm"
          />
          {value.search ? (
            <button
              type="button"
              onClick={() => update("search", "")}
              className="absolute end-2 top-1/2 inline-flex size-8 -translate-y-1/2 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              aria-label={t("bloodBank.clearQueueSearch")}
            >
              <X aria-hidden="true" className="size-4" />
            </button>
          ) : null}
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          <FilterSelect
            id="filter-urgency"
            label={t("common.urgency")}
          >
            <select
              id="filter-urgency"
              className={selectClassName}
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
          </FilterSelect>

          <FilterSelect
            id="filter-blood-group"
            label={t("common.bloodGroup")}
          >
            <select
              id="filter-blood-group"
              className={selectClassName}
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
          </FilterSelect>

          <FilterSelect
            id="filter-component"
            label={t("common.component")}
          >
            <select
              id="filter-component"
              className={selectClassName}
              value={value.component}
              onChange={(event) =>
                update(
                  "component",
                  event.target.value as RequestFilterValues["component"],
                )
              }
            >
              <option value="all">{t("bloodBank.allComponents")}</option>
              {bloodBankComponents.map((component) => (
                <option key={component} value={component}>
                  {formatBloodBankComponent(component)}
                </option>
              ))}
            </select>
          </FilterSelect>

          <FilterSelect id="filter-status" label={t("common.status")}>
            <select
              id="filter-status"
              className={selectClassName}
              value={value.status}
              onChange={(event) =>
                update(
                  "status",
                  event.target.value as RequestFilterValues["status"],
                )
              }
            >
              <option value="all">{t("hospital.allStatuses")}</option>
              {bloodBankQueueStatuses.map((status) => (
                <option key={status} value={status}>
                  {formatBloodBankStatus(status)}
                </option>
              ))}
            </select>
          </FilterSelect>

          <FilterSelect
            id="filter-sort"
            label={t("bloodBank.queueSortLabel")}
          >
            <select
              id="filter-sort"
              className={selectClassName}
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
              <option value="highest_urgency">
                {t("bloodBank.queueSortHighestUrgency")}
              </option>
            </select>
          </FilterSelect>
        </div>
      </div>
    </section>
  );
}

interface FilterSelectProps {
  id: string;
  label: string;
  children: ReactNode;
}

function FilterSelect({ id, label, children }: FilterSelectProps) {
  return (
    <div className="min-w-0">
      <label
        htmlFor={id}
        className="mb-1.5 block text-xs font-semibold text-muted-foreground"
      >
        {label}
      </label>
      <div className="relative">
        {children}
        <ChevronDown
          aria-hidden="true"
          className="pointer-events-none absolute end-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
        />
      </div>
    </div>
  );
}
