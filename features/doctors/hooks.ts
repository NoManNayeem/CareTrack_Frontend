"use client";

import { keepPreviousData, useMutation, useQuery, useQueryClient, type QueryKey } from "@tanstack/react-query";
import { useEffect } from "react";
import { toast } from "sonner";
import { ApiError } from "@/lib/api-client";
import { queryKeys } from "@/lib/query-keys";
import type { Paginated, Patient } from "@/lib/types";
import type { DoctorValues } from "@/lib/validation";
import type { PatientPayload } from "@/features/patients/api";
import { doctorsApi, type DoctorListParams, type DoctorPatientParams } from "./api";

export function useDoctors(params: DoctorListParams) {
  const qc = useQueryClient();
  const query = useQuery({
    queryKey: queryKeys.doctors.list(params),
    queryFn: ({ signal }) => doctorsApi.list(params, signal),
    placeholderData: keepPreviousData, // keep the current page on screen while the next loads
  });

  // Prefetch the next page so "Next" feels instant.
  const hasNext = query.data?.meta.hasNextPage;
  useEffect(() => {
    if (!hasNext) return;
    const next = { ...params, page: (params.page ?? 1) + 1 };
    void qc.prefetchQuery({
      queryKey: queryKeys.doctors.list(next),
      queryFn: ({ signal }) => doctorsApi.list(next, signal),
    });
  }, [qc, hasNext, params]);

  return query;
}

export function useDoctor(id: string) {
  return useQuery({
    queryKey: queryKeys.doctors.detail(id),
    queryFn: ({ signal }) => doctorsApi.get(id, signal),
  });
}

/** Hover-intent prefetch for list rows → the detail page opens with data already cached. */
export function usePrefetchDoctor() {
  const qc = useQueryClient();
  return (id: string) =>
    qc.prefetchQuery({
      queryKey: queryKeys.doctors.detail(id),
      queryFn: ({ signal }) => doctorsApi.get(id, signal),
      staleTime: 30_000,
    });
}

export function useDoctorFacets() {
  return useQuery({
    queryKey: queryKeys.doctors.facets(),
    queryFn: ({ signal }) => doctorsApi.facets(signal),
    staleTime: 5 * 60_000,
  });
}

/** Lightweight doctor search for comboboxes (patient filter, reassignment). */
export function useDoctorOptions(q: string) {
  return useQuery({
    queryKey: queryKeys.doctors.options(q),
    queryFn: ({ signal }) => doctorsApi.list({ q, limit: 20, sort: "name_asc" }, signal),
    placeholderData: keepPreviousData,
    staleTime: 60_000,
    select: (res) => res.data,
  });
}

export function useCreateDoctor() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (values: DoctorValues) => doctorsApi.create(values),
    onSuccess: (doctor) => {
      toast.success("Doctor added", { description: `${doctor.name} · ${doctor.specialization}` });
      void qc.invalidateQueries({ queryKey: queryKeys.doctors.lists() });
      void qc.invalidateQueries({ queryKey: queryKeys.doctors.facets() });
      void qc.invalidateQueries({ queryKey: queryKeys.analytics.all });
    },
  });
}

export function useDoctorPatients(id: string, params: DoctorPatientParams) {
  return useQuery({
    queryKey: queryKeys.doctors.patients(id, params),
    queryFn: ({ signal }) => doctorsApi.patients(id, params, signal),
    placeholderData: keepPreviousData,
  });
}

function invalidatePatientData(qc: ReturnType<typeof useQueryClient>) {
  void qc.invalidateQueries({ queryKey: queryKeys.doctors.all });
  void qc.invalidateQueries({ queryKey: queryKeys.patients.all });
  void qc.invalidateQueries({ queryKey: queryKeys.analytics.all });
}

export function useAddDoctorPatient(doctorId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: PatientPayload) => doctorsApi.addPatient(doctorId, payload),
    onSuccess: (patient) => {
      toast.success("Patient added", { description: `${patient.name} assigned to ${patient.doctor?.name}` });
      invalidatePatientData(qc);
    },
  });
}

type PatientPage = Paginated<Patient>;

/** Optimistic removal: the row disappears immediately and is restored if the request fails. */
export function useRemoveDoctorPatient(doctorId: string) {
  const qc = useQueryClient();
  const prefix = [...queryKeys.doctors.all, "patients", doctorId];

  return useMutation({
    mutationFn: (patient: Patient) => doctorsApi.removePatient(doctorId, patient.id),
    onMutate: async (patient) => {
      await qc.cancelQueries({ queryKey: prefix });
      const snapshot = qc.getQueriesData<PatientPage>({ queryKey: prefix });
      qc.setQueriesData<PatientPage>({ queryKey: prefix }, (page) =>
        page
          ? {
              ...page,
              data: page.data.filter((p) => p.id !== patient.id),
              meta: { ...page.meta, total: Math.max(0, page.meta.total - 1) },
            }
          : page,
      );
      return { snapshot };
    },
    onError: (error, patient, ctx) => {
      ctx?.snapshot.forEach(([key, data]: [QueryKey, PatientPage | undefined]) => qc.setQueryData(key, data));
      toast.error(`Couldn't remove ${patient.name}`, {
        description: error instanceof ApiError ? error.message : undefined,
      });
    },
    onSuccess: (_void, patient) => toast.success(`${patient.name} removed from this doctor`),
    onSettled: () => invalidatePatientData(qc),
  });
}
