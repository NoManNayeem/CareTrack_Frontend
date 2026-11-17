"use client";

import { ArrowLeft, Building2, CalendarClock, Check, Copy, Mail, Phone, Plus, SearchX, UserPlus } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useQueryStates } from "nuqs";
import { useState } from "react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
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
import { patientColumns, PatientMobileCard } from "@/features/patients/columns";
import { PatientFormSheet } from "@/features/patients/patient-form-sheet";
import { doctorPatientParsers } from "@/features/patients/search-params";
import { ApiError } from "@/lib/api-client";
import { CONDITION_META, CONDITIONS } from "@/lib/constants";
import { fromUtcDate } from "@/lib/dates";
import { formatDate, formatNumber, formatRelativeDay, initials } from "@/lib/format";
import type { DoctorDetail, Patient } from "@/lib/types";
import { ConditionCensus } from "./condition-census";
import { useDoctor, useDoctorPatients, useRemoveDoctorPatient } from "./hooks";

function CopyButton({ value, label }: { value: string; label: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant="ghost"
          size="icon-xs"
          aria-label={`Copy ${label}`}
          onClick={() => {
            void navigator.clipboard.writeText(value);
            setCopied(true);
            setTimeout(() => setCopied(false), 1400);
          }}
        >
          {copied ? <Check className="text-success" /> : <Copy />}
        </Button>
      </TooltipTrigger>
      <TooltipContent>{copied ? "Copied" : `Copy ${label}`}</TooltipContent>
    </Tooltip>
  );
}

