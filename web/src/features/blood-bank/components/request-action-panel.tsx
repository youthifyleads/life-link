import { Check, LoaderCircle, PackageOpen, RotateCcw, X } from "lucide-react";
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
  confirm: Check,
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
        className={cn("inline-flex items-center justify-end gap-1", className)}
        role="group"
        aria-label={t("bloodBank.confirmRejectionOf", { id: request.id })}
      >
        <span className="sr-only">
          {t("bloodBank.queueRejectConfirmation")}
        </span>
        <Button
          type="button"
          size="icon"
          variant="destructive"
          className="size-8"
          disabled={isPending}
          onClick={() => onAction(request, "reject")}
          title={t("bloodBank.confirmRejection", "Confirm rejection")}
          aria-label={t("bloodBank.confirmRejection", "Confirm rejection")}
        >
          {isPending ? (
            <LoaderCircle aria-hidden="true" className="size-3 animate-spin" />
          ) : (
            <X aria-hidden="true" className="size-3.5" />
          )}
        </Button>
        <Button
          type="button"
          size="icon"
          variant="ghost"
          className="size-8 text-muted-foreground"
          disabled={isPending}
          onClick={() => setIsConfirmingReject(false)}
          title={t("common.cancel", "Cancel")}
          aria-label={t("common.cancel", "Cancel")}
        >
          <RotateCcw aria-hidden="true" className="size-3.5" />
        </Button>
      </div>
    );
  }

  const PrimaryIcon = primaryAction ? actionIcons[primaryAction] : null;
  const primaryActionLabel = primaryAction
    ? getBloodBankActionLabel(primaryAction)
    : "";

  return (
    <div className={cn("flex min-w-0 items-center gap-1.5", className)}>
      {primaryAction && PrimaryIcon ? (
        <Button
          type="button"
          size="icon"
          variant="ghost"
          disabled={isPending}
          className="size-8 shrink-0 text-success hover:text-success"
          onClick={() => onAction(request, primaryAction)}
          title={primaryActionLabel}
          aria-label={`${primaryActionLabel} ${request.id}`}
        >
          {isPending ? (
            <LoaderCircle
              aria-hidden="true"
              className="size-3.5 animate-spin"
            />
          ) : (
            <PrimaryIcon aria-hidden="true" className="size-3.5" />
          )}
        </Button>
      ) : null}
      {canReject ? (
        <Button
          type="button"
          size="icon"
          variant="ghost"
          disabled={isPending}
          className="ms-auto size-8 shrink-0 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
          title={t("bloodBank.rejectRequest", "Reject request")}
          aria-label={`${t("bloodBank.rejectRequest", "Reject request")} ${request.id}`}
          onClick={() => setIsConfirmingReject(true)}
        >
          <X aria-hidden="true" className="size-3.5" />
        </Button>
      ) : null}
    </div>
  );
}
