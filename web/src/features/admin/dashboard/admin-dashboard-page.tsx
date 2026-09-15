import {
  Building2,
  ChevronRight,
  Hospital,
  ShieldCheck,
  Users,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";

import { AdminPageFrame } from "@/features/admin/components/admin-page-frame";
import { AdminKPIs } from "@/features/admin/dashboard/admin-kpis";
import { AdminRecentActivity } from "@/features/admin/dashboard/admin-recent-activity";
import { useAdminAuditLogs, useAdminKPIs } from "@/features/admin/hooks/use-admin";
import { LoadingState } from "@/shared/components/feedback/system-states";
import { buttonVariants } from "@/shared/components/ui/button.variants";
import { cn } from "@/shared/lib/utils";

export function AdminDashboardPage() {
  const { t } = useTranslation();
  const { data: kpis, isLoading: kpisLoading } = useAdminKPIs();
  const { data: logs, isLoading: logsLoading } = useAdminAuditLogs();

  if (kpisLoading || logsLoading || !kpis || !logs) {
    return (
      <AdminPageFrame
        title={t("admin.operations")}
        description={t("admin.operationsDesc")}
        breadcrumbs={[{ label: t("nav.administration") }, { label: t("nav.dashboard") }]}
      >
        <LoadingState label={t("common.loading")} rows={5} />
      </AdminPageFrame>
    );
  }

  return (
    <AdminPageFrame
      title={t("admin.operations")}
      description={t("admin.operationsDesc")}
      breadcrumbs={[{ label: t("nav.administration") }, { label: t("nav.dashboard") }]}
      actions={
        <div className="flex flex-wrap items-center gap-2.5">
          <Link
            to="/admin/users"
            className={cn(buttonVariants({ variant: "default", size: "sm" }))}
          >
            <Users className="size-3.5" aria-hidden="true" />
            <span>{t("admin.manageUsers")}</span>
          </Link>
          <Link
            to="/admin/roles"
            className={cn(buttonVariants({ variant: "secondary", size: "sm" }))}
          >
            <ShieldCheck className="size-3.5" aria-hidden="true" />
            <span>{t("admin.accessControl")}</span>
          </Link>
        </div>
      }
    >
      <div className="space-y-8">
        {/* Governance KPIs */}
        <AdminKPIs kpis={kpis} />

        {/* Operational Domains Overview */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className="rounded-lg border border-border bg-card p-5 shadow-sm">
            <div className="flex items-center gap-3">
              <span className="flex size-9 items-center justify-center rounded-md bg-sky-50 text-sky-900 border border-sky-200">
                <Hospital className="size-4" aria-hidden="true" />
              </span>
              <div>
                <h3 className="text-sm font-semibold text-foreground">
                  {t("admin.hospitalFacilitiesTitle")}
                </h3>
                <p className="text-xs text-muted-foreground">
                  <bdi dir="ltr">{kpis.totalHospitals}</bdi> {t("admin.totalHospitalsHelper")}
                </p>
              </div>
            </div>
            <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
              {t("admin.hospitalsDesc")}
            </p>
            <div className="mt-4 border-t border-border pt-3">
              <Link
                to="/admin/hospitals"
                className="text-xs font-medium text-primary hover:underline inline-flex items-center gap-1"
              >
                <span>{t("admin.viewHospitalDirectory")}</span>
                <ChevronRight className="size-3 rtl:rotate-180" aria-hidden="true" />
              </Link>
            </div>
          </div>

          <div className="rounded-lg border border-border bg-card p-5 shadow-sm">
            <div className="flex items-center gap-3">
              <span className="flex size-9 items-center justify-center rounded-md bg-rose-50 text-rose-900 border border-rose-200">
                <Building2 className="size-4" aria-hidden="true" />
              </span>
              <div>
                <h3 className="text-sm font-semibold text-foreground">
                  {t("admin.regionalBloodBanksTitle")}
                </h3>
                <p className="text-xs text-muted-foreground">
                  <bdi dir="ltr">{kpis.totalBloodBanks}</bdi> {t("admin.totalBloodBanksHelper")}
                </p>
              </div>
            </div>
            <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
              {t("admin.bloodBanksDesc")}
            </p>
            <div className="mt-4 border-t border-border pt-3">
              <Link
                to="/admin/blood-banks"
                className="text-xs font-medium text-primary hover:underline inline-flex items-center gap-1"
              >
                <span>{t("admin.viewBloodBankDirectory")}</span>
                <ChevronRight className="size-3 rtl:rotate-180" aria-hidden="true" />
              </Link>
            </div>
          </div>

          <div className="rounded-lg border border-border bg-card p-5 shadow-sm">
            <div className="flex items-center gap-3">
              <span className="flex size-9 items-center justify-center rounded-md bg-purple-50 text-purple-900 border border-purple-200">
                <ShieldCheck className="size-4" aria-hidden="true" />
              </span>
              <div>
                <h3 className="text-sm font-semibold text-foreground">
                  {t("admin.rolesPermissionsTitle")}
                </h3>
                <p className="text-xs text-muted-foreground">
                  {t("admin.rolesDesc")}
                </p>
              </div>
            </div>
            <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
              {t("admin.confirmRoleChangeDesc")}
            </p>
            <div className="mt-4 border-t border-border pt-3">
              <Link
                to="/admin/roles"
                className="text-xs font-medium text-primary hover:underline inline-flex items-center gap-1"
              >
                <span>{t("admin.rolesPermissionsTitle")}</span>
                <ChevronRight className="size-3 rtl:rotate-180" aria-hidden="true" />
              </Link>
            </div>
          </div>
        </div>

        {/* Recent Activity Ledger */}
        <AdminRecentActivity logs={logs} />
      </div>
    </AdminPageFrame>
  );
}
