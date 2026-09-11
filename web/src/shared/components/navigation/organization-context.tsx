import { Building2, Check, ChevronsUpDown } from "lucide-react";
import { useTranslation } from "react-i18next";

import type { OrganizationSummary } from "@/features/authentication/model/auth.types";
import { Button } from "@/shared/components/ui/button";
import { BidiText } from "@/shared/components/i18n/bidi-text";
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

  if (compact) {
    return (
      <div className="min-w-0">
        <p className="truncate text-sm font-semibold text-foreground">
          <BidiText>{activeOrganization.name}</BidiText>
        </p>
        <p className="truncate text-xs text-muted-foreground">
          {t(getOrganizationTypeKey(activeOrganization.type))}
        </p>
      </div>
    );
  }

  return (
    <div className="px-4 py-4">
      <p className="mb-2 text-xs font-medium text-sidebar-muted">
        {t("nav.organization")}
      </p>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            type="button"
            variant="ghost"
            disabled={!canSwitch}
            className="h-auto min-h-14 w-full justify-start gap-3 border border-sidebar-border bg-white/[0.04] px-3 py-2 text-start text-white hover:bg-sidebar-accent hover:text-white disabled:pointer-events-none disabled:opacity-100"
            aria-label={
              canSwitch
                ? t("nav.changeOrganizationCurrent", { name: activeOrganization.name })
                : t("nav.currentOrganization", { name: activeOrganization.name })
            }
          >
            <Building2
              aria-hidden="true"
              className="size-5 shrink-0 text-sidebar-muted"
            />
            <span className="min-w-0 flex-1">
              <span className="block truncate text-sm font-semibold">
                <BidiText>{activeOrganization.name}</BidiText>
              </span>
              <span className="mt-0.5 block truncate text-xs font-normal text-sidebar-muted">
                {t(getOrganizationTypeKey(activeOrganization.type))}
              </span>
            </span>
            {canSwitch ? (
              <ChevronsUpDown aria-hidden="true" className="size-4" />
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
                        <BidiText>{organization.name}</BidiText>
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
