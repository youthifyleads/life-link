import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import {
  Bell,
  CheckCircle2,
  Mail,
  MessageSquare,
  Radio,
  RotateCcw,
  Save,
  Volume2,
} from "lucide-react";

import { useAuth } from "@/features/authentication/model/use-auth";
import { getLocalizedRoleName } from "@/features/notifications/components/notifications-formatters";
import {
  useNotificationPreferences,
  useUpdateNotificationPreferences,
} from "@/features/notifications/hooks/use-notifications";
import type { NotificationPreferences } from "@/features/notifications/types/notifications.types";
import {
  ErrorState,
  LoadingState,
} from "@/shared/components/feedback/system-states";
import { Button } from "@/shared/components/ui/button";

const defaultPreferences: NotificationPreferences = {
  inAppNotifications: true,
  urgentAlerts: true,
  workflowUpdates: true,
  systemAnnouncements: true,
  emailDigest: false,
  smsEmergencyAlerts: true,
  soundEnabled: true,
};

export function NotificationPreferencesPage() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const preferencesQuery = useNotificationPreferences();
  const updateMutation = useUpdateNotificationPreferences();

  const [overrides, setOverrides] = useState<Partial<NotificationPreferences>>({});
  const [saveSuccess, setSaveSuccess] = useState(false);

  const effectivePreferences: NotificationPreferences = {
    ...(preferencesQuery.data ?? defaultPreferences),
    ...overrides,
  };

  const handleToggle = (key: keyof NotificationPreferences) => {
    setOverrides((prev) => ({
      ...prev,
      [key]: !effectivePreferences[key],
    }));
    setSaveSuccess(false);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateMutation.mutateAsync(effectivePreferences);
    setOverrides({});
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 4000);
  };

  const handleReset = () => {
    setOverrides({});
    setSaveSuccess(false);
  };

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-6 sm:px-6 lg:px-8 text-start">
      {/* Header & Breadcrumbs */}
      <div className="border-b border-border pb-6">
        <nav className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1">
          <Link to="/" className="hover:underline">
            {t("nav.workspace", "Workspace")}
          </Link>
          <span className="rtl:rotate-180">/</span>
          <Link to="/notifications" className="hover:underline">
            {t("notifications.notificationInboxTitle", "Notifications")}
          </Link>
          <span className="rtl:rotate-180">/</span>
          <span className="text-foreground font-medium">
            {t("notifications.preferencesAction", "Preferences")}
          </span>
        </nav>
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            {t("notifications.preferencesTitle", "Notification Preferences")}
          </h1>
          <span className="text-xs text-muted-foreground rounded bg-muted px-2 py-0.5">
            {t("notifications.rolePrefix", "Role")}:{" "}
            {getLocalizedRoleName(user?.primary_role ?? "")}
          </span>
        </div>
        <p className="mt-1 text-sm text-muted-foreground">
          {t(
            "notifications.preferencesDesc",
            "Control which operational alerts, lifecycle updates, and clinical dispatch notifications you receive.",
          )}
        </p>
      </div>

      {preferencesQuery.isLoading ? (
        <div className="mt-8">
          <LoadingState
            label={t("notifications.loadingLedger", "Loading notification preferences")}
          />
        </div>
      ) : preferencesQuery.isError ? (
        <div className="mt-8">
          <ErrorState
            title={t("notifications.failedToLoadPreferences", "Failed to load preferences")}
            description={t(
              "notifications.failedToLoadPreferencesDesc",
              "Could not retrieve your stored notification settings.",
            )}
            onRetry={() => void preferencesQuery.refetch()}
          />
        </div>
      ) : (
        <form onSubmit={handleSave} className="mt-6 space-y-6">
          {saveSuccess ? (
            <div className="flex items-center gap-2 rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-4 text-xs font-medium text-emerald-800 dark:text-emerald-300">
              <CheckCircle2 className="size-4 shrink-0 text-emerald-600" aria-hidden="true" />
              <span>
                {t(
                  "notifications.preferencesSavedSuccess",
                  "Notification preferences saved successfully.",
                )}
              </span>
            </div>
          ) : null}

          {/* Section 1: In-App Operational Channels */}
          <div className="rounded-lg border border-border bg-card p-5 shadow-sm space-y-4">
            <div>
              <h2 className="text-sm font-semibold text-foreground flex items-center gap-2">
                <Bell className="size-4 text-primary shrink-0" />
                <span>
                  {t(
                    "notifications.inAppSectionTitle",
                    "In-App Operational Channels",
                  )}
                </span>
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                {t(
                  "notifications.inAppSectionDesc",
                  "Configure popovers and ledger updates within the web application.",
                )}
              </p>
            </div>

            <div className="divide-y divide-border pt-1">
              <div className="flex items-center justify-between py-3.5 gap-4">
                <div className="pe-4 flex-1">
                  <p className="text-xs font-semibold text-foreground">
                    {t(
                      "notifications.prefInAppFeedTitle",
                      "In-App Notification Feed",
                    )}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {t(
                      "notifications.prefInAppFeedDesc",
                      "Show badge indicators on the header bell and record items in the Notification Center.",
                    )}
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer shrink-0">
                  <input
                    type="checkbox"
                    checked={effectivePreferences.inAppNotifications}
                    onChange={() => handleToggle("inAppNotifications")}
                    className="sr-only peer"
                    id="pref-in-app"
                    aria-label={t(
                      "notifications.prefInAppFeedTitle",
                      "In-App Notification Feed",
                    )}
                  />
                  <div className="w-9 h-5 bg-muted peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary"></div>
                </label>
              </div>

              <div className="flex items-center justify-between py-3.5 gap-4">
                <div className="pe-4 flex-1">
                  <p className="text-xs font-semibold text-foreground">
                    {t(
                      "notifications.prefUrgentAlertsTitle",
                      "Urgent & Emergency Shortage Alerts",
                    )}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {t(
                      "notifications.prefUrgentAlertsDesc",
                      "Receive high-priority alerts for code-red transfusions, low blood stock, and immediate appeals.",
                    )}
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer shrink-0">
                  <input
                    type="checkbox"
                    checked={effectivePreferences.urgentAlerts}
                    onChange={() => handleToggle("urgentAlerts")}
                    className="sr-only peer"
                    id="pref-urgent-alerts"
                    aria-label={t(
                      "notifications.prefUrgentAlertsTitle",
                      "Urgent & Emergency Shortage Alerts",
                    )}
                  />
                  <div className="w-9 h-5 bg-muted peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary"></div>
                </label>
              </div>

              <div className="flex items-center justify-between py-3.5 gap-4">
                <div className="pe-4 flex-1">
                  <p className="text-xs font-semibold text-foreground">
                    {t(
                      "notifications.prefWorkflowUpdatesTitle",
                      "Workflow Status & Allocation Updates",
                    )}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {t(
                      "notifications.prefWorkflowUpdatesDesc",
                      "Notifies when requisitions are confirmed, units allocated, or couriers arrive at destination.",
                    )}
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer shrink-0">
                  <input
                    type="checkbox"
                    checked={effectivePreferences.workflowUpdates}
                    onChange={() => handleToggle("workflowUpdates")}
                    className="sr-only peer"
                    id="pref-workflow-updates"
                    aria-label={t(
                      "notifications.prefWorkflowUpdatesTitle",
                      "Workflow Status & Allocation Updates",
                    )}
                  />
                  <div className="w-9 h-5 bg-muted peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary"></div>
                </label>
              </div>

              <div className="flex items-center justify-between py-3.5 gap-4">
                <div className="pe-4 flex-1">
                  <p className="text-xs font-semibold text-foreground">
                    {t(
                      "notifications.prefSystemNoticesTitle",
                      "Platform Governance & System Notices",
                    )}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {t(
                      "notifications.prefSystemNoticesDesc",
                      "Announcements about scheduled maintenance windows, policy changes, and security updates.",
                    )}
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer shrink-0">
                  <input
                    type="checkbox"
                    checked={effectivePreferences.systemAnnouncements}
                    onChange={() => handleToggle("systemAnnouncements")}
                    className="sr-only peer"
                    id="pref-system-announcements"
                    aria-label={t(
                      "notifications.prefSystemNoticesTitle",
                      "Platform Governance & System Notices",
                    )}
                  />
                  <div className="w-9 h-5 bg-muted peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary"></div>
                </label>
              </div>
            </div>
          </div>

          {/* Section 2: Audio & Secondary Dispatch Channels */}
          <div className="rounded-lg border border-border bg-card p-5 shadow-sm space-y-4">
            <div>
              <h2 className="text-sm font-semibold text-foreground flex items-center gap-2">
                <Radio className="size-4 text-primary shrink-0" />
                <span>
                  {t(
                    "notifications.dispatchSectionTitle",
                    "Dispatch & Auxiliary Channels",
                  )}
                </span>
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                {t(
                  "notifications.dispatchSectionDesc",
                  "Simulated external channels for urgent off-screen alerts.",
                )}
              </p>
            </div>

            <div className="divide-y divide-border pt-1">
              <div className="flex items-center justify-between py-3.5 gap-4">
                <div className="pe-4 flex-1">
                  <div className="flex items-center gap-1.5">
                    <Volume2 className="size-3.5 text-muted-foreground shrink-0" />
                    <p className="text-xs font-semibold text-foreground">
                      {t(
                        "notifications.prefSoundTitle",
                        "Auditory Chime on Urgent Alerts",
                      )}
                    </p>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {t(
                      "notifications.prefSoundDesc",
                      "Play a clinical alert sound when emergency blood requisitions or temperature breaches are recorded.",
                    )}
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer shrink-0">
                  <input
                    type="checkbox"
                    checked={effectivePreferences.soundEnabled}
                    onChange={() => handleToggle("soundEnabled")}
                    className="sr-only peer"
                    id="pref-sound"
                    aria-label={t(
                      "notifications.prefSoundTitle",
                      "Auditory Chime on Urgent Alerts",
                    )}
                  />
                  <div className="w-9 h-5 bg-muted peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary"></div>
                </label>
              </div>

              <div className="flex items-center justify-between py-3.5 gap-4">
                <div className="pe-4 flex-1">
                  <div className="flex items-center gap-1.5">
                    <MessageSquare className="size-3.5 text-muted-foreground shrink-0" />
                    <p className="text-xs font-semibold text-foreground">
                      {t(
                        "notifications.prefSmsTitle",
                        "SMS Emergency Alerts (Simulated)",
                      )}
                    </p>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {t(
                      "notifications.prefSmsDesc",
                      "Send immediate cellular SMS notifications for urgent donor shortage appeals or courier handover.",
                    )}
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer shrink-0">
                  <input
                    type="checkbox"
                    checked={effectivePreferences.smsEmergencyAlerts}
                    onChange={() => handleToggle("smsEmergencyAlerts")}
                    className="sr-only peer"
                    id="pref-sms"
                    aria-label={t(
                      "notifications.prefSmsTitle",
                      "SMS Emergency Alerts (Simulated)",
                    )}
                  />
                  <div className="w-9 h-5 bg-muted peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary"></div>
                </label>
              </div>

              <div className="flex items-center justify-between py-3.5 gap-4">
                <div className="pe-4 flex-1">
                  <div className="flex items-center gap-1.5">
                    <Mail className="size-3.5 text-muted-foreground shrink-0" />
                    <p className="text-xs font-semibold text-foreground">
                      {t(
                        "notifications.prefEmailTitle",
                        "Daily Summary Email Digest",
                      )}
                    </p>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {t(
                      "notifications.prefEmailDesc",
                      "Receive a consolidated summary of the day's activity, issued vouchers, and inventory levels.",
                    )}
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer shrink-0">
                  <input
                    type="checkbox"
                    checked={effectivePreferences.emailDigest}
                    onChange={() => handleToggle("emailDigest")}
                    className="sr-only peer"
                    id="pref-email-digest"
                    aria-label={t(
                      "notifications.prefEmailTitle",
                      "Daily Summary Email Digest",
                    )}
                  />
                  <div className="w-9 h-5 bg-muted peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary"></div>
                </label>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-between pt-2">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="gap-1.5 text-xs text-muted-foreground"
              onClick={handleReset}
            >
              <RotateCcw className="size-3.5" />
              <span>{t("notifications.resetChanges", "Reset changes")}</span>
            </Button>

            <Button
              type="submit"
              size="sm"
              className="gap-1.5 text-xs"
              disabled={updateMutation.isPending}
              id="save-preferences-btn"
            >
              <Save className="size-3.5" />
              <span>
                {updateMutation.isPending
                  ? t("notifications.savingPreferences", "Saving...")
                  : t("notifications.savePreferencesAction", "Save Preferences")}
              </span>
            </Button>
          </div>
        </form>
      )}
    </div>
  );
}
