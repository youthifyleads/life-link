import { Search, SlidersHorizontal, X } from "lucide-react";
import { useTranslation } from "react-i18next";

import { formatBloodBankStatus } from "@/features/blood-bank/components/blood-bank-formatters";
import {
  bloodBankComponentLabels,
  bloodBankComponents,
  bloodBankQueueStatuses,
  type BloodBankRequestFilters as RequestFilterValues,
} from "@/features/blood-bank/types/blood-bank.types";
import {
  bloodGroups,
  urgencyLevels,
} from "@/shared/components/clinical/clinical.types";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";

interface RequestQueueFiltersProps {
  value: RequestFilterValues;
  onChange: (value: RequestFilterValues) => void;
  resultCount: number;
}

const selectClassName =
  "min-h-10 w-full rounded-md border border-input bg-surface px-3 text-sm text-foreground focus-visible:border-ring focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/25";

const defaultFilters: RequestFilterValues = {
  search: "",
  status: "all",
  urgency: "all",
  bloodGroup: "all",
  component: "all",
  sort: "newest",
};

export function RequestQueueFilters({
  value,
  onChange,
  resultCount,
}: RequestQueueFiltersProps) {
  const { t } = useTranslation();

  const hasFilters = Object.entries(defaultFilters).some(
    ([key, defaultValue]) =>
      value[key as keyof RequestFilterValues] !== defaultValue,
  );

  const update = <Key extends keyof RequestFilterValues>(
    key: Key,
    nextValue: RequestFilterValues[Key],
  ) => onChange({ ...value, [key]: nextValue });

  return (
    <section
      aria-label={t("bloodBank.incomingRequestFilters")}
      className="border border-border bg-surface"
    >
      <div className="flex min-h-14 items-center gap-3 border-b border-border px-4">
        <SlidersHorizontal aria-hidden="true" className="size-4 text-primary" />
        <h2 className="text-sm font-semibold">{t("bloodBank.findQueueRequests")}</h2>
        <span className="ms-auto text-xs text-muted-foreground tabular-nums">
          {resultCount} {resultCount === 1 ? t("hospital.record") : t("hospital.records")}
        </span>
      </div>

      <div className="grid gap-3 p-4 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-[minmax(15rem,1.5fr)_repeat(5,minmax(8rem,1fr))]">
        <label className="relative">
          <span className="sr-only">{t("common.search")}</span>
          <Search
            aria-hidden="true"
            className="pointer-events-none absolute start-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
          />
          <Input
            value={value.search}
            onChange={(event) => update("search", event.target.value)}
            placeholder={t("bloodBank.searchQueuePlaceholder")}
            className="ps-9"
          />
        </label>

        <label>
          <span className="sr-only">{t("common.status")}</span>
          <select
            className={selectClassName}
            value={value.status}
            onChange={(event) =>
              update(
                "status",
                event.target.value as RequestFilterValues["status"],
              )
            }
          >
            <option value="all">{t("hospital.allStatuses")}</option>
            {bloodBankQueueStatuses.map((status) => (
              <option key={status} value={status}>
                {formatBloodBankStatus(status)}
              </option>
            ))}
          </select>
        </label>

        <label>
          <span className="sr-only">{t("common.urgency")}</span>
          <select
            className={selectClassName}
            value={value.urgency}
            onChange={(event) =>
              update(
                "urgency",
                event.target.value as RequestFilterValues["urgency"],
              )
            }
          >
            <option value="all">{t("hospital.allUrgencies")}</option>
            {urgencyLevels.map((urgency) => (
              <option key={urgency} value={urgency}>
                {t(`urgency.${urgency}`)}
              </option>
            ))}
          </select>
        </label>

        <label>
          <span className="sr-only">{t("common.bloodGroup")}</span>
          <select
            className={selectClassName}
            value={value.bloodGroup}
            onChange={(event) =>
              update(
                "bloodGroup",
                event.target.value as RequestFilterValues["bloodGroup"],
              )
            }
          >
            <option value="all">{t("hospital.allBloodGroups")}</option>
            {bloodGroups.map((group) => (
              <option key={group} value={group}>
                {group}
              </option>
            ))}
          </select>
        </label>

        <label>
          <span className="sr-only">{t("common.component")}</span>
          <select
            className={selectClassName}
            value={value.component}
            onChange={(event) =>
              update(
                "component",
                event.target.value as RequestFilterValues["component"],
              )
            }
          >
            <option value="all">{t("common.all")} {t("common.component")}</option>
            {bloodBankComponents.map((component) => (
              <option key={component} value={component}>
                {bloodBankComponentLabels[component]}
              </option>
            ))}
          </select>
        </label>

        <label>
          <span className="sr-only">{t("hospital.statusOverview")}</span>
          <select
            className={selectClassName}
            value={value.sort}
            onChange={(event) =>
              update("sort", event.target.value as RequestFilterValues["sort"])
            }
          >
            <option value="newest">{t("hospital.newestFirst")}</option>
            <option value="oldest">{t("hospital.oldestFirst")}</option>
            <option value="required_soonest">{t("hospital.requiredSoonest")}</option>
            <option value="highest_urgency">{t("hospital.urgentRequests")}</option>
          </select>
        </label>
      </div>

      {hasFilters ? (
        <div className="border-t border-border px-4 py-2 text-end">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => onChange(defaultFilters)}
          >
            <X aria-hidden="true" />
            {t("hospital.clearFilters")}
          </Button>
        </div>
      ) : null}
    </section>
  );
}
