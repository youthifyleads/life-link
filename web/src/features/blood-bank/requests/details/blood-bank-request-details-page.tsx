import {
  ArrowLeft,
  Check,
  CheckCircle2,
  LoaderCircle,
  PackageCheck,
  PackageOpen,
  QrCode,
  X,
} from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Link, useParams } from "react-router-dom";

import { BloodBankPageFrame } from "@/features/blood-bank/components/blood-bank-page-frame";
import {
  useAllocateUnits,
  useBloodBankRequest,
  useBloodUnits,
  useDeallocateUnit,
  useReserveUnits,
  useTransitionBloodBankRequest,
  useUpdateDocumentReviewStatus,
} from "@/features/blood-bank/hooks/use-blood-bank-requests";
import { AllocatedUnitsLedger } from "@/features/blood-bank/requests/allocation/allocated-units-ledger";
import { UnitAllocationTable } from "@/features/blood-bank/requests/allocation/unit-allocation-table";
import { BloodBankDocumentsSection } from "@/features/blood-bank/requests/details/blood-bank-documents-section";
import { BloodBankRequestSummary } from "@/features/blood-bank/requests/details/blood-bank-request-summary";
import { DispatchQrModal } from "@/features/blood-bank/requests/details/dispatch-qr-modal";
import { RejectRequestModal } from "@/features/blood-bank/requests/details/reject-request-modal";
import { BloodBankTimeline } from "@/features/blood-bank/requests/timeline/blood-bank-timeline";
import type {
  BloodBankRequestAction,
  DocumentReviewStatus,
} from "@/features/blood-bank/types/blood-bank.types";
import {
  EmptyState,
  ErrorState,
  LoadingState,
} from "@/shared/components/feedback/system-states";
import { Button } from "@/shared/components/ui/button";

