"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { Textarea } from "@/components/ui/textarea";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { ConditionSelect } from "@/components/forms/condition-select";
import { DatePicker } from "@/components/forms/date-picker";
import { DoctorCombobox } from "@/components/forms/doctor-combobox";
import { FormSheet } from "@/components/forms/form-sheet";
import { useAddDoctorPatient } from "@/features/doctors/hooks";
import { ApiError } from "@/lib/api-client";
import { GENDER_LABEL, GENDERS } from "@/lib/constants";
import type { Patient } from "@/lib/types";
import { patientSchema, type PatientValues } from "@/lib/validation";
import { toPatientPayload } from "./api";
import { useUpdatePatient } from "./hooks";

type Mode = { kind: "create"; doctorId: string; doctorName: string } | { kind: "edit"; patient: Patient };

function defaults(mode: Mode | null): PatientValues {
  if (mode?.kind === "edit") {
    const p = mode.patient;
    const d = new Date(p.admissionDate);
    return {
      name: p.name,
      age: p.age,
      gender: p.gender,
      phone: p.phone,
      email: p.email ?? "",
      condition: p.condition,
      diagnosis: p.diagnosis,
      admissionDate: new Date(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()),
      notes: p.notes ?? "",
      doctorId: p.doctor?.id,
    };
  }
  return {
    name: "",
    age: undefined as unknown as number,
    gender: undefined as unknown as PatientValues["gender"],
    phone: "",
    email: "",
    condition: "under_observation",
    diagnosis: "",
    admissionDate: new Date(),
    notes: "",
  };
}

/** Map API field names back to form field names. */
const API_TO_FORM: Record<string, keyof PatientValues> = { doctor: "doctorId" };

const modeKey = (m: Mode | null) =>
  m?.kind === "edit" ? `${m.patient.id}:${m.patient.updatedAt}` : m ? `create:${m.doctorId}` : "none";

/**
 * Keeps the last opened record while the sheet animates closed, and remounts the form
 * (fresh defaults) whenever a different record is opened.
 */
export function PatientFormSheet({ mode, onOpenChange }: { mode: Mode | null; onOpenChange: (open: boolean) => void }) {
  const [shown, setShown] = useState(mode);
  if (mode && modeKey(mode) !== modeKey(shown)) setShown(mode);
  return <PatientFormSheetInner key={modeKey(shown)} mode={shown} open={mode !== null} onOpenChange={onOpenChange} />;
}

