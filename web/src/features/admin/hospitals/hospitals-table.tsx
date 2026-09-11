import { Edit, Eye, Power, PowerOff } from "lucide-react";
import { useTranslation } from "react-i18next";

import { AdminStatusBadge } from "@/features/admin/components/admin-status-badge";
import { useToggleHospitalStatus } from "@/features/admin/hooks/use-admin";
import type { AdminHospital } from "@/features/admin/types/admin.types";
import { Button } from "@/shared/components/ui/button";

interface HospitalsTableProps {
  hospitals: AdminHospital[];
  onView: (hospital: AdminHospital) => void;
  onEdit: (hospital: AdminHospital) => void;
}

export function HospitalsTable({
  hospitals,
  onView,
  onEdit,
}: HospitalsTableProps) {
  const { t } = useTranslation();
  const toggleMutation = useToggleHospitalStatus();

  const handleToggle = (hospital: AdminHospital) => {
    void toggleMutation.mutateAsync(hospital.id);
  };

  if (hospitals.length === 0) {
    return (
      <div className="rounded-lg border border-border bg-card p-12 text-center">
        <h3 className="text-sm font-semibold text-foreground">
          {t("admin.noUsersFoundTitle", "No hospital facilities match your criteria")}
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
    <div className="overflow-hidden rounded-lg border border-border bg-card shadow-sm">
      <div
        tabIndex={0}
        role="region"
        aria-label={t("admin.hospitalsTableLabel")}
        className="overflow-x-auto"
      >
        <table className="w-full text-start text-xs">
          <thead className="border-b border-border bg-muted/40 font-semibold uppercase tracking-wider text-muted-foreground">
            <tr>
              <th scope="col" className="px-4 py-3 text-start">
                {t("admin.auditEntityIdCol", "Hospital ID")}
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
                {t("admin.totalUsers", "Users")}
              </th>
              <th scope="col" className="px-4 py-3 text-center">
                {t("admin.activeBloodRequests", "Active Requests")}
              </th>
              <th scope="col" className="px-4 py-3 text-end">
                {t("admin.userActionsCol", "Actions")}
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {hospitals.map((hospital) => (
              <tr
                key={hospital.id}
                className="transition-colors hover:bg-muted/30 focus-within:bg-muted/30"
              >
                <td className="whitespace-nowrap px-4 py-3 font-mono text-[11px] font-semibold text-primary">
                  <button
                    type="button"
                    onClick={() => onView(hospital)}
                    className="hover:underline focus-visible:outline-none"
                    title={t("common.viewDetails", "View facility details")}
                  >
                    <bdi dir="ltr">{hospital.facilityCode}</bdi>
                  </button>
                </td>
                <td className="whitespace-nowrap px-4 py-3 font-semibold text-foreground">
                  {hospital.name}
                </td>
                <td className="whitespace-nowrap px-4 py-3 text-muted-foreground">
                  {hospital.governorate}
                </td>
                <td className="px-4 py-3 text-muted-foreground max-w-xs truncate">
                  {hospital.address}
                </td>
                <td className="whitespace-nowrap px-4 py-3 font-mono text-[11px] text-muted-foreground">
                  <bdi dir="ltr">{hospital.phone}</bdi>
                </td>
                <td className="whitespace-nowrap px-4 py-3">
                  <AdminStatusBadge status={hospital.status} />
                </td>
                <td className="whitespace-nowrap px-4 py-3 text-center font-medium text-foreground">
                  <bdi dir="ltr">{hospital.userCount}</bdi>
                </td>
                <td className="whitespace-nowrap px-4 py-3 text-center">
                  <span
                    className={`inline-flex rounded-full px-2 py-0.5 text-xs font-semibold ${
                      hospital.activeRequestsCount > 0
                        ? "bg-amber-100 text-amber-900"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    <bdi dir="ltr">{hospital.activeRequestsCount}</bdi>
                  </span>
                </td>
                <td className="whitespace-nowrap px-4 py-3 text-end">
                  <div className="inline-flex items-center gap-1 justify-end">
                    <Button
                      type="button"
                      variant="secondary"
                      size="sm"
                      onClick={() => onView(hospital)}
                      className="size-7 p-0"
                      title={t("common.view", "View facility profile")}
                      aria-label={`${t("common.view", "View")} ${hospital.name}`}
                    >
                      <Eye className="size-3.5" aria-hidden="true" />
                    </Button>
                    <Button
                      type="button"
                      variant="secondary"
                      size="sm"
                      onClick={() => onEdit(hospital)}
                      className="size-7 p-0"
                      title={t("common.edit", "Edit facility details")}
                      aria-label={`${t("common.edit", "Edit")} ${hospital.name}`}
                    >
                      <Edit className="size-3.5" aria-hidden="true" />
                    </Button>
                    <Button
                      type="button"
                      variant="secondary"
                      size="sm"
                      onClick={() => handleToggle(hospital)}
                      disabled={toggleMutation.isPending}
                      className={`size-7 p-0 ${
                        hospital.status === "active"
                          ? "text-rose-700 hover:text-rose-800"
                          : "text-emerald-700 hover:text-emerald-800"
                      }`}
                      title={
                        hospital.status === "active"
                          ? t("admin.deactivateUserAction", "Deactivate facility")
                          : t("admin.activateUserAction", "Activate facility")
                      }
                      aria-label={
                        hospital.status === "active"
                          ? `${t("admin.deactivateUserAction", "Deactivate")} ${hospital.name}`
                          : `${t("admin.activateUserAction", "Activate")} ${hospital.name}`
                      }
                    >
                      {hospital.status === "active" ? (
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
        {t("hospital.records", "records")}: <bdi dir="ltr">{hospitals.length}</bdi>
      </div>
    </div>
  );
}
