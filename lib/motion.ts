import type { Transition, Variants } from "motion/react";

/** One easing curve and three durations for the whole product. */
export const ease = [0.2, 0, 0, 1] as const;
export const duration = { fast: 0.12, base: 0.18, slow: 0.26 } as const;

export const transition: Transition = { duration: duration.base, ease };
export const spring: Transition = { type: "spring", stiffness: 520, damping: 42, mass: 0.8 };

export const fadeRise: Variants = {
  hidden: { opacity: 0, y: 4 },
  visible: { opacity: 1, y: 0, transition: { duration: duration.slow, ease } },
};

export const stagger = (step = 0.04): Variants => ({
  hidden: {},
  visible: { transition: { staggerChildren: step } },
});

export const rowExit = {
  opacity: 0,
  height: 0,
  transition: { duration: duration.base, ease },
};
