import { ArrowDownRight, ArrowRight, ArrowUpRight } from "lucide-react";
import type { ReactNode } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { CountUp } from "./count-up";
import { Sparkline } from "./sparkline";

/**
 * Stat tile contract: label · value · delta vs a named period · optional trend.
 * Deltas use neutral ink — more admissions is neither "good" nor "bad".
 */
export function KpiTile({
  label,
  value,
  delta,
  hint,
  trend,
  isLoading,
  icon,
}: {
  label: string;
  value: number | undefined;
  delta?: { value: number | null; period: string } | null;
  hint?: ReactNode;
  trend?: number[];
  isLoading?: boolean;
  icon?: ReactNode;
}) {
  const dir = delta?.value == null ? null : delta.value > 0.5 ? "up" : delta.value < -0.5 ? "down" : "flat";
  const Arrow = dir === "up" ? ArrowUpRight : dir === "down" ? ArrowDownRight : ArrowRight;

  return (
    <div className="flex flex-col gap-3 rounded-lg border bg-card px-4 py-3.5 sm:px-5 sm:py-4">
      <p className="flex items-center gap-1.5 text-[13px] text-muted-foreground">
        {icon}
        {label}
      </p>
      <div className="flex items-end justify-between gap-3">
        {isLoading || value === undefined ? (
          <Skeleton className="h-8 w-24" />
        ) : (
          <p className="text-2xl leading-none font-semibold tracking-[-0.02em] sm:text-[28px]">
            <CountUp value={value} />
          </p>
        )}
        {trend && !isLoading && <Sparkline values={trend} className="hidden shrink-0 sm:block" />}
      </div>
      <div className="min-h-4 text-xs text-muted-foreground">
        {isLoading ? (
          <Skeleton className="h-3 w-32" />
        ) : delta && dir ? (
          <span className="inline-flex flex-wrap items-center gap-x-1">
            <span className="tabular inline-flex items-center font-medium text-foreground">
              <Arrow className="size-3.5" />
              {delta.value! > 0 ? "+" : ""}
              {delta.value!.toFixed(1)}%
            </span>
            {delta.period}
          </span>
        ) : delta && delta.value === null ? (
          <span>No data for the previous period</span>
        ) : (
          hint
        )}
      </div>
    </div>
  );
}
