import { Ticket } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";

import { DonorPageFrame } from "@/features/donor/components/donor-page-frame";
import { useDonationHistory } from "@/features/donor/hooks/use-donor";
import { BloodGroupBadge } from "@/shared/components/clinical/blood-group-badge";
import { StatusIndicator } from "@/shared/components/clinical/status-indicator";
import {
  EmptyState,
  ErrorState,
  LoadingState,
} from "@/shared/components/feedback/system-states";
import { Button } from "@/shared/components/ui/button";

export function DonorDonationsPage() {
  const { t } = useTranslation();
  const historyQuery = useDonationHistory();

  if (historyQuery.isPending) {
    return (
      <DonorPageFrame
        breadcrumbs={[
          {
            label: t("nav.donorServices", "Donor services"),
            href: "/donor/dashboard",
          },
          { label: t("nav.donationHistory", "Donation history") },
        ]}
        title={t("donor.donationsTitle", "Donation History")}
        description={t(
          "donor.portalDesc",
          "Comprehensive personal ledger of all verified whole blood and apheresis donations.",
        )}
      >
        <LoadingState
          label={t("common.loadingRecords", "Loading donation history…")}
        />
      </DonorPageFrame>
    );
  }

  if (historyQuery.isError || !historyQuery.data) {
    return (
      <DonorPageFrame
        breadcrumbs={[
          {
            label: t("nav.donorServices", "Donor services"),
            href: "/donor/dashboard",
          },
          { label: t("nav.donationHistory", "Donation history") },
        ]}
        title={t("donor.donationsTitle", "Donation History")}
        description={t(
          "donor.portalDesc",
          "Comprehensive personal ledger of all verified whole blood and apheresis donations.",
        )}
      >
        <ErrorState
          title={t("common.error", "Could not load donation history")}
          description={t("donor.donationsLoadErrorDescription")}
          onRetry={() => {
            void historyQuery.refetch();
          }}
        />
      </DonorPageFrame>
    );
  }

  const history = historyQuery.data;

  return (
    <DonorPageFrame
      breadcrumbs={[
        {
          label: t("nav.donorServices", "Donor services"),
          href: "/donor/dashboard",
        },
        { label: t("nav.donationHistory", "Donation history") },
      ]}
      title={t("donor.donationsTitle", "Donation History")}
      description={t(
        "donor.portalDesc",
        "Comprehensive personal ledger of all verified whole blood and apheresis donations.",
      )}
      actions={
        <Button asChild variant="secondary" size="sm">
          <Link to="/donor/vouchers" className="gap-2">
            <Ticket className="size-4 text-primary" />
            <span>{t("donor.vouchers", "View My Vouchers")}</span>
          </Link>
        </Button>
      }
    >
      <div className="space-y-6">
        {history.length === 0 ? (
          <EmptyState
            title={t("hospital.noRecordsTitle", "No past donations recorded")}
            description={t(
              "hospital.noRecordsDesc",
              "When you complete a verified blood donation at an accredited hospital or blood bank, it will appear here.",
            )}
            action={
              <Button asChild size="sm">
                <Link to="/donor/requests">
                  {t("nav.donationRequests", "Explore Open Requests")}
                </Link>
              </Button>
            }
          />
        ) : (
          <div className="overflow-hidden rounded-lg border border-border/80 bg-surface shadow-2xs">
            <div
              tabIndex={0}
              role="region"
              aria-label={t("donor.donationHistoryTableLabel")}
              className="overflow-x-auto focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <table className="clinical-table">
                <thead className="border-b border-border bg-muted/40 font-semibold uppercase tracking-wider text-muted-foreground">
                  <tr>
                    <th scope="col" className="px-4 py-3 sm:px-6 text-start">
                      {t("admin.auditEntityIdCol", "Donation ID")}
                    </th>
                    <th scope="col" className="px-4 py-3 text-start">
                      {t("common.date", "Date")}
                    </th>
                    <th scope="col" className="px-4 py-3 text-start">
                      {t("common.bloodGroup", "Blood Group")}
                    </th>
                    <th scope="col" className="px-4 py-3 text-start">
                      {t("common.component", "Component & Volume")}
                    </th>
                    <th scope="col" className="px-4 py-3 text-start">
                      {t("common.facility", "Facility & Region")}
                    </th>
                    <th scope="col" className="px-4 py-3 text-start">
                      {t("common.status", "Status")}
                    </th>
                    <th scope="col" className="px-4 py-3 sm:px-6 text-end">
                      {t("donor.vouchers", "Voucher")}
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {history.map((record) => (
                    <tr
                      key={record.id}
                      className="transition-colors hover:bg-muted/30"
                    >
                      <td className="px-4 py-4 font-mono font-bold text-foreground sm:px-6">
                        <bdi dir="ltr">{record.id}</bdi>
                      </td>
                      <td className="px-4 py-4 text-muted-foreground font-mono">
                        <bdi dir="ltr">{record.donationDate}</bdi>
                      </td>
                      <td className="px-4 py-4">
                        <BloodGroupBadge group={record.bloodGroup} />
                      </td>
                      <td className="px-4 py-4">
                        <span className="font-medium text-foreground capitalize">
                          {record.component.replace("_", " ")}
                        </span>{" "}
                        <span className="text-muted-foreground">
                          (<bdi dir="ltr">{record.volumeMl} mL</bdi>)
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <div className="font-semibold text-foreground">
                          {record.facilityName}
                        </div>
                        <div className="text-[11px] text-muted-foreground">
                          {record.facilityGovernorate}
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        {record.status === "completed" ? (
                          <StatusIndicator tone="success">
                            {t("status.completed", "Completed")}
                          </StatusIndicator>
                        ) : record.status === "processing" ? (
                          <StatusIndicator tone="pending">
                            {t("status.preparing", "Processing")}
                          </StatusIndicator>
                        ) : (
                          <StatusIndicator tone="warning">
                            {t("status.rejected", "Deferred")}
                          </StatusIndicator>
                        )}
                      </td>
                      <td className="px-4 py-4 sm:px-6 text-end">
                        {record.voucherId ? (
                          <Link
                            to="/donor/vouchers"
                            className="font-mono text-xs font-medium text-primary underline-offset-4 hover:underline"
                          >
                            <bdi dir="ltr">{record.voucherId}</bdi>
                          </Link>
                        ) : (
                          <span className="text-muted-foreground text-[11px]">
                            —
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </DonorPageFrame>
  );
}

export default DonorDonationsPage;
