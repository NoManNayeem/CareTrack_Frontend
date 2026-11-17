import { motion } from "motion/react";
import { ConditionDot } from "@/components/feedback/condition-badge";
import { CONDITION_META, CONDITIONS, type Condition } from "@/lib/constants";
import { formatNumber } from "@/lib/format";
import { ease } from "@/lib/motion";
import { cn } from "@/lib/utils";

/** One whole split into parts: thin segmented bar + legend that carries names and numbers. */
export function ConditionCensus({
  counts,
  className,
  onSelect,
  selected = [],
}: {
  counts: Record<Condition, number>;
  className?: string;
  onSelect?: (condition: Condition) => void;
  selected?: Condition[];
}) {
  const total = CONDITIONS.reduce((s, c) => s + counts[c], 0);
  return (
    <div className={cn("space-y-3", className)}>
      <motion.div
        className="flex h-2 origin-left gap-[2px] overflow-hidden rounded-full bg-muted"
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ duration: 0.6, ease }}
        role="img"
        aria-label={CONDITIONS.map((c) => `${CONDITION_META[c].label}: ${counts[c]}`).join(", ")}
      >
        {total > 0 &&
          CONDITIONS.filter((c) => counts[c] > 0).map((c) => (
            <span
              key={c}
              className="h-full min-w-[3px]"
              style={{ backgroundColor: `var(--condition-${c})`, flexBasis: 0, flexGrow: counts[c] }}
            />
          ))}
      </motion.div>
      <ul className="flex flex-wrap gap-x-5 gap-y-2">
        {CONDITIONS.map((c) => {
          const content = (
            <>
              <ConditionDot condition={c} />
              <span className="text-muted-foreground">{CONDITION_META[c].label}</span>
              <span className="tabular font-medium">{formatNumber(counts[c])}</span>
            </>
          );
          return (
            <li key={c}>
              {onSelect ? (
                <button
                  type="button"
                  onClick={() => onSelect(c)}
                  aria-pressed={selected.includes(c)}
                  className={cn(
                    "-mx-1.5 flex items-center gap-1.5 rounded-md px-1.5 py-0.5 text-[13px] transition-colors hover:bg-muted",
                    selected.includes(c) && "bg-muted ring-1 ring-border-strong",
                  )}
                >
                  {content}
                </button>
              ) : (
                <span className="flex items-center gap-1.5 text-[13px]">{content}</span>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
