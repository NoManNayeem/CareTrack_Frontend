import type { Metadata } from "next";
import { Suspense } from "react";
import { ListPageSkeleton } from "@/components/data/page-skeleton";
import { DoctorDetailView } from "@/features/doctors/doctor-detail-view";

export const metadata: Metadata = { title: "Doctor" };

export default function DoctorPage() {
  return (
    <Suspense fallback={<ListPageSkeleton />}>
      <DoctorDetailView />
    </Suspense>
  );
}
