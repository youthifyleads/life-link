import {
  Activity,
  Bell,
  Boxes,
  Building2,
  ClipboardList,
  FileCheck2,
  Hospital,
  LayoutDashboard,
  QrCode,
  ScrollText,
  ShieldCheck,
  Users,
  type LucideIcon,
} from "lucide-react";

import type { UserRole } from "@/features/authentication/model/auth.types";

export interface NavigationItem {
  label: string;
  href: string;
  icon: LucideIcon;
  enabled: boolean;
}

export interface NavigationGroup {
  label: string;
  items: NavigationItem[];
}

export const navigationByRole: Record<UserRole, NavigationGroup[]> = {
  hospital_staff: [
    {
      label: "Hospital operations",
      items: [
        {
          label: "Dashboard",
          href: "/hospital/dashboard",
          icon: LayoutDashboard,
          enabled: true,
        },
        {
          label: "Blood requests",
          href: "/hospital/requests",
          icon: ClipboardList,
          enabled: true,
        },
        {
          label: "Notifications",
          href: "/notifications",
          icon: Bell,
          enabled: true,
        },
        {
          label: "Documents",
          href: "/hospital/documents",
          icon: FileCheck2,
          enabled: true,
        },
      ],
    },
  ],
  blood_bank_staff: [
    {
      label: "Blood bank operations",
      items: [
        {
          label: "Dashboard",
          href: "/blood-bank/dashboard",
          icon: LayoutDashboard,
          enabled: true,
        },
        {
          label: "Request queue",
          href: "/blood-bank/requests",
          icon: ClipboardList,
          enabled: true,
        },
        {
          label: "Inventory",
          href: "/blood-bank/inventory",
          icon: Boxes,
          enabled: true,
        },
        {
          label: "QR tracking",
          href: "/blood-bank/tracking",
          icon: QrCode,
          enabled: true,
        },
        {
          label: "Notifications",
          href: "/notifications",
          icon: Bell,
          enabled: true,
        },
        {
          label: "Documents",
          href: "/blood-bank/documents",
          icon: FileCheck2,
          enabled: true,
        },
      ],
    },
  ],
  admin: [
    {
      label: "Administration",
      items: [
        {
          label: "Dashboard",
          href: "/admin/dashboard",
          icon: LayoutDashboard,
          enabled: true,
        },
        {
          label: "Users",
          href: "/admin/users",
          icon: Users,
          enabled: true,
        },
        {
          label: "Hospitals",
          href: "/admin/hospitals",
          icon: Hospital,
          enabled: true,
        },
        {
          label: "Blood banks",
          href: "/admin/blood-banks",
          icon: Building2,
          enabled: true,
        },
        {
          label: "Roles & permissions",
          href: "/admin/roles",
          icon: ShieldCheck,
          enabled: true,
        },
        {
          label: "Notifications",
          href: "/notifications",
          icon: Bell,
          enabled: true,
        },
        {
          label: "System activity",
          href: "/activity",
          icon: Activity,
          enabled: true,
        },
        {
          label: "Governance audit",
          href: "/admin/audit",
          icon: ScrollText,
          enabled: true,
        },
      ],
    },
  ],
  donor: [],
  caregiver: [],
  medical_lead: [
    {
      label: "Hospital operations",
      items: [
        {
          label: "Dashboard",
          href: "/hospital/dashboard",
          icon: LayoutDashboard,
          enabled: true,
        },
        {
          label: "Blood requests",
          href: "/hospital/requests",
          icon: ClipboardList,
          enabled: true,
        },
        {
          label: "Documents",
          href: "/hospital/documents",
          icon: FileCheck2,
          enabled: true,
        },
        {
          label: "Notifications",
          href: "/notifications",
          icon: Bell,
          enabled: true,
        },
      ],
    },
  ],
  platform_support: [
    {
      label: "Administration",
      items: [
        {
          label: "Dashboard",
          href: "/admin/dashboard",
          icon: LayoutDashboard,
          enabled: true,
        },
        {
          label: "Users",
          href: "/admin/users",
          icon: Users,
          enabled: true,
        },
        {
          label: "Hospitals",
          href: "/admin/hospitals",
          icon: Hospital,
          enabled: true,
        },
        {
          label: "Blood banks",
          href: "/admin/blood-banks",
          icon: Building2,
          enabled: true,
        },
        {
          label: "Governance audit",
          href: "/admin/audit",
          icon: ScrollText,
          enabled: true,
        },
        {
          label: "Notifications",
          href: "/notifications",
          icon: Bell,
          enabled: true,
        },
      ],
    },
  ],
};
