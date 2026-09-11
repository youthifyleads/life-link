import {
  Check,
  LoaderCircle,
  PackageCheck,
  PackageOpen,
  X,
} from "lucide-react";
import { useState } from "react";

import { getAvailableActions } from "@/features/blood-bank/requests/blood-bank-requests.mock";
import type {
  BloodBankRequest,
  BloodBankRequestAction,
} from "@/features/blood-bank/types/blood-bank.types";
import { Button } from "@/shared/components/ui/button";

interface RequestActionPanelProps {
  request: BloodBankRequest;
  isPending: boolean;
  onAction: (request: BloodBankRequest, action: BloodBankRequestAction) => void;
}

const actionIcons = {
  acknowledge: Check,
  confirm: PackageCheck,
  start_preparation: PackageOpen,
  complete: Check,
} as const;

import { useTranslation } from "react-i18next";
import { getBloodBankActionLabel } from "@/features/blood-bank/components/blood-bank-formatters";

export function RequestActionPanel({
  request,
  isPending,
  onAction,
}: RequestActionPanelProps) {
  const { t } = useTranslation();
  const [isConfirmingReject, setIsConfirmingReject] = useState(false);
  const actions = getAvailableActions(request);
  const primaryAction = actions.find((action) => action !== "reject");
  const canReject = actions.includes("reject");

  if (actions.length === 0) {
    return (
      <span className="text-xs text-muted-foreground italic tabular-nums">
        {t("common.none", "—")}
      </span>
    );
  }

  if (isConfirmingReject) {
    return (
      <div
        className="inline-flex flex-col gap-1.5 rounded-md border border-destructive/30 bg-emergency-subtle p-2 text-start shadow-xs animate-in fade-in-50 duration-150"
        role="group"
        aria-label={t("bloodBank.confirmRejectionOf", { id: request.id })}
      >
        <span className="text-[11px] font-semibold text-destructive">
          {t("bloodBank.rejectionModalTitle", "Reject requisition?")}
        </span>
        <div className="flex items-center gap-1.5">
          <Button
            type="button"
            size="sm"
            variant="destructive"
            className="h-6 px-2 text-[11px]"
            disabled={isPending}
            onClick={() => onAction(request, "reject")}
          >
            {isPending ? (
              <LoaderCircle aria-hidden="true" className="size-3 animate-spin" />
            ) : (
              <X aria-hidden="true" className="size-3" />
            )}
            {t("common.confirm", "Confirm")}
          </Button>
          <Button
            type="button"
            size="sm"
            variant="ghost"
            className="h-6 px-2 text-[11px]"
            disabled={isPending}
            onClick={() => setIsConfirmingReject(false)}
          >
            {t("common.cancel", "Cancel")}
          </Button>
        </div>
      </div>
    );
  }

  const PrimaryIcon = primaryAction ? actionIcons[primaryAction] : null;

  return (
    <div className="flex items-center gap-1.5">
      {primaryAction && PrimaryIcon ? (
        <Button
          type="button"
          size="sm"
          disabled={isPending}
          className="h-8 px-2.5 text-xs font-semibold shadow-xs"
          onClick={() => onAction(request, primaryAction)}
        >
          {isPending ? (
            <LoaderCircle aria-hidden="true" className="size-3.5 animate-spin" />
          ) : (
            <PrimaryIcon aria-hidden="true" className="size-3.5" />
          )}
          {getBloodBankActionLabel(primaryAction)}
        </Button>
      ) : null}
      {canReject ? (
        <Button
          type="button"
          size="sm"
          variant="ghost"
          disabled={isPending}
          className="h-8 px-2 text-xs text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
          title={t("bloodBank.rejectRequest", "Reject request")}
          onClick={() => setIsConfirmingReject(true)}
        >
          <X aria-hidden="true" className="size-3.5" />
          <span className="sr-only sm:not-sr-only sm:inline-block">
            {t("common.rejected", "Reject")}
          </span>
        </Button>
      ) : null}
    </div>
  );
}
