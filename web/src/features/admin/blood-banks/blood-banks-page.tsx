import { Plus, RotateCcw, Search } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { egyptGovernorates, getGovernorateLabel } from "@/features/admin/components/governorates";

import { BloodBankDetailsDialog } from "@/features/admin/blood-banks/blood-bank-details-dialog";
import { BloodBankFormDialog } from "@/features/admin/blood-banks/blood-bank-form-dialog";
import { BloodBanksTable } from "@/features/admin/blood-banks/blood-banks-table";
import { AdminPageFrame } from "@/features/admin/components/admin-page-frame";
import { useAdminBloodBanks } from "@/features/admin/hooks/use-admin";
import type { AdminBloodBank, BloodBankFilters } from "@/features/admin/types/admin.types";
import { LoadingState } from "@/shared/components/feedback/system-states";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";

const initialFilters: BloodBankFilters = {
  search: "",
  governorate: "all",
  status: "all",
};

export function BloodBanksPage() {
  const { t } = useTranslation();
  const [filters, setFilters] = useState<BloodBankFilters>(initialFilters);
  const [formOpen, setFormOpen] = useState(false);
  const [selectedBloodBankToEdit, setSelectedBloodBankToEdit] = useState<AdminBloodBank | null>(null);
  const [selectedBloodBankToView, setSelectedBloodBankToView] = useState<AdminBloodBank | null>(null);
  const [viewOpen, setViewOpen] = useState(false);

  const { data: bloodBanks, isLoading } = useAdminBloodBanks(filters);

  const handleOpenCreate = () => {
    setSelectedBloodBankToEdit(null);
    setFormOpen(true);
  };

  const handleOpenEdit = (bloodBank: AdminBloodBank) => {
    setSelectedBloodBankToEdit(bloodBank);
    setFormOpen(true);
  };

  const handleOpenView = (bloodBank: AdminBloodBank) => {
    setSelectedBloodBankToView(bloodBank);
    setViewOpen(true);
  };

  return (
    <AdminPageFrame
      title={t("admin.bloodBanksDirectoryTitle", "Blood Banks Management")}
      description={t(
        "admin.bloodBanksDirectoryDesc",
        "Manage regional blood processing centers, storage repositories, staff allocations, and live cold-chain inventory posture.",
      )}
      breadcrumbs={[
        { label: t("nav.administration", "Administration") },
        { label: t("nav.bloodBanks", "Blood Banks") },
      ]}
      actions={
        <Button onClick={handleOpenCreate} size="sm" className="gap-1.5">
          <Plus className="size-4" aria-hidden="true" />
          <span>{t("admin.registerBloodBankAction", "Register Blood Bank")}</span>
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
                placeholder={t("admin.searchBloodBanksPlaceholder", "Search blood banks by name, code, address...")}
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

        {isLoading || !bloodBanks ? (
          <LoadingState label={t("common.loadingRecords", "Loading blood bank facilities…")} rows={6} />
        ) : (
          <BloodBanksTable
            bloodBanks={bloodBanks}
            onView={handleOpenView}
            onEdit={handleOpenEdit}
          />
        )}
      </div>

      <BloodBankFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        bloodBankToEdit={selectedBloodBankToEdit}
      />

      <BloodBankDetailsDialog
        bloodBank={selectedBloodBankToView}
        open={viewOpen}
        onOpenChange={setViewOpen}
        onEdit={handleOpenEdit}
      />
    </AdminPageFrame>
  );
}
