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
          {t(
            "bloodBank.kpiSubtitle",
            "Real-time cold-chain stock posture and clinical availability across Central Blood Bank.",
          )}
        </p>
      </div>

      <dl className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-6">
        {/* 1. Available */}
        <div className="rounded-xl border border-border/80 bg-surface p-4 xl:col-span-1">
          <dt className="text-xs font-medium text-muted-foreground">
            {t("bloodBank.totalAvailable", "Total Available Units")}
          </dt>
          <dd>
            <div className="mt-2 flex items-start justify-between gap-4">
              <span className="text-3xl font-semibold tabular-nums text-foreground">
                <bdi dir="ltr">{kpis.totalAvailable}</bdi>
              </span>
              <Droplets aria-hidden="true" className="size-6 shrink-0 text-primary" />
            </div>
            <span className="mt-3 block border-t border-border/60 pt-3 text-xs leading-5 text-muted-foreground">
              {t("healthcare.available", "Ready for immediate issue")}
            </span>
          </dd>
        </div>

        {/* 2. Reserved */}
        <div className="rounded-xl border border-border/80 bg-surface p-4 xl:col-span-1">
          <dt className="text-xs font-medium text-muted-foreground">
            {t("bloodBank.reservedUnits", "Reserved Units")}
          </dt>
          <dd>
            <div className="mt-2 flex items-start justify-between gap-4">
              <span className="text-3xl font-semibold tabular-nums text-foreground">
                <bdi dir="ltr">{kpis.reservedUnits}</bdi>
              </span>
              <BookmarkCheck aria-hidden="true" className="size-6 shrink-0 text-warning" />
            </div>
            <span className="mt-3 block border-t border-border/60 pt-3 text-xs leading-5 text-muted-foreground">
              {t("healthcare.reserved", "Held for cross-match / prep")}
            </span>
          </dd>
        </div>

        {/* 3. Quarantined */}
        <div className="rounded-xl border border-border/80 bg-surface p-4 xl:col-span-1">
          <dt className="text-xs font-medium text-muted-foreground">
            {t("bloodBank.quarantinedUnits", "Quarantined Units")}
          </dt>
          <dd>
            <div className="mt-2 flex items-start justify-between gap-4">
              <span className="text-3xl font-semibold tabular-nums text-foreground">
                <bdi dir="ltr">{kpis.quarantinedUnits}</bdi>
              </span>
              <ShieldAlert
                aria-hidden="true"
                className={`size-6 shrink-0 ${
                  kpis.quarantinedUnits > 0
                    ? "text-emergency"
                    : "text-muted-foreground"
                }`}
              />
            </div>
            <span className="mt-3 block border-t border-border/60 pt-3 text-xs leading-5 text-muted-foreground">
              {t("healthcare.quarantine", "Awaiting assay verification")}
            </span>
          </dd>
        </div>

        {/* 4. Expiring Soon */}
        <div className="rounded-xl border border-border/80 bg-surface p-4 xl:col-span-1">
          <dt className="text-xs font-medium text-muted-foreground">
            {t("bloodBank.expiringSoon", "Expiring Soon (<48h)")}
          </dt>
          <dd>
            <div className="mt-2 flex items-start justify-between gap-4">
              <span className="text-3xl font-semibold tabular-nums text-foreground">
                <bdi dir="ltr">{kpis.expiringSoon}</bdi>
              </span>
              <ClockAlert
                aria-hidden="true"
                className={`size-6 shrink-0 ${
                  kpis.expiringSoon > 0
                    ? "text-warning"
                    : "text-muted-foreground"
                }`}
              />
            </div>
            <span className="mt-3 block border-t border-border/60 pt-3 text-xs leading-5 text-muted-foreground">
              {t("urgency.urgent", "Urgent dispatch priority")}
            </span>
          </dd>
        </div>

        {/* 5. Critical Low Stock Groups */}
        <div className="rounded-xl border border-border/80 bg-surface p-4 sm:col-span-2 xl:col-span-2">
          <dt className="text-xs font-medium text-muted-foreground">
            {t("bloodBank.criticalGroups", "Critical Low Stock Groups")}
          </dt>
          <dd>
            <div className="mt-2 flex items-start justify-between gap-4">
              <span className="text-3xl font-semibold tracking-tight tabular-nums text-foreground">
                <bdi dir="ltr">{kpis.criticalLowStockGroups.length}</bdi>
              </span>
              <AlertOctagon
                aria-hidden="true"
                className={`size-6 shrink-0 ${
                  kpis.criticalLowStockGroups.length > 0
                    ? "text-emergency"
                    : "text-muted-foreground"
                }`}
              />
            </div>
            <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-border/60 pt-3 text-xs leading-5 text-muted-foreground">
              <span>&le; 2 {t("common.units", "units")}</span>
              <span className="flex flex-wrap gap-x-2 font-semibold text-foreground">
                {kpis.criticalLowStockGroups.length > 0
                  ? kpis.criticalLowStockGroups.map((group) => (
                      <bdi key={group} dir="ltr">
                        {group}
                      </bdi>
                    ))
                  : t("common.none", "None")}
              </span>
            </div>
          </dd>
        </div>
      </dl>
    </section>
  );
}
