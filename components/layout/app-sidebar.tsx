"use client";

import { motion } from "motion/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Suspense } from "react";
import { LogoMark } from "@/components/brand/logo";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  useSidebar,
} from "@/components/ui/sidebar";
import { spring } from "@/lib/motion";
import { isActivePath, NAV_ITEMS } from "./nav-items";
import { UserMenu } from "./user-menu";

function NavLinks({ pathname }: { pathname: string | null }) {
  const { setOpenMobile } = useSidebar();
  return (
    <SidebarMenu className="gap-0.5">
      {NAV_ITEMS.map((item) => {
        const active = pathname ? isActivePath(pathname, item.href) : false;
        return (
          <SidebarMenuItem key={item.href} className="relative">
            {active && (
              <motion.span
                layoutId="sidebar-active"
                transition={spring}
                className="absolute inset-0 rounded-md border border-border bg-card shadow-hairline dark:bg-sidebar-accent"
              />
            )}
            <SidebarMenuButton
              asChild
              isActive={active}
              tooltip={item.label}
              className="relative h-8 bg-transparent! font-medium text-sidebar-foreground data-[active=true]:text-foreground pointer-coarse:h-11 [&>svg]:text-muted-foreground data-[active=true]:[&>svg]:text-brand"
            >
              <Link href={item.href} onClick={() => setOpenMobile(false)} aria-current={active ? "page" : undefined}>
                <item.icon />
                <span>{item.label}</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        );
      })}
    </SidebarMenu>
  );
}

function ActiveNav() {
  return <NavLinks pathname={usePathname()} />;
}

export function AppSidebar() {
  return (
    <Sidebar collapsible="icon" variant="inset">
      <SidebarHeader className="px-2 pt-3 pb-2">
        <Link
          href="/dashboard"
          className="flex items-center gap-2.5 rounded-md px-1.5 py-1 outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <LogoMark className="size-7 shrink-0" />
          <span className="grid leading-tight group-data-[collapsible=icon]:hidden">
            <span className="text-[15px] font-semibold tracking-[-0.01em]">CareTrack</span>
            <span className="text-xs text-muted-foreground">Admin console</span>
          </span>
        </Link>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-xs tracking-wide text-subtle-foreground uppercase">
            Workspace
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <Suspense fallback={<NavLinks pathname={null} />}>
              <ActiveNav />
            </Suspense>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <UserMenu />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
