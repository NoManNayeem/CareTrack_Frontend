"use client";

import { motion } from "motion/react";
import { useState } from "react";
import { ConditionDot } from "@/components/feedback/condition-badge";
import { CONDITION_META, type Condition } from "@/lib/constants";
import { formatNumber } from "@/lib/format";
import { ease } from "@/lib/motion";
import { cn } from "@/lib/utils";

/** Tall segmented bar (one whole → parts) + legend list. Hover/focus highlights a part. */
export function CensusBar({
  data,
  onSelect,
}: {
  data: Array<{ condition: Condition; count: number }>;
  onSelect?: (c: Condition) => void;
}) {
  const total = data.reduce((s, d) => s + d.count, 0);
  const [hover, setHover] = useState<Condition | null>(null);

  return (
    <div className="space-y-5 px-2">
      <div>
        <p className="text-[28px] leading-none font-semibold tracking-[-0.02em]">{formatNumber(total)}</p>
        <p className="mt-1.5 text-xs text-muted-foreground">patients on record</p>
      </div>
      <motion.div
        className="flex h-7 origin-left gap-[2px]"
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ duration: 0.6, ease }}
        role="img"
        aria-label={data.map((d) => `${CONDITION_META[d.condition].label} ${d.count}`).join(", ")}
      >
        {data
          .filter((d) => d.count > 0)
          .map((d) => {
            const share = total ? d.count / total : 0;
            return (
              <motion.button
                type="button"
                key={d.condition}
                animate={{ opacity: hover && hover !== d.condition ? 0.35 : 1 }}
                transition={{ duration: 0.15 }}
                onMouseEnter={() => setHover(d.condition)}
                onMouseLeave={() => setHover(null)}
                onFocus={() => setHover(d.condition)}
                onBlur={() => setHover(null)}
                onClick={() => onSelect?.(d.condition)}
                aria-label={`${CONDITION_META[d.condition].label}: ${d.count} (${Math.round(share * 100)}%)`}
                className="relative min-w-[4px] basis-0 overflow-hidden rounded-[4px] text-left focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 focus-visible:outline-none"
                style={{ backgroundColor: `var(--condition-${d.condition})`, flexGrow: d.count }}
              />
            );
          })}
      </motion.div>
      <ul className="space-y-0.5">
        {data.map((d) => {
          const share = total ? (d.count / total) * 100 : 0;
          return (
            <li key={d.condition}>
              <button
                type="button"
                onClick={() => onSelect?.(d.condition)}
                onMouseEnter={() => setHover(d.condition)}
                onMouseLeave={() => setHover(null)}
                className={cn(
                  "-mx-2 flex w-[calc(100%+1rem)] items-center gap-2.5 rounded-md px-2 py-1.5 text-[13px] transition-colors hover:bg-muted pointer-coarse:min-h-11",
                  hover === d.condition && "bg-muted",
                )}
              >
                <ConditionDot condition={d.condition} />
                <span className="flex-1 text-left">{CONDITION_META[d.condition].label}</span>
                <span className="tabular font-medium">{formatNumber(d.count)}</span>
                <span className="tabular w-10 text-right text-xs text-muted-foreground">{share.toFixed(0)}%</span>
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
