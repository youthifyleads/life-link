import {
  AlertCircle,
  ArrowRight,
  Bell,
  CheckCircle2,
  Droplets,
  Heart,
  HeartHandshake,
  History,
  Inbox,
  ShieldCheck,
  Sparkles,
  Ticket,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";

import { formatShortDate } from "@/features/donor/components/donor-formatters";
import { DonorPageFrame } from "@/features/donor/components/donor-page-frame";
import {
  useDonationRequests,
  useDonorNotifications,
  useDonorProfile,
} from "@/features/donor/hooks/use-donor";
import { BloodGroupBadge } from "@/shared/components/clinical/blood-group-badge";
import { UrgencyBadge } from "@/shared/components/clinical/urgency-badge";
import {
  ErrorState,
  LoadingState,
} from "@/shared/components/feedback/system-states";
import { Button } from "@/shared/components/ui/button";

export function DonorDashboardPage() {
  const { t } = useTranslation();
  const profileQuery = useDonorProfile();
  const requestsQuery = useDonationRequests();
  const notificationsQuery = useDonorNotifications();

  if (profileQuery.isPending || requestsQuery.isPending) {
    return (
      <DonorPageFrame
        breadcrumbs={[
          { label: t("nav.donorServices", "Donor Services") },
          { label: t("nav.dashboard", "Dashboard") },
        ]}
        title={t("donor.portalTitle", "Donor Portal")}
        description={t(
          "donor.portalDesc",
          "Personal blood donation record, community shortage calls, and priority vouchers.",
        )}
      >
        <LoadingState label={t("common.loading", "Loading your donor profile…")} />
      </DonorPageFrame>
    );
  }

  if (profileQuery.isError || !profileQuery.data) {
    return (
      <DonorPageFrame
        breadcrumbs={[
          { label: t("nav.donorServices", "Donor Services") },
          { label: t("nav.dashboard", "Dashboard") },
        ]}
        title={t("donor.portalTitle", "Donor Portal")}
        description={t(
          "donor.portalDesc",
          "Personal blood donation record, community shortage calls, and priority vouchers.",
        )}
      >
        <ErrorState
          title={t("common.error", "Could not load donor profile")}
          description={t("donor.profileLoadErrorDescription")}
          onRetry={() => {
            void profileQuery.refetch();
          }}
        />
      </DonorPageFrame>
    );
  }

  const profile = profileQuery.data;
  const requests = requestsQuery.data ?? [];
  const notifications = notificationsQuery.data ?? [];

  const urgentRequests = requests.filter(
    (r) => r.urgency === "emergency" || r.urgency === "urgent",
  );

  return (
    <DonorPageFrame
      breadcrumbs={[
        { label: t("nav.donorServices", "Donor Services") },
        { label: t("nav.dashboard", "Dashboard") },
      ]}
      title={t("donor.portalTitle", "Donor Portal")}
      description={t(
        "donor.portalDesc",
        "Personal blood donation record, community shortage calls, and priority replacement vouchers.",
      )}
      actions={
        <Button asChild className="gap-2">
          <Link to="/donor/requests">
            <HeartHandshake className="size-4" aria-hidden="true" />
            <span>{t("nav.donationRequests", "Browse Requests")}</span>
          </Link>
        </Button>
      }
    >
      <div className="space-y-8">
        {/* Donor Identity & Eligibility Card */}
        <section
          aria-labelledby="donor-status-heading"
          className="overflow-hidden border border-border bg-surface p-6 sm:p-8"
        >
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-start gap-4">
              <div className="flex size-14 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Droplets className="size-7" aria-hidden="true" />
              </div>
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-3">
                  <h2
                    id="donor-status-heading"
                    className="text-xl font-bold tracking-tight text-foreground sm:text-2xl"
                  >
                    {profile.name}
                  </h2>
                  <BloodGroupBadge group={profile.bloodGroup} />
                </div>
                <p className="mt-1 text-sm text-muted-foreground">
                  {t("roles.donor", "Registered Voluntary Donor")} · {t("common.appName", "Life Link")}
                </p>
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 rounded-md bg-emerald-500/10 px-2.5 py-1 text-xs font-semibold text-emerald-700 dark:text-emerald-300">
                    <CheckCircle2 className="size-3.5" aria-hidden="true" />
                    {t("donor.eligibleNotice", "Eligible to Donate")}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {t("donor.nextEligibleDate", "Last donated on")}{" "}
                    <strong className="text-foreground">
                      <bdi dir="ltr">{profile.lastDonationDate}</bdi>
                    </strong>
                  </span>
                </div>
              </div>
            </div>

            <div className="rounded-md border border-emerald-500/30 bg-emerald-50/50 p-4 text-xs text-emerald-950 dark:bg-emerald-950/20 dark:text-emerald-200 lg:max-w-md">
              <div className="flex items-start gap-2">
                <ShieldCheck
                  className="size-4 shrink-0 text-emerald-600 mt-0.5"
                  aria-hidden="true"
                />
                <p className="leading-relaxed">{profile.eligibilityMessage}</p>
              </div>
            </div>
          </div>

          {/* Key Impact Metrics */}
          <div className="mt-8 grid grid-cols-2 gap-4 border-t border-border pt-6 sm:grid-cols-4">
            <div className="space-y-1">
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Heart className="size-3.5 text-primary" aria-hidden="true" />
                <span>{t("donor.donationsTitle", "Total Donations")}</span>
              </div>
              <p className="text-2xl font-bold text-foreground">
                <bdi dir="ltr">{profile.metrics.totalDonations}</bdi>
              </p>
              <p className="text-[11px] text-muted-foreground">
                {t("healthcare.wholeBlood", "Whole blood & apheresis")}
              </p>
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Droplets
                  className="size-3.5 text-rose-500"
                  aria-hidden="true"
                />
                <span>{t("donor.unitsDonated", "Units Contributed")}</span>
              </div>
              <p className="text-2xl font-bold text-foreground">
                <bdi dir="ltr">{profile.metrics.unitsContributed}</bdi>
              </p>
              <p className="text-[11px] text-muted-foreground">
                <bdi dir="ltr">~2,700 mL</bdi> {t("common.quantity", "volume")}
              </p>
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Sparkles
                  className="size-3.5 text-amber-500"
                  aria-hidden="true"
                />
                <span>{t("donor.myImpact", "Lives Impacted")}</span>
              </div>
              <p className="text-2xl font-bold text-foreground">
                <bdi dir="ltr">{profile.metrics.livesImpacted}</bdi>
              </p>
              <p className="text-[11px] text-muted-foreground">
                {t("donor.myImpact", "Up to 3 lives per donation")}
              </p>
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Ticket className="size-3.5 text-blue-500" aria-hidden="true" />
                <span>{t("donor.vouchers", "Active Vouchers")}</span>
              </div>
              <p className="text-2xl font-bold text-foreground">
                <bdi dir="ltr">{profile.metrics.activeVouchers}</bdi>
              </p>
              <p className="text-[11px] text-muted-foreground">
                {t("donor.voucherNotice", "Family replacement benefit")}
              </p>
            </div>
          </div>
        </section>

        {/* Urgent Call for Donor's Blood Group Banner */}
        {urgentRequests.length > 0 && (
          <section
            aria-labelledby="urgent-shortage-heading"
            className="border-s-4 border-s-emergency border-y border-e border-border bg-surface p-5 sm:p-6"
          >
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <span className="flex size-7 items-center justify-center rounded-full bg-emergency/10 text-emergency">
                    <AlertCircle className="size-4" aria-hidden="true" />
                  </span>
                  <h3
                    id="urgent-shortage-heading"
                    className="text-base font-bold text-foreground"
                  >
                    {t("donor.appealsTitle", "Urgent Shortage: Blood Needed")}
                  </h3>
                  <UrgencyBadge urgency={urgentRequests[0].urgency} />
                </div>
                <p className="text-xs text-muted-foreground max-w-2xl">
                  {urgentRequests[0].requestingOrg.name} — {urgentRequests[0].clinicalContextSafe}.
                </p>
              </div>
              <Button asChild size="sm" className="shrink-0 gap-1.5">
                <Link to={`/donor/requests/${urgentRequests[0].id}`}>
                  <span>{t("donor.commitDonation", "Respond to Request")}</span>
                  <ArrowRight className="size-3.5 rtl:rotate-180" aria-hidden="true" />
                </Link>
              </Button>
            </div>
          </section>
        )}

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          {/* Active Donation Requests Register Preview */}
          <section
            aria-labelledby="active-requests-heading"
            className="space-y-4 lg:col-span-2"
          >
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div>
                <h3
                  id="active-requests-heading"
                  className="text-base font-semibold text-foreground"
                >
                  {t("donor.urgentCalls", "Active Donation Requests")} (<bdi dir="ltr">{requests.length}</bdi>)
                </h3>
                <p className="text-xs text-muted-foreground">
                  {t("donor.appealsDescription", "Verified hospital & regional blood bank requests matching your profile.")}
                </p>
              </div>
              <Button asChild variant="ghost" size="sm">
                <Link to="/donor/requests" className="text-xs gap-1">
                  <span>{t("hospital.viewAllRequests", "View All")}</span>
                  <ArrowRight className="size-3.5 rtl:rotate-180" aria-hidden="true" />
                </Link>
              </Button>
            </div>

            <div className="space-y-3">
              {requests.slice(0, 3).map((req) => (
                <div
                  key={req.id}
                  className="flex flex-col gap-3 border border-border bg-surface p-4 transition-colors hover:border-primary/50 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="space-y-1.5">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono text-xs font-bold text-foreground">
                        <bdi dir="ltr">{req.reference}</bdi>
                      </span>
                      <BloodGroupBadge group={req.bloodGroup} />
                      <UrgencyBadge urgency={req.urgency} />
                      {req.myResponse === "interested" && (
                        <span className="inline-flex items-center gap-1 rounded bg-blue-500/10 px-2 py-0.5 text-[11px] font-semibold text-blue-700 dark:text-blue-300">
                          <CheckCircle2 className="size-3" aria-hidden="true" />
                          {t("status.confirmed", "Interested")}
                        </span>
                      )}
                    </div>
                    <h4 className="text-sm font-semibold text-foreground">
                      {req.requestingOrg.name}
                    </h4>
                    <p className="text-xs text-muted-foreground">
                      {req.clinicalContextSafe} · {t("hospital.requiredBy", "Required by")}{" "}
                      <bdi dir="ltr">{req.requiredByDate}</bdi>
                    </p>
                  </div>
                  <Button asChild variant="secondary" size="sm">
                    <Link to={`/donor/requests/${req.id}`}>
                      <span>{t("common.viewDetails", "Inspect Details")}</span>
                    </Link>
                  </Button>
                </div>
              ))}
            </div>
          </section>

          {/* Recent Notifications & Quick Links */}
          <aside
            aria-labelledby="recent-updates-heading"
            className="space-y-6"
          >
            <div className="border border-border bg-surface p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-border pb-3">
                <div className="flex items-center gap-2">
                  <Bell className="size-4 text-primary" aria-hidden="true" />
                  <h3
                    id="recent-updates-heading"
                    className="text-sm font-semibold text-foreground"
                  >
                    {t("nav.notifications", "Recent Notifications")}
                  </h3>
                </div>
                <Link
                  to="/donor/notifications"
                  className="text-xs text-primary hover:underline"
                >
                  {t("common.view", "See all")}
                </Link>
              </div>

              <div className="space-y-3">
                {notifications.slice(0, 3).map((notif) => (
                  <div
                    key={notif.id}
                    className="space-y-1 border-b border-border/50 pb-3 last:border-0 last:pb-0"
                  >
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-semibold text-foreground">
                        {notif.title}
                      </h4>
                      {!notif.read && (
                        <span
                          className="size-1.5 rounded-full bg-primary"
                          title={t("notifications.unreadBadge", "Unread notification")}
                        />
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground line-clamp-2">
                      {notif.message}
                    </p>
                    <time className="text-[10px] font-medium text-muted-foreground">
                      <bdi dir="ltr">{formatShortDate(notif.timestamp)}</bdi>
                    </time>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Actions Card */}
            <div className="border border-border bg-surface p-5 space-y-3">
              <h3 className="text-sm font-semibold text-foreground">
                {t("common.overview", "Donor Shortcuts")}
              </h3>
              <ul className="space-y-2 text-xs">
                <li>
                  <Link
                    to="/donor/donations"
                    className="flex items-center justify-between rounded p-2 text-muted-foreground hover:bg-muted hover:text-foreground"
                  >
                    <span className="flex items-center gap-2">
                      <History className="size-4 text-primary" />
                      {t("nav.donationHistory", "Donation History Ledger")}
                    </span>
                    <ArrowRight className="size-3.5 rtl:rotate-180" />
                  </Link>
                </li>
                <li>
                  <Link
                    to="/donor/vouchers"
                    className="flex items-center justify-between rounded p-2 text-muted-foreground hover:bg-muted hover:text-foreground"
                  >
                    <span className="flex items-center gap-2">
                      <Ticket className="size-4 text-primary" />
                      {t("nav.donationVouchers", "Priority Replacement Vouchers")}
                    </span>
                    <ArrowRight className="size-3.5 rtl:rotate-180" />
                  </Link>
                </li>
                <li>
                  <Link
                    to="/donor/requests"
                    className="flex items-center justify-between rounded p-2 text-muted-foreground hover:bg-muted hover:text-foreground"
                  >
                    <span className="flex items-center gap-2">
                      <Inbox className="size-4 text-primary" />
                      {t("nav.donationRequests", "Open Donation Requests")}
                    </span>
                    <ArrowRight className="size-3.5 rtl:rotate-180" />
                  </Link>
                </li>
                <li>
                  <Link
                    to="/donor/consents"
                    className="flex items-center justify-between rounded p-2 text-muted-foreground hover:bg-muted hover:text-foreground"
                  >
                    <span className="flex items-center gap-2">
                      <ShieldCheck className="size-4 text-primary" />
                      {t("nav.consentsAndRights", "Consents & Authorizations")}
                    </span>
                    <ArrowRight className="size-3.5 rtl:rotate-180" />
                  </Link>
                </li>
              </ul>
            </div>
          </aside>
        </div>
      </div>
    </DonorPageFrame>
  );
}

export default DonorDashboardPage;
