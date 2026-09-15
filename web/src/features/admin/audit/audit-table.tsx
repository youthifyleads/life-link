import { CheckCircle2, Clock, Eye, ShieldAlert } from "lucide-react";
import { useTranslation } from "react-i18next";

import { formatDateTime } from "@/features/admin/components/admin-formatters";
import { AdminRoleBadge } from "@/features/admin/components/admin-role-badge";
import type { AuditLogEvent } from "@/features/admin/types/admin.types";
import { Button } from "@/shared/components/ui/button";

interface AuditTableProps {
  logs: AuditLogEvent[];
  onInspect: (log: AuditLogEvent) => void;
}

export function AuditTable({ logs, onInspect }: AuditTableProps) {
  const { t } = useTranslation();

  if (logs.length === 0) {
    return (
      <div className="rounded-lg border border-border bg-card p-12 text-center">
        <h3 className="text-sm font-semibold text-foreground">
          {t("admin.noUsersFoundTitle", "No audit records match your filters")}
        </h3>
        <p className="mt-1 text-xs text-muted-foreground">
          {t(
            "admin.noUsersFoundDesc",
            "Adjust the date range, actor, or organization selection.",
          )}
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-lg border border-border bg-card shadow-sm">
      <div
        tabIndex={0}
        role="region"
        aria-label={t("admin.auditTableLabel")}
        className="overflow-x-auto"
      >
        <table className="w-full text-start text-xs">
          <thead className="border-b border-border bg-muted/40 font-semibold uppercase tracking-wider text-muted-foreground">
            <tr>
              <th scope="col" className="px-4 py-3 text-start">
                {t("admin.auditTimestampCol", "Timestamp")}
              </th>
              <th scope="col" className="px-4 py-3 text-start">
                {t("admin.auditActorCol", "Actor")}
              </th>
              <th scope="col" className="px-4 py-3 text-start">
                {t("admin.auditRoleCol", "Role")}
              </th>
              <th scope="col" className="px-4 py-3 text-start">
                {t("admin.auditOrgCol", "Organization")}
              </th>
              <th scope="col" className="px-4 py-3 text-start">
                {t("admin.auditActionCol", "Action")}
              </th>
              <th scope="col" className="px-4 py-3 text-start">
                {t("admin.auditEntityTypeCol", "Entity Type")}
              </th>
              <th scope="col" className="px-4 py-3 text-start">
                {t("admin.auditEntityIdCol", "Entity ID")}
              </th>
              <th scope="col" className="px-4 py-3 text-start">
                {t("admin.auditResultCol", "Result")}
              </th>
              <th scope="col" className="px-4 py-3 text-end">
                {t("admin.inspectAuditAction", "Inspect")}
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {logs.map((log) => (
              <tr
                key={log.id}
                className="transition-colors hover:bg-muted/30 focus-within:bg-muted/30"
              >
                <td className="whitespace-nowrap px-4 py-3 font-mono text-[11px] text-muted-foreground">
                  <div className="flex items-center gap-1.5">
                    <Clock className="size-3 text-muted-foreground/70" />
                    <bdi dir="ltr">{formatDateTime(log.timestamp)}</bdi>
                  </div>
                </td>
                <td className="whitespace-nowrap px-4 py-3 font-semibold text-foreground">
                  {log.actor.name}
                </td>
                <td className="whitespace-nowrap px-4 py-3">
                  <AdminRoleBadge role={log.actor.role} />
                </td>
                <td className="whitespace-nowrap px-4 py-3 text-muted-foreground">
                  {log.organization}
                </td>
                <td className="px-4 py-3">
                  <span className="font-semibold text-foreground">
                    {log.action}
                  </span>
                  {log.details ? (
                    <p className="mt-0.5 max-w-[20rem] truncate text-[11px] text-muted-foreground">
                      {log.details}
                    </p>
                  ) : null}
                </td>
                <td className="whitespace-nowrap px-4 py-3">
                  <span className="inline-flex rounded border border-border bg-muted px-1.5 py-0.5 font-mono text-[11px] text-foreground">
                    <bdi dir="ltr">{log.entityType}</bdi>
                  </span>
                </td>
                <td className="whitespace-nowrap px-4 py-3 font-mono text-[11px] text-muted-foreground">
                  <bdi dir="ltr">{log.entityId}</bdi>
                </td>
                <td className="whitespace-nowrap px-4 py-3">
                  {log.result === "success" ? (
                    <span className="inline-flex items-center gap-1 font-medium text-emerald-700">
                      <CheckCircle2 className="size-3.5" aria-hidden="true" />
                      <span>{t("common.success", "Success")}</span>
                    </span>
                  ) : log.result === "warning" ? (
                    <span className="inline-flex items-center gap-1 font-medium text-amber-700">
                      <ShieldAlert className="size-3.5" aria-hidden="true" />
                      <span>{t("common.warning", "Warning")}</span>
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 font-medium text-rose-700">
                      <ShieldAlert className="size-3.5" aria-hidden="true" />
                      <span>{t("common.error", "Failure")}</span>
                    </span>
                  )}
                </td>
                <td className="whitespace-nowrap px-4 py-3 text-end">
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    onClick={() => onInspect(log)}
                    className="size-7 p-0"
                    title={t("admin.inspectAuditAction", "Inspect audit event")}
                    aria-label={`${t("admin.inspectAuditAction", "Inspect")} ${log.id}`}
                  >
                    <Eye className="size-3.5" aria-hidden="true" />
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="border-t border-border bg-muted/20 px-4 py-3 text-xs text-muted-foreground">
        {t("hospital.records", "records")}: <bdi dir="ltr">{logs.length}</bdi>
      </div>
    </div>
  );
}
