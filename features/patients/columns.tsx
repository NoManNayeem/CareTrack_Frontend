"use client";

import { MoreHorizontal, Pencil, Trash2, UserMinus } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { Column } from "@/components/data/data-table";
import { ConditionBadge, ConditionDot } from "@/components/feedback/condition-badge";
import { Skeleton } from "@/components/ui/skeleton";
import { CONDITION_META, GENDER_LABEL } from "@/lib/constants";
import { formatDate, formatRelativeDay } from "@/lib/format";
import type { Patient } from "@/lib/types";

interface Actions {
  onEdit: (p: Patient) => void;
  onDelete: (p: Patient) => void;
  /** "remove" = detach from this doctor (doctor page); "delete" = delete the record. */
  deleteKind?: "delete" | "remove";
}

export function PatientActions({ patient, onEdit, onDelete, deleteKind = "delete" }: Actions & { patient: Patient }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon-sm"
          aria-label={`Actions for ${patient.name}`}
          onClick={(e) => e.stopPropagation()}
        >
          <MoreHorizontal />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48" onClick={(e) => e.stopPropagation()}>
        <DropdownMenuItem onSelect={() => onEdit(patient)}>
          <Pencil /> Edit details
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem variant="destructive" onSelect={() => onDelete(patient)}>
          {deleteKind === "remove" ? <UserMinus /> : <Trash2 />}
          {deleteKind === "remove" ? "Remove from doctor" : "Delete patient"}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function patientColumns({ showDoctor, ...actions }: Actions & { showDoctor: boolean }): Column<Patient>[] {
  return [
    {
      id: "name",
      header: "Patient",
      sort: { asc: "name_asc", desc: "name_desc" },
      className: "min-w-52",
      cell: (p) => (
        <div className="min-w-0">
          <p className="truncate text-[13.5px] font-medium">{p.name}</p>
          <p className="tabular truncate text-xs text-muted-foreground">{p.email ?? p.phone}</p>
        </div>
      ),
    },
    {
      id: "age",
      header: "Age · Sex",
      cell: (p) => (
        <span className="tabular text-[13px] whitespace-nowrap text-muted-foreground">
          <span className="text-foreground">{p.age}</span> · {GENDER_LABEL[p.gender]}
        </span>
      ),
    },
    {
      id: "condition",
      header: "Condition",
      cell: (p) => <ConditionBadge condition={p.condition} />,
      skeleton: <Skeleton className="h-6 w-24 rounded-full" />,
    },
    {
      id: "diagnosis",
      header: "Diagnosis",
      cell: (p) => <span className="line-clamp-1 text-[13px]">{p.diagnosis}</span>,
      className: "max-w-56",
    },
    ...(showDoctor
      ? [
          {
            id: "doctor",
            header: "Doctor",
            className: "hidden lg:table-cell",
            headerClassName: "hidden lg:table-cell",
            cell: (p: Patient) =>
              p.doctor ? (
                <div className="min-w-0">
                  <Link
                    href={`/doctors/${p.doctor.id}`}
                    onClick={(e) => e.stopPropagation()}
                    className="block truncate text-[13px] hover:underline hover:underline-offset-2"
                  >
                    {p.doctor.name}
                  </Link>
                  <p className="truncate text-xs text-muted-foreground">{p.doctor.specialization}</p>
                </div>
              ) : (
                <span className="text-xs text-muted-foreground">Unassigned</span>
              ),
          } satisfies Column<Patient>,
        ]
      : []),
    {
      id: "admitted",
      header: "Admitted",
      sort: { asc: "admitted_asc", desc: "admitted_desc" },
      cell: (p) => (
        <div className="whitespace-nowrap">
          <p className="tabular text-[13px]">{formatDate(p.admissionDate)}</p>
          <p className="text-xs text-muted-foreground">{formatRelativeDay(p.admissionDate)}</p>
        </div>
      ),
    },
    {
      id: "actions",
      header: <span className="sr-only">Actions</span>,
      className: "w-12 text-right",
      cell: (p) => <PatientActions patient={p} {...actions} />,
      skeleton: <span />,
    },
  ];
}

export function PatientMobileCard({
  patient,
  showDoctor,
  ...actions
}: Actions & { patient: Patient; showDoctor: boolean }) {
  return (
    <div className="flex items-start gap-3 px-4 py-3.5">
      <ConditionDot condition={patient.condition} className="mt-1.5" />
      <div className="min-w-0 flex-1">
        <div className="flex items-baseline justify-between gap-2">
          <p className="truncate text-sm font-medium">{patient.name}</p>
          <span className="tabular shrink-0 text-xs text-muted-foreground">
            {formatDate(patient.admissionDate, "d MMM")}
          </span>
        </div>
        <p className="truncate text-xs text-muted-foreground">
          {CONDITION_META[patient.condition].label} · {patient.diagnosis} · {patient.age}y
        </p>
        {showDoctor && patient.doctor && (
          <p className="mt-0.5 truncate text-xs text-muted-foreground">{patient.doctor.name}</p>
        )}
      </div>
      <PatientActions patient={patient} {...actions} />
    </div>
  );
}
