import {
  CheckCircle2,
  Clock,
  Code2,
  FileText,
  Lock,
  ShieldAlert,
} from "lucide-react";
import { useTranslation } from "react-i18next";

import { formatDateTime } from "@/features/admin/components/admin-formatters";
import { AdminRoleBadge } from "@/features/admin/components/admin-role-badge";
import type { AuditLogEvent } from "@/features/admin/types/admin.types";
import { Button } from "@/shared/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog";

interface AuditDetailsDialogProps {
  event: AuditLogEvent | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AuditDetailsDialog({
  event,
  open,
  onOpenChange,
}: AuditDetailsDialogProps) {
  const { t } = useTranslation();
  if (!event) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <span className="font-mono text-xs font-semibold text-muted-foreground">
              <bdi dir="ltr">{event.id}</bdi>
            </span>
            <span
              className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wider ${
                event.result === "success"
                  ? "bg-emerald-100 text-emerald-900"
                  : event.result === "warning"
                    ? "bg-amber-100 text-amber-900"
                    : "bg-rose-100 text-rose-900"
              }`}
            >
              {event.result === "success" ? (
                <CheckCircle2 className="size-3" />
              ) : (
                <ShieldAlert className="size-3" />
              )}
              <span>{event.result === "success" ? t("common.success", "Success") : event.result === "warning" ? t("common.warning", "Warning") : t("common.error", "Failure")}</span>
            </span>
          </div>
          <DialogTitle className="text-base">{event.action}</DialogTitle>
          <DialogDescription>
            {t("admin.auditDesc", "Audit record is read-only and cryptographically verified in system ledger.")}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2 text-xs">
          {/* Metadata ledger */}
          <div className="rounded-lg border border-border bg-muted/40 p-3 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">{t("admin.auditActorCol", "Actor")}:</span>
              <div className="flex items-center gap-1.5 font-medium text-foreground">
                <span>{event.actor.name}</span>
                <AdminRoleBadge role={event.actor.role} />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">{t("admin.auditOrgCol", "Organization")}:</span>
              <span className="font-medium text-foreground">
                {event.organization}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">{t("admin.auditEntityTypeCol", "Target Entity")}:</span>
              <div className="flex items-center gap-1 font-mono text-foreground">
                <span className="rounded bg-muted px-1.5 py-0.5 border border-border">
                  <bdi dir="ltr">{event.entityType}</bdi>
                </span>
                <span><bdi dir="ltr">{event.entityId}</bdi></span>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">{t("admin.auditTimestampCol", "Timestamp")}:</span>
              <span className="flex items-center gap-1 font-mono text-foreground">
                <Clock className="size-3 text-muted-foreground" />
                <span><bdi dir="ltr">{formatDateTime(event.timestamp)}</bdi></span>
              </span>
            </div>
          </div>

          {/* Details note */}
          {event.details && (
            <div className="rounded-lg border border-border bg-card p-3">
              <div className="flex items-center gap-1.5 font-semibold text-foreground">
                <FileText className="size-3.5 text-primary" />
                <span>{t("common.details", "Event Summary & Audit Narrative")}</span>
              </div>
              <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">
                {event.details}
              </p>
            </div>
          )}

          {/* Safe Metadata */}
          {event.metadata && Object.keys(event.metadata).length > 0 && (
            <div className="rounded-lg border border-border bg-card p-3">
              <div className="flex items-center gap-1.5 font-semibold text-foreground">
                <Code2 className="size-3.5 text-primary" />
                <span>{t("activity.rawJson", "Safe Operational Metadata")}</span>
              </div>
              <pre className="mt-2 max-h-36 overflow-x-auto rounded bg-muted/50 p-2 font-mono text-[11px] text-foreground text-start" dir="ltr">
                {JSON.stringify(event.metadata, null, 2)}
              </pre>
            </div>
          )}

          <div className="flex items-center gap-2 rounded-md bg-muted/30 p-2.5 text-muted-foreground">
            <Lock className="size-3.5 shrink-0 text-primary" />
            <span>
              {t("admin.readOnlyAuditTrail", "Read-only ledger integrity enforced. Records cannot be altered or purged.")}
            </span>
          </div>
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="secondary"
            onClick={() => onOpenChange(false)}
          >
            {t("common.close", "Close")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
