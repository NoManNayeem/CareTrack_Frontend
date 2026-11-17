"use client";

import { Check, PlusCircle } from "lucide-react";
import type { ReactNode } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

export interface FacetOption<V extends string> {
  value: V;
  label: string;
  icon?: ReactNode;
}

/** Multi-select filter: dashed trigger shows the active selection inline. */
export function FacetedFilter<V extends string>({
  title,
  options,
  selected,
  onChange,
  searchable = options.length > 7,
}: {
  title: string;
  options: FacetOption<V>[];
  selected: V[];
  onChange: (values: V[]) => void;
  searchable?: boolean;
}) {
  const set = new Set(selected);
  const toggle = (value: V) => {
    const next = new Set(set);
    if (next.has(value)) next.delete(value);
    else next.add(value);
    onChange(options.map((o) => o.value).filter((v) => next.has(v)));
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="h-8 border-dashed font-normal text-muted-foreground data-[active=true]:border-solid data-[active=true]:text-foreground"
          data-active={set.size > 0}
        >
          <PlusCircle className={cn(set.size > 0 && "hidden")} />
          {title}
          {set.size > 0 && (
            <>
              <Separator orientation="vertical" className="mx-0.5 h-4" />
              <Badge variant="secondary" className="rounded-sm px-1 font-normal lg:hidden">
                {set.size}
              </Badge>
              <div className="hidden gap-1 lg:flex">
                {set.size > 2 ? (
                  <Badge variant="secondary" className="rounded-sm px-1.5 font-normal">
                    {set.size} selected
                  </Badge>
                ) : (
                  options
                    .filter((o) => set.has(o.value))
                    .map((o) => (
                      <Badge key={o.value} variant="secondary" className="rounded-sm px-1.5 font-normal">
                        {o.label}
                      </Badge>
                    ))
                )}
              </div>
            </>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-60 p-0" align="start">
        <Command>
          {searchable && <CommandInput placeholder={`Filter ${title.toLowerCase()}…`} />}
          <CommandList>
            <CommandEmpty>No matches.</CommandEmpty>
            <CommandGroup>
              {options.map((option) => {
                const isSelected = set.has(option.value);
                return (
                  <CommandItem key={option.value} value={option.label} onSelect={() => toggle(option.value)}>
                    <span
                      className={cn(
                        "flex size-4 items-center justify-center rounded-[4px] border border-border-strong transition-colors",
                        isSelected && "border-brand bg-brand text-primary-foreground",
                      )}
                    >
                      <Check className={cn("size-3", !isSelected && "invisible")} />
                    </span>
                    {option.icon}
                    <span className="truncate">{option.label}</span>
                  </CommandItem>
                );
              })}
            </CommandGroup>
            {set.size > 0 && (
              <>
                <CommandSeparator />
                <CommandGroup>
                  <CommandItem onSelect={() => onChange([])} className="justify-center text-muted-foreground">
                    Clear selection
                  </CommandItem>
                </CommandGroup>
              </>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
