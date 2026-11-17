"use client";

import { CalendarDays, Check } from "lucide-react";
import { useState } from "react";
import type { DateRange } from "react-day-picker";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { DATE_PRESETS, fromUtcDate, toUtcDate } from "@/lib/dates";
import { formatDate } from "@/lib/format";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";

function label(from: Date | null, to: Date | null) {
  if (!from && !to) return null;
  if (from && to) {
    const sameYear = from.getUTCFullYear() === to.getUTCFullYear();
    return `${formatDate(fromUtcDate(from), sameYear ? "d MMM" : "d MMM yyyy")} – ${formatDate(fromUtcDate(to), "d MMM yyyy")}`;
  }
  return from ? `From ${formatDate(fromUtcDate(from))}` : `Until ${formatDate(fromUtcDate(to!))}`;
}

/**
 * Preset rows + a range calendar. Values are UTC calendar dates (as stored in the URL),
 * so "17 Nov" means the whole of 17 Nov for every user regardless of timezone.
 */
export function DateRangeFilter({
  title,
  from,
  to,
  onChange,
  align = "start",
}: {
  title: string;
  from: Date | null;
  to: Date | null;
  onChange: (range: { from: Date | null; to: Date | null }) => void;
  align?: "start" | "end";
}) {
  const [open, setOpen] = useState(false);
  const isMobile = useIsMobile();
  const [draft, setDraft] = useState<DateRange | undefined>();
  const active = label(from, to);
  const selected: DateRange | undefined =
    draft ??
    (from || to ? { from: from ? fromUtcDate(from) : undefined, to: to ? fromUtcDate(to) : undefined } : undefined);

  const apply = (range: DateRange | undefined) => {
    onChange({ from: range?.from ? toUtcDate(range.from) : null, to: range?.to ? toUtcDate(range.to) : null });
    setDraft(undefined);
    setOpen(false);
  };

  const activePreset = DATE_PRESETS.find((p) => {
    if (!from || !to) return false;
    const r = p.range();
    return toUtcDate(r.from).getTime() === from.getTime() && toUtcDate(r.to).getTime() === to.getTime();
  })?.id;

  return (
    <Popover
      open={open}
      onOpenChange={(o) => {
        setOpen(o);
        if (!o) setDraft(undefined);
      }}
    >
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className={cn(
            "h-8 border-dashed font-normal text-muted-foreground",
            active && "border-solid text-foreground",
          )}
        >
          <CalendarDays />
          {active ? <span className="tabular">{active}</span> : title}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align={align}>
        <div className="flex flex-col sm:flex-row">
          <ul
            className="flex shrink-0 gap-1 overflow-x-auto border-b p-2 sm:w-40 sm:flex-col sm:border-r sm:border-b-0"
            aria-label="Presets"
          >
            {DATE_PRESETS.map((preset) => (
              <li key={preset.id}>
                <button
                  type="button"
                  onClick={() => apply(preset.range())}
                  className={cn(
                    "flex w-full items-center justify-between gap-2 rounded-md px-2 py-1.5 text-left text-[13px] whitespace-nowrap hover:bg-muted pointer-coarse:min-h-11",
                    activePreset === preset.id && "font-semibold",
                  )}
                >
                  {preset.label}
                  {activePreset === preset.id && <Check className="size-4 text-brand" strokeWidth={2.5} />}
                </button>
              </li>
            ))}
          </ul>
          <div>
            <Calendar
              mode="range"
              numberOfMonths={isMobile ? 1 : 2}
              selected={selected}
              onSelect={setDraft}
              defaultMonth={selected?.from ?? new Date(new Date().getFullYear(), new Date().getMonth() - 1)}
              disabled={{ after: new Date() }}
              className="p-3"
            />
            <div className="flex items-center justify-between gap-2 border-t px-3 py-2.5">
              <Button variant="ghost" size="sm" onClick={() => apply(undefined)} disabled={!active && !draft}>
                Clear
              </Button>
              <Button size="sm" onClick={() => apply(draft)} disabled={!draft?.from}>
                Apply range
              </Button>
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
