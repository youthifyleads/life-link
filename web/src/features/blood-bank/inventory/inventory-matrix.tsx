import { AlertOctagon, AlertTriangle, CheckCircle2 } from "lucide-react";
import { useTranslation } from "react-i18next";

import { ALL_BLOOD_GROUPS } from "@/features/blood-bank/inventory/inventory.mock";
import { bloodBankComponentLabels } from "@/features/blood-bank/types/blood-bank.types";
import type {
  BloodBankComponent,
  BloodStockMatrixCell,
  StockCondition,
} from "@/features/blood-bank/types/blood-bank.types";
import { BloodGroupBadge } from "@/shared/components/clinical/blood-group-badge";
import type { BloodGroup } from "@/shared/components/clinical/clinical.types";

interface InventoryMatrixProps {
  cells: BloodStockMatrixCell[];
  selectedGroup: BloodGroup | "all";
  onSelectGroup: (group: BloodGroup | "all") => void;
}

const primaryComponents: BloodBankComponent[] = [
  "red_cells",
  "platelets",
  "fresh_frozen_plasma",
  "whole_blood",
];

export function InventoryMatrix({
  cells,
  selectedGroup,
  onSelectGroup,
}: InventoryMatrixProps) {
  const { t } = useTranslation();

  // Helper to find a specific cell
  const getCell = (group: BloodGroup, comp: BloodBankComponent) => {
    return cells.find((c) => c.bloodGroup === group && c.component === comp);
  };

  // Group summary calculations
  const getGroupSummary = (group: BloodGroup) => {
    const groupCells = cells.filter((c) => c.bloodGroup === group);
    const totalAvailable = groupCells.reduce((sum, c) => sum + c.available, 0);
    const totalReserved = groupCells.reduce((sum, c) => sum + c.reserved, 0);
    const totalExpiring = groupCells.reduce((sum, c) => sum + c.expiringSoon, 0);

    let condition: StockCondition = "optimal";
    if (totalAvailable === 0 || (group === "O−" && totalAvailable <= 3) || (group === "AB−" && totalAvailable === 0)) {
      condition = "critical";
    } else if (totalAvailable <= 2) {
      condition = "warning";
    }

    return { totalAvailable, totalReserved, totalExpiring, condition };
  };

  return (
    <section aria-labelledby="stock-matrix-heading" className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 id="stock-matrix-heading" className="text-base font-semibold">
            {t("bloodBank.matrixTitle", "Blood Stock Matrix")}
          </h2>
          <p className="mt-0.5 text-xs text-muted-foreground">
            {t("bloodBank.matrixSubtitle", "Multi-component ABO/Rh cross-matrix. Click any group row to filter the detailed unit ledger.")}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-4 text-xs">
          <span className="flex items-center gap-1.5 text-muted-foreground">
            <CheckCircle2 aria-hidden="true" className="size-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>{t("common.approved", "Optimal")}</span>
          </span>
          <span className="flex items-center gap-1.5 text-muted-foreground">
            <AlertTriangle aria-hidden="true" className="size-3.5 text-amber-800 dark:text-amber-300" />
            <span>{t("bloodBank.criticalGroups", "Low Stock")}</span>
          </span>
          <span className="flex items-center gap-1.5 text-muted-foreground">
            <AlertOctagon aria-hidden="true" className="size-3.5 text-emergency" />
            <span>{t("healthcare.criticalLowStock", "Critical Shortage")}</span>
          </span>
          {selectedGroup !== "all" ? (
            <button
              type="button"
              onClick={() => onSelectGroup("all")}
              className="font-medium text-primary hover:underline focus:outline-none"
            >
              {t("hospital.clearFilters", "Reset group filter")}
            </button>
          ) : null}
        </div>
      </div>

      <div
        tabIndex={0}
        role="region"
        aria-label={t("bloodBank.matrixTitle", "Blood stock matrix table across all ABO and Rh groups")}
        className="overflow-x-auto border border-border"
      >
        <table className="w-full min-w-[46rem] border-collapse text-start text-xs">
          <thead className="border-b border-border bg-surface-subtle font-semibold text-muted-foreground">
            <tr>
              <th scope="col" className="px-3.5 py-2.5 text-start">
                {t("common.bloodGroup", "ABO/Rh Group")}
              </th>
              {primaryComponents.map((comp) => (
                <th key={comp} scope="col" className="px-3.5 py-2.5 text-center">
                  {bloodBankComponentLabels[comp]}
                </th>
              ))}
              <th scope="col" className="px-3.5 py-2.5 text-center font-bold">
                {t("bloodBank.totalAvailable", "Total Available")}
              </th>
              <th scope="col" className="px-3.5 py-2.5 text-center">
                {t("common.status", "Stock Condition")}
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border bg-surface">
            {ALL_BLOOD_GROUPS.map((group) => {
              const summary = getGroupSummary(group);
              const isSelected = selectedGroup === group;

              return (
                <tr
                  key={group}
                  onClick={() => onSelectGroup(isSelected ? "all" : group)}
                  className={`cursor-pointer transition-colors hover:bg-surface-subtle/70 ${
                    isSelected ? "bg-primary/10 font-medium" : ""
                  }`}
                >
                  {/* Group Badge */}
                  <td className="px-3.5 py-2.5 text-start font-medium">
                    <div className="flex items-center gap-2">
                      <BloodGroupBadge group={group} />
                      <span className="text-muted-foreground">
                        {group === "O−" ? "(Universal)" : group === "AB+" ? "(Universal Plt)" : ""}
                      </span>
                    </div>
                  </td>

                  {/* Components */}
                  {primaryComponents.map((comp) => {
                    const cell = getCell(group, comp);
                    const avail = cell?.available ?? 0;
                    const res = cell?.reserved ?? 0;
                    const exp = cell?.expiringSoon ?? 0;

                    return (
                      <td key={comp} className="px-3.5 py-2.5 text-center">
                        <div className="inline-flex flex-col items-center">
                          <span
                            className={`tabular-nums font-semibold ${
                              avail === 0
                                ? "text-muted-foreground"
                                : cell?.condition === "critical"
                                  ? "text-emergency"
                                  : cell?.condition === "warning"
                                    ? "text-amber-800 dark:text-amber-300"
                                    : "text-foreground"
                            }`}
                          >
                            <bdi dir="ltr">{avail}</bdi> {t("healthcare.available", "avail")}
                          </span>
                          <span className="text-[10px] text-muted-foreground">
                            {res > 0 ? <><bdi dir="ltr">{res}</bdi> {t("healthcare.reserved", "res")}</> : ""}
                            {res > 0 && exp > 0 ? " · " : ""}
                            {exp > 0 ? (
                              <span className="text-amber-800 dark:text-amber-300 font-medium">
                                <bdi dir="ltr">{exp}</bdi> {t("healthcare.expiringSoon", "exp")}
                              </span>
                            ) : (
                              ""
                            )}
                            {res === 0 && exp === 0 ? "—" : ""}
                          </span>
                        </div>
                      </td>
                    );
                  })}

                  {/* Total Available in Group */}
                  <td className="px-3.5 py-2.5 text-center font-bold tabular-nums">
                    <span
                      className={`text-sm ${
                        summary.totalAvailable === 0
                          ? "text-emergency"
                          : summary.condition === "warning"
                            ? "text-amber-800 dark:text-amber-300"
                            : "text-foreground"
                      }`}
                    >
                      <bdi dir="ltr">{summary.totalAvailable}</bdi>
                    </span>
                  </td>

                  {/* Condition Badge */}
                  <td className="px-3.5 py-2.5 text-center">
                    {summary.condition === "critical" ? (
                      <span className="inline-flex items-center gap-1 rounded-none border border-emergency/30 bg-emergency-subtle px-2 py-0.5 text-[11px] font-semibold text-emergency">
                        <AlertOctagon aria-hidden="true" className="size-3" />
                        {t("healthcare.criticalLowStock", "Critical Shortage")}
                      </span>
                    ) : summary.condition === "warning" ? (
                      <span className="inline-flex items-center gap-1 rounded-none border border-amber-500/30 bg-amber-500/10 px-2 py-0.5 text-[11px] font-semibold text-amber-900 dark:text-amber-300">
                        <AlertTriangle aria-hidden="true" className="size-3" />
                        {t("bloodBank.criticalGroups", "Low Stock")}
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 rounded-none border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 text-[11px] font-semibold text-emerald-700 dark:text-emerald-400">
                        <CheckCircle2 aria-hidden="true" className="size-3" />
                        {t("common.approved", "Optimal")}
                      </span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}
