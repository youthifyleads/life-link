import {
  CheckCircle2,
  Clock,
  Ticket,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";

import { DonorPageFrame } from "@/features/donor/components/donor-page-frame";
import { useDonationHistory } from "@/features/donor/hooks/use-donor";
import { BloodGroupBadge } from "@/shared/components/clinical/blood-group-badge";
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
          { label: t("nav.donorServices", "Donor services"), href: "/donor/dashboard" },
          { label: t("nav.donationHistory", "Donation history") },
        ]}
        title={t("donor.donationsTitle", "Donation History")}
        description={t("donor.portalDesc", "Comprehensive personal ledger of all verified whole blood and apheresis donations.")}
      >
        <LoadingState label={t("common.loadingRecords", "Loading donation history…")} />
      </DonorPageFrame>
    );
  }

  if (historyQuery.isError || !historyQuery.data) {
    return (
      <DonorPageFrame
        breadcrumbs={[
          { label: t("nav.donorServices", "Donor services"), href: "/donor/dashboard" },
          { label: t("nav.donationHistory", "Donation history") },
        ]}
        title={t("donor.donationsTitle", "Donation History")}
        description={t("donor.portalDesc", "Comprehensive personal ledger of all verified whole blood and apheresis donations.")}
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
        { label: t("nav.donorServices", "Donor services"), href: "/donor/dashboard" },
        { label: t("nav.donationHistory", "Donation history") },
      ]}
      title={t("donor.donationsTitle", "Donation History")}
      description={t("donor.portalDesc", "Comprehensive personal ledger of all verified whole blood and apheresis donations.")}
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
            description={t("hospital.noRecordsDesc", "When you complete a verified blood donation at an accredited hospital or blood bank, it will appear here.")}
            action={
              <Button asChild size="sm">
                <Link to="/donor/requests">{t("nav.donationRequests", "Explore Open Requests")}</Link>
              </Button>
            }
          />
        ) : (
          <div className="overflow-hidden border border-border bg-surface">
            <div
              tabIndex={0}
              role="region"
              aria-label={t("donor.donationHistoryTableLabel")}
              className="overflow-x-auto focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <table className="w-full text-start text-xs">
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
                          <span className="inline-flex items-center gap-1 rounded-md bg-emerald-500/10 px-2 py-0.5 font-semibold text-emerald-700 dark:text-emerald-300">
                            <CheckCircle2 className="size-3" aria-hidden="true" />
                            {t("status.completed", "Completed")}
                          </span>
                        ) : record.status === "processing" ? (
                          <span className="inline-flex items-center gap-1 rounded-md bg-blue-500/10 px-2 py-0.5 font-semibold text-blue-700 dark:text-blue-300">
                            <Clock className="size-3" aria-hidden="true" />
                            {t("status.preparing", "Processing")}
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 rounded-md bg-amber-500/10 px-2 py-0.5 font-semibold text-amber-700 dark:text-amber-400">
                            {t("status.rejected", "Deferred")}
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-4 sm:px-6 text-end">
                        {record.voucherId ? (
                          <Button asChild variant="secondary" size="sm">
                            <Link to="/donor/vouchers" className="gap-1 font-mono text-xs">
                              <Ticket className="size-3 text-primary" />
                              <span><bdi dir="ltr">{record.voucherId}</bdi></span>
                            </Link>
                          </Button>
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