export function BloodBankRequestDetailsPage() {
  const { t } = useTranslation();
  const { id = "" } = useParams();
  const requestQuery = useBloodBankRequest(id);
  const unitsQuery = useBloodUnits();

  const transitionMutation = useTransitionBloodBankRequest();
  const allocateMutation = useAllocateUnits();
  const reserveMutation = useReserveUnits();
  const deallocateMutation = useDeallocateUnit();
  const updateDocMutation = useUpdateDocumentReviewStatus();

  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [dispatchQrOpen, setDispatchQrOpen] = useState(false);
  const [activeUnitId, setActiveUnitId] = useState<string>();
  const [feedback, setFeedback] = useState<{
    tone: "success" | "error";
    message: string;
  }>();

  const request = requestQuery.data;
  const units = unitsQuery.data ?? [];

  if (requestQuery.isPending || unitsQuery.isPending) {
    return (
      <BloodBankPageFrame
        breadcrumbs={[
          { label: t("nav.bloodBankOperations", "Blood bank"), href: "/blood-bank/dashboard" },
          { label: t("nav.requestQueue", "Request queue"), href: "/blood-bank/requests" },
          { label: id || t("common.loading", "Loading") },
        ]}
        title={t("common.loadingRecords", "Loading clinical records…")}
        description={t("common.loading", "Loading your workspace…")}
      >
        <LoadingState label={id} rows={8} />
      </BloodBankPageFrame>
    );
  }

  if (requestQuery.isError || unitsQuery.isError) {
    return (
      <BloodBankPageFrame
        breadcrumbs={[
          { label: t("nav.bloodBankOperations", "Blood bank"), href: "/blood-bank/dashboard" },
          { label: t("nav.requestQueue", "Request queue"), href: "/blood-bank/requests" },
          { label: id },
        ]}
        title={t("common.error", "Error")}
        description={t("errors.notFoundDescription", "The requested clinical page or resource does not exist or has moved.")}
      >
        <ErrorState
          title={t("common.error", "Error")}
          description={t("errors.notFoundDescription", "The requested clinical page or resource does not exist or has moved.")}
          onRetry={() => {
            void requestQuery.refetch();
            void unitsQuery.refetch();
          }}
        />
      </BloodBankPageFrame>
    );
  }

  if (!request) {
    return (
      <BloodBankPageFrame
        breadcrumbs={[
          { label: t("nav.bloodBankOperations", "Blood bank"), href: "/blood-bank/dashboard" },
          { label: t("nav.requestQueue", "Request queue"), href: "/blood-bank/requests" },
          { label: id },
        ]}
        title={t("common.noRecordsTitle", "No records found")}
        description={t("common.noRecordsDesc", "There are no clinical records matching your active filters or search criteria.")}
      >
        <EmptyState
          title={t("common.noRecordsTitle", "No records found")}
          description={t("common.noRecordsDesc", "There are no clinical records matching your active filters or search criteria.")}
          action={
            <Button asChild variant="secondary">
              <Link to="/blood-bank/requests">
                <ArrowLeft aria-hidden="true" className="size-4 rtl:rotate-180" />
                {t("bloodBank.backToQueue", "Back to queue")}
              </Link>
            </Button>
          }
        />
      </BloodBankPageFrame>
    );
  }

  const handleTransition = async (
    action: BloodBankRequestAction,
    options?: { note?: string; rejectReason?: string },
  ) => {
    setFeedback(undefined);
    try {
      const updated = await transitionMutation.mutateAsync({
        requestId: request.id,
        action,
        note: options?.note,
        rejectReason: options?.rejectReason,
      });
      setFeedback({
        tone: "success",
        message: `Status transitioned to "${updated.status.replaceAll("_", " ")}" in this local preview. No remote database was altered.`,
      });
    } catch (err) {
      setFeedback({
        tone: "error",
        message:
          err instanceof Error
            ? err.message
            : "Could not transition status. Please try again.",
      });
    }
  };

  const handleAllocate = async (unitIds: string[]) => {
    setFeedback(undefined);
    try {
      await allocateMutation.mutateAsync({
        requestId: request.id,
        unitIds,
      });
      setFeedback({
        tone: "success",
        message: `Allocated ${unitIds.length} blood unit(s) to requisition ${request.id}.`,
      });
    } catch (err) {
      setFeedback({
        tone: "error",
        message:
          err instanceof Error ? err.message : "Failed to allocate units.",
      });
    }
  };

  const handleReserve = async (unitIds: string[]) => {
    setFeedback(undefined);
    try {
      await reserveMutation.mutateAsync({
        requestId: request.id,
        unitIds,
      });
      setFeedback({
        tone: "success",
        message: `Reserved ${unitIds.length} blood unit(s) for requisition ${request.id}.`,
      });
    } catch (err) {
      setFeedback({
        tone: "error",
        message:
          err instanceof Error ? err.message : "Failed to reserve units.",
      });
    }
  };

  const handleRemoveUnit = async (unitId: string) => {
    setFeedback(undefined);
    setActiveUnitId(unitId);
    try {
      await deallocateMutation.mutateAsync({
        requestId: request.id,
        unitId,
      });
      setFeedback({
        tone: "success",
        message: `Unit ${unitId} unallocated from requisition ${request.id}.`,
      });
    } catch (err) {
      setFeedback({
        tone: "error",
        message:
          err instanceof Error ? err.message : "Failed to remove unit.",
      });
    } finally {
      setActiveUnitId(undefined);
    }
  };

  const handleUpdateDocumentStatus = async (
    documentId: string,
    status: DocumentReviewStatus,
  ) => {
    setFeedback(undefined);
    try {
      await updateDocMutation.mutateAsync({
        requestId: request.id,
        documentId,
        status,
      });
      setFeedback({
        tone: "success",
        message: `Document status marked as "${status.replaceAll("_", " ")}".`,
      });
    } catch (err) {
      setFeedback({
        tone: "error",
        message:
          err instanceof Error ? err.message : "Failed to update document status.",
      });
    }
  };

  // Workflow state controls
  const canAcknowledge = request.status === "submitted";
  const canConfirm = request.status === "acknowledged";
  const canStartPreparation = request.status === "confirmed";
  const canComplete = request.status === "preparing";
  const canReject =
    request.status === "submitted" || request.status === "acknowledged";
  const canGenerateQr = ["confirmed", "preparing", "completed"].includes(
    request.status,
  );

  const isTransitionPending = transitionMutation.isPending;

  return (
    <BloodBankPageFrame
      breadcrumbs={[
        { label: t("nav.bloodBankOperations", "Blood bank"), href: "/blood-bank/dashboard" },
        { label: t("nav.requestQueue", "Request queue"), href: "/blood-bank/requests" },
        { label: request.id },
      ]}
      title={`${request.id} — ${t("bloodBank.requisitionReview", "Requisition Review")}`}
      description={t("bloodBank.requisitionReviewDesc", {
        hospital: request.hospital.name,
        defaultValue: `Assess clinical requirements for ${request.hospital.name}, allocate matching inventory units, and progress dispatch checkpoints.`,
      })}
      actions={
        <div className="flex flex-wrap items-center gap-2">
          {canAcknowledge ? (
            <Button
              type="button"
              disabled={isTransitionPending}
              onClick={() => void handleTransition("acknowledge")}
            >
              {isTransitionPending ? (
                <LoaderCircle aria-hidden="true" className="size-4 animate-spin" />
              ) : (
                <Check aria-hidden="true" className="size-4" />
              )}
              {t("bloodBank.acknowledgeRequest", "Acknowledge request")}
            </Button>
          ) : null}

          {canConfirm ? (
            <Button
              type="button"
              disabled={isTransitionPending}
              onClick={() => void handleTransition("confirm")}
            >
              {isTransitionPending ? (
                <LoaderCircle aria-hidden="true" className="size-4 animate-spin" />
              ) : (
                <PackageCheck aria-hidden="true" className="size-4" />
              )}
              {t("bloodBank.confirmAllocation", "Confirm allocation")}
            </Button>
          ) : null}

          {canStartPreparation ? (
            <Button
              type="button"
              disabled={isTransitionPending}
              onClick={() => void handleTransition("start_preparation")}
            >
              {isTransitionPending ? (
                <LoaderCircle aria-hidden="true" className="size-4 animate-spin" />
              ) : (
                <PackageOpen aria-hidden="true" className="size-4" />
              )}
              {t("bloodBank.startPreparation", "Start preparation")}
            </Button>
          ) : null}

          {canComplete ? (
            <Button
              type="button"
              disabled={isTransitionPending}
              onClick={() => void handleTransition("complete")}
            >
              {isTransitionPending ? (
                <LoaderCircle aria-hidden="true" className="size-4 animate-spin" />
              ) : (
                <CheckCircle2 aria-hidden="true" className="size-4" />
              )}
              {t("bloodBank.markCompleted", "Mark completed")}
            </Button>
          ) : null}

          {canGenerateQr ? (
            <Button
              type="button"
              variant="secondary"
              onClick={() => setDispatchQrOpen(true)}
            >
              <QrCode aria-hidden="true" className="size-4 text-primary" />
              {t("bloodBank.dispatchQrWaybill", "Dispatch QR & Waybill")}
            </Button>
          ) : null}

          {canReject ? (
            <Button
              type="button"
              variant="secondary"
              className="text-destructive hover:text-destructive"
              disabled={isTransitionPending}
              onClick={() => setRejectModalOpen(true)}
            >
              <X aria-hidden="true" className="size-4" />
              {t("bloodBank.rejectRequest", "Reject request")}
            </Button>
          ) : null}

          <Button asChild variant="secondary">
            <Link to="/blood-bank/requests">
              <ArrowLeft aria-hidden="true" className="size-4 rtl:rotate-180" />
              {t("bloodBank.backToQueue", "Back to queue")}
            </Link>
          </Button>
        </div>
      }
    >
      <div className="space-y-6">
        {/* Feedback Alert Banner */}
        {feedback ? (
          <div
            role={feedback.tone === "error" ? "alert" : "status"}
            className={`border px-4 py-3 text-xs font-medium leading-relaxed ${
              feedback.tone === "error"
                ? "border-destructive/25 bg-emergency-subtle text-[#7a1a13]"
                : "border-success/25 bg-success-subtle text-success"
            }`}
          >
            {feedback.message}
          </div>
        ) : null}

        {/* 2-Column Responsive Workspace */}
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
          {/* Left Column: Requirements & Unit Allocation */}
          <div className="space-y-6 min-w-0">
            <BloodBankRequestSummary request={request} />

            <AllocatedUnitsLedger
              request={request}
              allUnits={units}
              isPending={deallocateMutation.isPending}
              activeUnitId={activeUnitId}
              onRemoveUnit={(unitId) => void handleRemoveUnit(unitId)}
            />

            <UnitAllocationTable
              request={request}
              units={units}
              isPending={allocateMutation.isPending || reserveMutation.isPending}
              onAllocateUnits={(unitIds) => void handleAllocate(unitIds)}
              onReserveUnits={(unitIds) => void handleReserve(unitIds)}
            />
          </div>

          {/* Right Column: Timeline & Supporting Documents */}
          <div className="space-y-6 min-w-0">
            <BloodBankTimeline
              currentStatus={request.status}
              events={request.history}
            />

            <BloodBankDocumentsSection
              documents={request.documents}
              isPending={updateDocMutation.isPending}
              onUpdateStatus={(docId, status) =>
                void handleUpdateDocumentStatus(docId, status)
              }
            />
          </div>
        </div>
      </div>

      {/* Rejection Modal */}
      <RejectRequestModal
        open={rejectModalOpen}
        requestId={request.id}
        isPending={isTransitionPending}
        onOpenChange={setRejectModalOpen}
        onConfirmReject={(reason) => {
          setRejectModalOpen(false);
          void handleTransition("reject", { rejectReason: reason });
        }}
      />

      {/* Dispatch QR & Cold Box Waybill Modal */}
      <DispatchQrModal
        open={dispatchQrOpen}
        onOpenChange={setDispatchQrOpen}
        request={request}
        allocatedUnits={units.filter((u) =>
          request.allocatedUnitIds.includes(u.id),
        )}
      />
    </BloodBankPageFrame>
  );
}
