import {
  Award,
  CheckCircle2,
  QrCode,
  ShieldCheck,
  Ticket,
} from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";

import { DonorPageFrame } from "@/features/donor/components/donor-page-frame";
import { useDonationVouchers } from "@/features/donor/hooks/use-donor";
import type { DonationVoucher } from "@/features/donor/types/donor.types";
import {
  EmptyState,
  ErrorState,
  LoadingState,
} from "@/shared/components/feedback/system-states";
import { Button } from "@/shared/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog";

export function DonorVouchersPage() {
  const { t } = useTranslation();
  const [selectedVoucher, setSelectedVoucher] = useState<DonationVoucher | null>(
    null,
  );
  const vouchersQuery = useDonationVouchers();

  if (vouchersQuery.isPending) {
    return (
      <DonorPageFrame
        breadcrumbs={[
          { label: t("nav.donorServices", "Donor services"), href: "/donor/dashboard" },
          { label: t("nav.donationVouchers", "Donation vouchers") },
        ]}
        title={t("donor.vouchersTitle", "Donation Vouchers")}
        description={t("donor.voucherNotice", "Official priority blood replacement certificates issued for verified donations.")}
      >
        <LoadingState label={t("common.loadingRecords", "Loading donation vouchers…")} />
      </DonorPageFrame>
    );
  }

  if (vouchersQuery.isError || !vouchersQuery.data) {
    return (
      <DonorPageFrame
        breadcrumbs={[
          { label: t("nav.donorServices", "Donor services"), href: "/donor/dashboard" },
          { label: t("nav.donationVouchers", "Donation vouchers") },
        ]}
        title={t("donor.vouchersTitle", "Donation Vouchers")}
        description={t("donor.voucherNotice", "Official priority blood replacement certificates issued for verified donations.")}
      >
        <ErrorState
          title={t("common.error", "Could not load vouchers")}
          description={t("donor.vouchersLoadErrorDescription")}
          onRetry={() => {
            void vouchersQuery.refetch();
          }}
        />
      </DonorPageFrame>
    );
  }

  const vouchers = vouchersQuery.data;

  return (
    <DonorPageFrame
      breadcrumbs={[
        { label: t("nav.donorServices", "Donor services"), href: "/donor/dashboard" },
        { label: t("nav.donationVouchers", "Donation vouchers") },
      ]}
      title={t("donor.vouchersTitle", "Donation Vouchers")}
      description={t("donor.voucherNotice", "Official priority blood replacement certificates issued for verified donations.")}
      actions={
        <Button asChild variant="secondary" size="sm">
          <Link to="/donor/donations">{t("nav.donationHistory", "Donation History")}</Link>
        </Button>
      }
    >
      <div className="space-y-6">
        {/* Informational Banner */}
        <section
          aria-labelledby="voucher-terms-heading"
          className="border border-border bg-surface p-5 sm:p-6"
        >
          <div className="flex items-start gap-3">
            <ShieldCheck
              className="size-5 shrink-0 text-emerald-600 mt-0.5"
              aria-hidden="true"
            />
            <div className="space-y-1">
              <h2
                id="voucher-terms-heading"
                className="text-sm font-semibold text-foreground"
              >
                {t("healthcare.voucherCertificate", "About Priority Blood Replacement Vouchers")}
              </h2>
              <p className="text-xs text-muted-foreground leading-relaxed">
                {t("donor.voucherNotice", "For every successful whole blood or apheresis donation, the Ministry of Health issues a digital voucher guaranteeing priority, zero-fee replacement blood units for you or your first-degree family members in any registered hospital.")}
              </p>
            </div>
          </div>
        </section>

        {/* Voucher Cards Grid */}
        {vouchers.length === 0 ? (
          <EmptyState
            title={t("hospital.noRecordsTitle", "No vouchers currently issued")}
            description={t("hospital.noRecordsDesc", "Complete a blood donation to earn priority replacement vouchers.")}
            action={
              <Button asChild size="sm">
                <Link to="/donor/requests">{t("nav.donationRequests", "Browse Shortage Requests")}</Link>
              </Button>
            }
          />
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            {vouchers.map((voucher) => (
              <article
                key={voucher.id}
                className={`relative overflow-hidden border bg-surface p-6 transition-colors ${
                  voucher.status === "active"
                    ? "border-emerald-500/40 shadow-sm"
                    : "border-border opacity-75"
                }`}
              >
                {/* Decorative Top Pill */}
                <div className="flex items-center justify-between border-b border-border pb-4">
                  <div className="flex items-center gap-2">
                    <Ticket
                      className={`size-5 ${
                        voucher.status === "active"
                          ? "text-emerald-600"
                          : "text-muted-foreground"
                      }`}
                      aria-hidden="true"
                    />
                    <span className="font-mono text-sm font-bold text-foreground">
                      <bdi dir="ltr">{voucher.voucherNumber}</bdi>
                    </span>
                  </div>

                  {voucher.status === "active" ? (
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-xs font-semibold text-emerald-700 dark:text-emerald-300">
                      <CheckCircle2 className="size-3.5" aria-hidden="true" />
                      {t("common.active", "Active Voucher")}
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2.5 py-0.5 text-xs font-semibold text-muted-foreground">
                      {t("status.expired", "Expired")}
                    </span>
                  )}
                </div>

                <div className="mt-4 space-y-3 text-xs">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">
                      {t("donor.donationsTitle", "Linked Donation")}:
                    </span>
                    <span className="font-mono font-semibold text-foreground">
                      <bdi dir="ltr">{voucher.donationId}</bdi>
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-muted-foreground">{t("hospital.created", "Issued Date")}:</span>
                    <span className="font-semibold text-foreground font-mono">
                      <bdi dir="ltr">{voucher.issuedDate}</bdi>
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-muted-foreground">{t("bloodBank.expiry", "Valid Through")}:</span>
                    <span className="font-semibold text-foreground font-mono">
                      <bdi dir="ltr">{voucher.expiryDate}</bdi>
                    </span>
                  </div>

                  <div className="pt-2 border-t border-border/50">
                    <p className="text-[11px] text-muted-foreground line-clamp-2">
                      {voucher.beneficiaryRights}
                    </p>
                  </div>
                </div>

                <div className="mt-6 flex justify-end">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => setSelectedVoucher(voucher)}
                    className="gap-2 text-xs"
                  >
                    <QrCode className="size-3.5" aria-hidden="true" />
                    <span>{t("donor.redeemVoucher", "Inspect Certificate")}</span>
                  </Button>
                </div>
              </article>
            ))}
          </div>
        )}

        {/* Voucher Detail Modal */}
        <Dialog
          open={Boolean(selectedVoucher)}
          onOpenChange={(open) => !open && setSelectedVoucher(null)}
        >
          {selectedVoucher && (
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2 text-base font-bold">
                  <Award className="size-5 text-emerald-600" aria-hidden="true" />
                  {t("healthcare.voucherCertificate", "Priority Replacement Voucher")}
                </DialogTitle>
                <DialogDescription>
                  {t("donor.voucherNotice", "Digital Certificate of Blood Donation and Beneficiary Rights")}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4 py-3 text-xs">
                <div className="rounded-lg border border-border bg-surface-subtle p-4 text-center">
                  <span className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">
                    {t("bloodBank.custodyReference", "Certificate Serial Reference")}
                  </span>
                  <p className="mt-1 font-mono text-xl font-extrabold text-foreground tracking-wider">
                    <bdi dir="ltr">{selectedVoucher.voucherNumber}</bdi>
                  </p>
                  <div className="mt-3 flex justify-center">
                    <div className="flex size-24 items-center justify-center border border-border bg-white text-clinical-ink">
                      <QrCode className="size-16" aria-hidden="true" />
                    </div>
                  </div>
                  <p className="mt-2 text-[10px] text-muted-foreground">
                    {t("bloodBank.scannableNotice", "Scan for national transfusion network verification")}
                  </p>
                </div>

                <dl className="space-y-2.5 divide-y divide-border">
                  <div className="flex justify-between pt-2">
                    <dt className="text-muted-foreground">{t("donor.donationsTitle", "Donation Reference")}</dt>
                    <dd className="font-mono font-semibold text-foreground">
                      <bdi dir="ltr">{selectedVoucher.donationId}</bdi>
                    </dd>
                  </div>
                  <div className="flex justify-between pt-2">
                    <dt className="text-muted-foreground">{t("hospital.facility", "Issue Authority")}</dt>
                    <dd className="font-semibold text-foreground text-end max-w-[14rem]">
                      {selectedVoucher.issuedBy}
                    </dd>
                  </div>
                  <div className="flex justify-between pt-2">
                    <dt className="text-muted-foreground">{t("common.timeline", "Validity Period")}</dt>
                    <dd className="font-semibold text-foreground font-mono">
                      <bdi dir="ltr">{selectedVoucher.issuedDate}</bdi> → <bdi dir="ltr">{selectedVoucher.expiryDate}</bdi>
                    </dd>
                  </div>
                  <div className="pt-2">
                    <dt className="text-muted-foreground mb-1">
                      {t("donor.consentsTitle", "Beneficiary Rights & Coverage")}
                    </dt>
                    <dd className="rounded bg-muted/40 p-2.5 text-[11px] leading-relaxed text-foreground">
                      {selectedVoucher.beneficiaryRights}
                    </dd>
                  </div>
                </dl>
              </div>

              <DialogFooter>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => setSelectedVoucher(null)}
                >
                  {t("common.close", "Close")}
                </Button>
              </DialogFooter>
            </DialogContent>
          )}
        </Dialog>
      </div>
    </DonorPageFrame>
  );
}

export default DonorVouchersPage;
