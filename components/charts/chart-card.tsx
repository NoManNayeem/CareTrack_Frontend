"use client";

import { ChartColumn, Table2 } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState, type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { duration, ease } from "@/lib/motion";
import { cn } from "@/lib/utils";

/**
 * Card wrapper for every chart. Each chart also ships an accessible table view
 * (toggle top-right), so no value is ever gated behind colour or hover.
 */
export function ChartCard({
  title,
  subtitle,
  action,
  table,
  children,
  isLoading,
  className,
  bodyClassName,
}: {
  title: string;
  subtitle?: ReactNode;
  action?: ReactNode;
  table?: ReactNode;
  children: ReactNode;
  isLoading?: boolean;
  className?: string;
  bodyClassName?: string;
}) {
  const [view, setView] = useState<"chart" | "table">("chart");
  return (
    <section className={cn("flex flex-col rounded-lg border bg-card", className)} aria-label={title}>
      <header className="flex items-start justify-between gap-3 px-4 pt-4 sm:px-5">
        <div className="min-w-0">
          <h2 className="text-sm font-semibold">{title}</h2>
          {subtitle && <p className="mt-0.5 text-xs text-muted-foreground">{subtitle}</p>}
        </div>
        <div className="flex shrink-0 items-center gap-1">
          {action}
          {table && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon-xs"
                  aria-pressed={view === "table"}
                  aria-label={view === "chart" ? `Show ${title} as a table` : `Show ${title} as a chart`}
                  onClick={() => setView((v) => (v === "chart" ? "table" : "chart"))}
                  className="text-muted-foreground"
                >
                  {view === "chart" ? <Table2 /> : <ChartColumn />}
                </Button>
              </TooltipTrigger>
              <TooltipContent>{view === "chart" ? "Table view" : "Chart view"}</TooltipContent>
            </Tooltip>
          )}
        </div>
      </header>
      <div className={cn("relative flex-1 px-2 pt-3 pb-3 sm:px-3", bodyClassName)}>
        {isLoading ? (
          <Skeleton className="mx-2 h-full min-h-48 rounded-md" />
        ) : (
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={view}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: duration.fast, ease }}
              className="h-full"
            >
              {view === "chart" ? children : <div className="max-h-80 scrollbar-thin overflow-auto px-2">{table}</div>}
            </motion.div>
          </AnimatePresence>
        )}
      </div>
    </section>
  );
}

export function SimpleTable({ head, rows }: { head: string[]; rows: Array<Array<ReactNode>> }) {
  return (
    <table className="w-full text-[13px]">
      <thead>
        <tr className="border-b text-left text-xs text-muted-foreground">
          {head.map((h, i) => (
            <th key={h} className={cn("py-2 font-medium", i > 0 && "text-right")}>
              {h}
            </th>
          ))}
        </tr>
      </thead>
      <tbody className="tabular">
        {rows.map((r, i) => (
          <tr key={i} className="border-b last:border-0">
            {r.map((c, j) => (
              <td key={j} className={cn("py-1.5", j > 0 && "text-right")}>
                {c}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}