function PatientFormSheetInner({
  mode,
  open,
  onOpenChange,
}: {
  mode: Mode | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const add = useAddDoctorPatient(mode?.kind === "create" ? mode.doctorId : "");
  const update = useUpdatePatient();
  const form = useForm<PatientValues>({
    resolver: zodResolver(patientSchema),
    defaultValues: defaults(mode),
    mode: "onTouched",
  });
  const { errors, isSubmitting } = form.formState;
  const [doctorLabel, setDoctorLabel] = useState<string | null>(
    mode?.kind === "edit" ? (mode.patient.doctor?.name ?? null) : null,
  );

  const onSubmit = form.handleSubmit(async (values) => {
    try {
      const payload = toPatientPayload(values);
      if (mode?.kind === "create") {
        delete payload.doctor;
        await add.mutateAsync(payload);
      } else if (mode?.kind === "edit") {
        if (payload.doctor === mode.patient.doctor?.id) delete payload.doctor;
        await update.mutateAsync({ id: mode.patient.id, payload });
      }
      onOpenChange(false);
    } catch (error) {
      if (error instanceof ApiError && error.details?.length) {
        Object.entries(error.fieldErrors()).forEach(([field, message]) =>
          form.setError(API_TO_FORM[field] ?? (field as keyof PatientValues), { message }, { shouldFocus: true }),
        );
      } else {
        form.setError("root", { message: error instanceof ApiError ? error.message : "Something went wrong." });
      }
    }
  });

  const title = mode?.kind === "edit" ? "Edit patient" : "Add patient";
  const description =
    mode?.kind === "create" ? (
      <>
        Under the care of <span className="font-medium text-foreground">{mode.doctorName}</span>
      </>
    ) : mode?.kind === "edit" ? (
      "Changes are saved to the patient record immediately."
    ) : undefined;

  return (
    <FormSheet
      open={open}
      onOpenChange={onOpenChange}
      title={title}
      description={description}
      footer={
        <>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            type="submit"
            form="patient-form"
            disabled={isSubmitting || (mode?.kind === "edit" && !form.formState.isDirty)}
          >
            {isSubmitting && <Spinner />} {mode?.kind === "edit" ? "Save changes" : "Add patient"}
          </Button>
        </>
      }
    >
      <form id="patient-form" onSubmit={onSubmit} noValidate>
        {errors.root && (
          <p role="alert" className="mb-4 rounded-md border border-danger/25 bg-danger/5 px-3 py-2 text-[13px]">
            {errors.root.message}
          </p>
        )}
        <FieldGroup className="gap-5">
          <Field data-invalid={!!errors.name}>
            <FieldLabel htmlFor="patient-name">Full name</FieldLabel>
            <Input
              id="patient-name"
              autoComplete="off"
              placeholder="Karim Hossain"
              aria-invalid={!!errors.name}
              className="h-9"
              {...form.register("name")}
            />
            <FieldError errors={[errors.name]} />
          </Field>

          <div className="grid gap-5 sm:grid-cols-[96px_1fr]">
            <Field data-invalid={!!errors.age}>
              <FieldLabel htmlFor="patient-age">Age</FieldLabel>
              <Input
                id="patient-age"
                type="number"
                inputMode="numeric"
                min={0}
                max={130}
                placeholder="42"
                aria-invalid={!!errors.age}
                className="tabular h-9"
                {...form.register("age", { setValueAs: (v) => (v === "" || v === null ? undefined : Number(v)) })}
              />
              <FieldError errors={[errors.age]} />
            </Field>
            <Field data-invalid={!!errors.gender}>
              <FieldLabel id="patient-gender-label">Gender</FieldLabel>
              <Controller
                control={form.control}
                name="gender"
                render={({ field }) => (
                  <ToggleGroup
                    type="single"
                    variant="outline"
                    value={field.value ?? ""}
                    onValueChange={(v) => v && field.onChange(v)}
                    aria-labelledby="patient-gender-label"
                    aria-invalid={!!errors.gender}
                    className="h-9 w-full *:h-9 *:flex-1"
                  >
                    {GENDERS.map((g) => (
                      <ToggleGroupItem
                        key={g}
                        value={g}
                        className="data-[state=on]:bg-brand-soft data-[state=on]:text-brand-ink"
                      >
                        {GENDER_LABEL[g]}
                      </ToggleGroupItem>
                    ))}
                  </ToggleGroup>
                )}
              />
              <FieldError errors={[errors.gender]} />
            </Field>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <Field data-invalid={!!errors.phone}>
              <FieldLabel htmlFor="patient-phone">Phone</FieldLabel>
              <Input
                id="patient-phone"
                type="tel"
                inputMode="tel"
                placeholder="+1 555 200 1000"
                aria-invalid={!!errors.phone}
                className="tabular h-9"
                {...form.register("phone")}
              />
              <FieldError errors={[errors.phone]} />
            </Field>
            <Field data-invalid={!!errors.email}>
              <FieldLabel htmlFor="patient-email">
                Email <span className="font-normal text-muted-foreground">(optional)</span>
              </FieldLabel>
              <Input
                id="patient-email"
                type="email"
                placeholder="name@example.com"
                aria-invalid={!!errors.email}
                className="h-9"
                {...form.register("email")}
              />
              <FieldError errors={[errors.email]} />
            </Field>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <Field data-invalid={!!errors.condition}>
              <FieldLabel htmlFor="patient-condition">Condition</FieldLabel>
              <Controller
                control={form.control}
                name="condition"
                render={({ field }) => (
                  <ConditionSelect
                    id="patient-condition"
                    value={field.value}
                    onChange={field.onChange}
                    invalid={!!errors.condition}
                  />
                )}
              />
              <FieldError errors={[errors.condition]} />
            </Field>
            <Field data-invalid={!!errors.admissionDate}>
              <FieldLabel htmlFor="patient-admission">Admission date</FieldLabel>
              <Controller
                control={form.control}
                name="admissionDate"
                render={({ field }) => (
                  <DatePicker
                    id="patient-admission"
                    value={field.value}
                    onChange={(d) => field.onChange(d)}
                    invalid={!!errors.admissionDate}
                  />
                )}
              />
              <FieldError errors={[errors.admissionDate]} />
            </Field>
          </div>

          <Field data-invalid={!!errors.diagnosis}>
            <FieldLabel htmlFor="patient-diagnosis">Diagnosis</FieldLabel>
            <Input
              id="patient-diagnosis"
              placeholder="Type 2 diabetes"
              aria-invalid={!!errors.diagnosis}
              className="h-9"
              {...form.register("diagnosis")}
            />
            <FieldError errors={[errors.diagnosis]} />
          </Field>

          {mode?.kind === "edit" && (
            <Field data-invalid={!!errors.doctorId}>
              <FieldLabel htmlFor="patient-doctor">Attending doctor</FieldLabel>
              <Controller
                control={form.control}
                name="doctorId"
                render={({ field }) => (
                  <DoctorCombobox
                    id="patient-doctor"
                    value={field.value ?? null}
                    label={doctorLabel}
                    onChange={(d) => {
                      setDoctorLabel(d?.name ?? null);
                      field.onChange(d?.id);
                    }}
                    invalid={!!errors.doctorId}
                  />
                )}
              />
              <FieldDescription>Reassigning moves the patient to another doctor’s list.</FieldDescription>
              <FieldError errors={[errors.doctorId]} />
            </Field>
          )}

          <Field data-invalid={!!errors.notes}>
            <FieldLabel htmlFor="patient-notes">
              Clinical notes <span className="font-normal text-muted-foreground">(optional)</span>
            </FieldLabel>
            <Textarea
              id="patient-notes"
              rows={3}
              placeholder="Allergies, care plan, follow-ups…"
              aria-invalid={!!errors.notes}
              {...form.register("notes")}
            />
            <FieldError errors={[errors.notes]} />
          </Field>
        </FieldGroup>
      </form>
    </FormSheet>
  );
}
