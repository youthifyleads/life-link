import { RotateCcw, Search } from "lucide-react";
import { useTranslation } from "react-i18next";

import {
  ALL_BLOOD_GROUPS,
  ALL_COMPONENTS,
} from "@/features/blood-bank/inventory/inventory.mock";
import {
  bloodBankComponentLabels,
  type BloodBankComponent,
  type BloodUnitStatus,
  type ExpiryWindowFilter,
  type InventoryLedgerFilters,
} from "@/features/blood-bank/types/blood-bank.types";
import type { BloodGroup } from "@/shared/components/clinical/clinical.types";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";

interface InventoryFiltersProps {
  filters: InventoryLedgerFilters;
  onChange: (updated: InventoryLedgerFilters) => void;
  onReset: () => void;
}

export function InventoryFilters({
  filters,
  onChange,
  onReset,
}: InventoryFiltersProps) {
  const { t } = useTranslation();

  const statusOptions: { value: BloodUnitStatus | "all"; label: string }[] = [
    { value: "all", label: t("hospital.allStatuses", "All statuses") },
    { value: "available", label: t("status.available", "Available") },
    { value: "reserved", label: t("status.reserved", "Reserved") },
    { value: "allocated", label: t("status.allocated", "Allocated") },
    { value: "quarantined", label: t("status.quarantined", "Quarantined") },
    { value: "expired", label: t("status.expired", "Expired") },
  ];

  const expiryOptions: { value: ExpiryWindowFilter; label: string }[] = [
    { value: "all", label: t("common.all", "All expiry windows") },
    { value: "within_24h", label: "< 24h" },
    { value: "within_48h", label: "< 48h" },
    { value: "within_7d", label: "< 7d" },
    { value: "expired", label: t("status.expired", "Already expired") },
  ];

  const isFiltered =
    filters.search.trim() !== "" ||
    filters.bloodGroup !== "all" ||
    filters.component !== "all" ||
    filters.status !== "all" ||
    filters.expiryWindow !== "all" ||
    filters.sortBy !== "expiry_soonest";

  return (
    <div className="flex flex-col gap-3 border border-border bg-surface p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        {/* Search Input */}
        <div className="relative min-w-[15rem] flex-1">
          <Search
            aria-hidden="true"
            className="pointer-events-none absolute start-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
          />
          <Input
            type="search"
            aria-label={t("bloodBank.searchUnits", "Search units by ID, location, or request")}
            placeholder={t("bloodBank.searchUnits", "Search Unit ID, location, or notes...")}
            value={filters.search}
            onChange={(e) => onChange({ ...filters, search: e.target.value })}
            className="h-9 ps-9 text-xs"
          />
        </div>

        {/* Clear Filters */}
        {isFiltered ? (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onReset}
            className="h-9 text-xs"
          >
            <RotateCcw aria-hidden="true" className="size-3.5" />
            {t("hospital.clearFilters", "Reset filters")}
          </Button>
        ) : null}
      </div>

      {/* Multi-facet Filter Selects */}
      <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-5">
        {/* Blood Group */}
        <div>
          <label htmlFor="filter-blood-group" className="sr-only">
            {t("common.bloodGroup", "Blood group")}
          </label>
          <select
            id="filter-blood-group"
            value={filters.bloodGroup}
            onChange={(e) =>
              onChange({
                ...filters,
                bloodGroup: e.target.value as BloodGroup | "all",
              })
            }
            className="h-8 w-full rounded-none border border-field-stroke bg-background px-2 text-xs text-foreground focus:border-primary focus:outline-none"
          >
            <option value="all">{t("hospital.allBloodGroups", "All blood groups")}</option>
            {ALL_BLOOD_GROUPS.map((g) => (
              <option key={g} value={g}>
                {g}
              </option>
            ))}
          </select>
        </div>

        {/* Component */}
        <div>
          <label htmlFor="filter-component" className="sr-only">
            {t("common.component", "Component")}
          </label>
          <select
            id="filter-component"
            value={filters.component}
            onChange={(e) =>
              onChange({
                ...filters,
                component: e.target.value as BloodBankComponent | "all",
              })
            }
            className="h-8 w-full rounded-none border border-field-stroke bg-background px-2 text-xs text-foreground focus:border-primary focus:outline-none"
          >
            <option value="all">{t("bloodBank.allComponents", "All components")}</option>
            {ALL_COMPONENTS.map((c) => (
              <option key={c} value={c}>
                {bloodBankComponentLabels[c]}
              </option>
            ))}
          </select>
        </div>

        {/* Status */}
        <div>
          <label htmlFor="filter-status" className="sr-only">
            {t("common.status", "Status")}
          </label>
          <select
            id="filter-status"
            value={filters.status}
            onChange={(e) =>
              onChange({
                ...filters,
                status: e.target.value as BloodUnitStatus | "all",
              })
            }
            className="h-8 w-full rounded-none border border-field-stroke bg-background px-2 text-xs text-foreground focus:border-primary focus:outline-none"
          >
            {statusOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        {/* Expiry Window */}
        <div>
          <label htmlFor="filter-expiry" className="sr-only">
            {t("bloodBank.expiry", "Expiry window")}
          </label>
          <select
            id="filter-expiry"
            value={filters.expiryWindow}
            onChange={(e) =>
              onChange({
                ...filters,
                expiryWindow: e.target.value as ExpiryWindowFilter,
              })
            }
            className="h-8 w-full rounded-none border border-field-stroke bg-background px-2 text-xs text-foreground focus:border-primary focus:outline-none"
          >
            {expiryOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        {/* Sort By */}
        <div className="col-span-2 sm:col-span-1">
          <label htmlFor="filter-sort" className="sr-only">
            {t("common.filter", "Sort by")}
          </label>
          <select
            id="filter-sort"
            value={filters.sortBy}
            onChange={(e) =>
              onChange({
                ...filters,
                sortBy: e.target.value as InventoryLedgerFilters["sortBy"],
              })
            }
            className="h-8 w-full rounded-none border border-field-stroke bg-background px-2 text-xs text-foreground focus:border-primary focus:outline-none"
          >
            <option value="expiry_soonest">{t("hospital.requiredSoonest", "Expiry: Soonest first")}</option>
            <option value="expiry_latest">{t("hospital.oldestFirst", "Expiry: Latest first")}</option>
            <option value="collection_newest">{t("hospital.newestFirst", "Collection: Newest first")}</option>
            <option value="id_asc">{t("bloodBank.unitId", "Unit ID: A to Z")}</option>
          </select>
        </div>
      </div>
    </div>
  );
}
