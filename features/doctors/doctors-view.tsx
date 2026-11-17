"use client";

import { Plus, SearchX, Stethoscope } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useQueryStates } from "nuqs";
import { useState } from "react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DataTable, type Column } from "@/components/data/data-table";
import { ListCard } from "@/components/data/list-card";
import { PaginationBar } from "@/components/data/pagination-bar";
import { EmptyState } from "@/components/feedback/empty-state";
import { ErrorState } from "@/components/feedback/error-state";
import { ActiveFilters, type ActiveFilter } from "@/components/filters/active-filters";
import { DateRangeFilter } from "@/components/filters/date-range-filter";
import { FacetedFilter } from "@/components/filters/faceted-filter";
import { SearchInput } from "@/components/filters/search-input";
import { PageHeader } from "@/components/layout/page-header";
import { DOCTOR_SORTS, SPECIALIZATIONS, type DoctorSort } from "@/lib/constants";
import { fromUtcDate } from "@/lib/dates";
import { formatDate, formatNumber, initials } from "@/lib/format";
import type { DoctorListItem } from "@/lib/types";
import { DoctorFormSheet } from "./doctor-form-sheet";
import { useDoctorFacets, useDoctors, usePrefetchDoctor } from "./hooks";
import { doctorListParsers, newDoctorParser } from "./search-params";

function DoctorIdentity({ doctor }: { doctor: DoctorListItem }) {
  return (
    <div className="flex min-w-0 items-center gap-3">
      <Avatar className="size-8 rounded-md">
        <AvatarFallback className="rounded-md bg-muted text-xs font-semibold text-muted-foreground">
          {initials(doctor.name)}
        </AvatarFallback>
      </Avatar>
      <div className="min-w-0">
        <Link
          href={`/doctors/${doctor.id}`}
          onClick={(e) => e.stopPropagation()}
          className="block truncate text-[13.5px] font-medium text-foreground hover:underline hover:underline-offset-2"
        >
          {doctor.name}
        </Link>
        <p className="truncate text-xs text-muted-foreground">{doctor.email}</p>
      </div>
    </div>
  );
}

