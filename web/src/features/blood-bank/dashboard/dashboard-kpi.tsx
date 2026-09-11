import {
  AlertTriangle,
  CheckCircle2,
  ClipboardClock,
  Droplets,
  type LucideIcon,
} from "lucide-react";
import { useTranslation } from "react-i18next";

interface BloodBankDashboardKpiProps {
  availableUnits: number;
  pending: number;
  urgent: number;
  completed: number;
}

interface KpiItem {
  label: string;
  value: number;
  description: string;
  icon: LucideIcon;
  tone?: "warning" | "emergency" | "success";
}

export function BloodBankDashboardKpi({
  availableUnits,
  pending,
  urgent,
  completed,
}: BloodBankDashboardKpiProps) {
  const { t } = useTranslation();

  const items: KpiItem[] = [
    {
      label: t("bloodBank.availableBloodUnits"),
      value: availableUnits,
      description: t("bloodBank.aggregateSnapshot"),
      icon: Droplets,
    },
    {
      label: t("hospital.pendingRequests"),
      value: pending,
      description: t("bloodBank.pendingRequestsDesc"),
      icon: ClipboardClock,
      tone: "warning",
    },
    {
      label: t("hospital.urgentRequests"),
      value: urgent,
      description: t("bloodBank.urgentRequestsDesc"),
      icon: AlertTriangle,
      tone: "emergency",
    },
    {
      label: t("hospital.completedRequests"),
      value: completed,
      description: t("bloodBank.completedRequestsDesc"),
      icon: CheckCircle2,
      tone: "success",
    },
  ];

  return (
    <section aria-labelledby="blood-bank-kpis-title">
      <div className="mb-3">
        <h2 id="blood-bank-kpis-title" className="text-lg font-semibold">
          {t("bloodBank.queueOverview")}
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          {t("bloodBank.operationsDesc")}
        </p>
      </div>
      <dl className="grid grid-cols-2 gap-px border border-border bg-border xl:grid-cols-4">
        {items.map(({ label, value, description, icon: Icon, tone }) => (
          <div key={label} className="bg-surface p-4 sm:p-5">
            <dt className="text-sm font-medium text-muted-foreground">
              {label}
            </dt>
            <dd>
              <div className="mt-2 flex items-start justify-between gap-4">
                <span className="text-3xl font-semibold tabular-nums text-foreground">
                  {value}
                </span>
                <Icon
                  aria-hidden="true"
                  className={
                    tone === "emergency"
                      ? "size-5 text-emergency"
                      : tone === "success"
                        ? "size-5 text-success"
                        : tone === "warning"
                          ? "size-5 text-warning"
                          : "size-5 text-primary"
                  }
                />
              </div>
              <span className="mt-3 block text-xs text-muted-foreground">
                {description}
              </span>
            </dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
