import {
  ChevronDown,
  Search,
  X,
} from "lucide-react";
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

  const isPresetActive = (type: "all" | "emergency" | "urgent" | "submitted" | "preparing") => {
    if (type === "all") return value.urgency === "all" && value.status === "all";
    if (type === "emergency") return value.urgency === "emergency";
    if (type === "urgent") return value.urgency === "urgent";
    if (type === "submitted") return value.status === "submitted";
    if (type === "preparing") return value.status === "preparing";
    return false;
  };

  const applyPreset = (type: "all" | "emergency" | "urgent" | "submitted" | "preparing") => {
    if (type === "all") {
      onChange({ ...value, urgency: "all", status: "all" });
    } else if (type === "emergency") {
      onChange({ ...value, urgency: "emergency", status: "all" });
    } else if (type === "urgent") {
      onChange({ ...value, urgency: "urgent", status: "all" });
    } else if (type === "submitted") {
      onChange({ ...value, status: "submitted", urgency: "all" });
    } else if (type === "preparing") {
      onChange({ ...value, status: "preparing", urgency: "all" });
    }
  };

  return (
    <section
      aria-label={t("bloodBank.incomingRequestFilters")}
      className="border border-border bg-surface shadow-xs"
    >
      {/* Tier 1: Search and Fast Triage Command Header */}
      <div className="flex flex-col gap-3 border-b border-border p-3 sm:flex-row sm:items-center sm:justify-between sm:px-4">
        {/* Search Field */}
        <div className="relative w-full sm:max-w-md">
          <Search
            aria-hidden="true"
            className="pointer-events-none absolute start-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
          />
          <Input
            value={value.search}
            onChange={(event) => update("search", event.target.value)}
            placeholder={t("bloodBank.searchQueuePlaceholder", "Search ID, hospital, or component")}
            className="h-9 w-full bg-surface-subtle/50 ps-9 pe-8 text-xs sm:text-sm"
          />
          {value.search ? (
            <button
              type="button"
              onClick={() => update("search", "")}
              className="absolute end-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              aria-label="Clear search"
            >
              <X aria-hidden="true" className="size-3.5" />
            </button>
          ) : null}
        </div>

        {/* Fast Triage Dispatch Chips */}
        <div className="flex flex-wrap items-center gap-1.5 overflow-x-auto text-xs">
          <span className="me-1 hidden text-[11px] font-medium text-muted-foreground lg:inline-block">
            {t("bloodBank.quickTriage", "Quick Triage:")}
          </span>
          <button
            type="button"
            onClick={() => applyPreset("all")}
            className={`inline-flex h-7 items-center rounded-md border px-2.5 text-xs font-medium transition-colors ${
              isPresetActive("all")
                ? "border-primary bg-primary text-primary-foreground font-semibold shadow-xs"
                : "border-border bg-surface text-muted-foreground hover:bg-surface-subtle hover:text-foreground"
            }`}
          >
            {t("bloodBank.triageAll", "All Requisitions")}
          </button>
          <button
            type="button"
            onClick={() => applyPreset("emergency")}
            className={`inline-flex h-7 items-center gap-1 rounded-md border px-2.5 text-xs font-semibold transition-colors ${
              isPresetActive("emergency")
                ? "border-destructive bg-destructive text-white shadow-xs"
                : "border-destructive/30 bg-destructive/5 text-destructive hover:bg-destructive/15"
            }`}
          >
            <span className="size-1.5 rounded-full bg-current animate-pulse" />
            {t("bloodBank.queueStatEmergency", "STAT Emergency")}
          </button>
          <button
            type="button"
            onClick={() => applyPreset("urgent")}
            className={`inline-flex h-7 items-center gap-1 rounded-md border px-2.5 text-xs font-medium transition-colors ${
              isPresetActive("urgent")
                ? "border-amber-600 bg-amber-600 text-white font-semibold shadow-xs"
                : "border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-400 hover:bg-amber-500/20"
            }`}
          >
            {t("bloodBank.queueUrgentTriage", "Urgent")}
          </button>
          <button
            type="button"
            onClick={() => applyPreset("submitted")}
            className={`inline-flex h-7 items-center rounded-md border px-2.5 text-xs font-medium transition-colors ${
              isPresetActive("submitted")
                ? "border-secondary-foreground bg-secondary text-secondary-foreground font-semibold"
                : "border-border bg-surface text-muted-foreground hover:bg-surface-subtle hover:text-foreground"
            }`}
          >
            {t("bloodBank.queueNeedsAllocation", "Needs Allocation")}
          </button>
        </div>
      </div>

      {/* Tier 2: Secondary Structured Clinical Parameters */}
      <div className="grid grid-cols-2 gap-2.5 p-3 sm:grid-cols-3 lg:grid-cols-5 xl:px-4">
        {/* Urgency Parameter */}
        <div className="relative">
          <label htmlFor="filter-urgency" className="mb-1 block text-[11px] font-medium text-muted-foreground">
            {t("common.urgency", "Urgency")}
          </label>
          <div className="relative">
            <select
              id="filter-urgency"
              aria-label={t("common.urgency", "Urgency")}
              className="h-8 w-full appearance-none rounded border border-border bg-surface ps-2.5 pe-7 text-xs font-medium text-foreground hover:border-border-hover focus-visible:border-ring focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              value={value.urgency}
              onChange={(event) =>
                update(
                  "urgency",
                  event.target.value as RequestFilterValues["urgency"],
                )
              }
            >
              <option value="all">{t("hospital.allUrgencies", "All Urgencies")}</option>
              {urgencyLevels.map((urgency) => (
                <option key={urgency} value={urgency}>
                  {t(`urgency.${urgency}`)}
                </option>
              ))}
            </select>
            <ChevronDown
              aria-hidden="true"
              className="pointer-events-none absolute end-2 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground"
            />
          </div>
        </div>

        {/* Blood Group Parameter */}
        <div className="relative">
          <label htmlFor="filter-blood-group" className="mb-1 block text-[11px] font-medium text-muted-foreground">
            {t("common.bloodGroup", "Blood Group")}
          </label>
          <div className="relative">
            <select
              id="filter-blood-group"
              aria-label={t("common.bloodGroup", "Blood Group")}
              className="h-8 w-full appearance-none rounded border border-border bg-surface ps-2.5 pe-7 text-xs font-medium text-foreground hover:border-border-hover focus-visible:border-ring focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              value={value.bloodGroup}
              onChange={(event) =>
                update(
                  "bloodGroup",
                  event.target.value as RequestFilterValues["bloodGroup"],
                )
              }
            >
              <option value="all">{t("hospital.allBloodGroups", "All Groups (ABO/RhD)")}</option>
              {bloodGroups.map((group) => (
                <option key={group} value={group}>
                  {group}
                </option>
              ))}
            </select>
            <ChevronDown
              aria-hidden="true"
              className="pointer-events-none absolute end-2 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground"
            />
          </div>
        </div>

        {/* Component Parameter */}
        <div className="relative">
          <label htmlFor="filter-component" className="mb-1 block text-[11px] font-medium text-muted-foreground">
            {t("common.component", "Component")}
          </label>
          <div className="relative">
            <select
              id="filter-component"
              aria-label={t("common.component", "Component")}
              className="h-8 w-full appearance-none rounded border border-border bg-surface ps-2.5 pe-7 text-xs font-medium text-foreground hover:border-border-hover focus-visible:border-ring focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              value={value.component}
              onChange={(event) =>
                update(
                  "component",
                  event.target.value as RequestFilterValues["component"],
                )
              }
            >
              <option value="all">
                {t("common.all")} {t("common.component")}
              </option>
              {bloodBankComponents.map((component) => (
                <option key={component} value={component}>
                  {formatBloodBankComponent(component)}
                </option>
              ))}
            </select>
            <ChevronDown
              aria-hidden="true"
              className="pointer-events-none absolute end-2 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground"
            />
          </div>
        </div>

        {/* Status Parameter */}
        <div className="relative">
          <label htmlFor="filter-status" className="mb-1 block text-[11px] font-medium text-muted-foreground">
            {t("common.status", "Status")}
          </label>
          <div className="relative">
            <select
              id="filter-status"
              aria-label={t("common.status", "Status")}
              className="h-8 w-full appearance-none rounded border border-border bg-surface ps-2.5 pe-7 text-xs font-medium text-foreground hover:border-border-hover focus-visible:border-ring focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              value={value.status}
              onChange={(event) =>
                update(
                  "status",
                  event.target.value as RequestFilterValues["status"],
                )
              }
            >
              <option value="all">{t("hospital.allStatuses", "All Statuses")}</option>
              {bloodBankQueueStatuses.map((status) => (
                <option key={status} value={status}>
                  {formatBloodBankStatus(status)}
                </option>
              ))}
            </select>
            <ChevronDown
              aria-hidden="true"
              className="pointer-events-none absolute end-2 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground"
            />
          </div>
        </div>

        {/* Sorting Parameter */}
        <div className="relative col-span-2 sm:col-span-1">
          <label htmlFor="filter-sort" className="mb-1 block text-[11px] font-medium text-muted-foreground">
            {t("hospital.statusOverview", "Chronology & Priority")}
          </label>
          <div className="relative">
            <select
              id="filter-sort"
              aria-label={t("hospital.statusOverview", "Sorting")}
              className="h-8 w-full appearance-none rounded border border-border bg-surface ps-2.5 pe-7 text-xs font-medium text-foreground hover:border-border-hover focus-visible:border-ring focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              value={value.sort}
              onChange={(event) =>
                update("sort", event.target.value as RequestFilterValues["sort"])
              }
            >
              <option value="newest">{t("hospital.newestFirst", "Newest first")}</option>
              <option value="oldest">{t("hospital.oldestFirst", "Oldest first")}</option>
              <option value="required_soonest">{t("hospital.requiredSoonest", "Required soonest")}</option>
              <option value="highest_urgency">{t("hospital.urgentRequests", "Highest urgency")}</option>
            </select>
            <ChevronDown
              aria-hidden="true"
              className="pointer-events-none absolute end-2 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground"
            />
          </div>
        </div>
      </div>

      {/* Tier 3: Active Filter Ledger Ribbon */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-t border-border bg-surface-subtle/40 px-4 py-2 text-xs">
        <div className="flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground">
          <span className="font-semibold text-foreground tabular-nums">
            {totalCount != null && totalCount !== resultCount ? (
              t("bloodBank.showingOf", {
                shown: resultCount,
                total: totalCount,
                defaultValue: `Showing ${resultCount} of ${totalCount} requisitions`,
              })
            ) : (
              `${resultCount} ${resultCount === 1 ? t("hospital.record") : t("hospital.records")}`
            )}
          </span>

          {/* Active filter badges */}
          {hasActiveFilters ? (
            <div className="ms-2 flex flex-wrap items-center gap-1">
              {value.urgency !== "all" && (
                <span className="inline-flex items-center gap-1 rounded bg-surface border border-border px-1.5 py-0.5 text-[11px] font-medium text-foreground">
                  <span>{t(`urgency.${value.urgency}`)}</span>
                  <button
                    type="button"
                    onClick={() => update("urgency", "all")}
                    className="text-muted-foreground hover:text-foreground"
                  >
                    <X aria-hidden="true" className="size-3" />
                  </button>
                </span>
              )}
              {value.bloodGroup !== "all" && (
                <span className="inline-flex items-center gap-1 rounded bg-surface border border-border px-1.5 py-0.5 text-[11px] font-medium text-foreground">
                  <span>{value.bloodGroup}</span>
                  <button
                    type="button"
                    onClick={() => update("bloodGroup", "all")}
                    className="text-muted-foreground hover:text-foreground"
                  >
                    <X aria-hidden="true" className="size-3" />
                  </button>
                </span>
              )}
              {value.component !== "all" && (
                <span className="inline-flex items-center gap-1 rounded bg-surface border border-border px-1.5 py-0.5 text-[11px] font-medium text-foreground">
                  <span>{formatBloodBankComponent(value.component)}</span>
                  <button
                    type="button"
                    onClick={() => update("component", "all")}
                    className="text-muted-foreground hover:text-foreground"
                  >
                    <X aria-hidden="true" className="size-3" />
                  </button>
                </span>
              )}
              {value.status !== "all" && (
                <span className="inline-flex items-center gap-1 rounded bg-surface border border-border px-1.5 py-0.5 text-[11px] font-medium text-foreground">
                  <span>{formatBloodBankStatus(value.status)}</span>
                  <button
                    type="button"
                    onClick={() => update("status", "all")}
                    className="text-muted-foreground hover:text-foreground"
                  >
                    <X aria-hidden="true" className="size-3" />
                  </button>
                </span>
              )}
              {value.search && (
                <span className="inline-flex items-center gap-1 rounded bg-surface border border-border px-1.5 py-0.5 text-[11px] font-medium text-foreground">
                  <span>&ldquo;{value.search}&rdquo;</span>
                  <button
                    type="button"
                    onClick={() => update("search", "")}
                    className="text-muted-foreground hover:text-foreground"
                  >
                    <X aria-hidden="true" className="size-3" />
                  </button>
                </span>
              )}
            </div>
          ) : null}
        </div>

        {hasActiveFilters ? (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-6 px-2 text-xs text-muted-foreground hover:text-foreground"
            onClick={() => onChange(defaultFilters)}
          >
            <X aria-hidden="true" className="size-3 me-1" />
            {t("bloodBank.resetAllFilters", "Reset all filters")}
          </Button>
        ) : null}
      </div>
    </section>
  );
}
