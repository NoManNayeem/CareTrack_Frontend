"use client";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ConditionDot } from "@/components/feedback/condition-badge";
import { CONDITION_META, CONDITIONS, type Condition } from "@/lib/constants";

export function ConditionSelect({
  id,
  value,
  onChange,
  invalid,
}: {
  id?: string;
  value: Condition | undefined;
  onChange: (value: Condition) => void;
  invalid?: boolean;
}) {
  return (
    <Select value={value} onValueChange={(v) => onChange(v as Condition)}>
      <SelectTrigger id={id} aria-invalid={invalid} className="h-9 w-full data-[size=default]:h-9">
        <SelectValue placeholder="Select condition" />
      </SelectTrigger>
      <SelectContent>
        {CONDITIONS.map((c) => (
          <SelectItem key={c} value={c}>
            <ConditionDot condition={c} />
            <span>{CONDITION_META[c].label}</span>
            <span className="ml-2 hidden text-xs text-muted-foreground sm:inline">{CONDITION_META[c].description}</span>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
