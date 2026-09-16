import {
  Building2,
  ClipboardList,
  Hospital,
  ScrollText,
  UserCheck,
  Users,
} from "lucide-react";
import { useTranslation } from "react-i18next";

import type { AdminGovernanceKPIs } from "@/features/admin/types/admin.types";

interface AdminKPIsProps {
  kpis: AdminGovernanceKPIs;
}

export function AdminKPIs({ kpis }: AdminKPIsProps) {
  const { t } = useTranslation();

  const cards = [
    {
      id: "total-users",
      label: t("admin.totalUsers"),
      value: kpis.totalUsers,
      helper: (
        <span>
          <bdi dir="ltr">{kpis.activeUsers}</bdi> {t("admin.totalUsersHelper")}
        </span>
      ),
      icon: Users,
      accent: "text-slate-900 border-slate-200 bg-white",
    },
    {
      id: "active-users",
      label: t("admin.activeUsers"),
      value: kpis.activeUsers,
      helper: (
        <span>
          <bdi dir="ltr">{Math.round((kpis.activeUsers / (kpis.totalUsers || 1)) * 100)}%</bdi>{" "}
          {t("admin.activeUsersHelper")}
        </span>
      ),
      icon: UserCheck,
      accent: "text-emerald-950 border-emerald-200 bg-emerald-50/40",
    },
    {
      id: "total-hospitals",
      label: t("admin.activeHospitals"),
      value: kpis.totalHospitals,
      helper: t("admin.totalHospitalsHelper"),
      icon: Hospital,
      accent: "text-sky-950 border-sky-200 bg-sky-50/40",
    },
    {
      id: "total-blood-banks",
      label: t("admin.licensedBloodBanks"),
      value: kpis.totalBloodBanks,
      helper: t("admin.totalBloodBanksHelper"),
      icon: Building2,
      accent: "text-rose-950 border-rose-200 bg-rose-50/40",
    },
    {
      id: "active-requests",
      label: t("admin.activeBloodRequests"),
      value: kpis.activeBloodRequests,
      helper: t("admin.activeRequestsHelper"),
      icon: ClipboardList,
      accent: "text-indigo-950 border-indigo-200 bg-indigo-50/40",
    },
    {
      id: "recent-changes",
      label: t("admin.recentAdminChanges"),
      value: kpis.recentAdminChanges,
      helper: t("admin.recentChangesHelper"),
      icon: ScrollText,
      accent: "text-amber-950 border-amber-200 bg-amber-50/40",
    },
  ];

  return (
    <section aria-labelledby="governance-kpis-heading">
      <h2 id="governance-kpis-heading" className="sr-only">
        {t("admin.operations")}
      </h2>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.id}
              className={`flex flex-col justify-between rounded-lg border p-4 shadow-sm transition-shadow hover:shadow-md ${card.accent}`}
            >
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  {card.label}
                </span>
                <span className="flex size-7 items-center justify-center rounded-md border border-black/5 bg-black/5 text-foreground">
                  <Icon className="size-4" aria-hidden="true" />
                </span>
              </div>
              <div className="mt-3">
                <div className="text-2xl font-bold tracking-tight text-foreground tabular-nums">
                  <bdi dir="ltr">{card.value}</bdi>
                </div>
                <div className="mt-1 text-xs text-muted-foreground">
                  {card.helper}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
