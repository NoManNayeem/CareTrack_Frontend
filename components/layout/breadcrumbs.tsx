"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Fragment } from "react";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { doctorsApi } from "@/features/doctors/api";
import { queryKeys } from "@/lib/query-keys";
import { NAV_ITEMS } from "./nav-items";

export function Breadcrumbs() {
  const pathname = usePathname();
  const [section, id] = pathname.split("/").filter(Boolean);
  // Same key as the page's query → shares its cache entry and request (no extra fetch).
  const doctor = useQuery({
    queryKey: queryKeys.doctors.detail(id ?? ""),
    queryFn: ({ signal }) => doctorsApi.get(id!, signal),
    enabled: section === "doctors" && !!id,
  });
  const nav = NAV_ITEMS.find((n) => n.href === `/${section}`);
  if (!nav) return null;

  const crumbs: Array<{ label: string; href?: string }> = [{ label: nav.label, href: id ? nav.href : undefined }];
  if (section === "doctors" && id) {
    crumbs.push({ label: doctor.data?.name ?? "Doctor" });
  }

  return (
    <Breadcrumb>
      <BreadcrumbList className="text-[13px]">
        {crumbs.map((c, i) => (
          <Fragment key={c.label}>
            {i > 0 && <BreadcrumbSeparator />}
            <BreadcrumbItem>
              {c.href ? (
                <BreadcrumbLink asChild>
                  <Link href={c.href}>{c.label}</Link>
                </BreadcrumbLink>
              ) : (
                <BreadcrumbPage className="max-w-[40vw] truncate font-medium">{c.label}</BreadcrumbPage>
              )}
            </BreadcrumbItem>
          </Fragment>
        ))}
      </BreadcrumbList>
    </Breadcrumb>
  );
}
