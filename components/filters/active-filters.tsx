"use client";

import { X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { Button } from "@/components/ui/button";
import { duration, ease } from "@/lib/motion";

export interface ActiveFilter {
  id: string;
  label: string;
  onRemove: () => void;
}

/** Removable chips summarising every active filter — one place to see and undo state. */
export function ActiveFilters({ filters, onClearAll }: { filters: ActiveFilter[]; onClearAll: () => void }) {
  return (
    <AnimatePresence initial={false}>
      {filters.length > 0 && (
        <motion.div
          key="bar"
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0, transition: { duration: duration.base, ease } }}
          exit={{ opacity: 0, y: -4, transition: { duration: duration.fast, ease } }}
        >
          <div className="flex flex-wrap items-center gap-1.5 pt-3 pointer-coarse:gap-2">
            <AnimatePresence initial={false} mode="popLayout">
              {filters.map((f) => (
                <motion.span
                  layout
                  key={f.id}
                  initial={{ opacity: 0, scale: 0.92 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.92, transition: { duration: 0.08, ease } }}
                  transition={{ duration: duration.fast, ease }}
                  className="inline-flex h-6 items-center gap-1 rounded-md border bg-muted/60 pr-0.5 pl-2 text-xs text-foreground pointer-coarse:h-9"
                >
                  {f.label}
                  <button
                    type="button"
                    onClick={f.onRemove}
                    aria-label={`Remove filter ${f.label}`}
                    className="inline-flex size-5 items-center justify-center rounded-sm text-muted-foreground hover:bg-background hover:text-foreground pointer-coarse:size-8"
                  >
                    <X className="size-3" />
                  </button>
                </motion.span>
              ))}
            </AnimatePresence>
            <Button variant="ghost" size="xs" className="text-muted-foreground" onClick={onClearAll}>
              Clear all
            </Button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
