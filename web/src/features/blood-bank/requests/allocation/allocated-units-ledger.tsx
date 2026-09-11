import { Check, LoaderCircle, PackageMinus, ShieldAlert } from "lucide-react";
import { useTranslation } from "react-i18next";

import { bloodBankComponentLabels } from "@/features/blood-bank/types/blood-bank.types";
import type {
  BloodBankComponent,
  BloodBankRequest,
  BloodUnit,
} from "@/features/blood-bank/types/blood-bank.types";
import { BloodGroupBadge } from "@/shared/components/clinical/blood-group-badge";
import type { BloodGroup } from "@/shared/components/clinical/clinical.types";
import { Button } from "@/shared/components/ui/button";

interface AllocatedUnitsLedgerProps {
  request: BloodBankRequest;
  allUnits: BloodUnit[];
  isPending: boolean;
  activeUnitId?: string;
  onRemoveUnit: (unitId: string) => void;
}

export function AllocatedUnitsLedger({
  request,
  allUnits,
  isPending,
  activeUnitId,
  onRemoveUnit,
}: AllocatedUnitsLedgerProps) {
  const { t } = useTranslation();
  const allocatedUnits = allUnits.filter((u) =>
    request.allocatedUnitIds.includes(u.id),
  );
  const requiredCount = request.quantity;
  const allocatedCount = allocatedUnits.length;
  const isFulfilled = allocatedCount >= requiredCount;
  const remainingCount = Math.max(0, requiredCount - allocatedCount);
  const percentage = Math.min(
    100,
    Math.round((allocatedCount / requiredCount) * 100),
  );

  return (
    <section
      aria-labelledby="allocated-units-heading"
      className="border border-border bg-surface p-5"
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 id="allocated-units-heading" className="text-base font-semibold">
            {t("bloodBank.allocatedUnits", "Allocated blood units")}
          </h2>
          <p className="mt-0.5 text-xs text-muted-foreground">
            {t("bloodBank.allocatedUnitsDesc", {
              id: request.id,
              defaultValue: `Specific units assigned to fulfill hospital requisition ${request.id}.`,
            })}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span
            className={`inline-flex items-center gap-1.5 rounded border px-2.5 py-1 text-xs font-semibold ${
              isFulfilled
                ? "border-success/30 bg-success-subtle text-success"
                : "border-warning/30 bg-warning-subtle text-[#6f4a00]"
            }`}
          >
            {isFulfilled ? (
              <Check aria-hidden="true" className="size-3.5" />
            ) : (
              <ShieldAlert aria-hidden="true" className="size-3.5" />
            )}
            {t("bloodBank.allocatedOf", {
              count: allocatedCount,
              total: requiredCount,
              defaultValue: `${allocatedCount} / ${requiredCount} units allocated`,
            })}
          </span>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mt-4">
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>{t("bloodBank.allocationProgress", "Allocation progress")}</span>
          <span className="font-semibold tabular-nums"><bdi dir="ltr">{percentage}%</bdi></span>
        </div>
        <div
          className="mt-1.5 flex h-2 w-full overflow-hidden rounded-full bg-surface-subtle"
          role="progressbar"
          aria-label={t("bloodBank.allocationProgress", "Blood unit allocation progress")}
          aria-valuenow={allocatedCount}
          aria-valuemin={0}
          aria-valuemax={requiredCount}
        >
          <div
            className={`h-full transition-all duration-300 ${
              isFulfilled ? "bg-success" : "bg-primary"
            }`}
            style={{ width: `${percentage}%` }}
          />
        </div>
        {!isFulfilled ? (
          <p className="mt-1.5 text-xs text-muted-foreground">
            {t("bloodBank.remainingPrompt", {
              count: remainingCount,
              defaultValue: `Select and allocate ${remainingCount} more unit(s) from available inventory below.`,
            })}
          </p>
        ) : null}
      </div>

      {/* Allocated Units Register */}
      <div className="mt-5">
        {allocatedUnits.length === 0 ? (
          <div className="rounded border border-dashed border-border p-6 text-center text-xs text-muted-foreground">
            {t(
              "bloodBank.noAllocatedUnits",
              "No blood units currently allocated to this request. Review available units in the inventory table below to match and assign.",
            )}
          </div>
        ) : (
          <div
            className="overflow-x-auto border border-border"
            tabIndex={0}
            role="region"
            aria-label={t("bloodBank.allocatedUnits", "Allocated blood units table.")}
          >
            <table className="w-full table-fixed border-collapse text-start text-xs">
              <thead className="border-b border-border bg-surface-subtle font-semibold text-muted-foreground">
                <tr>
                  <th scope="col" className="px-3 py-2.5 text-start w-[22%]">
                    {t("bloodBank.unitId", "Unit ID")}
                  </th>
                  <th scope="col" className="px-3 py-2.5 text-start w-[14%]">
                    {t("common.bloodGroup", "Group")}
                  </th>
                  <th scope="col" className="px-3 py-2.5 text-start w-[24%]">
                    {t("common.component", "Component")}
                  </th>
                  <th scope="col" className="px-3 py-2.5 text-start w-[20%]">
                    {t("bloodBank.location", "Location")}
                  </th>
                  <th scope="col" className="px-3 py-2.5 text-start w-[14%]">
                    {t("bloodBank.expiry", "Expiry")}
                  </th>
                  <th scope="col" className="px-3 py-2.5 text-end w-[16%]">
                    {t("common.actions", "Action")}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border bg-surface">
                {allocatedUnits.map((unit) => (
                  <tr key={unit.id} className="hover:bg-surface-subtle/50">
                    <td className="px-3 py-2.5 font-semibold text-foreground tabular-nums">
                      <bdi dir="ltr">{unit.id}</bdi>
                    </td>
                    <td className="px-3 py-2.5">
                      <BloodGroupBadge group={unit.bloodGroup as BloodGroup} />
                    </td>
                    <td className="px-3 py-2.5 font-medium text-foreground">
                      {bloodBankComponentLabels[unit.component as BloodBankComponent]}
                    </td>
                    <td className="px-3 py-2.5 text-muted-foreground">
                      {unit.storageLocation}
                    </td>
                    <td className="px-3 py-2.5 text-muted-foreground tabular-nums">
                      <bdi dir="ltr">{unit.expiryDate}</bdi>
                    </td>
                    <td className="px-3 py-2.5 text-end">
                      <Button
                        type="button"
                        size="sm"
                        variant="secondary"
                        className="h-7 px-2 text-xs text-destructive hover:text-destructive"
                        disabled={isPending}
                        onClick={() => onRemoveUnit(unit.id)}
                        aria-label={`${t("bloodBank.remove", "Remove")} ${unit.id}`}
                      >
                        {isPending && activeUnitId === unit.id ? (
                          <LoaderCircle aria-hidden="true" className="size-3.5 animate-spin" />
                        ) : (
                          <PackageMinus aria-hidden="true" className="size-3.5" />
                        )}
                        {t("bloodBank.remove", "Remove")}
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  );
}
