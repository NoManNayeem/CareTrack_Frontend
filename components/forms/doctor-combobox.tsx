"use client";

import { Check, ChevronsUpDown, Stethoscope, X } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Spinner } from "@/components/ui/spinner";
import { useDoctorOptions } from "@/features/doctors/hooks";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import { cn } from "@/lib/utils";

/** Server-searched doctor picker (the doctor list can be large, so it never loads everything). */
export function DoctorCombobox({
  id,
  value,
  label,
  onChange,
  placeholder = "Select a doctor",
  variant = "field",
  invalid,
}: {
  id?: string;
  value: string | null;
  /** Display name for the current value (avoids a lookup request). */
  label?: string | null;
  onChange: (doctor: { id: string; name: string } | null) => void;
  placeholder?: string;
  variant?: "field" | "filter";
  invalid?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const q = useDebouncedValue(search.trim(), 250);
  const { data: doctors = [], isFetching } = useDoctorOptions(q);

  const isFilter = variant === "filter";

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <div className="relative">
        <PopoverTrigger asChild>
          <Button
            id={id}
            type="button"
            variant="outline"
            role="combobox"
            aria-expanded={open}
            aria-invalid={invalid}
            size={isFilter ? "sm" : "default"}
            className={cn(
              "w-full justify-between font-normal",
              isFilter ? "h-8 border-dashed text-muted-foreground" : "h-9 px-2.5",
              isFilter && value && "border-solid pr-8 text-foreground",
              !value && !isFilter && "text-muted-foreground",
            )}
          >
            <span className="flex min-w-0 items-center gap-2">
              <Stethoscope className="text-muted-foreground" />
              <span className="truncate">{value ? (label ?? "Selected doctor") : placeholder}</span>
            </span>
            {!(isFilter && value) && <ChevronsUpDown className="text-muted-foreground" />}
          </Button>
        </PopoverTrigger>
        {isFilter && value && (
          <button
            type="button"
            aria-label="Clear doctor filter"
            onClick={() => onChange(null)}
            className="absolute top-1/2 right-1.5 inline-flex size-5 -translate-y-1/2 items-center justify-center rounded-sm text-muted-foreground hover:bg-muted hover:text-foreground pointer-coarse:size-9"
          >
            <X className="size-3.5" />
          </button>
        )}
      </div>
      <PopoverContent className="w-72 p-0" align="start">
        <Command shouldFilter={false}>
          <CommandInput value={search} onValueChange={setSearch} placeholder="Search doctors…" />
          <CommandList>
            <CommandEmpty>{isFetching ? "Searching…" : "No doctors found."}</CommandEmpty>
            <CommandGroup heading={isFetching ? undefined : q ? "Matches" : "Doctors A–Z"}>
              {isFetching && doctors.length === 0 && (
                <div className="flex justify-center py-4">
                  <Spinner />
                </div>
              )}
              {doctors.map((d) => (
                <CommandItem
                  key={d.id}
                  value={d.id}
                  onSelect={() => {
                    onChange({ id: d.id, name: d.name });
                    setOpen(false);
                    setSearch("");
                  }}
                >
                  <Check className={cn("text-brand", value === d.id ? "opacity-100" : "opacity-0")} />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate">{d.name}</span>
                    <span className="block truncate text-xs text-muted-foreground">{d.specialization}</span>
                  </span>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
