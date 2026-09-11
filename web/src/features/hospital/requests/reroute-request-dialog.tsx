import {
  AlertCircle,
  Building2,
  LoaderCircle,
  MapPin,
  Phone,
  RefreshCw,
} from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";

import {
  useAvailableBloodBanks,
  useRerouteHospitalRequest,
} from "@/features/hospital/hooks/use-hospital-requests";
import type { HospitalRequest } from "@/features/hospital/types/hospital.types";
import { BloodGroupBadge } from "@/shared/components/clinical/blood-group-badge";
import { BidiText, TechnicalText } from "@/shared/components/i18n/bidi-text";
import { Button } from "@/shared/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog";

interface RerouteRequestDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  request: HospitalRequest;
  onSuccess: (updated: HospitalRequest) => void;
}

export function RerouteRequestDialog({
  open,
  onOpenChange,
  request,
  onSuccess,
}: RerouteRequestDialogProps) {
  const { t } = useTranslation();
  const bloodBanksQuery = useAvailableBloodBanks();
  const rerouteMutation = useRerouteHospitalRequest();

  const allBanks = bloodBanksQuery.data ?? [];
  const alternativeBanks = allBanks.filter(
    (b) => b.id !== request.bloodBankId && b.status === "active",
  );

  const [selectedBankId, setSelectedBankId] = useState<string>(
    alternativeBanks[0]?.id ?? "",
  );
  const [resubmissionNote, setResubmissionNote] = useState("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const selectedBank =
    alternativeBanks.find((b) => b.id === selectedBankId) ?? alternativeBanks[0];

  const handleReroute = async () => {
    if (!selectedBank) {
      setErrorMsg(t("hospital.selectAlternativeError"));
      return;
    }

    setErrorMsg(null);
    try {
      const updated = await rerouteMutation.mutateAsync({
        requestId: request.id,
        newBloodBankId: selectedBank.id,
        notes: resubmissionNote,
      });
      onSuccess(updated);
      onOpenChange(false);
    } catch (err) {
      setErrorMsg(
        err instanceof Error ? err.message : t("hospital.rerouteFailed"),
      );
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg sm:max-w-xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-base">
            <RefreshCw className="size-4 text-primary" aria-hidden="true" />
            {t("hospital.rerouteRequisition")} <TechnicalText>{request.id}</TechnicalText>
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            {t("hospital.rerouteDialogDescription")}
          </DialogDescription>
        </DialogHeader>

        {errorMsg ? (
          <div
            className="flex items-center gap-2 border border-destructive/30 bg-emergency-subtle p-3 text-xs text-emergency"
            role="alert"
          >
            <AlertCircle className="size-4 shrink-0" aria-hidden="true" />
            <span>{errorMsg}</span>
          </div>
        ) : null}

        <div className="space-y-4 py-2">
          <div className="border border-border bg-surface-subtle p-3 text-xs">
            <span className="font-semibold text-foreground">
              {t("hospital.currentRequisition")}:
            </span>{" "}
            <BloodGroupBadge group={request.bloodGroup} size="compact" /> {t("hospital.unitCount", { count: request.quantity })} · {t("common.urgency")}:{" "}
            <span className="capitalize font-medium text-foreground">
              {t(`urgency.${request.urgency}`)}
            </span>{" "}
            · {t("hospital.rejectedBy")}:{" "}
            <span className="font-semibold text-foreground">
              <BidiText>{request.targetBloodBank?.name || t("hospital.recipientBank")}</BidiText>
            </span>
          </div>

          <div>
            <label className="text-xs font-semibold text-foreground">
              {t("hospital.selectAlternativeBank")}
            </label>
            <p className="text-[11px] text-muted-foreground mb-2">
              {t("hospital.activeFacilitiesDescription")}
            </p>

            <div className="max-h-56 space-y-2 overflow-y-auto pe-1">
              {alternativeBanks.map((bank) => {
                const isSelected = bank.id === (selectedBank?.id ?? "");
                const posture = bank.availabilitySummary.posture;

                return (
                  <button
                    key={bank.id}
                    type="button"
                    onClick={() => setSelectedBankId(bank.id)}
                    className={`w-full text-start p-3 border transition-colors flex items-start justify-between gap-3 ${
                      isSelected
                        ? "border-primary bg-primary/5 ring-1 ring-primary"
                        : "border-border bg-surface hover:bg-surface-subtle"
                    }`}
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <Building2
                          className="size-4 text-primary shrink-0"
                          aria-hidden="true"
                        />
                        <span className="font-semibold text-xs text-foreground truncate">
                          <BidiText>{bank.name}</BidiText>
                        </span>
                        <span className="rounded bg-muted px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground">
                          <TechnicalText>{bank.facilityCode}</TechnicalText>
                        </span>
                      </div>
                      <div className="mt-1 flex flex-wrap items-center gap-x-3 text-[11px] text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <MapPin className="size-3" aria-hidden="true" />
                          <BidiText>{bank.governorate}</BidiText>
                        </span>
                        <span className="flex items-center gap-1">
                          <Phone className="size-3" aria-hidden="true" />
                          <TechnicalText>{bank.phone}</TechnicalText>
                        </span>
                      </div>
                    </div>

                    <div className="text-end shrink-0">
                      <span
                        className={`inline-block px-1.5 py-0.5 text-[10px] font-semibold uppercase ${
                          posture === "optimal"
                            ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30"
                            : posture === "warning"
                              ? "bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/30"
                              : "bg-emergency-subtle text-emergency border border-destructive/30"
                        }`}
                      >
                        {t("hospital.availableUnitPosture", { count: bank.availabilitySummary.totalAvailable, posture: t(`hospital.posture.${posture}`) })}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label
              htmlFor="reroute-note-input"
              className="text-xs font-semibold text-foreground"
            >
              {t("hospital.resubmissionNote")}
            </label>
            <textarea
              id="reroute-note-input"
              rows={3}
              value={resubmissionNote}
              onChange={(e) => setResubmissionNote(e.target.value)}
              placeholder={t("hospital.resubmissionNotePlaceholder")}
              className="mt-1 w-full border border-border bg-surface px-3 py-2 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            type="button"
            variant="secondary"
            onClick={() => onOpenChange(false)}
            disabled={rerouteMutation.isPending}
          >
            {t("hospital.keepRejected")}
          </Button>
          <Button
            type="button"
            onClick={() => void handleReroute()}
            disabled={rerouteMutation.isPending || !selectedBank}
          >
            {rerouteMutation.isPending ? (
              <LoaderCircle
                className="size-3.5 animate-spin"
                aria-hidden="true"
              />
            ) : (
              <RefreshCw className="size-3.5" aria-hidden="true" />
            )}
            {t("hospital.resubmitTo", { name: selectedBank?.name ?? t("hospital.selectedBank") })}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
