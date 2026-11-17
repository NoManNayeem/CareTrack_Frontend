"use client";

import { animate, useReducedMotion } from "motion/react";
import { useEffect, useRef } from "react";
import { formatNumber } from "@/lib/format";

/** Animates between values (not from 0 on every refetch) — writes to the DOM, no re-renders. */
export function CountUp({ value, format = formatNumber }: { value: number; format?: (n: number) => string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const previous = useRef(0);
  const reduce = useReducedMotion();

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    if (reduce) {
      node.textContent = format(value);
      previous.current = value;
      return;
    }
    const controls = animate(previous.current, value, {
      duration: 0.7,
      ease: [0.2, 0, 0, 1],
      onUpdate: (v) => {
        node.textContent = format(Math.round(v));
      },
    });
    previous.current = value;
    return () => controls.stop();
  }, [value, reduce, format]);

  return <span ref={ref}>{format(value)}</span>;
}
