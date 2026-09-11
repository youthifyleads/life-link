import {
  BookmarkCheck,
  CheckCircle2,
  LoaderCircle,
  PackagePlus,
  Search,
} from "lucide-react";
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";

import { bloodBankComponentLabels } from "@/features/blood-bank/types/blood-bank.types";
import type {
  BloodBankComponent,
  BloodBankRequest,
  BloodUnit,
} from "@/features/blood-bank/types/blood-bank.types";
import { BloodGroupBadge } from "@/shared/components/clinical/blood-group-badge";
import type { BloodGroup } from "@/shared/components/clinical/clinical.types";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";

interface UnitAllocationTableProps {
  request: BloodBankRequest;
  units: BloodUnit[];
  isPending: boolean;
  onAllocateUnits: (unitIds: string[]) => void;
  onReserveUnits: (unitIds: string[]) => void;
}

export function UnitAllocationTable({
  request,
  units,
  isPending,
  onAllocateUnits,
  onReserveUnits,
}: UnitAllocationTableProps) {
  const { t } = useTranslation();
  const [matchingOnly, setMatchingOnly] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedUnitIds, setSelectedUnitIds] = useState<string[]>([]);

  // Filter available and reserved units (not currently allocated to this request)
  const candidateUnits = useMemo(() => {
    return units.filter(
      (unit) => !request.allocatedUnitIds.includes(unit.id) && unit.status !== "quarantined",
    );
  }, [units, request.allocatedUnitIds]);

  const filteredUnits = useMemo(() => {
    return candidateUnits.filter((unit) => {
      if (matchingOnly) {
        if (
          unit.bloodGroup !== request.bloodGroup ||
          unit.component !== request.component
        ) {
          return false;
        }
      }
      if (search.trim()) {
        const query = search.trim().toLowerCase();
        const matchesId = unit.id.toLowerCase().includes(query);
        const matchesLocation = unit.storageLocation.toLowerCase().includes(query);
        const matchesGroup = unit.bloodGroup.toLowerCase().includes(query);
        if (!matchesId && !matchesLocation && !matchesGroup) {
          return false;
        }
      }
      return true;
    });
  }, [candidateUnits, matchingOnly, search, request.bloodGroup, request.component]);

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedUnitIds(filteredUnits.map((u) => u.id));
    } else {
      setSelectedUnitIds([]);
    }
  };

  const toggleSelectUnit = (unitId: string) => {
    setSelectedUnitIds((prev) =>
      prev.includes(unitId) ? prev.filter((id) => id !== unitId) : [...prev, unitId],
    );
  };

  const handleBatchAllocate = () => {
    if (selectedUnitIds.length > 0) {
      onAllocateUnits(selectedUnitIds);
      setSelectedUnitIds([]);
    }
  };

  const handleBatchReserve = () => {
    if (selectedUnitIds.length > 0) {
      onReserveUnits(selectedUnitIds);
      setSelectedUnitIds([]);
    }
  };

  return (
    <section
      aria-labelledby="available-inventory-heading"
      className="border border-border bg-surface p-5"
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 id="available-inventory-heading" className="text-base font-semibold">
            {t("bloodBank.availableMatching", "Available blood unit matching")}
          </h2>
          <p className="mt-0.5 text-xs text-muted-foreground">
            {t("bloodBank.availableMatchingDesc", "Locate and allocate compatible blood units from Central Blood Bank stock.")}
          </p>
        </div>

        {/* Filter Controls */}
        <div className="flex flex-wrap items-center gap-2.5">
          <label className="inline-flex cursor-pointer items-center gap-2 rounded border border-border bg-surface-subtle px-2.5 py-1.5 text-xs font-medium text-foreground hover:bg-surface">
            <input
              type="checkbox"
              checked={matchingOnly}
              onChange={(e) => setMatchingOnly(e.target.checked)}
              className="size-3.5 rounded border-field-stroke text-primary focus:ring-1 focus:ring-primary"
            />
            <span>
              {t("bloodBank.matchingOnly", "Matching only")} (<bdi dir="ltr">{request.bloodGroup}</bdi> ·{" "}
              {bloodBankComponentLabels[request.component]})
            </span>
          </label>

          <div className="relative w-48">
            <Search
              aria-hidden="true"
              className="pointer-events-none absolute start-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground"
            />
            <Input
              type="search"
              aria-label={t("bloodBank.searchUnits", "Search available units by ID or location")}
              placeholder={t("bloodBank.searchUnits", "Search ID / location...")}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-8 ps-8 text-xs"
            />
          </div>
        </div>
      </div>

      {/* Batch Action Toolbar */}
      {selectedUnitIds.length > 0 ? (
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border border-primary/30 bg-primary/5 p-3">
          <div className="flex items-center gap-2 text-xs font-semibold text-primary">
            <CheckCircle2 aria-hidden="true" className="size-4" />
            <span>
              {t("bloodBank.unitsSelected", {
                count: selectedUnitIds.length,
                defaultValue: `${selectedUnitIds.length} unit(s) selected`,
              })}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Button
              type="button"
              size="sm"
              className="h-7 text-xs"
              disabled={isPending}
              onClick={handleBatchAllocate}
            >
              {isPending ? (
                <LoaderCircle aria-hidden="true" className="size-3.5 animate-spin" />
              ) : (
                <PackagePlus aria-hidden="true" className="size-3.5" />
              )}
              {t("bloodBank.allocateSelected", "Allocate selected")}
            </Button>
            <Button
              type="button"
              size="sm"
              variant="secondary"
              className="h-7 text-xs"
              disabled={isPending}
              onClick={handleBatchReserve}
            >
              <BookmarkCheck aria-hidden="true" className="size-3.5" />
              {t("bloodBank.reserveSelected", "Reserve selected")}
            </Button>
            <Button
              type="button"
              size="sm"
              variant="ghost"
              className="h-7 text-xs"
              onClick={() => setSelectedUnitIds([])}
            >
              {t("bloodBank.clearSelection", "Clear")}
            </Button>
          </div>
        </div>
      ) : null}

      {/* Table */}
      <div
        className="mt-4 overflow-x-auto border border-border"
        tabIndex={0}
        role="region"
        aria-label={t("bloodBank.availableMatching", "Available blood units matching table.")}
      >
        {filteredUnits.length === 0 ? (
          <div className="p-8 text-center text-xs text-muted-foreground">
            {t(
              "bloodBank.noMatchingUnits",
              "No blood units found matching the active criteria. Uncheck \"Matching only\" or adjust the search query.",
            )}
          </div>
        ) : (
          <table className="w-full table-fixed border-collapse text-start text-xs">
            <thead className="border-b border-border bg-surface-subtle font-semibold text-muted-foreground">
              <tr>
                <th scope="col" className="w-[5%] px-3 py-2.5 text-center">
                  <input
                    type="checkbox"
                    aria-label={t("bloodBank.selectAllUnits")}
                    checked={
                      filteredUnits.length > 0 &&
                      selectedUnitIds.length === filteredUnits.length
                    }
                    onChange={(e) => handleSelectAll(e.target.checked)}
                    className="size-3.5 rounded border-field-stroke text-primary"
                  />
                </th>
                <th scope="col" className="w-[18%] px-3 py-2.5 text-start">
                  {t("bloodBank.unitId", "Unit ID")}
                </th>
                <th scope="col" className="w-[12%] px-3 py-2.5 text-start">
                  {t("common.bloodGroup", "Group")}
                </th>
                <th scope="col" className="w-[18%] px-3 py-2.5 text-start">
                  {t("common.component", "Component")}
                </th>
                <th scope="col" className="w-[13%] px-3 py-2.5 text-start">
                  {t("bloodBank.collection", "Collection")}
                </th>
                <th scope="col" className="w-[13%] px-3 py-2.5 text-start">
                  {t("bloodBank.expiry", "Expiry")}
                </th>
                <th scope="col" className="w-[18%] px-3 py-2.5 text-start">
                  {t("bloodBank.location", "Location")}
                </th>
                <th scope="col" className="w-[11%] px-3 py-2.5 text-start">
                  {t("common.status", "Status")}
                </th>
                <th scope="col" className="w-[16%] px-3 py-2.5 text-end">
                  {t("common.actions", "Actions")}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border bg-surface">
              {filteredUnits.map((unit) => {
                const isExactMatch =
                  unit.bloodGroup === request.bloodGroup &&
                  unit.component === request.component;
                const isSelected = selectedUnitIds.includes(unit.id);

                return (
                  <tr
                    key={unit.id}
                    className={`hover:bg-surface-subtle/60 ${
                      isSelected ? "bg-primary/5" : ""
                    }`}
                  >
                    <td className="px-3 py-2.5 text-center">
                      <input
                        type="checkbox"
                        aria-label={t("bloodBank.selectUnit", { id: unit.id })}
                        checked={isSelected}
                        onChange={() => toggleSelectUnit(unit.id)}
                        className="size-3.5 rounded border-field-stroke text-primary"
                      />
                    </td>
                    <td className="px-3 py-2.5 font-semibold text-foreground tabular-nums">
                      <div className="flex items-center gap-1.5">
                        <bdi dir="ltr">{unit.id}</bdi>
                        {isExactMatch ? (
                          <span
                            title={t("bloodBank.exactMatch", "Exact clinical match")}
                            className="inline-block size-1.5 rounded-full bg-success"
                          />
                        ) : null}
                      </div>
                    </td>
                    <td className="px-3 py-2.5">
                      <BloodGroupBadge group={unit.bloodGroup as BloodGroup} />
                    </td>
                    <td className="px-3 py-2.5 font-medium text-foreground">
                      {bloodBankComponentLabels[unit.component as BloodBankComponent]}
                    </td>
                    <td className="px-3 py-2.5 text-muted-foreground tabular-nums">
                      <bdi dir="ltr">{unit.collectionDate}</bdi>
                    </td>
                    <td className="px-3 py-2.5 text-muted-foreground tabular-nums">
                      <bdi dir="ltr">{unit.expiryDate}</bdi>
                    </td>
                    <td className="px-3 py-2.5 text-muted-foreground">
                      {unit.storageLocation}
                    </td>
                    <td className="px-3 py-2.5">
                      <span
                        className={`inline-flex rounded px-1.5 py-0.5 text-[11px] font-semibold capitalize ${
                          unit.status === "available"
                            ? "bg-success-subtle text-success"
                            : unit.status === "reserved"
                              ? "bg-warning-subtle text-[#6f4a00]"
                              : "bg-surface-subtle text-muted-foreground"
                        }`}
                      >
                        {t(`status.${unit.status}`, unit.status)}
                      </span>
                    </td>
                    <td className="px-3 py-2.5 text-end">
                      <div className="flex items-center justify-end gap-1.5">
                        <Button
                          type="button"
                          size="sm"
                          className="h-6 px-2 text-xs"
                          disabled={isPending}
                          onClick={() => onAllocateUnits([unit.id])}
                          aria-label={`${t("bloodBank.allocate", "Allocate")} ${unit.id}`}
                        >
                          {t("bloodBank.allocate", "Allocate")}
                        </Button>
                        <Button
                          type="button"
                          size="sm"
                          variant="secondary"
                          className="h-6 px-2 text-xs"
                          disabled={isPending}
                          onClick={() => onReserveUnits([unit.id])}
                          aria-label={`${t("bloodBank.reserve", "Reserve")} ${unit.id}`}
                        >
                          {t("bloodBank.reserve", "Reserve")}
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </section>
  );
}
