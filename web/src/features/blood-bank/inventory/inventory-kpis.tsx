import {
  AlertOctagon,
  BookmarkCheck,
  ClockAlert,
  Droplets,
  ShieldAlert,
} from "lucide-react";
import { useTranslation } from "react-i18next";

import type { InventoryKPIs } from "@/features/blood-bank/types/blood-bank.types";

interface InventoryKpisProps {
  kpis: InventoryKPIs;
}

export function InventoryKpis({ kpis }: InventoryKpisProps) {
  const { t } = useTranslation();

  return (
    <section aria-labelledby="inventory-kpis-title">
      <div className="mb-3">
        <h2 id="inventory-kpis-title" className="text-base font-semibold">
          {t("bloodBank.kpiTitle", "Inventory KPIs")}
        </h2>
        <p className="mt-0.5 text-xs text-muted-foreground">
          {t("bloodBank.kpiSubtitle", "Real-time cold-chain stock posture and clinical availability across Central Blood Bank.")}
        </p>
      </div>

      <dl className="grid grid-cols-2 gap-px border border-border bg-border sm:grid-cols-3 lg:grid-cols-5">
        {/* 1. Available */}
        <div className="bg-surface p-4 sm:p-5">
          <dt className="text-xs font-medium text-muted-foreground">
            {t("bloodBank.totalAvailable", "Total Available Units")}
          </dt>
          <dd>
            <div className="mt-2 flex items-start justify-between gap-3">
              <span className="text-3xl font-semibold tabular-nums text-foreground">
                <bdi dir="ltr">{kpis.totalAvailable}</bdi>
              </span>
              <Droplets aria-hidden="true" className="size-5 text-primary" />
            </div>
            <span className="mt-2.5 block text-xs text-muted-foreground">
              {t("healthcare.available", "Ready for immediate issue")}
            </span>
          </dd>
        </div>

        {/* 2. Reserved */}
        <div className="bg-surface p-4 sm:p-5">
          <dt className="text-xs font-medium text-muted-foreground">
            {t("bloodBank.reservedUnits", "Reserved Units")}
          </dt>
          <dd>
            <div className="mt-2 flex items-start justify-between gap-3">
              <span className="text-3xl font-semibold tabular-nums text-foreground">
                <bdi dir="ltr">{kpis.reservedUnits}</bdi>
              </span>
              <BookmarkCheck aria-hidden="true" className="size-5 text-warning" />
            </div>
            <span className="mt-2.5 block text-xs text-muted-foreground">
              {t("healthcare.reserved", "Held for cross-match / prep")}
            </span>
          </dd>
        </div>

        {/* 3. Quarantined */}
        <div className="bg-surface p-4 sm:p-5">
          <dt className="text-xs font-medium text-muted-foreground">
            {t("bloodBank.quarantinedUnits", "Quarantined Units")}
          </dt>
          <dd>
            <div className="mt-2 flex items-start justify-between gap-3">
              <span className="text-3xl font-semibold tabular-nums text-foreground">
                <bdi dir="ltr">{kpis.quarantinedUnits}</bdi>
              </span>
              <ShieldAlert
                aria-hidden="true"
                className={kpis.quarantinedUnits > 0 ? "size-5 text-emergency" : "size-5 text-muted-foreground"}
              />
            </div>
            <span className="mt-2.5 block text-xs text-muted-foreground">
              {t("healthcare.quarantine", "Awaiting assay verification")}
            </span>
          </dd>
        </div>

        {/* 4. Expiring Soon */}
        <div className="bg-surface p-4 sm:p-5">
          <dt className="text-xs font-medium text-muted-foreground">
            {t("bloodBank.expiringSoon", "Expiring Soon (<48h)")}
          </dt>
          <dd>
            <div className="mt-2 flex items-start justify-between gap-3">
              <span className="text-3xl font-semibold tabular-nums text-foreground">
                <bdi dir="ltr">{kpis.expiringSoon}</bdi>
              </span>
              <ClockAlert
                aria-hidden="true"
                className={kpis.expiringSoon > 0 ? "size-5 text-amber-600 dark:text-amber-400" : "size-5 text-muted-foreground"}
              />
            </div>
            <span className="mt-2.5 block text-xs text-muted-foreground">
              {t("urgency.urgent", "Urgent dispatch priority")}
            </span>
          </dd>
        </div>

        {/* 5. Critical Low Stock Groups */}
        <div className="col-span-2 bg-surface p-4 sm:col-span-1 sm:p-5">
          <dt className="text-xs font-medium text-muted-foreground">
            {t("bloodBank.criticalGroups", "Critical Low Stock Groups")}
          </dt>
          <dd>
            <div className="mt-2 flex items-start justify-between gap-3">
              <span className="text-xl font-semibold text-emergency sm:text-2xl">
                {kpis.criticalLowStockGroups.length > 0 ? (
                  <span className="inline-flex flex-wrap gap-1.5">
                    {kpis.criticalLowStockGroups.map((grp) => (
                      <bdi key={grp} dir="ltr">{grp}</bdi>
                    ))}
                  </span>
                ) : (
                  t("common.none", "None")
                )}
              </span>
              <AlertOctagon aria-hidden="true" className="size-5 text-emergency" />
            </div>
            <span className="mt-2.5 block text-xs text-muted-foreground">
              &le; 2 {t("common.units", "units")}
            </span>
          </dd>
        </div>
      </dl>
    </section>
  );
}
