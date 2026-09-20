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

const iconTone = {
  default: "text-primary",
  warning: "text-warning",
  emergency: "text-emergency",
  success: "text-success",
} as const;

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
      <dl className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {items.map(({ label, value, description, icon: Icon, tone }) => (
          <div
            key={label}
            className="rounded-xl border border-border/80 bg-surface p-4"
          >
            <dt className="text-xs font-medium leading-5 text-muted-foreground">
              {label}
            </dt>
            <dd className="mt-2">
              <div className="flex items-start justify-between gap-4">
                <bdi
                  dir="ltr"
                  className="text-3xl font-semibold tracking-tight tabular-nums text-foreground"
                >
                  {value}
                </bdi>
                <Icon aria-hidden="true" className={`size-6 shrink-0 ${iconTone[tone ?? "default"]}`} />
              </div>
              <p className="mt-3 border-t border-border/60 pt-3 text-xs leading-5 text-muted-foreground">
                {description}
              </p>
            </dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