function Stat({ label, value, hint }: { label: string; value: React.ReactNode; hint?: React.ReactNode }) {
  return (
    <div className="px-4 py-3.5 sm:px-5">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-1 text-xl font-semibold tracking-tight">{value}</p>
      {hint && <p className="mt-0.5 text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}

function ProfileSkeleton() {
  return (
    <div className="space-y-5">
      <Skeleton className="h-4 w-20" />
      <div className="flex items-center gap-4">
        <Skeleton className="size-14 rounded-lg" />
        <div className="space-y-2">
          <Skeleton className="h-6 w-56" />
          <Skeleton className="h-4 w-72" />
        </div>
      </div>
      <Skeleton className="h-28 w-full rounded-lg" />
    </div>
  );
}

function Profile({ doctor, onAdd }: { doctor: DoctorDetail; onAdd: () => void }) {
  const { stats } = doctor;
  const active = stats.totalPatients - stats.byCondition.discharged;
  return (
    <div className="space-y-5">
      <Link
        href="/doctors"
        className="inline-flex items-center gap-1.5 text-[13px] text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-3.5" /> All doctors
      </Link>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex min-w-0 items-start gap-4">
          <Avatar className="size-14 rounded-lg">
            <AvatarFallback className="rounded-lg bg-brand-soft text-lg font-semibold text-brand-ink">
              {initials(doctor.name)}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0 space-y-1.5">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-xl font-semibold tracking-[-0.015em] sm:text-[22px]">{doctor.name}</h1>
              <Badge variant="outline" className="font-normal">
                {doctor.specialization}
              </Badge>
            </div>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[13px] text-muted-foreground">
              <span className="inline-flex items-center gap-1.5">
                <Building2 className="size-3.5" /> {doctor.hospital}
              </span>
              <span className="inline-flex items-center gap-1">
                <Phone className="size-3.5" />
                <a href={`tel:${doctor.phone.replace(/[^\d+]/g, "")}`} className="tabular hover:text-foreground">
                  {doctor.phone}
                </a>
                <CopyButton value={doctor.phone} label="phone" />
              </span>
              <span className="inline-flex min-w-0 items-center gap-1">
                <Mail className="size-3.5 shrink-0" />
                <a href={`mailto:${doctor.email}`} className="truncate hover:text-foreground">
                  {doctor.email}
                </a>
                <CopyButton value={doctor.email} label="email" />
              </span>
            </div>
          </div>
        </div>
        <Button onClick={onAdd} className="shrink-0">
          <UserPlus /> Add patient
        </Button>
      </div>

      <section className="rounded-lg border bg-card" aria-label="Caseload summary">
        <div className="grid grid-cols-2 divide-border sm:grid-cols-4 sm:divide-x [&>*:nth-child(-n+2)]:border-b sm:[&>*:nth-child(-n+2)]:border-b-0">
          <Stat
            label="Total patients"
            value={formatNumber(stats.totalPatients)}
            hint={`${formatNumber(active)} under active care`}
          />
          <Stat
            label="Critical"
            value={
              <span className="inline-flex items-center gap-2">
                <ConditionDot condition="critical" className="size-2.5" /> {formatNumber(stats.byCondition.critical)}
              </span>
            }
            hint={`${formatNumber(stats.byCondition.under_observation)} under observation`}
          />
          <Stat
            label="Last admission"
            value={stats.lastAdmissionAt ? formatRelativeDay(stats.lastAdmissionAt) : "—"}
            hint={stats.lastAdmissionAt ? formatDate(stats.lastAdmissionAt) : "No admissions yet"}
          />
          <Stat
            label="On CareTrack since"
            value={formatDate(doctor.createdAt, "MMM yyyy")}
            hint={
              <span className="inline-flex items-center gap-1">
                <CalendarClock className="size-3" /> {formatDate(doctor.createdAt)}
              </span>
            }
          />
        </div>
        <div className="border-t px-4 py-4 sm:px-5">
          <ConditionCensus counts={stats.byCondition} />
        </div>
      </section>
    </div>
  );
}

export function DoctorDetailView() {
  const { id } = useParams<{ id: string }>();
  const doctor = useDoctor(id);
  const [params, setParams] = useQueryStates(doctorPatientParsers, { history: "replace" });
  const [sheet, setSheet] = useState<{ kind: "create" } | { kind: "edit"; patient: Patient } | null>(null);
  const [removing, setRemoving] = useState<Patient | null>(null);
  const remove = useRemoveDoctorPatient(id);

  const patients = useDoctorPatients(id, {
    q: params.pq,
    condition: params.pcondition,
    from: params.pfrom,
    to: params.pto,
    page: params.ppage,
    limit: 10,
  });

  const filter = (patch: Partial<typeof params>) => void setParams({ ...patch, ppage: 1 });
  const actions = {
    onEdit: (patient: Patient) => setSheet({ kind: "edit", patient }),
    onDelete: setRemoving,
    deleteKind: "remove" as const,
  };
  const columns = patientColumns({ showDoctor: false, ...actions });

  if (doctor.error instanceof ApiError && (doctor.error.status === 404 || doctor.error.status === 400)) {
    return (
      <EmptyState
        icon={SearchX}
        title="Doctor not found"
        description="This doctor may have been removed, or the link is incorrect."
        action={
          <Button variant="outline" size="sm" asChild>
            <Link href="/doctors">Back to doctors</Link>
          </Button>
        }
      />
    );
  }
  if (doctor.error && !doctor.data) return <ErrorState error={doctor.error} onRetry={() => void doctor.refetch()} />;

  const active: ActiveFilter[] = [
    ...(params.pq ? [{ id: "q", label: `“${params.pq}”`, onRemove: () => filter({ pq: "" }) }] : []),
    ...params.pcondition.map((c) => ({
      id: c,
      label: CONDITION_META[c].label,
      onRemove: () => filter({ pcondition: params.pcondition.filter((x) => x !== c) }),
    })),
    ...(params.pfrom || params.pto
      ? [
          {
            id: "date",
            label: `Admitted ${params.pfrom ? formatDate(fromUtcDate(params.pfrom), "d MMM") : "…"} – ${params.pto ? formatDate(fromUtcDate(params.pto), "d MMM yyyy") : "now"}`,
            onRemove: () => filter({ pfrom: null, pto: null }),
          },
        ]
      : []),
  ];
  const clearAll = () => filter({ pq: "", pcondition: [], pfrom: null, pto: null });
  const data = patients.data;

  return (
    <div className="space-y-6">
      {doctor.data ? <Profile doctor={doctor.data} onAdd={() => setSheet({ kind: "create" })} /> : <ProfileSkeleton />}

      <ListCard
        toolbar={
          <>
            <div className="mb-3 flex items-baseline justify-between">
              <h2 className="text-sm font-semibold">
                Patients{" "}
                {data && (
                  <span className="tabular ml-1 font-normal text-muted-foreground">
                    {formatNumber(data.meta.total)}
                  </span>
                )}
              </h2>
            </div>
            <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
              <SearchInput
                value={params.pq}
                onChange={(pq) => filter({ pq })}
                placeholder="Search this doctor’s patients"
                className="sm:w-80"
              />
              <div className="flex flex-wrap items-center gap-2">
                <FacetedFilter
                  title="Condition"
                  options={CONDITIONS.map((c) => ({
                    value: c,
                    label: CONDITION_META[c].label,
                    icon: <ConditionDot condition={c} />,
                  }))}
                  selected={params.pcondition}
                  onChange={(pcondition) => filter({ pcondition })}
                />
                <DateRangeFilter
                  title="Admission date"
                  from={params.pfrom}
                  to={params.pto}
                  onChange={(r) => filter({ pfrom: r.from, pto: r.to })}
                />
              </div>
            </div>
            <ActiveFilters filters={active} onClearAll={clearAll} />
          </>
        }
        footer={
          data && data.meta.total > 0 ? (
            <PaginationBar meta={data.meta} noun="patients" onPageChange={(ppage) => void setParams({ ppage })} />
          ) : undefined
        }
      >
        {patients.error && !data ? (
          <ErrorState error={patients.error} onRetry={() => void patients.refetch()} />
        ) : (
          <DataTable
            caption={`Patients of ${doctor.data?.name ?? "doctor"}`}
            columns={columns}
            rows={data?.data}
            getRowId={(p) => p.id}
            isLoading={patients.isPending}
            isRefreshing={patients.isPlaceholderData && patients.isFetching}
            onRowClick={(patient) => setSheet({ kind: "edit", patient })}
            rowLabel={(p) => `Edit ${p.name}`}
            skeletonRows={5}
            empty={
              active.length ? (
                <EmptyState
                  icon={SearchX}
                  title="No matching patients"
                  description="No patients of this doctor match the current filters."
                  action={
                    <Button variant="outline" size="sm" onClick={clearAll}>
                      Clear filters
                    </Button>
                  }
                />
              ) : (
                <EmptyState
                  icon={UserPlus}
                  title="No patients assigned"
                  description="Add the first patient under this doctor’s care."
                  action={
                    <Button size="sm" onClick={() => setSheet({ kind: "create" })}>
                      <Plus /> Add patient
                    </Button>
                  }
                />
              )
            }
            mobileCard={(p) => <PatientMobileCard patient={p} showDoctor={false} {...actions} />}
          />
        )}
      </ListCard>

      <PatientFormSheet
        mode={
          sheet?.kind === "edit"
            ? { kind: "edit", patient: sheet.patient }
            : sheet?.kind === "create" && doctor.data
              ? { kind: "create", doctorId: id, doctorName: doctor.data.name }
              : null
        }
        onOpenChange={(open) => !open && setSheet(null)}
      />
      <ConfirmDialog
        open={!!removing}
        onOpenChange={(open) => !open && setRemoving(null)}
        title={`Remove ${removing?.name ?? "patient"}?`}
        description={`${removing?.name ?? "This patient"} will be removed from ${doctor.data?.name ?? "this doctor"}’s patient list and their record deleted.`}
        confirmLabel="Remove patient"
        onConfirm={() => removing && remove.mutate(removing)}
      />
    </div>
  );
}
