"use client";

import { SearchX, UsersRound } from "lucide-react";
import Link from "next/link";
import { useQueryStates } from "nuqs";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DataTable } from "@/components/data/data-table";
import { ListCard } from "@/components/data/list-card";
import { PaginationBar } from "@/components/data/pagination-bar";
import { ConditionDot } from "@/components/feedback/condition-badge";
import { ConfirmDialog } from "@/components/feedback/confirm-dialog";
import { EmptyState } from "@/components/feedback/empty-state";
import { ErrorState } from "@/components/feedback/error-state";
import { ActiveFilters, type ActiveFilter } from "@/components/filters/active-filters";
import { DateRangeFilter } from "@/components/filters/date-range-filter";
import { FacetedFilter } from "@/components/filters/faceted-filter";
import { SearchInput } from "@/components/filters/search-input";
import { DoctorCombobox } from "@/components/forms/doctor-combobox";
import { PageHeader } from "@/components/layout/page-header";
import {
  AGE_GROUPS,
  CONDITION_META,
  CONDITIONS,
  GENDER_LABEL,
  GENDERS,
  PATIENT_SORTS,
  type AgeGroup,
  type PatientSort,
} from "@/lib/constants";
import { fromUtcDate } from "@/lib/dates";
import { formatDate, formatNumber } from "@/lib/format";
import type { Patient } from "@/lib/types";
import { patientColumns, PatientMobileCard } from "./columns";
import { useDeletePatient, usePatients } from "./hooks";
import { PatientFormSheet } from "./patient-form-sheet";
import { patientListParsers } from "./search-params";

