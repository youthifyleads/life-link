import { useTranslation } from "react-i18next";

import type { UserRole } from "@/features/authentication/model/auth.types";
import { cn } from "@/shared/lib/utils";

interface AdminRoleBadgeProps {
  role: UserRole;
  className?: string;
}

const roleDisplayMap: Record<
  UserRole,
  { label: string; bg: string; text: string; border: string }
> = {
  admin: {
    label: "Administrator",
    bg: "bg-slate-100",
    text: "text-slate-900",
    border: "border-slate-300",
  },
  hospital_staff: {
    label: "Hospital Staff",
    bg: "bg-slate-50",
    text: "text-slate-800",
    border: "border-slate-200",
  },
  blood_bank_staff: {
    label: "Blood Bank Staff",
    bg: "bg-emergency-subtle",
    text: "text-emergency",
    border: "border-emergency/20",
  },
  medical_lead: {
    label: "Medical Lead",
    bg: "bg-slate-100",
    text: "text-slate-800",
    border: "border-slate-200",
  },
  platform_support: {
    label: "Platform Support",
    bg: "bg-amber-50",
    text: "text-amber-900",
    border: "border-amber-200",
  },
  donor: {
    label: "Donor",
    bg: "bg-emergency-subtle",
    text: "text-emergency",
    border: "border-emergency/20",
  },
  caregiver: {
    label: "Caregiver",
    bg: "bg-slate-50",
    text: "text-slate-800",
    border: "border-slate-200",
  },
};

export function AdminRoleBadge({ role, className }: AdminRoleBadgeProps) {
  const { t } = useTranslation();
  const config = roleDisplayMap[role] ?? {
    label: role,
    bg: "bg-slate-50",
    text: "text-slate-900",
    border: "border-slate-300",
  };

  const translatedLabel = t(`roles.${role}` as const, {
    defaultValue: config.label,
  });

  return (
    <span
      className={cn(
        "inline-flex items-center px-1 py-0.5 text-xs font-medium tracking-tight",
        config.bg,
        config.text,
        config.border,
        className,
      )}
    >
      {translatedLabel}
    </span>
  );
}
