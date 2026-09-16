import { RotateCcw, Search } from "lucide-react";
import { useTranslation } from "react-i18next";

import {
  useAdminBloodBanks,
  useAdminHospitals,
} from "@/features/admin/hooks/use-admin";
import type { UserFilters } from "@/features/admin/types/admin.types";
import type { UserRole } from "@/features/authentication/model/auth.types";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";

interface UsersFiltersProps {
  filters: UserFilters;
  onFilterChange: (filters: UserFilters) => void;
  onReset: () => void;
}

export function UsersFilters({
  filters,
  onFilterChange,
  onReset,
}: UsersFiltersProps) {
  const { t } = useTranslation();
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
            placeholder={t("admin.searchUsersPlaceholder", "Search users by name, email, ID...")}
            className="ps-9"
          />
        </div>

        {/* Role Filter */}
        <div>
          <select
            value={filters.role}
            onChange={(e) =>
              onFilterChange({
                ...filters,
                role: e.target.value as UserRole | "all",
              })
            }
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            aria-label={t("common.filterBy", "Filter by role")}
          >
            <option value="all">{t("common.allRoles", "All Roles")}</option>
            <option value="admin">{t("roles.admin", "System Administrator")}</option>
            <option value="hospital_staff">{t("roles.hospital_staff", "Hospital Staff")}</option>
            <option value="blood_bank_staff">{t("roles.blood_bank_staff", "Blood Bank Staff")}</option>
            <option value="medical_lead">{t("roles.medical_lead", "Medical Lead")}</option>
            <option value="platform_support">{t("roles.platform_support", "Platform Support")}</option>
            <option value="donor">{t("roles.donor", "Donor")}</option>
            <option value="caregiver">{t("roles.caregiver", "Caregiver")}</option>
          </select>
        </div>

        {/* Organization Filter */}
        <div>
          <select
            value={filters.organization}
            onChange={(e) =>
              onFilterChange({
                ...filters,
                organization: e.target.value,
              })
            }
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            aria-label={t("common.facility", "Filter by organization")}
          >
            <option value="all">{t("common.allOrganizations", "All Organizations")}</option>
            <optgroup label={t("nav.administration", "Platform")}>
              <option value="platform-administration">
                {t("admin.operations", "Platform Administration")}
              </option>
            </optgroup>
            <optgroup label={t("admin.hospitalsTitle", "Hospitals")}>
              {hospitals?.map((h) => (
                <option key={h.id} value={h.id}>
                  {h.name}
                </option>
              ))}
            </optgroup>
            <optgroup label={t("admin.bloodBanksTitle", "Blood Banks")}>
              {bloodBanks?.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name}
                </option>
              ))}
            </optgroup>
          </select>
        </div>

        {/* Status Filter */}
        <div>
          <select
            value={filters.status}
            onChange={(e) =>
              onFilterChange({
                ...filters,
                status: e.target.value as "active" | "inactive" | "all",
              })
            }
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            aria-label={t("common.status", "Filter by status")}
          >
            <option value="all">{t("common.allStatuses", "All Statuses")}</option>
            <option value="active">{t("common.active", "Active Accounts")}</option>
            <option value="inactive">{t("common.inactive", "Inactive Accounts")}</option>
          </select>
        </div>
      </div>

      <div className="mt-3 flex flex-wrap items-center justify-between gap-3 border-t border-border pt-3 text-xs">
        <div className="flex items-center gap-2 text-muted-foreground">
          <span>{t("common.filterBy", "Sort by")}:</span>
          <select
            value={filters.sortBy}
            onChange={(e) =>
              onFilterChange({
                ...filters,
                sortBy: e.target.value as UserFilters["sortBy"],
              })
            }
            className="rounded border border-input bg-background px-2 py-1 text-xs text-foreground focus-visible:outline-none"
            aria-label={t("common.filterBy", "Sort users")}
          >
            <option value="name_asc">{t("admin.sortNameAscending")}</option>
            <option value="created_desc">{t("admin.userCreatedCol", "Created Date")} ({t("hospital.newestFirst", "Newest")})</option>
            <option value="activity_desc">{t("admin.userLastActivityCol", "Recent Activity")}</option>
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
