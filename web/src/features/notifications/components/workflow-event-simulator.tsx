import { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Boxes,
  CheckCircle2,
  Clock,
  HeartHandshake,
  Play,
  ScanLine,
  Sparkles,
} from "lucide-react";

import {
  simulateDonorResponseReceived,
  simulateHospitalRequestCreated,
  simulateInventoryAlert,
  simulateUnitReleased,
  simulateUnitsAllocated,
} from "@/features/notifications/mocks/event-bus.mock";
import { Button } from "@/shared/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/shared/components/ui/dialog";

export function WorkflowEventSimulator() {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [lastTriggered, setLastTriggered] = useState<string | null>(null);

  const handleSimulate = (fn: () => { activity: { action: string } }, label: string) => {
    const res = fn();
    setLastTriggered(`${label}: ${res.activity.action}`);
    // Auto-clear feedback after 4 seconds
    setTimeout(() => {
      setLastTriggered(null);
    }, 4000);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="secondary"
          size="sm"
          className="gap-1.5 border-primary/30 text-primary hover:bg-primary/5"
          id="simulate-workflow-events-btn"
        >
          <Sparkles className="size-3.5" aria-hidden="true" />
          <span>{t("notifications.simulatorBtn", "Simulate Events")}</span>
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-md text-start">
        <DialogHeader className="text-start">
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="size-5 text-primary" aria-hidden="true" />
            {t("notifications.simulatorTitle", "Workflow Event Simulator")}
          </DialogTitle>
          <DialogDescription className="text-start">
            {t(
              "notifications.simulatorDesc",
              "Trigger mock lifecycle events across hospital, blood bank, donor, and caregiver roles to test real-time cross-role notifications.",
            )}
          </DialogDescription>
        </DialogHeader>

        {lastTriggered ? (
          <div className="flex items-center gap-2 rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-3 text-xs font-medium text-emerald-800 dark:text-emerald-300">
            <CheckCircle2 className="size-4 shrink-0 text-emerald-600" aria-hidden="true" />
            <p className="truncate">
              {t("notifications.dispatchedFeedback", {
                action: lastTriggered,
                defaultValue: `Dispatched: ${lastTriggered}`,
              })}
            </p>
          </div>
        ) : null}

        <div className="space-y-2.5 pt-2">
          {/* Hospital: Request Created */}
          <div className="rounded-lg border border-border p-3 transition-colors hover:bg-muted/20">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-foreground">
                  <Clock className="size-3.5 text-sky-600 shrink-0" aria-hidden="true" />
                  <span>
                    {t(
                      "notifications.eventHospitalRequestTitle",
                      "Hospital: Request Created",
                    )}
                  </span>
                </div>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {t(
                    "notifications.eventHospitalRequestDesc",
                    "Simulates emergency requisition creation for O- Red Cells.",
                  )}
                </p>
              </div>
              <Button
                size="sm"
                variant="secondary"
                className="h-8 gap-1 shrink-0 text-xs"
                onClick={() =>
                  handleSimulate(
                    () => simulateHospitalRequestCreated("BR-2026-9901"),
                    "REQUEST_CREATED",
                  )
                }
              >
                <Play className="size-3 rtl:rotate-180" aria-hidden="true" />
                <span>{t("notifications.triggerAction", "Trigger")}</span>
              </Button>
            </div>
          </div>

          {/* Blood Bank: Units Allocated */}
          <div className="rounded-lg border border-border p-3 transition-colors hover:bg-muted/20">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-foreground">
                  <Boxes className="size-3.5 text-indigo-600 shrink-0" aria-hidden="true" />
                  <span>
                    {t(
                      "notifications.eventBloodBankAllocatedTitle",
                      "Blood Bank: Units Allocated",
                    )}
                  </span>
                </div>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {t(
                    "notifications.eventBloodBankAllocatedDesc",
                    "Allocates 2 verified blood units to request BR-2026-2194.",
                  )}
                </p>
              </div>
              <Button
                size="sm"
                variant="secondary"
                className="h-8 gap-1 shrink-0 text-xs"
                onClick={() =>
                  handleSimulate(
                    () => simulateUnitsAllocated("BR-2026-2194", "UNT-O-NEG-0992"),
                    "UNITS_ALLOCATED",
                  )
                }
              >
                <Play className="size-3 rtl:rotate-180" aria-hidden="true" />
                <span>{t("notifications.triggerAction", "Trigger")}</span>
              </Button>
            </div>
          </div>

          {/* Tracking: Unit Released */}
          <div className="rounded-lg border border-border p-3 transition-colors hover:bg-muted/20">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-foreground">
                  <ScanLine className="size-3.5 text-cyan-600 shrink-0" aria-hidden="true" />
                  <span>
                    {t(
                      "notifications.eventTrackingReleasedTitle",
                      "Tracking: Unit Released",
                    )}
                  </span>
                </div>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {t(
                    "notifications.eventTrackingReleasedDesc",
                    "Dispatches transit unit UNT-B-POS-0331 under 2°C–6°C assurance.",
                  )}
                </p>
              </div>
              <Button
                size="sm"
                variant="secondary"
                className="h-8 gap-1 shrink-0 text-xs"
                onClick={() =>
                  handleSimulate(
                    () => simulateUnitReleased("UNT-B-POS-0331"),
                    "UNIT_RELEASED",
                  )
                }
              >
                <Play className="size-3 rtl:rotate-180" aria-hidden="true" />
                <span>{t("notifications.triggerAction", "Trigger")}</span>
              </Button>
            </div>
          </div>

          {/* Donor: Response Confirmed */}
          <div className="rounded-lg border border-border p-3 transition-colors hover:bg-muted/20">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-foreground">
                  <HeartHandshake className="size-3.5 text-emerald-600 shrink-0" aria-hidden="true" />
                  <span>
                    {t(
                      "notifications.eventDonorConfirmedTitle",
                      "Donor: Response Confirmed",
                    )}
                  </span>
                </div>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {t(
                    "notifications.eventDonorConfirmedDesc",
                    "Donor Omar confirms acceptance for shortage appeal DR-2026-0811.",
                  )}
                </p>
              </div>
              <Button
                size="sm"
                variant="secondary"
                className="h-8 gap-1 shrink-0 text-xs"
                onClick={() =>
                  handleSimulate(
                    () => simulateDonorResponseReceived("Omar Donor", "DR-2026-0811"),
                    "DONATION_RESPONSE_RECEIVED",
                  )
                }
              >
                <Play className="size-3 rtl:rotate-180" aria-hidden="true" />
                <span>{t("notifications.triggerAction", "Trigger")}</span>
              </Button>
            </div>
          </div>

          {/* Inventory: Low Reserve Alert */}
          <div className="rounded-lg border border-border p-3 transition-colors hover:bg-muted/20">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-foreground">
                  <Boxes className="size-3.5 text-orange-600 shrink-0" aria-hidden="true" />
                  <span>
                    {t(
                      "notifications.eventInventoryAlertTitle",
                      "Inventory: Low Reserve Alert",
                    )}
                  </span>
                </div>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {t(
                    "notifications.eventInventoryAlertDesc",
                    "Fires critical shortage warning for O- cold storage.",
                  )}
                </p>
              </div>
              <Button
                size="sm"
                variant="secondary"
                className="h-8 gap-1 shrink-0 text-xs"
                onClick={() =>
                  handleSimulate(
                    () => simulateInventoryAlert("O-"),
                    "INVENTORY_ALERT",
                  )
                }
              >
                <Play className="size-3 rtl:rotate-180" aria-hidden="true" />
                <span>{t("notifications.triggerAction", "Trigger")}</span>
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
