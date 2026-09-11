import { PackagePlus, ScanLine } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";

import { BloodBankPageFrame } from "@/features/blood-bank/components/blood-bank-page-frame";
import {
  useBloodStockMatrix,
  useInventoryKPIs,
  useInventoryUnits,
  useInventoryWarnings,
  useRegisterBloodUnits,
  useUpdateUnitStatus,
} from "@/features/blood-bank/hooks/use-blood-bank-inventory";
import { InventoryFilters } from "@/features/blood-bank/inventory/inventory-filters";
import { InventoryKpis } from "@/features/blood-bank/inventory/inventory-kpis";
import { InventoryMatrix } from "@/features/blood-bank/inventory/inventory-matrix";
import { InventoryTable } from "@/features/blood-bank/inventory/inventory-table";
import { InventoryWarnings } from "@/features/blood-bank/inventory/inventory-warnings";
import { UnitIntakeDialog } from "@/features/blood-bank/inventory/unit-intake-dialog";
import type {
  ExpiryWindowFilter,
  InventoryLedgerFilters,
} from "@/features/blood-bank/types/blood-bank.types";
import type { BloodGroup } from "@/shared/components/clinical/clinical.types";
import {
  ErrorState,
  LoadingState,
} from "@/shared/components/feedback/system-states";
import { Button } from "@/shared/components/ui/button";

const defaultFilters: InventoryLedgerFilters = {
  search: "",
  bloodGroup: "all",
  component: "all",
  status: "all",
  expiryWindow: "all",
  sortBy: "expiry_soonest",
};

export function BloodBankInventoryPage() {
  const { t } = useTranslation();
  const [filters, setFilters] = useState<InventoryLedgerFilters>(defaultFilters);
  const [intakeOpen, setIntakeOpen] = useState(false);

  const kpisQuery = useInventoryKPIs();
  const matrixQuery = useBloodStockMatrix();
  const warningsQuery = useInventoryWarnings();
  const unitsQuery = useInventoryUnits(filters);

  const registerMutation = useRegisterBloodUnits();
  const updateStatusMutation = useUpdateUnitStatus();

  const isPending =
    kpisQuery.isPending ||
    matrixQuery.isPending ||
    warningsQuery.isPending ||
    unitsQuery.isPending;

  const isError =
    kpisQuery.isError ||
    matrixQuery.isError ||
    warningsQuery.isError ||
    unitsQuery.isError;

  const handleSelectMatrixGroup = (group: BloodGroup | "all") => {
    setFilters((prev) => ({
      ...prev,
      bloodGroup: group,
    }));
  };

  const handleFilterExpiry = (window: ExpiryWindowFilter) => {
    setFilters((prev) => ({
      ...prev,
      expiryWindow: window,
    }));
  };

  return (
    <BloodBankPageFrame
      breadcrumbs={[
        { label: t("nav.bloodBankOperations", "Blood bank"), href: "/blood-bank/dashboard" },
        { label: t("nav.inventory", "Inventory") },
      ]}
      title={t("bloodBank.inventoryTitle", "Central blood bank inventory")}
      description={t("bloodBank.inventorySubtitle", "Monitor live cold-chain inventory across all ABO/Rh blood groups, track expiring stocks, and register new phlebotomy intakes.")}
      actions={
        <div className="flex flex-wrap items-center gap-2.5">
          <Button asChild variant="secondary" size="sm" className="h-9 text-xs">
            <Link to="/blood-bank/tracking">
              <ScanLine aria-hidden="true" className="size-3.5" />
              {t("nav.qrTracking", "QR Tracking")}
            </Link>
          </Button>
          <Button
            type="button"
            size="sm"
            onClick={() => setIntakeOpen(true)}
            className="h-9 text-xs"
          >
            <PackagePlus aria-hidden="true" className="size-3.5" />
            {t("bloodBank.registerUnits", "Register new unit")}
          </Button>
        </div>
      }
    >
      {isPending ? (
        <LoadingState label={t("common.loadingRecords", "Loading blood bank inventory records…")} />
      ) : isError ? (
        <ErrorState
          title={t("common.error", "Could not load inventory records")}
          description={t("errors.notFoundDescription", "A preview error occurred while accessing the local inventory ledger. Please refresh to try again.")}
          onRetry={() => {
            void kpisQuery.refetch();
            void matrixQuery.refetch();
            void warningsQuery.refetch();
            void unitsQuery.refetch();
          }}
        />
      ) : (
        <div className="space-y-8">
          {/* 1. Operational Warnings */}
          <InventoryWarnings
            warnings={warningsQuery.data ?? []}
            onFilterGroup={handleSelectMatrixGroup}
            onFilterExpiry={handleFilterExpiry}
          />

          {/* 2. Inventory KPIs */}
          {kpisQuery.data ? <InventoryKpis kpis={kpisQuery.data} /> : null}

          {/* 3. Blood Stock Matrix */}
          {matrixQuery.data ? (
            <InventoryMatrix
              cells={matrixQuery.data}
              selectedGroup={filters.bloodGroup}
              onSelectGroup={handleSelectMatrixGroup}
            />
          ) : null}

          {/* 4. Filters & Detailed Ledger Table */}
          <div className="space-y-4">
            <InventoryFilters
              filters={filters}
              onChange={setFilters}
              onReset={() => setFilters(defaultFilters)}
            />

            <InventoryTable
              units={unitsQuery.data ?? []}
              onUpdateStatus={(unitId, status) => {
                updateStatusMutation.mutate({ unitId, status });
              }}
            />
          </div>
        </div>
      )}

      {/* Unit Registration / Intake Modal */}
      <UnitIntakeDialog
        open={intakeOpen}
        onOpenChange={setIntakeOpen}
        registerFn={registerMutation.mutateAsync}
        onSuccess={() => {
          // React query automatically invalidates through mutation onSuccess
        }}
      />
    </BloodBankPageFrame>
  );
}
export { BloodBankInventoryPage as default };
