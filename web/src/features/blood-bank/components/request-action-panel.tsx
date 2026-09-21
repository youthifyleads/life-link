import {
  Check,
  Eye,
  LoaderCircle,
  MoreVertical,
  PackageOpen,
  PackagePlus,
  X,
} from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";

import { getBloodBankActionLabel } from "@/features/blood-bank/components/blood-bank-formatters";
import { getAvailableActions } from "@/features/blood-bank/constants/blood-bank.constants";
import type {
  BloodBankRequest,
  BloodBankRequestAction,
} from "@/features/blood-bank/types/blood-bank.types";
import { Button } from "@/shared/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/shared/components/ui/popover";
import { cn } from "@/shared/lib/utils";

interface RequestActionPanelProps {
  request: BloodBankRequest;
  isPending: boolean;
  onAction: (request: BloodBankRequest, action: BloodBankRequestAction) => void;
  className?: string;
  allowAllocation?: boolean;
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
  allowAllocation = true,
}: RequestActionPanelProps) {
  const { t } = useTranslation();
  const [isConfirmingReject, setIsConfirmingReject] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const actions = getAvailableActions(request);
  const primaryAction = actions.find((action) => action !== "reject");
  const canReject = actions.includes("reject");

  const allocatedCount = request.allocatedUnitIds.length;
  const isFulfilled = allocatedCount >= request.quantity;
  const canAllocate =
    allowAllocation &&
    !isFulfilled &&
    request.status !== "completed" &&
    request.status !== "cancelled" &&
    request.status !== "rejected";

  if (actions.length === 0 && !canAllocate) {
    return (
      <div className={cn("flex items-center justify-end gap-1", className)}>
        <Button asChild size="icon" variant="ghost" className="size-8">
          <Link
            to={`/blood-bank/requests/${request.id}`}
            title={t("common.details", "Details")}
            aria-label={`${t("common.details", "Details")} ${request.id}`}
          >
            <Eye aria-hidden="true" className="size-3.5" />
          </Link>
        </Button>
      </div>
    );
  }

  const PrimaryIcon = primaryAction ? actionIcons[primaryAction] : null;
  const primaryActionLabel = primaryAction
    ? getBloodBankActionLabel(primaryAction)
    : "";

  return (
    <div className={cn("flex min-w-0 items-center gap-1", className)}>
      {/* 1. Primary Action Button */}
      {primaryAction && PrimaryIcon ? (
        <Button
          type="button"
          size="icon"
          variant="ghost"
          disabled={isPending}
          className="size-8 shrink-0 text-success hover:bg-success/10 hover:text-success cursor-pointer"
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
      ) : canAllocate ? (
        <Button
          asChild
          size="icon"
          variant="ghost"
          className="size-8 shrink-0 text-primary hover:bg-primary/10 hover:text-primary"
        >
          <Link
            to={`/blood-bank/requests/${request.id}`}
            title={t("bloodBank.allocateUnits", "Allocate units")}
            aria-label={`${t("bloodBank.allocateUnits", "Allocate units")} ${request.id}`}
          >
            <PackagePlus aria-hidden="true" className="size-3.5" />
          </Link>
        </Button>
      ) : null}

      {/* 2. Secondary Actions Dropdown (Three dots menu) */}
      <Popover open={isMenuOpen} onOpenChange={setIsMenuOpen}>
        <PopoverTrigger asChild>
          <Button
            type="button"
            size="icon"
            variant="ghost"
            className="size-8 shrink-0 text-muted-foreground hover:text-foreground cursor-pointer"
            title={t("common.moreActions", "More actions")}
            aria-label={`${t("common.moreActions", "More actions")} ${request.id}`}
          >
            <MoreVertical aria-hidden="true" className="size-3.5" />
          </Button>
        </PopoverTrigger>
        <PopoverContent align="end" className="w-48 p-1.5 shadow-md">
          <div className="flex flex-col gap-0.5 text-xs">
            {canAllocate && primaryAction ? (
              <Link
                to={`/blood-bank/requests/${request.id}`}
                onClick={() => setIsMenuOpen(false)}
                className="flex items-center gap-2 rounded px-2.5 py-1.5 text-foreground hover:bg-surface-subtle transition-colors"
              >
                <PackagePlus className="size-3.5 text-primary" />
                <span>{t("bloodBank.allocateUnits", "Allocate units")}</span>
              </Link>
            ) : null}

            <Link
              to={`/blood-bank/requests/${request.id}`}
              onClick={() => setIsMenuOpen(false)}
              className="flex items-center gap-2 rounded px-2.5 py-1.5 text-foreground hover:bg-surface-subtle transition-colors"
            >
              <Eye className="size-3.5 text-muted-foreground" />
              <span>{t("common.details", "View details")}</span>
            </Link>

            {canReject ? (
              isConfirmingReject ? (
                <div className="mt-1 border-t border-border pt-1.5 px-1 space-y-1.5">
                  <p className="text-[11px] font-medium text-destructive px-1">
                    {t("bloodBank.confirmRejection", "Confirm rejection?")}
                  </p>
                  <div className="flex items-center gap-1">
                    <Button
                      type="button"
                      size="sm"
                      variant="destructive"
                      className="h-7 px-2 text-[11px] flex-1 cursor-pointer"
                      disabled={isPending}
                      onClick={() => {
                        onAction(request, "reject");
                        setIsConfirmingReject(false);
                        setIsMenuOpen(false);
                      }}
                    >
                      {isPending ? (
                        <LoaderCircle className="size-3 animate-spin" />
                      ) : (
                        t("common.reject", "Reject")
                      )}
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      className="h-7 px-2 text-[11px] cursor-pointer"
                      onClick={() => setIsConfirmingReject(false)}
                    >
                      {t("common.cancel", "Cancel")}
                    </Button>
                  </div>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setIsConfirmingReject(true)}
                  className="flex w-full items-center gap-2 rounded px-2.5 py-1.5 text-destructive hover:bg-destructive/10 transition-colors text-start cursor-pointer"
                >
                  <X className="size-3.5" />
                  <span>{t("bloodBank.rejectRequest", "Reject request")}</span>
                </button>
              )
            ) : null}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