export function PatientsView() {
  const [params, setParams] = useQueryStates(patientListParsers, { history: "replace" });
  const [doctorLabel, setDoctorLabel] = useState<string | null>(null);
  const [editing, setEditing] = useState<Patient | null>(null);
  const [deleting, setDeleting] = useState<Patient | null>(null);
  const remove = useDeletePatient();

  const age = params.age ? AGE_GROUPS[params.age] : null;
  const { data, error, isPending, isPlaceholderData, isFetching, refetch } = usePatients({
    q: params.q,
    condition: params.condition,
    gender: params.gender,
    doctor: params.doctor,
    minAge: age?.min,
    maxAge: age?.max,
    from: params.from,
    to: params.to,
    sort: params.sort,
    page: params.page,
    limit: params.limit,
  });

  const filter = (patch: Partial<typeof params>) => void setParams({ ...patch, page: 1 });
  const actions = { onEdit: setEditing, onDelete: setDeleting };
  const columns = patientColumns({ showDoctor: true, ...actions });

  // Resolve the doctor chip label from loaded rows if we arrived via a shared URL.
  const doctorName = doctorLabel ?? data?.data.find((p) => p.doctor?.id === params.doctor)?.doctor?.name ?? null;

  const active: ActiveFilter[] = [
    ...(params.q ? [{ id: "q", label: `“${params.q}”`, onRemove: () => filter({ q: "" }) }] : []),
    ...params.condition.map((c) => ({
      id: `c-${c}`,
      label: CONDITION_META[c].label,
      onRemove: () => filter({ condition: params.condition.filter((x) => x !== c) }),
    })),
    ...params.gender.map((g) => ({
      id: `g-${g}`,
      label: GENDER_LABEL[g],
      onRemove: () => filter({ gender: params.gender.filter((x) => x !== g) }),
    })),
    ...(age ? [{ id: "age", label: `Age ${age.label}`, onRemove: () => filter({ age: null }) }] : []),
    ...(params.doctor
      ? [{ id: "doctor", label: doctorName ?? "Doctor", onRemove: () => filter({ doctor: null }) }]
      : []),
    ...(params.from || params.to
      ? [
          {
            id: "date",
            label: `Admitted ${params.from ? formatDate(fromUtcDate(params.from), "d MMM") : "…"} – ${params.to ? formatDate(fromUtcDate(params.to), "d MMM yyyy") : "now"}`,
            onRemove: () => filter({ from: null, to: null }),
          },
        ]
      : []),
  ];
  const hasFilters = active.length > 0;
  const clearAll = () => filter({ q: "", condition: [], gender: [], age: null, doctor: null, from: null, to: null });

  return (
    <div className="space-y-5">
      <PageHeader
        title="Patients"
        description={
          data
            ? `${formatNumber(data.meta.total)} ${hasFilters ? "matching" : ""} patient records`.replace("  ", " ")
            : "All patient records across every doctor"
        }
        actions={
          <Button variant="outline" asChild>
            <Link href="/doctors">Add via a doctor</Link>
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
                placeholder="Search name, diagnosis or phone"
                className="sm:w-80"
              />
              <div className="ml-auto shrink-0">
                <Select value={params.sort} onValueChange={(sort) => filter({ sort: sort as PatientSort })}>
                  <SelectTrigger
                    size="sm"
                    className="h-8 w-[42px] sm:w-44 [&>span]:hidden sm:[&>span]:flex"
                    aria-label="Sort patients"
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent align="end">
                    {Object.entries(PATIENT_SORTS).map(([value, label]) => (
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
                  title="Condition"
                  options={CONDITIONS.map((c) => ({
                    value: c,
                    label: CONDITION_META[c].label,
                    icon: <ConditionDot condition={c} />,
                  }))}
                  selected={params.condition}
                  onChange={(condition) => filter({ condition })}
                />
                <FacetedFilter
                  title="Sex"
                  options={GENDERS.map((g) => ({ value: g, label: GENDER_LABEL[g] }))}
                  selected={params.gender}
                  onChange={(gender) => filter({ gender })}
                />
                <Select
                  value={params.age ?? "any"}
                  onValueChange={(v) => filter({ age: v === "any" ? null : (v as AgeGroup) })}
                >
                  <SelectTrigger
                    size="sm"
                    className="h-8 w-auto border-dashed font-normal data-[active=true]:border-solid"
                    data-active={!!params.age}
                    aria-label="Age group"
                  >
                    <span className="text-muted-foreground">Age</span>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="any">Any</SelectItem>
                    {Object.entries(AGE_GROUPS).map(([k, g]) => (
                      <SelectItem key={k} value={k}>
                        {g.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <div className="w-44">
                  <DoctorCombobox
                    variant="filter"
                    placeholder="Doctor"
                    value={params.doctor}
                    label={doctorName}
                    onChange={(d) => {
                      setDoctorLabel(d?.name ?? null);
                      filter({ doctor: d?.id ?? null });
                    }}
                  />
                </div>
                <DateRangeFilter title="Admission date" from={params.from} to={params.to} onChange={(r) => filter(r)} />
              </div>
            </div>
            <ActiveFilters filters={active} onClearAll={clearAll} />
          </>
        }
        footer={
          data && data.meta.total > 0 ? (
            <PaginationBar
              meta={data.meta}
              noun="patients"
              onPageChange={(page) => void setParams({ page })}
              onLimitChange={(limit) => void setParams({ limit, page: 1 })}
            />
          ) : undefined
        }
      >
        {error && !data ? (
          <ErrorState error={error} onRetry={() => void refetch()} title="Couldn't load patients" />
        ) : (
          <DataTable
            caption="Patients"
            columns={columns}
            rows={data?.data}
            getRowId={(p) => p.id}
            isLoading={isPending}
            isRefreshing={isPlaceholderData && isFetching}
            sort={params.sort}
            onSortChange={(sort) => filter({ sort: sort as PatientSort })}
            onRowClick={setEditing}
            rowLabel={(p) => `Edit ${p.name}`}
            skeletonRows={params.limit}
            empty={
              hasFilters ? (
                <EmptyState
                  icon={SearchX}
                  title="No patients match these filters"
                  description="Broaden the date range or remove a filter to see more records."
                  action={
                    <Button variant="outline" size="sm" onClick={clearAll}>
                      Clear filters
                    </Button>
                  }
                />
              ) : (
                <EmptyState
                  icon={UsersRound}
                  title="No patients yet"
                  description="Patients are added from a doctor’s page, so they’re always assigned to someone."
                  action={
                    <Button size="sm" asChild>
                      <Link href="/doctors">Go to doctors</Link>
                    </Button>
                  }
                />
              )
            }
            mobileCard={(p) => <PatientMobileCard patient={p} showDoctor {...actions} />}
          />
        )}
      </ListCard>

      <PatientFormSheet
        mode={editing ? { kind: "edit", patient: editing } : null}
        onOpenChange={(open) => !open && setEditing(null)}
      />
      <ConfirmDialog
        open={!!deleting}
        onOpenChange={(open) => !open && setDeleting(null)}
        title={`Delete ${deleting?.name ?? "patient"}?`}
        description="This permanently removes the patient record and its history. This can’t be undone."
        confirmLabel="Delete patient"
        onConfirm={() => deleting && remove.mutate(deleting)}
      />
    </div>
  );
}
