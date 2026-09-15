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
      <span className="text-xs leading-5 text-muted-foreground">
        {t("common.none", "No action required")}
      </span>
    );
  }

  if (isConfirmingReject) {
    return (
      <div
        className="min-w-52 border border-destructive/25 bg-emergency-subtle p-2.5"
        role="group"
        aria-label={t("bloodBank.confirmRejectionOf", { id: request.id })}
      >
        <p className="text-xs font-semibold text-[#7a1a13]">
          {t("bloodBank.rejectionModalTitle", "Reject this request?")}
        </p>
        <div className="mt-2 flex gap-2">
          <Button
            type="button"
            size="sm"
            variant="destructive"
            disabled={isPending}
            onClick={() => onAction(request, "reject")}
          >
            {isPending ? (
              <LoaderCircle aria-hidden="true" className="animate-spin" />
            ) : (
              <X aria-hidden="true" />
            )}
            {t("common.confirm", "Confirm reject")}
          </Button>
          <Button
            type="button"
            size="sm"
            variant="secondary"
            disabled={isPending}
            onClick={() => setIsConfirmingReject(false)}
          >
            {t("common.cancel", "Keep request")}
          </Button>
        </div>
      </div>
    );
  }

  const PrimaryIcon = primaryAction ? actionIcons[primaryAction] : null;

  return (
    <div className="flex flex-wrap gap-2">
      {primaryAction && PrimaryIcon ? (
        <Button
          type="button"
          size="sm"
          disabled={isPending}
          onClick={() => onAction(request, primaryAction)}
        >
          {isPending ? (
            <LoaderCircle aria-hidden="true" className="animate-spin" />
          ) : (
            <PrimaryIcon aria-hidden="true" />
          )}
          {getBloodBankActionLabel(primaryAction)}
        </Button>
      ) : null}
      {canReject ? (
        <Button
          type="button"
          size="sm"
          variant="secondary"
          disabled={isPending}
          className="text-destructive hover:text-destructive"
          onClick={() => setIsConfirmingReject(true)}
        >
          <X aria-hidden="true" />
          {t("common.rejected", "Reject")}
        </Button>
      ) : null}
    </div>
  );
}
