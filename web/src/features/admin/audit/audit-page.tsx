import { Shield } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";

import { AuditDetailsDialog } from "@/features/admin/audit/audit-details-dialog";
import { AuditFilters as AuditFiltersBar } from "@/features/admin/audit/audit-filters";
import { AuditTable } from "@/features/admin/audit/audit-table";
import { AdminPageFrame } from "@/features/admin/components/admin-page-frame";
import { useAdminAuditLogs } from "@/features/admin/hooks/use-admin";
import type { AuditFilters, AuditLogEvent } from "@/features/admin/types/admin.types";
import { LoadingState } from "@/shared/components/feedback/system-states";

const initialFilters: AuditFilters = {
  search: "",
  actor: "all",
  organization: "all",
  action: "all",
  dateRange: "all",
  sortBy: "timestamp_desc",
};

export function AuditPage() {
  const { t } = useTranslation();
  const [filters, setFilters] = useState<AuditFilters>(initialFilters);
  const [selectedEvent, setSelectedEvent] = useState<AuditLogEvent | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);

  const { data: logs, isLoading } = useAdminAuditLogs(filters);

  const handleInspect = (event: AuditLogEvent) => {
    setSelectedEvent(event);
    setDetailsOpen(true);
  };

  const handleResetFilters = () => {
    setFilters(initialFilters);
  };

  return (
    <AdminPageFrame
      title={t("admin.auditLedgerTitle", "System Activity / Audit Logs")}
      description={t(
        "admin.auditLedgerDesc",
        "Cryptographically anchored, read-only operational audit ledger tracking user provisioning, role elevation, facility states, and clinical transactions.",
      )}
      breadcrumbs={[
        { label: t("nav.administration", "Administration") },
        { label: t("nav.governanceAudit", "Governance Audit") },
      ]}
      actions={
        <div className="flex items-center gap-1.5 rounded-md bg-muted/60 px-3 py-1.5 font-mono text-xs text-muted-foreground border border-border">
          <Shield className="size-3.5 text-primary" />
          <span>{t("admin.readOnlyAuditTrail", "Read-Only Audit Trail")}</span>
        </div>
      }
    >
      <div className="space-y-6">
        <AuditFiltersBar
          filters={filters}
          onFilterChange={setFilters}
          onReset={handleResetFilters}
        />

        {isLoading || !logs ? (
          <LoadingState label={t("common.loadingRecords", "Loading audit activity ledger…")} rows={6} />
        ) : (
          <AuditTable logs={logs} onInspect={handleInspect} />
        )}
      </div>

      <AuditDetailsDialog
        event={selectedEvent}
        open={detailsOpen}
        onOpenChange={setDetailsOpen}
      />
    </AdminPageFrame>
  );
}
