import { CONDITION_META, type Condition } from "@/lib/constants";
import { cn } from "@/lib/utils";

export function ConditionDot({ condition, className }: { condition: Condition; className?: string }) {
  return (
    <span
      aria-hidden="true"
      className={cn("inline-block size-2 shrink-0 rounded-full", className)}
      style={{ backgroundColor: `var(--condition-${condition})` }}
    />
  );
}

/** Status is never colour-alone: a dot + a text label, in neutral ink. */
export function ConditionBadge({ condition, className }: { condition: Condition; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex h-6 items-center gap-1.5 rounded-full border border-border bg-card px-2 text-xs font-medium whitespace-nowrap text-foreground",
        className,
      )}
    >
      <ConditionDot condition={condition} />
      {CONDITION_META[condition].label}
    </span>
  );
}
