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
    bg: "bg-purple-50",
    text: "text-purple-900",
    border: "border-purple-300",
  },
  hospital_staff: {
    label: "Hospital Staff",
    bg: "bg-sky-50",
    text: "text-sky-900",
    border: "border-sky-300",
  },
  blood_bank_staff: {
    label: "Blood Bank Staff",
    bg: "bg-rose-50",
    text: "text-rose-900",
    border: "border-rose-300",
  },
  medical_lead: {
    label: "Medical Lead",
    bg: "bg-indigo-50",
    text: "text-indigo-900",
    border: "border-indigo-300",
  },
  platform_support: {
    label: "Platform Support",
    bg: "bg-amber-50",
    text: "text-amber-900",
    border: "border-amber-300",
  },
  donor: {
    label: "Donor",
    bg: "bg-teal-50",
    text: "text-teal-900",
    border: "border-teal-300",
  },
  caregiver: {
    label: "Caregiver",
    bg: "bg-emerald-50",
    text: "text-emerald-900",
    border: "border-emerald-300",
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

  const translatedLabel = t(`roles.${role}` as const, { defaultValue: config.label });

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium tracking-tight",
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
