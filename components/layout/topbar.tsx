import { Suspense } from "react";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Breadcrumbs } from "./breadcrumbs";
import { CommandMenu } from "./command-menu";
import { ThemeToggle } from "./theme-toggle";

export function Topbar() {
  return (
    <header className="sticky top-0 z-20 flex h-13 shrink-0 items-center gap-2 border-b bg-card/90 px-3 backdrop-blur-sm supports-[backdrop-filter]:bg-card/75 sm:px-4 md:rounded-t-xl">
      <SidebarTrigger className="-ml-1" aria-label="Open menu" />
      <Separator orientation="vertical" className="mr-1 hidden h-4 md:block" />
      <Suspense fallback={null}>
        <Breadcrumbs />
      </Suspense>
      <div className="ml-auto flex items-center gap-1.5 pointer-coarse:gap-2">
        <CommandMenu />
        <ThemeToggle />
      </div>
    </header>
  );
}
