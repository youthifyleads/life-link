import { RotateCcw, Search } from "lucide-react";
import { useTranslation } from "react-i18next";

import {
  useAdminBloodBanks,
  useAdminHospitals,
  useAdminUsers,
} from "@/features/admin/hooks/use-admin";
import type { AuditFilters } from "@/features/admin/types/admin.types";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";

interface AuditFiltersProps {
  filters: AuditFilters;
  onFilterChange: (filters: AuditFilters) => void;
  onReset: () => void;
}

export function AuditFilters({
  filters,
  onFilterChange,
  onReset,
}: AuditFiltersProps) {
  const { t } = useTranslation();
  const { data: users } = useAdminUsers();
  const { data: hospitals } = useAdminHospitals();
  const { data: bloodBanks } = useAdminBloodBanks();

  return (
    <div className="rounded-lg border border-border bg-card p-4 shadow-sm">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
        {/* Search */}
        <div className="relative sm:col-span-2 lg:col-span-2">
          <Search className="absolute start-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={filters.search}
            onChange={(e) =>
              onFilterChange({ ...filters, search: e.target.value })
            }
            placeholder={t("admin.searchAuditPlaceholder", "Search audit records by actor, action, entity ID...")}
            className="ps-9"
          />
        </div>

        {/* Actor / User filter */}
        <div>
          <select
            value={filters.actor}
            onChange={(e) =>
              onFilterChange({ ...filters, actor: e.target.value })
            }
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            aria-label={t("admin.auditActorCol", "Filter by actor")}
          >
            <option value="all">{t("common.allRoles", "All Actors")}</option>
            {users?.map((u) => (
              <option key={u.id} value={u.id}>
                {u.fullName} ({t(`roles.${u.primaryRole}`, u.primaryRole.replace(/_/g, " "))})
              </option>
            ))}
          </select>
        </div>

        {/* Organization filter */}
        <div>
          <select
            value={filters.organization}
            onChange={(e) =>
              onFilterChange({ ...filters, organization: e.target.value })
            }
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            aria-label={t("admin.auditOrgCol", "Filter by organization")}
          >
            <option value="all">{t("common.allOrganizations", "All Organizations")}</option>
            <option value="Blood Bank Platform Administration">
              {t("admin.operations", "Platform Administration")}
            </option>
            <optgroup label={t("admin.hospitalsTitle", "Hospitals")}>
              {hospitals?.map((h) => (
                <option key={h.id} value={h.name}>
                  {h.name}
                </option>
              ))}
            </optgroup>
            <optgroup label={t("admin.bloodBanksTitle", "Blood Banks")}>
              {bloodBanks?.map((b) => (
                <option key={b.id} value={b.name}>
                  {b.name}
                </option>
              ))}
            </optgroup>
          </select>
        </div>

        {/* Date range filter */}
        <div>
          <select
            value={filters.dateRange}
            onChange={(e) =>
              onFilterChange({
                ...filters,
                dateRange: e.target.value as AuditFilters["dateRange"],
              })
            }
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            aria-label={t("common.date", "Filter by date range")}
          >
            <option value="all">{t("common.all", "All Time")}</option>
            <option value="today">{t("common.today", "Today (Last 24h)")}</option>
            <option value="past_7_days">{t("common.thisWeek", "Past 7 Days")}</option>
            <option value="past_30_days">{t("common.thisMonth", "Past 30 Days")}</option>
          </select>
        </div>
      </div>

      <div className="mt-3 flex flex-wrap items-center justify-between gap-3 border-t border-border pt-3 text-xs">
        <div className="flex items-center gap-2 text-muted-foreground">
          <span>{t("common.filterBy", "Sort")}:</span>
          <select
            value={filters.sortBy}
            onChange={(e) =>
              onFilterChange({
                ...filters,
                sortBy: e.target.value as AuditFilters["sortBy"],
              })
            }
            className="rounded border border-input bg-background px-2 py-1 text-xs text-foreground focus-visible:outline-none"
            aria-label={t("common.filterBy", "Sort order")}
          >
            <option value="timestamp_desc">{t("hospital.newestFirst", "Newest First")}</option>
            <option value="timestamp_asc">{t("hospital.oldestFirst", "Oldest First")}</option>
          </select>
        </div>

        <Button
          type="button"
          variant="secondary"
          size="sm"
          onClick={onReset}
          className="h-7 text-xs gap-1.5"
        >
          <RotateCcw className="size-3" aria-hidden="true" />
          <span>{t("common.reset", "Reset Filters")}</span>
        </Button>
      </div>
    </div>
  );
}
