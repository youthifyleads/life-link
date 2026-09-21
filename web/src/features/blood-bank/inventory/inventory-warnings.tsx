import { AlertOctagon, AlertTriangle } from "lucide-react";
import { useTranslation } from "react-i18next";

import type {
  ExpiryWindowFilter,
  InventoryWarning,
} from "@/features/blood-bank/types/blood-bank.types";
import type { BloodGroup } from "@/shared/components/clinical/clinical.types";

interface InventoryWarningsProps {
  warnings: InventoryWarning[];
  onFilterGroup?: (group: BloodGroup) => void;
  onFilterExpiry?: (window: ExpiryWindowFilter) => void;
}

export function InventoryWarnings({
  warnings,
  onFilterGroup,
  onFilterExpiry,
}: InventoryWarningsProps) {
  const { t } = useTranslation();
  if (!warnings || warnings.length === 0) {
    return null;
  }

  const criticalWarnings = warnings.filter((w) => w.type === "critical");
  const attentionWarnings = warnings.filter((w) => w.type === "warning");

  return (
    <section aria-labelledby="operational-warnings-heading" className="space-y-2">
      <h2 id="operational-warnings-heading" className="sr-only">
        {t("bloodBank.operationalInventoryAlerts")}
      </h2>

      {/* Critical Alerts (Emergency Red) - Compact Strip */}
      {criticalWarnings.map((warn) => {
        const copy = getWarningCopy(warn, t);
        return (
          <div
            key={warn.id}
            role="alert"
            className="flex flex-col gap-2 rounded-lg border border-emergency/30 bg-emergency-subtle/80 px-4 py-2.5 text-xs text-foreground sm:flex-row sm:items-center sm:justify-between shadow-2xs"
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <span className="flex size-5 shrink-0 items-center justify-center text-emergency">
                <AlertOctagon aria-hidden="true" className="size-4" />
              </span>
              <div className="min-w-0 flex-1 truncate">
                <span className="font-semibold text-emergency pe-0.5">{copy.title}:</span>
                <span className="text-muted-foreground hidden md:inline truncate ms-2">{copy.description}</span>
              </div>
            </div>
            <div className="shrink-0 flex items-center gap-2">
              {warn.bloodGroup && onFilterGroup ? (
                <button
                  type="button"
                  onClick={() => onFilterGroup(warn.bloodGroup!)}
                  className="cursor-pointer inline-flex items-center justify-center rounded border border-emergency/40 bg-surface px-2.5 py-1 text-xs font-medium text-emergency hover:bg-emergency/10 transition-colors focus:outline-none focus:ring-1 focus:ring-emergency"
                >
                  {t("bloodBank.filterBloodGroupUnits", { group: warn.bloodGroup })}
                </button>
              ) : warn.id.includes("expired") && onFilterExpiry ? (
                <button
                  type="button"
                  onClick={() => onFilterExpiry("expired")}
                  className="cursor-pointer inline-flex items-center justify-center rounded border border-emergency/40 bg-surface px-2.5 py-1 text-xs font-medium text-emergency hover:bg-emergency/10 transition-colors focus:outline-none focus:ring-1 focus:ring-emergency"
                >
                  {t("bloodBank.viewExpiredUnits")}
                </button>
              ) : null}
            </div>
          </div>
        );
      })}

      {/* Attention / Warning Alerts (Amber) - Compact Strip */}
      {attentionWarnings.map((warn) => {
        const copy = getWarningCopy(warn, t);
        return (
          <div
            key={warn.id}
            role="region"
            aria-label={copy.title}
            className="flex flex-col gap-2 rounded-lg border border-amber-500/30 bg-amber-500/10 px-4 py-2.5 text-xs text-foreground sm:flex-row sm:items-center sm:justify-between shadow-2xs dark:bg-amber-950/20"
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <span className="flex size-5 shrink-0 items-center justify-center text-amber-800 dark:text-amber-300">
                <AlertTriangle aria-hidden="true" className="size-4" />
              </span>
              <div className="min-w-0 flex-1 truncate">
                <span className="font-semibold text-amber-900 dark:text-amber-300 pe-0.5">{copy.title}:</span>
                <span className="text-muted-foreground hidden md:inline truncate ms-2">{copy.description}</span>
              </div>
            </div>
            <div className="shrink-0 flex items-center gap-2">
              {warn.id.includes("24h") && onFilterExpiry ? (
                <button
                  type="button"
                  onClick={() => onFilterExpiry("within_24h")}
                  className="cursor-pointer inline-flex items-center justify-center rounded border border-amber-600/30 bg-surface px-2.5 py-1 text-xs font-medium text-amber-900 hover:bg-amber-500/10 transition-colors focus:outline-none focus:ring-1 focus:ring-amber-500 dark:text-amber-300"
                >
                  {t("bloodBank.viewWithin24Hours")}
                </button>
              ) : warn.id.includes("48h") && onFilterExpiry ? (
                <button
                  type="button"
                  onClick={() => onFilterExpiry("within_48h")}
                  className="cursor-pointer inline-flex items-center justify-center rounded border border-amber-600/30 bg-surface px-2.5 py-1 text-xs font-medium text-amber-900 hover:bg-amber-500/10 transition-colors focus:outline-none focus:ring-1 focus:ring-amber-500 dark:text-amber-300"
                >
                  {t("bloodBank.viewWithin48Hours")}
                </button>
              ) : null}
            </div>
          </div>
        );
      })}
    </section>
  );
}

function getWarningCopy(
  warning: InventoryWarning,
  t: ReturnType<typeof useTranslation>["t"],
) {
  const count = warning.unitCount ?? (warning.unitIds ? warning.unitIds.length : 0);
  const values = { count, ids: `${count}` };

  if (warning.id === "warn-crit-o-neg") {
    return { title: t("bloodBank.warningONegTitle"), description: t("bloodBank.warningONegDescription", values) };
  }
  if (warning.id === "warn-crit-ab-neg") {
    return { title: t("bloodBank.warningAbNegTitle"), description: t("bloodBank.warningAbNegDescription") };
  }
  if (warning.id === "warn-expired-units") {
    return { title: t("bloodBank.warningExpiredTitle", values), description: t("bloodBank.warningExpiredDescription", values) };
  }
  if (warning.id === "warn-expiring-24h") {
    return { title: t("bloodBank.warning24Title", values), description: t("bloodBank.warning24Description", values) };
  }
  if (warning.id === "warn-expiring-48h") {
    return { title: t("bloodBank.warning48Title", values), description: t("bloodBank.warning48Description", values) };
  }
  return { title: warning.title, description: warning.description };
}
