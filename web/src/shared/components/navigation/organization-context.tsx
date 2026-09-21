import { Building2, Check, ChevronsUpDown } from "lucide-react";
import { useTranslation } from "react-i18next";

import type { OrganizationSummary } from "@/features/authentication/model/auth.types";
import { Button } from "@/shared/components/ui/button";
import { BidiText } from "@/shared/components/i18n/bidi-text";
import { formatOrganizationName } from "@/shared/lib/formatters";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/shared/components/ui/popover";
import { cn } from "@/shared/lib/utils";

interface OrganizationContextProps {
  organizations: OrganizationSummary[];
  activeOrganizationId: string;
  onOrganizationChange?: (organizationId: string) => void;
  compact?: boolean;
  collapsible?: boolean;
}

function getOrganizationTypeKey(type: OrganizationSummary["type"]) {
  switch (type) {
    case "hospital":
      return "healthcare.hospital";
    case "blood_bank":
      return "healthcare.bloodBank";
    case "platform":
      return "nav.platformAdministration";
  }
}

export function OrganizationContext({
  organizations,
  activeOrganizationId,
  onOrganizationChange,
  compact = false,
  collapsible = false,
}: OrganizationContextProps) {
  const { t } = useTranslation();
  const activeOrganization =
    organizations.find(
      (organization) => organization.id === activeOrganizationId,
    ) ?? organizations[0];
  const canSwitch = organizations.length > 1 && Boolean(onOrganizationChange);

  if (!activeOrganization) {
    return null;
  }

  const activeOrgDisplayName = formatOrganizationName(activeOrganization.name);

  if (compact) {
    return (
      <div className="min-w-0">
        <p className="truncate text-sm font-semibold text-white">
          <BidiText>{activeOrgDisplayName}</BidiText>
        </p>
        <p className="truncate text-xs text-header-muted">
          {t(getOrganizationTypeKey(activeOrganization.type))}
        </p>
      </div>
    );
  }

  return (
    <div className={cn("py-2.5", collapsible ? "px-2 group-hover/sidebar:px-2.5" : "px-2.5")}>
      <p
        className={cn(
          "mb-1 whitespace-nowrap text-[10px] font-semibold uppercase tracking-[0.06em] text-white/75 px-1 rtl:tracking-normal",
          collapsible &&
            "max-h-0 overflow-hidden opacity-0 transition-[max-height,opacity] group-hover/sidebar:max-h-4 group-hover/sidebar:opacity-100 group-hover/sidebar:mb-1",
        )}
      >
        {t("nav.organization")}
      </p>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            type="button"
            variant="ghost"
            disabled={!canSwitch}
            className={cn(
              "h-9 w-full rounded-md text-start text-white/90 transition-colors duration-150 hover:bg-white/12 hover:text-white disabled:pointer-events-none disabled:opacity-100",
              collapsible
                ? "justify-center gap-0 px-0 group-hover/sidebar:justify-start group-hover/sidebar:gap-2.5 group-hover/sidebar:px-2.5"
                : "justify-start gap-2.5 px-2.5",
            )}
            aria-label={
              canSwitch
                ? t("nav.changeOrganizationCurrent", {
                    name: activeOrgDisplayName,
                  })
                : t("nav.currentOrganization", { name: activeOrgDisplayName })
            }
          >
            <Building2
              aria-hidden="true"
              className="size-[1.125rem] shrink-0 text-white/90 transition-colors"
            />
            <span
              className={cn(
                "min-w-0 flex-1 transition-[max-width,opacity] duration-150",
                collapsible &&
                  "max-w-0 overflow-hidden opacity-0 group-hover/sidebar:max-w-44 group-hover/sidebar:opacity-100",
              )}
            >
              <span className="block truncate text-sm font-semibold text-white">
                <BidiText>{activeOrgDisplayName}</BidiText>
              </span>
              <span className="block truncate text-xs font-normal text-white/75">
                {t(getOrganizationTypeKey(activeOrganization.type))}
              </span>
            </span>
            {canSwitch ? (
              <ChevronsUpDown
                aria-hidden="true"
                className={cn(
                  "size-3.5 shrink-0 text-white/75",
                  collapsible && "hidden group-hover/sidebar:block",
                )}
              />
            ) : null}
          </Button>
        </PopoverTrigger>
        {canSwitch ? (
          <PopoverContent align="start" className="w-72 p-2">
            <p className="px-2 pb-2 pt-1 text-xs font-semibold text-muted-foreground">
              {t("nav.changeOrganization")}
            </p>
            <div className="space-y-1">
              {organizations.map((organization) => {
                const isActive = organization.id === activeOrganization.id;
                const orgDisplayName = formatOrganizationName(
                  organization.name,
                );

                return (
                  <button
                    key={organization.id}
                    type="button"
                    className={cn(
                      "flex min-h-11 w-full items-center gap-3 rounded-md px-2.5 py-2 text-start text-sm transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                      isActive && "bg-secondary text-secondary-foreground",
                    )}
                    onClick={() => onOrganizationChange?.(organization.id)}
                  >
                    <span className="min-w-0 flex-1">
                      <span className="block truncate font-semibold">
                        <BidiText>{orgDisplayName}</BidiText>
                      </span>
                      <span className="block truncate text-xs text-muted-foreground">
                        {t(getOrganizationTypeKey(organization.type))}
                      </span>
                    </span>
                    {isActive ? (
                      <Check
                        aria-hidden="true"
                        className="size-4 text-primary"
                      />
                    ) : null}
                  </button>
                );
              })}
            </div>
          </PopoverContent>
        ) : null}
      </Popover>
    </div>
  );
}
