import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/** Bordered container shared by every list view: toolbar · content · footer. */
export function ListCard({
  toolbar,
  children,
  footer,
  className,
}: {
  toolbar?: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
  className?: string;
}) {
  return (
    <section className={cn("overflow-hidden rounded-lg border bg-card", className)}>
      {toolbar && <div className="border-b px-3 py-3 sm:px-4">{toolbar}</div>}
      {children}
      {footer && <div className="border-t px-3 py-3 sm:px-4">{footer}</div>}
    </section>
  );
}
