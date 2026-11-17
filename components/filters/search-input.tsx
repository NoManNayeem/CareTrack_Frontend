"use client";

import { Search, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { InputGroup, InputGroupAddon, InputGroupButton, InputGroupInput } from "@/components/ui/input-group";
import { Kbd } from "@/components/ui/kbd";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import { cn } from "@/lib/utils";

/**
 * Local state for typing; the debounced value is pushed upward (→ URL → query).
 * "/" focuses the field from anywhere on the page, like most data tools.
 */
export function SearchInput({
  value,
  onChange,
  placeholder,
  className,
  shortcut = true,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  className?: string;
  shortcut?: boolean;
}) {
  const [draft, setDraft] = useState(value);
  const debounced = useDebouncedValue(draft, 300);
  const ref = useRef<HTMLInputElement>(null);

  // Sync when the URL changes externally (back/forward, "clear all")
  const [lastValue, setLastValue] = useState(value);
  if (value !== lastValue) {
    setLastValue(value);
    setDraft(value);
  }

  useEffect(() => {
    if (debounced.trim() !== value) onChange(debounced.trim());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debounced]);

  useEffect(() => {
    if (!shortcut) return;
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (e.key === "/" && !["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName) && !target.isContentEditable) {
        e.preventDefault();
        ref.current?.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [shortcut]);

  return (
    <InputGroup className={cn("h-8 w-full sm:w-72", className)}>
      <InputGroupAddon>
        <Search className="text-muted-foreground" />
      </InputGroupAddon>
      <InputGroupInput
        ref={ref}
        type="search"
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Escape") setDraft("");
          if (e.key === "Enter") onChange(draft.trim());
        }}
        placeholder={placeholder}
        aria-label={placeholder}
        className="[&::-webkit-search-cancel-button]:hidden"
      />
      <InputGroupAddon align="inline-end">
        {draft ? (
          <InputGroupButton size="icon-xs" aria-label="Clear search" onClick={() => setDraft("")}>
            <X />
          </InputGroupButton>
        ) : (
          shortcut && <Kbd className="hidden sm:inline-flex">/</Kbd>
        )}
      </InputGroupAddon>
    </InputGroup>
  );
}
