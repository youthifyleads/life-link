import { Edit, Eye, Power, PowerOff } from "lucide-react";
import { useTranslation } from "react-i18next";

import { AdminStatusBadge } from "@/features/admin/components/admin-status-badge";
import { useToggleBloodBankStatus } from "@/features/admin/hooks/use-admin";
import type { AdminBloodBank } from "@/features/admin/types/admin.types";
import { StatusIndicator } from "@/shared/components/clinical/status-indicator";
import { Button } from "@/shared/components/ui/button";

interface BloodBanksTableProps {
  bloodBanks: AdminBloodBank[];
  onView: (bloodBank: AdminBloodBank) => void;
  onEdit: (bloodBank: AdminBloodBank) => void;
}

export function BloodBanksTable({
  bloodBanks,
  onView,
  onEdit,
}: BloodBanksTableProps) {
  const { t } = useTranslation();
  const toggleMutation = useToggleBloodBankStatus();

  const handleToggle = (bloodBank: AdminBloodBank) => {
    void toggleMutation.mutateAsync(bloodBank.id);
  };

  if (bloodBanks.length === 0) {
    return (
      <div className="overflow-hidden rounded-lg border border-border/80 bg-card p-12 text-center shadow-2xs">
        <h3 className="text-sm font-semibold text-foreground">
          {t(
            "admin.noUsersFoundTitle",
            "No blood bank facilities match your criteria",
          )}
        </h3>
        <p className="mt-1 text-xs text-muted-foreground">
          {t(
            "admin.noUsersFoundDesc",
            "Try adjusting your search terms or governorate filter.",
          )}
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-lg border border-border/80 bg-card shadow-2xs">
      <div
        tabIndex={0}
        role="region"
        aria-label={t("admin.bloodBanksTableLabel")}
        className="overflow-x-auto"
      >
        <table className="clinical-table">
          <thead className="border-b border-border bg-surface-subtle font-semibold text-muted-foreground">
            <tr>
              <th scope="col" className="px-4 py-3 text-start">
                {t("admin.auditEntityIdCol", "Blood Bank ID")}
              </th>
              <th scope="col" className="px-4 py-3 text-start">
                {t("admin.userFullNameCol", "Name")}
              </th>
              <th scope="col" className="px-4 py-3 text-start">
                {t("common.governorate", "Governorate")}
              </th>
              <th scope="col" className="px-4 py-3 text-start">
                {t("common.address", "Address")}
              </th>
              <th scope="col" className="px-4 py-3 text-start">
                {t("common.phone", "Phone")}
              </th>
              <th scope="col" className="px-4 py-3 text-start">
                {t("common.status", "Status")}
              </th>
              <th scope="col" className="px-4 py-3 text-center">
                {t("admin.totalUsers", "Staff")}
              </th>
              <th scope="col" className="px-4 py-3 text-start">
                {t("nav.inventory", "Inventory Posture")}
              </th>
              <th scope="col" className="px-4 py-3 text-end">
                {t("admin.userActionsCol", "Actions")}
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {bloodBanks.map((bloodBank) => (
              <tr
                key={bloodBank.id}
                className="transition-colors hover:bg-muted/30 focus-within:bg-muted/30"
              >
                <td className="whitespace-nowrap px-4 py-3 font-mono text-[11px] font-semibold text-rose-700">
                  <button
                    type="button"
                    onClick={() => onView(bloodBank)}
                    className="hover:underline focus-visible:outline-none"
                    title={t("common.viewDetails", "View facility details")}
                  >
                    <bdi dir="ltr">{bloodBank.facilityCode}</bdi>
                  </button>
                </td>
                <td className="whitespace-nowrap px-4 py-3 font-semibold text-foreground">
                  {bloodBank.name}
                </td>
                <td className="whitespace-nowrap px-4 py-3 text-muted-foreground">
                  {bloodBank.governorate}
                </td>
                <td className="px-4 py-3 text-muted-foreground max-w-xs truncate">
                  {bloodBank.address}
                </td>
                <td className="whitespace-nowrap px-4 py-3 font-mono text-[11px] text-muted-foreground">
                  <bdi dir="ltr">{bloodBank.phone}</bdi>
                </td>
                <td className="whitespace-nowrap px-4 py-3">
                  <AdminStatusBadge status={bloodBank.status} />
                </td>
                <td className="whitespace-nowrap px-4 py-3 text-center font-medium text-foreground">
                  <bdi dir="ltr">{bloodBank.staffCount}</bdi>
                </td>
                <td className="whitespace-nowrap px-4 py-3">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-semibold text-foreground">
                      <bdi dir="ltr">
                        {bloodBank.inventorySummary.totalAvailable}
                      </bdi>{" "}
                      {t("common.units", "units")}
                    </span>
                    <StatusIndicator
                      tone={
                        bloodBank.inventorySummary.posture === "optimal"
                          ? "success"
                          : bloodBank.inventorySummary.posture === "warning"
                            ? "warning"
                            : "danger"
                      }
                      className="uppercase"
                      indicator={
                        bloodBank.inventorySummary.posture === "optimal"
                          ? "✅"
                          : bloodBank.inventorySummary.posture === "warning"
                            ? "⚠️"
                            : "🚨"
                      }
                    >
                      {bloodBank.inventorySummary.posture}
                    </StatusIndicator>
                  </div>
                </td>
                <td className="whitespace-nowrap px-4 py-3 text-end">
                  <div className="inline-flex items-center gap-1 justify-end">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => onView(bloodBank)}
                      className="size-7 p-0"
                      title={t("common.view", "View blood bank profile")}
                      aria-label={`${t("common.view", "View")} ${bloodBank.name}`}
                    >
                      <Eye className="size-3.5" aria-hidden="true" />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => onEdit(bloodBank)}
                      className="size-7 p-0"
                      title={t("common.edit", "Edit blood bank details")}
                      aria-label={`${t("common.edit", "Edit")} ${bloodBank.name}`}
                    >
                      <Edit className="size-3.5" aria-hidden="true" />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => handleToggle(bloodBank)}
                      disabled={toggleMutation.isPending}
                      className={`size-7 p-0 ${
                        bloodBank.status === "active"
                          ? "text-rose-700 hover:text-rose-800"
                          : "text-emerald-700 hover:text-emerald-800"
                      }`}
                      title={
                        bloodBank.status === "active"
                          ? t(
                              "admin.deactivateUserAction",
                              "Deactivate facility",
                            )
                          : t("admin.activateUserAction", "Activate facility")
                      }
                      aria-label={
                        bloodBank.status === "active"
                          ? `${t("admin.deactivateUserAction", "Deactivate")} ${bloodBank.name}`
                          : `${t("admin.activateUserAction", "Activate")} ${bloodBank.name}`
                      }
                    >
                      {bloodBank.status === "active" ? (
                        <PowerOff className="size-3.5" aria-hidden="true" />
                      ) : (
                        <Power className="size-3.5" aria-hidden="true" />
                      )}
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="border-t border-border bg-muted/20 px-4 py-3 text-xs text-muted-foreground">
        {t("hospital.records", "records")}:{" "}
        <bdi dir="ltr">{bloodBanks.length}</bdi>
      </div>
    </div>
  );
}
