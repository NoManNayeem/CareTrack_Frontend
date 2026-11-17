import { Suspense } from "react";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { MobileTabBar } from "@/components/layout/mobile-tab-bar";
import { Topbar } from "@/components/layout/topbar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";

/** Static app shell — prerendered, so navigating between sections is instant. */
export default function PortalLayout({ children }: LayoutProps<"/">) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset className="min-w-0 md:border md:shadow-none">
        <Topbar />
        <div className="mx-auto w-full max-w-[1400px] flex-1 px-3 pt-5 pb-24 sm:px-6 sm:pt-6 md:pb-10">{children}</div>
      </SidebarInset>
      <Suspense fallback={null}>
        <MobileTabBar />
      </Suspense>
    </SidebarProvider>
  );
}