export function DoctorsView() {
  const [params, setParams] = useQueryStates(doctorListParsers, { history: "replace" });
  const [{ new: isCreating }, setCreating] = useQueryStates(newDoctorParser);
  const [highlightId, setHighlightId] = useState<string | null>(null);
  const router = useRouter();
  const prefetch = usePrefetchDoctor();
  const facets = useDoctorFacets();
  const { data, error, isPending, isPlaceholderData, isFetching, refetch } = useDoctors(params);

  /** Any filter change returns to page 1. */
  const filter = (patch: Partial<typeof params>) => void setParams({ ...patch, page: 1 });

  const maxPatients = Math.max(1, ...(data?.data.map((d) => d.patientCount) ?? [1]));

  const columns: Column<DoctorListItem>[] = [
    {
      id: "name",
      header: "Doctor",
      sort: { asc: "name_asc", desc: "name_desc" },
      cell: (d) => <DoctorIdentity doctor={d} />,
      className: "w-[30%] min-w-56",
    },
    {
      id: "specialization",
      header: "Specialization",
      cell: (d) => <span className="text-[13px]">{d.specialization}</span>,
    },
    {
      id: "hospital",
      header: "Hospital",
      cell: (d) => <span className="line-clamp-1 text-[13px] text-muted-foreground">{d.hospital}</span>,
    },
    {
      id: "phone",
      header: "Phone",
      cell: (d) => <span className="tabular text-[13px] whitespace-nowrap text-muted-foreground">{d.phone}</span>,
      className: "hidden lg:table-cell",
      headerClassName: "hidden lg:table-cell",
    },
    {
      id: "patients",
      header: "Patients",
      headerClassName: "text-right",
      className: "text-right",
      cell: (d) => (
        <div className="flex items-center justify-end gap-2.5">
          <span className="hidden h-1 w-12 overflow-hidden rounded-full bg-muted xl:block" aria-hidden="true">
            <span
              className="block h-full rounded-full bg-brand/70"
              style={{ width: `${(d.patientCount / maxPatients) * 100}%` }}
            />
          </span>
          <span className="tabular w-8 text-[13px] font-medium">{formatNumber(d.patientCount)}</span>
        </div>
      ),
    },
    {
      id: "joined",
      header: "Added",
      sort: { asc: "oldest", desc: "newest" },
      cell: (d) => (
        <span className="tabular text-[13px] whitespace-nowrap text-muted-foreground">{formatDate(d.createdAt)}</span>
      ),
    },
  ];

  const active: ActiveFilter[] = [
    ...(params.q ? [{ id: "q", label: `“${params.q}”`, onRemove: () => filter({ q: "" }) }] : []),
    ...params.specialization.map((s) => ({
      id: `s-${s}`,
      label: s,
      onRemove: () => filter({ specialization: params.specialization.filter((x) => x !== s) }),
    })),
    ...params.hospital.map((h) => ({
      id: `h-${h}`,
      label: h,
      onRemove: () => filter({ hospital: params.hospital.filter((x) => x !== h) }),
    })),
    ...(params.from || params.to
      ? [
          {
            id: "date",
            label: `Added ${params.from ? formatDate(fromUtcDate(params.from), "d MMM") : "…"} – ${params.to ? formatDate(fromUtcDate(params.to), "d MMM yyyy") : "now"}`,
            onRemove: () => filter({ from: null, to: null }),
          },
        ]
      : []),
  ];
  const hasFilters = active.length > 0;
  const clearAll = () => filter({ q: "", specialization: [], hospital: [], from: null, to: null });

  return (
    <div className="space-y-5">
      <PageHeader
        title="Doctors"
        description={
          data
            ? `${formatNumber(data.meta.total)} ${hasFilters ? "matching" : "registered"} doctors across ${facets.data?.hospitals.length ?? "—"} hospitals`
            : "Directory of registered doctors"
        }
        actions={
          <Button onClick={() => setCreating({ new: true })}>
            <Plus /> Add doctor
          </Button>
        }
      />

      <ListCard
        toolbar={
          <>
            <div className="flex items-center gap-2">
              <SearchInput
                value={params.q}
                onChange={(q) => filter({ q })}
                placeholder="Search name, email or phone"
                className="sm:w-80"
              />
              <div className="ml-auto shrink-0">
                <Select value={params.sort} onValueChange={(sort) => filter({ sort: sort as DoctorSort })}>
                  <SelectTrigger
                    size="sm"
                    className="h-8 w-[42px] sm:w-40 [&>span]:hidden sm:[&>span]:flex"
                    aria-label="Sort doctors"
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent align="end">
                    {Object.entries(DOCTOR_SORTS).map(([value, label]) => (
                      <SelectItem key={value} value={value}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <div className="contents">
                <FacetedFilter
                  title="Specialization"
                  options={SPECIALIZATIONS.map((s) => ({ value: s, label: s }))}
                  selected={params.specialization}
                  onChange={(specialization) => filter({ specialization })}
                />
                <FacetedFilter
                  title="Hospital"
                  options={(facets.data?.hospitals ?? []).map((h) => ({ value: h, label: h }))}
                  selected={params.hospital}
                  onChange={(hospital) => filter({ hospital })}
                />
                <DateRangeFilter title="Date added" from={params.from} to={params.to} onChange={(r) => filter(r)} />
              </div>
            </div>
            <ActiveFilters filters={active} onClearAll={clearAll} />
          </>
        }
        footer={
          data && data.meta.total > 0 ? (
            <PaginationBar
              meta={data.meta}
              noun="doctors"
              onPageChange={(page) => void setParams({ page })}
              onLimitChange={(limit) => void setParams({ limit, page: 1 })}
            />
          ) : undefined
        }
      >
        {error && !data ? (
          <ErrorState error={error} onRetry={() => void refetch()} title="Couldn't load doctors" />
        ) : (
          <DataTable
            caption="Doctors"
            columns={columns}
            rows={data?.data}
            getRowId={(d) => d.id}
            isLoading={isPending}
            isRefreshing={isPlaceholderData && isFetching}
            sort={params.sort}
            onSortChange={(sort) => filter({ sort: sort as DoctorSort })}
            onRowClick={(d) => router.push(`/doctors/${d.id}`)}
            onRowHover={(d) => void prefetch(d.id)}
            rowLabel={(d) => `Open ${d.name}`}
            highlightRowId={highlightId}
            skeletonRows={params.limit}
            empty={
              hasFilters ? (
                <EmptyState
                  icon={SearchX}
                  title="No doctors match these filters"
                  description="Try a shorter search term, or remove a filter to widen the results."
                  action={
                    <Button variant="outline" size="sm" onClick={clearAll}>
                      Clear filters
                    </Button>
                  }
                />
              ) : (
                <EmptyState
                  icon={Stethoscope}
                  title="No doctors yet"
                  description="Add your first doctor to start assigning patients."
                  action={
                    <Button size="sm" onClick={() => setCreating({ new: true })}>
                      <Plus /> Add doctor
                    </Button>
                  }
                />
              )
            }
            mobileCard={(d) => (
              <Link href={`/doctors/${d.id}`} className="flex items-center gap-3 px-4 py-3.5 active:bg-muted/60">
                <Avatar className="size-9 rounded-md">
                  <AvatarFallback className="rounded-md bg-muted text-xs font-semibold text-muted-foreground">
                    {initials(d.name)}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{d.name}</p>
                  <p className="truncate text-xs text-muted-foreground">
                    {d.specialization} · {d.hospital}
                  </p>
                </div>
                <div className="text-right">
                  <p className="tabular text-sm font-medium">{d.patientCount}</p>
                  <p className="text-xs text-muted-foreground">patients</p>
                </div>
              </Link>
            )}
          />
        )}
      </ListCard>

      <DoctorFormSheet
        open={isCreating}
        onOpenChange={(open) => void setCreating({ new: open || null })}
        onCreated={(doctor) => {
          setHighlightId(doctor.id);
          void setParams({ page: 1, sort: "newest" });
        }}
      />
    </div>
  );
}
