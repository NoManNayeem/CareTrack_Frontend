import type { Metadata } from "next";
import { Suspense } from "react";
import { ListPageSkeleton } from "@/components/data/page-skeleton";
import { PatientsView } from "@/features/patients/patients-view";

export const metadata: Metadata = { title: "Patients" };

export default function PatientsPage() {
  return (
    <Suspense fallback={<ListPageSkeleton />}>
      <PatientsView />
    </Suspense>
  );
}
