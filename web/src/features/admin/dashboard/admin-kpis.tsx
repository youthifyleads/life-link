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
      iconTone: "text-foreground",
    },
    {
      id: "active-users",
      label: t("admin.activeUsers"),
      value: kpis.activeUsers,
      helper: (
        <span>
          <bdi dir="ltr">
            {Math.round((kpis.activeUsers / (kpis.totalUsers || 1)) * 100)}%
          </bdi>{" "}
          {t("admin.activeUsersHelper")}
        </span>
      ),
      icon: UserCheck,
      iconTone: "text-success",
    },
    {
      id: "total-hospitals",
      label: t("admin.activeHospitals"),
      value: kpis.totalHospitals,
      helper: t("admin.totalHospitalsHelper"),
      icon: Hospital,
      iconTone: "text-primary",
    },
    {
      id: "total-blood-banks",
      label: t("admin.licensedBloodBanks"),
      value: kpis.totalBloodBanks,
      helper: t("admin.totalBloodBanksHelper"),
      icon: Building2,
      iconTone: "text-emergency",
    },
    {
      id: "active-requests",
      label: t("admin.activeBloodRequests"),
      value: kpis.activeBloodRequests,
      helper: t("admin.activeRequestsHelper"),
      icon: ClipboardList,
      iconTone: "text-primary",
    },
    {
      id: "recent-changes",
      label: t("admin.recentAdminChanges"),
      value: kpis.recentAdminChanges,
      helper: t("admin.recentChangesHelper"),
      icon: ScrollText,
      iconTone: "text-warning",
    },
  ];

  return (
    <section aria-labelledby="governance-kpis-heading">
      <h2 id="governance-kpis-heading" className="sr-only">
        {t("admin.operations")}
      </h2>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.id}
              className="rounded-xl border border-border/80 bg-surface p-4"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <div className="text-xs font-medium leading-5 text-muted-foreground">
                    {card.label}
                  </div>
                  <div className="mt-2 text-3xl font-semibold tracking-tight tabular-nums text-foreground">
                    <bdi dir="ltr">{card.value}</bdi>
                  </div>
                </div>
                <Icon className={`size-6 shrink-0 ${card.iconTone}`} aria-hidden="true" />
              </div>
              <div className="mt-3 border-t border-border/60 pt-3 text-xs leading-5 text-muted-foreground">
                {card.helper}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
