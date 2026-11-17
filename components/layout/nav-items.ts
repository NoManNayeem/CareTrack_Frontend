import { LayoutDashboard, Stethoscope, UsersRound, type LucideIcon } from "lucide-react";

export interface NavItem {
  href: "/dashboard" | "/doctors" | "/patients";
  label: string;
  icon: LucideIcon;
  description: string;
}

export const NAV_ITEMS: NavItem[] = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard, description: "Analytics and trends" },
  { href: "/doctors", label: "Doctors", icon: Stethoscope, description: "Directory and caseloads" },
  { href: "/patients", label: "Patients", icon: UsersRound, description: "Records and conditions" },
];

export const isActivePath = (pathname: string, href: string) => pathname === href || pathname.startsWith(`${href}/`);
