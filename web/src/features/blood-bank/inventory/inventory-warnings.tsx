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
    <section aria-labelledby="operational-warnings-heading" className="space-y-3">
      <h2 id="operational-warnings-heading" className="sr-only">
        {t("bloodBank.operationalInventoryAlerts")}
      </h2>

      {/* Critical Alerts (Emergency Red) */}
      {criticalWarnings.map((warn) => {
        const copy = getWarningCopy(warn, t);
        return (
        <div
          key={warn.id}
          role="alert"
          className="flex flex-col gap-3 rounded-none border border-emergency/40 bg-emergency-subtle p-4 text-xs text-foreground sm:flex-row sm:items-center sm:justify-between"
        >
          <div className="flex items-start gap-3">
            <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center text-emergency">
              <AlertOctagon aria-hidden="true" className="size-4" />
            </span>
            <div>
              <p className="font-semibold text-emergency">{copy.title}</p>
              <p className="mt-0.5 text-muted-foreground">{copy.description}</p>
            </div>
          </div>
          {warn.bloodGroup && onFilterGroup ? (
            <button
              type="button"
              onClick={() => onFilterGroup(warn.bloodGroup!)}
              className="inline-flex shrink-0 items-center justify-center border border-emergency/50 bg-surface px-2.5 py-1 text-xs font-medium text-emergency hover:bg-emergency/10 focus:outline-none focus:ring-1 focus:ring-emergency"
            >
              {t("bloodBank.filterBloodGroupUnits", { group: warn.bloodGroup })}
            </button>
          ) : warn.id.includes("expired") && onFilterExpiry ? (
            <button
              type="button"
              onClick={() => onFilterExpiry("expired")}
              className="inline-flex shrink-0 items-center justify-center border border-emergency/50 bg-surface px-2.5 py-1 text-xs font-medium text-emergency hover:bg-emergency/10 focus:outline-none focus:ring-1 focus:ring-emergency"
            >
              {t("bloodBank.viewExpiredUnits")}
            </button>
          ) : null}
        </div>
        );
      })}

      {/* Attention / Warning Alerts (Amber) */}
      {attentionWarnings.map((warn) => {
        const copy = getWarningCopy(warn, t);
        return (
        <div
          key={warn.id}
          role="region"
          aria-label={copy.title}
          className="flex flex-col gap-3 rounded-none border border-amber-500/40 bg-amber-500/10 p-4 text-xs text-foreground sm:flex-row sm:items-center sm:justify-between dark:bg-amber-950/20"
        >
          <div className="flex items-start gap-3">
            <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center text-amber-800 dark:text-amber-300">
              <AlertTriangle aria-hidden="true" className="size-4" />
            </span>
            <div>
              <p className="font-semibold text-amber-900 dark:text-amber-300">{copy.title}</p>
              <p className="mt-0.5 text-muted-foreground">{copy.description}</p>
            </div>
          </div>
          {warn.id.includes("24h") && onFilterExpiry ? (
            <button
              type="button"
              onClick={() => onFilterExpiry("within_24h")}
              className="inline-flex shrink-0 items-center justify-center border border-amber-600/40 bg-surface px-2.5 py-1 text-xs font-medium text-amber-900 hover:bg-amber-500/10 focus:outline-none focus:ring-1 focus:ring-amber-500 dark:text-amber-300"
            >
              {t("bloodBank.viewWithin24Hours")}
            </button>
          ) : warn.id.includes("48h") && onFilterExpiry ? (
            <button
              type="button"
              onClick={() => onFilterExpiry("within_48h")}
              className="inline-flex shrink-0 items-center justify-center border border-amber-600/40 bg-surface px-2.5 py-1 text-xs font-medium text-amber-900 hover:bg-amber-500/10 focus:outline-none focus:ring-1 focus:ring-amber-500 dark:text-amber-300"
            >
              {t("bloodBank.viewWithin48Hours")}
            </button>
          ) : null}
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
  const ids = warning.unitIds?.join(", ") ?? "";
  const values = { count: warning.unitCount ?? 0, ids };

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
