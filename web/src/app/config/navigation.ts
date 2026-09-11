import {
  Activity,
  Bell,
  Boxes,
  Building2,
  ClipboardList,
  FileCheck2,
  Gauge,
  History,
  Hospital,
  Inbox,
  QrCode,
  ScanLine,
  ScrollText,
  ShieldCheck,
  SlidersHorizontal,
  Ticket,
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
          icon: Gauge,
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
          label: "System activity",
          href: "/activity",
          icon: Activity,
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
          icon: Gauge,
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
          icon: ScanLine,
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
          icon: Gauge,
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
  donor: [
    {
      label: "Donor Services",
      items: [
        {
          label: "Dashboard",
          href: "/donor/dashboard",
          icon: Gauge,
          enabled: true,
        },
        {
          label: "Donation requests",
          href: "/donor/requests",
          icon: Inbox,
          enabled: true,
        },
        {
          label: "Donation history",
          href: "/donor/donations",
          icon: History,
          enabled: true,
        },
        {
          label: "Donation vouchers",
          href: "/donor/vouchers",
          icon: Ticket,
          enabled: true,
        },
        {
          label: "Consents & rights",
          href: "/donor/consents",
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
          label: "Preferences",
          href: "/settings/notifications",
          icon: SlidersHorizontal,
          enabled: true,
        },
      ],
    },
  ],
  caregiver: [
    {
      label: "Caregiver Tracking",
      items: [
        {
          label: "Dashboard",
          href: "/caregiver/dashboard",
          icon: Activity,
          enabled: true,
        },
        {
          label: "QR scan & lookup",
          href: "/caregiver/scan",
          icon: QrCode,
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
  medical_lead: [],
  platform_support: [],
};
