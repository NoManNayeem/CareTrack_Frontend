"use client";

import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PAGE_SIZES } from "@/lib/constants";
import { formatNumber } from "@/lib/format";
import type { PageMeta } from "@/lib/types";
import { cn } from "@/lib/utils";

/** 1 … 4 5 [6] 7 8 … 20 */
export function pageWindow(page: number, total: number): Array<number | "gap"> {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const pages = new Set([1, total, page - 1, page, page + 1]);
  if (page <= 3) [2, 3, 4].forEach((p) => pages.add(p));
  if (page >= total - 2) [total - 3, total - 2, total - 1].forEach((p) => pages.add(p));
  const sorted = [...pages].filter((p) => p >= 1 && p <= total).sort((a, b) => a - b);
  const out: Array<number | "gap"> = [];
  sorted.forEach((p, i) => {
    if (i > 0 && p - sorted[i - 1]! > 1) out.push("gap");
    out.push(p);
  });
  return out;
}

export function PaginationBar({
  meta,
  onPageChange,
  onLimitChange,
  noun = "results",
  className,
}: {
  meta: PageMeta | undefined;
  onPageChange: (page: number) => void;
  onLimitChange?: (limit: number) => void;
  noun?: string;
  className?: string;
}) {
  if (!meta || meta.total === 0) return null;
  const { page, limit, total, totalPages } = meta;
  const start = (page - 1) * limit + 1;
  const end = Math.min(page * limit, total);

  return (
    <nav
      aria-label="Pagination"
      className={cn("flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between", className)}
    >
      <div className="flex items-center gap-4 text-sm text-muted-foreground">
        <p className="tabular" aria-live="polite">
          <span className="font-medium text-foreground">
            {formatNumber(start)}–{formatNumber(end)}
          </span>{" "}
          of {formatNumber(total)} {noun}
        </p>
        {onLimitChange && (
          <div className="hidden items-center gap-2 sm:flex">
            <span className="text-xs">Rows</span>
            <Select value={String(limit)} onValueChange={(v) => onLimitChange(Number(v))}>
              <SelectTrigger size="sm" className="h-7 w-[68px]" aria-label="Rows per page">
                <SelectValue />
              </SelectTrigger>
              <SelectContent align="start">
                {PAGE_SIZES.map((s) => (
                  <SelectItem key={s} value={String(s)}>
                    {s}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
      </div>

      <div className="flex items-center gap-1 pointer-coarse:gap-2">
        <Button
          variant="ghost"
          size="icon-sm"
          className="hidden sm:inline-flex"
          disabled={page <= 1}
          onClick={() => onPageChange(1)}
          aria-label="First page"
        >
          <ChevronsLeft />
        </Button>
        <Button
          variant="outline"
          size="sm"
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
          aria-label="Previous page"
        >
          <ChevronLeft /> <span className="sm:hidden">Prev</span>
        </Button>
        <div className="hidden items-center gap-0.5 sm:flex">
          {pageWindow(page, totalPages).map((p, i) =>
            p === "gap" ? (
              <span key={`gap${i}`} className="w-7 text-center text-sm text-subtle-foreground">
                …
              </span>
            ) : (
              <Button
                key={p}
                size="icon-sm"
                variant={p === page ? "secondary" : "ghost"}
                className={cn("tabular min-w-7 text-[13px]", p === page && "font-semibold text-foreground")}
                aria-current={p === page ? "page" : undefined}
                onClick={() => onPageChange(p)}
              >
                {p}
              </Button>
            ),
          )}
        </div>
        <span className="tabular px-2 text-sm text-muted-foreground sm:hidden">
          {page} / {totalPages}
        </span>
        <Button
          variant="outline"
          size="sm"
          disabled={page >= totalPages}
          onClick={() => onPageChange(page + 1)}
          aria-label="Next page"
        >
          <span className="sm:hidden">Next</span> <ChevronRight />
        </Button>
        <Button
          variant="ghost"
          size="icon-sm"
          className="hidden sm:inline-flex"
          disabled={page >= totalPages}
          onClick={() => onPageChange(totalPages)}
          aria-label="Last page"
        >
          <ChevronsRight />
        </Button>
      </div>
    </nav>
  );
}
