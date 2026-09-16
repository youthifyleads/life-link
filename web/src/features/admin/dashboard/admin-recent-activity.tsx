import { ArrowRight, CheckCircle2, Clock, ShieldAlert } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";

import { formatTimeShort } from "@/features/admin/components/admin-formatters";
import type { AuditLogEvent } from "@/features/admin/types/admin.types";
import { buttonVariants } from "@/shared/components/ui/button.variants";
import { cn } from "@/shared/lib/utils";

interface AdminRecentActivityProps {
  logs: AuditLogEvent[];
}

export function AdminRecentActivity({ logs }: AdminRecentActivityProps) {
  const { t } = useTranslation();
  const displayLogs = logs.slice(0, 6);

  return (
    <section
      aria-labelledby="recent-activity-ledger-heading"
      className="rounded-lg border border-border bg-card shadow-sm"
    >
      <div className="flex flex-col gap-3 border-b border-border p-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2
            id="recent-activity-ledger-heading"
            className="text-base font-semibold tracking-tight text-foreground"
          >
            {t("admin.recentAdminActivityTitle", "Recent Administrative Activity")}
          </h2>
          <p className="text-xs text-muted-foreground">
            {t(
              "admin.recentAdminActivityDesc",
              "Immutable governance ledger tracking security, directory, and facility state modifications",
            )}
          </p>
        </div>
        <Link
          to="/admin/audit"
          className={cn(
            buttonVariants({ variant: "secondary", size: "sm" }),
            "self-start sm:self-auto gap-1.5",
          )}
        >
          <span>{t("admin.openFullAuditLedger", "Open Full Audit Ledger")}</span>
          <ArrowRight className="size-3.5 rtl:rotate-180" aria-hidden="true" />
        </Link>
      </div>

      <div
        tabIndex={0}
        role="region"
        aria-label={t("admin.recentActivityTableLabel")}
        className="overflow-x-auto"
      >
        <table className="w-full text-start text-xs">
          <thead className="border-b border-border bg-muted/40 font-semibold uppercase tracking-wider text-muted-foreground text-start">
            <tr>
              <th scope="col" className="px-4 py-3 text-start">
                {t("admin.auditTimestampCol", "Timestamp")}
              </th>
              <th scope="col" className="px-4 py-3 text-start">
                {t("admin.auditActorCol", "Actor")}
              </th>
              <th scope="col" className="px-4 py-3 text-start">
                {t("admin.auditActionCol", "Action")}
              </th>
              <th scope="col" className="px-4 py-3 text-start">
                {t("admin.auditEntityTypeCol", "Entity")}
              </th>
              <th scope="col" className="px-4 py-3 text-start">
                {t("admin.auditOrgCol", "Organization")}
              </th>
              <th scope="col" className="px-4 py-3 text-start">
                {t("admin.auditResultCol", "Result")}
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {displayLogs.map((log) => (
              <tr
                key={log.id}
                className="transition-colors hover:bg-muted/30 focus-within:bg-muted/30"
              >
                <td className="whitespace-nowrap px-4 py-3 text-muted-foreground">
                  <div className="flex items-center gap-1.5 font-mono text-[11px]">
                    <Clock className="size-3.5 shrink-0 text-muted-foreground/70" />
                    <bdi dir="ltr">{formatTimeShort(log.timestamp)}</bdi>
                  </div>
                </td>
                <td className="whitespace-nowrap px-4 py-3">
                  <div className="font-medium text-foreground">
                    {log.actor.name}
                  </div>
                  <div className="text-[11px] text-muted-foreground">
                    {t(`roles.${log.actor.role}`, log.actor.role.replace(/_/g, " "))}
                  </div>
                </td>
                <td className="px-4 py-3">
                  <span className="font-semibold text-foreground">
                    {log.action}
                  </span>
                  {log.details ? (
                    <p className="mt-0.5 max-w-[28rem] truncate text-[11px] text-muted-foreground">
                      {log.details}
                    </p>
                  ) : null}
                </td>
                <td className="whitespace-nowrap px-4 py-3">
                  <span className="inline-flex rounded border border-border bg-muted px-1.5 py-0.5 font-mono text-[11px] text-foreground">
                    <bdi dir="ltr">{log.entityType}</bdi>
                  </span>
                  {log.entityName ? (
                    <span className="ms-1.5 text-xs text-muted-foreground">
                      {log.entityName}
                    </span>
                  ) : null}
                </td>
                <td className="whitespace-nowrap px-4 py-3 text-muted-foreground">
                  {log.organization}
                </td>
                <td className="whitespace-nowrap px-4 py-3">
                  {log.result === "success" ? (
                    <span className="inline-flex items-center gap-1 font-medium text-emerald-700">
                      <CheckCircle2 className="size-3.5" aria-hidden="true" />
                      <span>{t("common.success", "Success")}</span>
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 font-medium text-amber-700">
                      <ShieldAlert className="size-3.5" aria-hidden="true" />
                      <span>{t("common.warning", "Warning")}</span>
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
