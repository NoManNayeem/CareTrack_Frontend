"use client";

import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ConditionBadge } from "@/components/feedback/condition-badge";
import { usePatients } from "@/features/patients/hooks";
import { formatRelativeDay } from "@/lib/format";

export function RecentAdmissions() {
  const { data, isPending } = usePatients({ sort: "admitted_desc", limit: 6, page: 1 });
  return (
    <section className="flex flex-col rounded-lg border bg-card" aria-label="Recent admissions">
      <header className="flex items-center justify-between px-4 pt-4 sm:px-5">
        <div>
          <h2 className="text-sm font-semibold">Recent admissions</h2>
          <p className="mt-0.5 text-xs text-muted-foreground">Latest patients across all doctors</p>
        </div>
        <Button variant="ghost" size="xs" asChild className="text-muted-foreground">
          <Link href="/patients">
            View all <ArrowRight />
          </Link>
        </Button>
      </header>
      <ul className="mt-2 flex-1 divide-y px-1.5 pb-1.5">
        {isPending
          ? Array.from({ length: 6 }, (_, i) => (
              <li key={i} className="flex items-center gap-3 px-2.5 py-3">
                <Skeleton className="h-4 flex-1" />
                <Skeleton className="h-6 w-24 rounded-full" />
              </li>
            ))
          : data?.data.map((p) => (
              <li key={p.id}>
                <Link
                  href={p.doctor ? `/doctors/${p.doctor.id}` : "/patients"}
                  className="flex items-center gap-3 rounded-md px-2.5 py-2.5 transition-colors hover:bg-muted/60"
                >
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[13px] font-medium">{p.name}</p>
                    <p className="truncate text-xs text-muted-foreground">
                      {p.diagnosis} · {p.doctor?.name}
                    </p>
                  </div>
                  <ConditionBadge condition={p.condition} className="hidden sm:inline-flex" />
                  <span className="w-20 shrink-0 text-right text-xs text-muted-foreground">
                    {formatRelativeDay(p.admissionDate)}
                  </span>
                </Link>
              </li>
            ))}
      </ul>
    </section>
  );
}
