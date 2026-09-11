import { AlertTriangle, LoaderCircle, X } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";

import { Button } from "@/shared/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog";

interface RejectRequestModalProps {
  open: boolean;
  requestId: string;
  isPending: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirmReject: (reason: string) => void;
}

export function RejectRequestModal({
  open,
  requestId,
  isPending,
  onOpenChange,
  onConfirmReject,
}: RejectRequestModalProps) {
  const { t } = useTranslation();
  const [reason, setReason] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason.trim() || reason.trim().length < 5) {
      setError(
        t(
          "bloodBank.rejectionReasonRequired",
          "Clinical justification is required to reject this requisition.",
        ),
      );
      return;
    }
    setError(null);
    onConfirmReject(reason.trim());
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <form onSubmit={handleSubmit} noValidate>
          <DialogHeader>
            <div className="mb-2 flex size-10 items-center justify-center rounded-full bg-emergency-subtle text-emergency">
              <AlertTriangle aria-hidden="true" className="size-5" />
            </div>
            <DialogTitle>
              {t("bloodBank.rejectModalTitle", "Reject hospital blood request?")}
            </DialogTitle>
            <DialogDescription>
              {t("bloodBank.rejectModalDesc", {
                id: requestId,
                defaultValue: `Rejecting request ${requestId} is a destructive action that terminates the fulfillment workflow and notifies the requesting hospital.`,
              })}
            </DialogDescription>
          </DialogHeader>

          <div className="mt-4 space-y-2">
            <label
              htmlFor="rejection-reason"
              className="block text-xs font-semibold text-foreground"
            >
              {t("bloodBank.rejectionReasonLabel", "Reason for rejection")}{" "}
              <span className="text-emergency">*</span>
            </label>
            <textarea
              id="rejection-reason"
              rows={3}
              disabled={isPending}
              placeholder={t(
                "bloodBank.rejectionPlaceholder",
                "e.g. Incompatible crossmatch, specimen hemolyzed, unfulfilled eligibility criteria...",
              )}
              value={reason}
              onChange={(e) => {
                setReason(e.target.value);
                if (error) setError(null);
              }}
              className="w-full rounded border border-field-stroke bg-surface p-2.5 text-xs text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary disabled:opacity-50"
            />
            {error ? (
              <p role="alert" className="text-xs font-medium text-emergency">
                {error}
              </p>
            ) : null}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="secondary"
              disabled={isPending}
              onClick={() => onOpenChange(false)}
            >
              {t("bloodBank.keepRequest", "Keep request")}
            </Button>
            <Button
              type="submit"
              variant="destructive"
              disabled={isPending}
            >
              {isPending ? (
                <LoaderCircle aria-hidden="true" className="size-3.5 animate-spin" />
              ) : (
                <X aria-hidden="true" className="size-3.5" />
              )}
              {t("bloodBank.confirmRejection", "Confirm rejection")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
