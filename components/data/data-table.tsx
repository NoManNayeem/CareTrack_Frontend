"use client";

import { ArrowDown, ArrowUp, ChevronsUpDown } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import type { KeyboardEvent, ReactNode } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { duration, ease } from "@/lib/motion";
import { cn } from "@/lib/utils";

export interface Column<T> {
  id: string;
  header: ReactNode;
  cell: (row: T) => ReactNode;
  className?: string;
  headerClassName?: string;
  /** Server-side sort values for this column (header becomes a toggle). */
  sort?: { asc: string; desc: string };
  skeleton?: ReactNode;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  rows: T[] | undefined;
  getRowId: (row: T) => string;
  isLoading: boolean;
  /** True while placeholder (previous page) data is shown during a refetch. */
  isRefreshing?: boolean;
  onRowClick?: (row: T) => void;
  onRowHover?: (row: T) => void;
  rowLabel?: (row: T) => string;
  sort?: string;
  onSortChange?: (sort: string) => void;
  empty: ReactNode;
  /** Card renderer used below the md breakpoint. */
  mobileCard: (row: T) => ReactNode;
  skeletonRows?: number;
  caption: string;
  /** Briefly tints a row (e.g. one that was just created). */
  highlightRowId?: string | null;
}

function SortIcon({ state }: { state: "asc" | "desc" | null }) {
  if (state === "asc") return <ArrowUp className="size-3.5" />;
  if (state === "desc") return <ArrowDown className="size-3.5" />;
  return <ChevronsUpDown className="size-3.5 opacity-40 group-hover/sort:opacity-80" />;
}

export function DataTable<T>({
  columns,
  rows,
  getRowId,
  isLoading,
  isRefreshing,
  onRowClick,
  onRowHover,
  rowLabel,
  sort,
  onSortChange,
  empty,
  mobileCard,
  skeletonRows = 8,
  caption,
  highlightRowId,
}: DataTableProps<T>) {
  const showSkeleton = isLoading && !rows;
  const isEmpty = !showSkeleton && rows?.length === 0;

  const onKeyDown = (event: KeyboardEvent, row: T) => {
    if (onRowClick && (event.key === "Enter" || event.key === " ")) {
      event.preventDefault();
      onRowClick(row);
    }
  };

  return (
    <div className="relative">
      {/* Thin progress line while a new page/filter result is loading */}
      <AnimatePresence>
        {isRefreshing && (
          <motion.div
            key="progress"
            className="absolute inset-x-0 top-0 z-10 h-px overflow-hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="h-full w-1/3 bg-brand"
              animate={{ x: ["-100%", "300%"] }}
              transition={{ duration: 1.1, ease: "easeInOut", repeat: Infinity }}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Desktop / tablet */}
      <div className={cn("hidden transition-opacity duration-150 md:block", isRefreshing && "opacity-60")}>
        <Table aria-label={caption} aria-busy={isLoading || isRefreshing}>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              {columns.map((col) => {
                const state =
                  col.sort && sort ? (sort === col.sort.asc ? "asc" : sort === col.sort.desc ? "desc" : null) : null;
                return (
                  <TableHead
                    key={col.id}
                    className={cn("h-9 text-xs font-medium text-muted-foreground", col.headerClassName)}
                    aria-sort={state === "asc" ? "ascending" : state === "desc" ? "descending" : undefined}
                  >
                    {col.sort && onSortChange ? (
                      <button
                        type="button"
                        className="group/sort -ml-1.5 inline-flex items-center gap-1 rounded-sm px-1.5 py-0.5 hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
                        onClick={() => onSortChange(state === "asc" ? col.sort!.desc : col.sort!.asc)}
                      >
                        {col.header}
                        <SortIcon state={state} />
                      </button>
                    ) : (
                      col.header
                    )}
                  </TableHead>
                );
              })}
            </TableRow>
          </TableHeader>
          <TableBody>
            {showSkeleton &&
              Array.from({ length: skeletonRows }, (_, i) => (
                <TableRow key={`s${i}`} className="hover:bg-transparent">
                  {columns.map((col) => (
                    <TableCell key={col.id} className={cn("h-13", col.className)}>
                      {col.skeleton ?? <Skeleton className="h-4 w-3/4 max-w-40" />}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            {isEmpty && (
              <TableRow className="hover:bg-transparent">
                <TableCell colSpan={columns.length}>{empty}</TableCell>
              </TableRow>
            )}
            <AnimatePresence initial={false}>
              {rows?.map((row) => (
                <motion.tr
                  key={getRowId(row)}
                  layout="position"
                  initial={
                    highlightRowId === getRowId(row)
                      ? { opacity: 0, backgroundColor: "var(--brand-soft)" }
                      : { opacity: 0 }
                  }
                  animate={
                    highlightRowId === getRowId(row)
                      ? {
                          opacity: 1,
                          backgroundColor: ["var(--brand-soft)", "var(--brand-soft)", "rgba(0,0,0,0)"],
                          transition: { duration: 2.4, times: [0, 0.6, 1] },
                        }
                      : { opacity: 1 }
                  }
                  exit={{ opacity: 0, x: -8, transition: { duration: duration.fast, ease } }}
                  transition={{ duration: duration.base, ease }}
                  data-slot="table-row"
                  tabIndex={onRowClick ? 0 : undefined}
                  aria-label={rowLabel?.(row)}
                  onClick={onRowClick ? () => onRowClick(row) : undefined}
                  onKeyDown={(e) => onKeyDown(e, row)}
                  onMouseEnter={onRowHover ? () => onRowHover(row) : undefined}
                  className={cn(
                    "border-b transition-colors hover:bg-muted/60 focus-visible:bg-muted/60 focus-visible:outline-none",
                    onRowClick && "cursor-pointer",
                  )}
                >
                  {columns.map((col) => (
                    <TableCell key={col.id} className={cn("h-13 py-2", col.className)}>
                      {col.cell(row)}
                    </TableCell>
                  ))}
                </motion.tr>
              ))}
            </AnimatePresence>
          </TableBody>
        </Table>
      </div>

      {/* Mobile */}
      <div className={cn("divide-y md:hidden", isRefreshing && "opacity-60")}>
        {showSkeleton &&
          Array.from({ length: Math.min(skeletonRows, 6) }, (_, i) => (
            <div key={i} className="space-y-2 px-4 py-3.5">
              <Skeleton className="h-4 w-1/2" />
              <Skeleton className="h-3 w-3/4" />
            </div>
          ))}
        {isEmpty && empty}
        <AnimatePresence initial={false}>
          {rows?.map((row) => (
            <motion.div
              key={getRowId(row)}
              layout="position"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, x: -12, transition: { duration: duration.fast, ease } }}
            >
              {mobileCard(row)}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
