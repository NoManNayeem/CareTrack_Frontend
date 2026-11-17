"use client";

import { Building2, Check, ChevronsUpDown, Plus } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

/** Pick an existing hospital (keeps naming consistent for filters) or type a new one. */
export function HospitalCombobox({
  id,
  value,
  onChange,
  options,
  invalid,
}: {
  id?: string;
  value: string;
  onChange: (value: string) => void;
  options: string[];
  invalid?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const trimmed = search.trim();
  const exact = options.some((o) => o.toLowerCase() === trimmed.toLowerCase());

  const choose = (v: string) => {
    onChange(v);
    setOpen(false);
    setSearch("");
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          id={id}
          type="button"
          variant="outline"
          role="combobox"
          aria-expanded={open}
          aria-invalid={invalid}
          className={cn("h-9 w-full justify-between px-2.5 font-normal", !value && "text-muted-foreground")}
        >
          <span className="flex min-w-0 items-center gap-2">
            <Building2 className="text-muted-foreground" />
            <span className="truncate">{value || "Select or type a hospital"}</span>
          </span>
          <ChevronsUpDown className="text-muted-foreground" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-(--radix-popover-trigger-width) p-0" align="start">
        <Command>
          <CommandInput value={search} onValueChange={setSearch} placeholder="Search or add hospital…" />
          <CommandList>
            <CommandEmpty>Type a name to add a new hospital.</CommandEmpty>
            {trimmed.length >= 2 && !exact && (
              <CommandGroup>
                <CommandItem value={`__new__${trimmed}`} onSelect={() => choose(trimmed)}>
                  <Plus /> Use “{trimmed}”
                </CommandItem>
              </CommandGroup>
            )}
            <CommandGroup heading="Existing hospitals">
              {options.map((o) => (
                <CommandItem key={o} value={o} onSelect={() => choose(o)}>
                  <Check className={cn(value === o ? "opacity-100" : "opacity-0", "text-brand")} />
                  {o}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
