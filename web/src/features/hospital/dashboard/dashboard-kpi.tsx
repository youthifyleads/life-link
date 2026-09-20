import {
  AlertTriangle,
  CheckCircle2,
  ClipboardClock,
  ClipboardList,
  type LucideIcon,
} from "lucide-react";
import { useTranslation } from "react-i18next";

interface KpiItem {
  label: string;
  value: number;
  description: string;
  icon: LucideIcon;
  tone?: "default" | "warning" | "emergency" | "success";
}

const iconTone = {
  default: "text-primary",
  warning: "text-warning",
  emergency: "text-emergency",
  success: "text-success",
} as const;

interface DashboardKpiProps {
  total: number;
  pending: number;
  urgent: number;
  completed: number;
}

export function DashboardKpi({
  total,
  pending,
  urgent,
  completed,
}: DashboardKpiProps) {
  const { t } = useTranslation();

  const items: KpiItem[] = [
    {
      label: t("hospital.totalRequests"),
      value: total,
      description: t("hospital.allRecords"),
      icon: ClipboardList,
    },
    {
      label: t("hospital.pendingRequests"),
      value: pending,
      description: t("hospital.awaitingCompletion"),
      icon: ClipboardClock,
      tone: "warning",
    },
    {
      label: t("hospital.urgentRequests"),
      value: urgent,
      description: t("hospital.urgentOrEmergency"),
      icon: AlertTriangle,
      tone: "emergency",
    },
    {
      label: t("hospital.completedRequests"),
      value: completed,
      description: t("hospital.handoffConfirmed"),
      icon: CheckCircle2,
      tone: "success",
    },
  ];

  return (
    <section aria-labelledby="operational-kpis-title">
      <div className="mb-3">
        <h2 id="operational-kpis-title" className="text-lg font-semibold">
          {t("hospital.statusOverview")}
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          {t("hospital.operationsDesc")}
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
