import {
  Check,
  LoaderCircle,
  PackageCheck,
  PackageOpen,
  X,
} from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";

import { getBloodBankActionLabel } from "@/features/blood-bank/components/blood-bank-formatters";
import { getAvailableActions } from "@/features/blood-bank/requests/blood-bank-requests.mock";
import type {
  BloodBankRequest,
  BloodBankRequestAction,
} from "@/features/blood-bank/types/blood-bank.types";
import { Button } from "@/shared/components/ui/button";
import { cn } from "@/shared/lib/utils";

interface RequestActionPanelProps {
  request: BloodBankRequest;
  isPending: boolean;
  onAction: (request: BloodBankRequest, action: BloodBankRequestAction) => void;
  className?: string;
}

const actionIcons = {
  acknowledge: Check,
  confirm: PackageCheck,
  start_preparation: PackageOpen,
  complete: Check,
} as const;

export function RequestActionPanel({
  request,
  isPending,
  onAction,
  className,
}: RequestActionPanelProps) {
  const { t } = useTranslation();
  const [isConfirmingReject, setIsConfirmingReject] = useState(false);
  const actions = getAvailableActions(request);
  const primaryAction = actions.find((action) => action !== "reject");
  const canReject = actions.includes("reject");

  if (actions.length === 0) {
    return (
      <span className="text-xs text-muted-foreground">
        {t("bloodBank.queueNoAction")}
      </span>
    );
  }

  if (isConfirmingReject) {
    return (
      <div
        className={cn(
          "inline-flex flex-col gap-2 rounded-md border border-destructive/30 bg-emergency-subtle p-2.5 text-start",
          className,
        )}
        role="group"
        aria-label={t("bloodBank.confirmRejectionOf", { id: request.id })}
      >
        <span className="text-xs font-semibold text-destructive">
          {t("bloodBank.queueRejectConfirmation")}
        </span>
        <div className="flex items-center gap-1.5">
          <Button
            type="button"
            size="sm"
            variant="destructive"
            className="h-8 px-2.5 text-xs"
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
            className="h-8 px-2.5 text-xs"
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
    <div className={cn("flex flex-wrap items-center gap-2", className)}>
      {primaryAction && PrimaryIcon ? (
        <Button
          type="button"
          size="sm"
          disabled={isPending}
          className="h-9 px-3 text-xs font-semibold"
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
          className="h-9 px-2.5 text-xs text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
          title={t("bloodBank.rejectRequest", "Reject request")}
          onClick={() => setIsConfirmingReject(true)}
        >
          <X aria-hidden="true" className="size-3.5" />
          <span>{t("bloodBank.rejectRequest")}</span>
        </Button>
      ) : null}
    </div>
  );
}
