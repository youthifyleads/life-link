import { Plus, RotateCcw, Search } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { egyptGovernorates, getGovernorateLabel } from "@/features/admin/components/governorates";

import { AdminPageFrame } from "@/features/admin/components/admin-page-frame";
import { useAdminHospitals } from "@/features/admin/hooks/use-admin";
import { HospitalDetailsDialog } from "@/features/admin/hospitals/hospital-details-dialog";
import { HospitalFormDialog } from "@/features/admin/hospitals/hospital-form-dialog";
import { HospitalsTable } from "@/features/admin/hospitals/hospitals-table";
import type { AdminHospital, HospitalFilters } from "@/features/admin/types/admin.types";
import { LoadingState } from "@/shared/components/feedback/system-states";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";

const initialFilters: HospitalFilters = {
  search: "",
  governorate: "all",
  status: "all",
};

export function HospitalsPage() {
  const { t } = useTranslation();
  const [filters, setFilters] = useState<HospitalFilters>(initialFilters);
  const [formOpen, setFormOpen] = useState(false);
  const [selectedHospitalToEdit, setSelectedHospitalToEdit] = useState<AdminHospital | null>(null);
  const [selectedHospitalToView, setSelectedHospitalToView] = useState<AdminHospital | null>(null);
  const [viewOpen, setViewOpen] = useState(false);

  const { data: hospitals, isLoading } = useAdminHospitals(filters);

  const handleOpenCreate = () => {
    setSelectedHospitalToEdit(null);
    setFormOpen(true);
  };

  const handleOpenEdit = (hospital: AdminHospital) => {
    setSelectedHospitalToEdit(hospital);
    setFormOpen(true);
  };

  const handleOpenView = (hospital: AdminHospital) => {
    setSelectedHospitalToView(hospital);
    setViewOpen(true);
  };

  return (
    <AdminPageFrame
      title={t("admin.hospitalsDirectoryTitle", "Hospitals Management")}
      description={t(
        "admin.hospitalsDirectoryDesc",
        "Manage healthcare facility records, regional governorates, emergency contact channels, and facility access states.",
      )}
      breadcrumbs={[
        { label: t("nav.administration", "Administration") },
        { label: t("nav.hospitals", "Hospitals") },
      ]}
      actions={
        <Button onClick={handleOpenCreate} size="sm" className="gap-1.5">
          <Plus className="size-4" aria-hidden="true" />
          <span>{t("admin.registerHospitalAction", "Register Hospital")}</span>
        </Button>
      }
    >
      <div className="space-y-6">
        {/* Filter bar */}
        <div className="rounded-lg border border-border bg-card p-4 shadow-sm">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <div className="relative sm:col-span-2">
              <Search className="absolute start-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={filters.search}
                onChange={(e) =>
                  setFilters({ ...filters, search: e.target.value })
                }
                placeholder={t("admin.searchHospitalsPlaceholder", "Search hospitals by name, code, address...")}
                className="ps-9"
              />
            </div>

            <div>
              <select
                value={filters.governorate}
                onChange={(e) =>
                  setFilters({ ...filters, governorate: e.target.value })
                }
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                aria-label={t("common.governorate", "Filter by governorate")}
              >
                <option value="all">{t("common.allGovernorates", "All Governorates")}</option>
                {egyptGovernorates.map((governorate) => (
                  <option key={governorate} value={governorate}>{getGovernorateLabel(governorate)}</option>
                ))}
              </select>
            </div>

            <div>
              <select
                value={filters.status}
                onChange={(e) =>
                  setFilters({
                    ...filters,
                    status: e.target.value as "active" | "inactive" | "all",
                  })
                }
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                aria-label={t("common.status", "Filter by status")}
              >
                <option value="all">{t("common.allStatuses", "All Statuses")}</option>
                <option value="active">{t("common.active", "Active Facilities")}</option>
                <option value="inactive">{t("common.inactive", "Inactive Facilities")}</option>
              </select>
            </div>
          </div>

          <div className="mt-3 flex justify-end border-t border-border pt-3">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => setFilters(initialFilters)}
              className="h-7 text-xs gap-1.5"
            >
              <RotateCcw className="size-3" aria-hidden="true" />
              <span>{t("common.reset", "Reset Filters")}</span>
            </Button>
          </div>
        </div>

        {isLoading || !hospitals ? (
          <LoadingState label={t("common.loadingRecords", "Loading hospital facilities…")} rows={6} />
        ) : (
          <HospitalsTable
            hospitals={hospitals}
            onView={handleOpenView}
            onEdit={handleOpenEdit}
          />
        )}
      </div>

      <HospitalFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        hospitalToEdit={selectedHospitalToEdit}
      />

      <HospitalDetailsDialog
        hospital={selectedHospitalToView}
        open={viewOpen}
        onOpenChange={setViewOpen}
        onEdit={handleOpenEdit}
      />
    </AdminPageFrame>
  );
}
