"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Spinner } from "@/components/ui/spinner";
import { FormSheet } from "@/components/forms/form-sheet";
import { HospitalCombobox } from "@/components/forms/hospital-combobox";
import { ApiError } from "@/lib/api-client";
import { SPECIALIZATIONS } from "@/lib/constants";
import type { DoctorListItem } from "@/lib/types";
import { doctorSchema, type DoctorValues } from "@/lib/validation";
import { useCreateDoctor, useDoctorFacets } from "./hooks";

const EMPTY: Partial<DoctorValues> = { name: "", hospital: "", phone: "", email: "", specialization: undefined };

export function DoctorFormSheet({
  open,
  onOpenChange,
  onCreated,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated?: (doctor: DoctorListItem) => void;
}) {
  const facets = useDoctorFacets();
  const create = useCreateDoctor();
  const form = useForm<DoctorValues>({
    resolver: zodResolver(doctorSchema),
    defaultValues: EMPTY as DoctorValues,
    mode: "onTouched",
  });
  const { errors, isSubmitting } = form.formState;

  const close = (next: boolean) => {
    onOpenChange(next);
    if (!next) form.reset(EMPTY as DoctorValues);
  };

  const onSubmit = form.handleSubmit(async (values) => {
    try {
      const doctor = await create.mutateAsync(values);
      onCreated?.(doctor);
      close(false);
    } catch (error) {
      if (error instanceof ApiError && error.details?.length) {
        Object.entries(error.fieldErrors()).forEach(([field, message]) =>
          form.setError(field as keyof DoctorValues, { message }, { shouldFocus: true }),
        );
      } else {
        form.setError("root", { message: error instanceof ApiError ? error.message : "Something went wrong." });
      }
    }
  });

  return (
    <FormSheet
      open={open}
      onOpenChange={close}
      title="Add doctor"
      description="Doctors appear in the directory immediately and can be assigned patients."
      footer={
        <>
          <Button variant="ghost" onClick={() => close(false)}>
            Cancel
          </Button>
          <Button type="submit" form="doctor-form" disabled={isSubmitting}>
            {isSubmitting && <Spinner />} Add doctor
          </Button>
        </>
      }
    >
      <form id="doctor-form" onSubmit={onSubmit} noValidate>
        {errors.root && (
          <p role="alert" className="mb-4 rounded-md border border-danger/25 bg-danger/5 px-3 py-2 text-[13px]">
            {errors.root.message}
          </p>
        )}
        <FieldGroup className="gap-5">
          <Field data-invalid={!!errors.name}>
            <FieldLabel htmlFor="doctor-name">Full name</FieldLabel>
            <Input
              id="doctor-name"
              placeholder="Dr. Ayesha Rahman"
              autoComplete="off"
              aria-invalid={!!errors.name}
              className="h-9"
              {...form.register("name")}
            />
            <FieldError errors={[errors.name]} />
          </Field>

          <Field data-invalid={!!errors.specialization}>
            <FieldLabel htmlFor="doctor-specialization">Specialization</FieldLabel>
            <Controller
              control={form.control}
              name="specialization"
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger
                    id="doctor-specialization"
                    aria-invalid={!!errors.specialization}
                    className="h-9 w-full data-[size=default]:h-9"
                    onBlur={field.onBlur}
                  >
                    <SelectValue placeholder="Select specialization" />
                  </SelectTrigger>
                  <SelectContent className="max-h-72">
                    {SPECIALIZATIONS.map((s) => (
                      <SelectItem key={s} value={s}>
                        {s}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            <FieldError errors={[errors.specialization]} />
          </Field>

          <Field data-invalid={!!errors.hospital}>
            <FieldLabel htmlFor="doctor-hospital">Hospital</FieldLabel>
            <Controller
              control={form.control}
              name="hospital"
              render={({ field }) => (
                <HospitalCombobox
                  id="doctor-hospital"
                  value={field.value}
                  onChange={(v) => {
                    field.onChange(v);
                    void form.trigger("hospital");
                  }}
                  options={facets.data?.hospitals ?? []}
                  invalid={!!errors.hospital}
                />
              )}
            />
            <FieldDescription>Choosing an existing hospital keeps filters consistent.</FieldDescription>
            <FieldError errors={[errors.hospital]} />
          </Field>

          <div className="grid gap-5 sm:grid-cols-2">
            <Field data-invalid={!!errors.phone}>
              <FieldLabel htmlFor="doctor-phone">Phone</FieldLabel>
              <Input
                id="doctor-phone"
                type="tel"
                inputMode="tel"
                placeholder="+1 555 010 2233"
                aria-invalid={!!errors.phone}
                className="tabular h-9"
                {...form.register("phone")}
              />
              <FieldError errors={[errors.phone]} />
            </Field>
            <Field data-invalid={!!errors.email}>
              <FieldLabel htmlFor="doctor-email">Email</FieldLabel>
              <Input
                id="doctor-email"
                type="email"
                placeholder="name@hospital.org"
                aria-invalid={!!errors.email}
                className="h-9"
                {...form.register("email")}
              />
              <FieldError errors={[errors.email]} />
            </Field>
          </div>
        </FieldGroup>
      </form>
    </FormSheet>
  );
}
