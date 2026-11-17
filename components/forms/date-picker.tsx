"use client";

import { CalendarDays } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { formatDate } from "@/lib/format";
import { cn } from "@/lib/utils";

export function DatePicker({
  id,
  value,
  onChange,
  invalid,
  placeholder = "Pick a date",
}: {
  id?: string;
  value: Date | undefined;
  onChange: (date: Date | undefined) => void;
  invalid?: boolean;
  placeholder?: string;
}) {
  const [open, setOpen] = useState(false);
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          id={id}
          type="button"
          variant="outline"
          aria-invalid={invalid}
          className={cn("h-9 w-full justify-start px-2.5 font-normal", !value && "text-muted-foreground")}
        >
          <CalendarDays className="text-muted-foreground" />
          {value ? formatDate(value, "EEE, d MMM yyyy") : placeholder}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={value}
          onSelect={(d) => {
            onChange(d);
            setOpen(false);
          }}
          captionLayout="dropdown"
          startMonth={new Date(2015, 0)}
          endMonth={new Date()}
          defaultMonth={value}
          disabled={{ after: new Date() }}
          className="p-3"
        />
      </PopoverContent>
    </Popover>
  );
}
