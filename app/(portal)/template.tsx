"use client";

import { motion } from "motion/react";
import { duration, ease } from "@/lib/motion";

/** Re-mounts on every navigation → a short, consistent page entrance. */
export default function PortalTemplate({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: duration.slow, ease }}
    >
      {children}
    </motion.div>
  );
}
