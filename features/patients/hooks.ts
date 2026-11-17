"use client";

import { keepPreviousData, useMutation, useQuery, useQueryClient, type QueryKey } from "@tanstack/react-query";
import { useEffect } from "react";
import { toast } from "sonner";
import { ApiError } from "@/lib/api-client";
import { queryKeys } from "@/lib/query-keys";
import type { Paginated, Patient } from "@/lib/types";
import { patientsApi, type PatientListParams, type PatientPayload } from "./api";

type PatientPage = Paginated<Patient>;

export function usePatients(params: PatientListParams) {
  const qc = useQueryClient();
  const query = useQuery({
    queryKey: queryKeys.patients.list(params),
    queryFn: ({ signal }) => patientsApi.list(params, signal),
    placeholderData: keepPreviousData,
  });

  const hasNext = query.data?.meta.hasNextPage;
  useEffect(() => {
    if (!hasNext) return;
    const next = { ...params, page: (params.page ?? 1) + 1 };
    void qc.prefetchQuery({
      queryKey: queryKeys.patients.list(next),
      queryFn: ({ signal }) => patientsApi.list(next, signal),
    });
  }, [qc, hasNext, params]);

  return query;
}

function invalidateEverythingPatientRelated(qc: ReturnType<typeof useQueryClient>) {
  void qc.invalidateQueries({ queryKey: queryKeys.patients.all });
  void qc.invalidateQueries({ queryKey: queryKeys.doctors.all });
  void qc.invalidateQueries({ queryKey: queryKeys.analytics.all });
}

export function useUpdatePatient() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Partial<PatientPayload> }) => patientsApi.update(id, payload),
    onSuccess: (patient) => {
      // Patch the row in every cached list immediately, then refetch in the background.
      const patch = (page: PatientPage | undefined) =>
        page ? { ...page, data: page.data.map((p) => (p.id === patient.id ? patient : p)) } : page;
      qc.setQueriesData<PatientPage>({ queryKey: queryKeys.patients.lists() }, patch);
      qc.setQueriesData<PatientPage>({ queryKey: [...queryKeys.doctors.all, "patients"] }, patch);
      toast.success("Patient updated", { description: patient.name });
      invalidateEverythingPatientRelated(qc);
    },
  });
}

export function useDeletePatient() {
  const qc = useQueryClient();
  const prefixes: QueryKey[] = [queryKeys.patients.lists(), [...queryKeys.doctors.all, "patients"]];

  return useMutation({
    mutationFn: (patient: Patient) => patientsApi.remove(patient.id),
    onMutate: async (patient) => {
      await Promise.all(prefixes.map((queryKey) => qc.cancelQueries({ queryKey })));
      const snapshot = prefixes.flatMap((queryKey) => qc.getQueriesData<PatientPage>({ queryKey }));
      for (const queryKey of prefixes) {
        qc.setQueriesData<PatientPage>({ queryKey }, (page) =>
          page
            ? {
                ...page,
                data: page.data.filter((p) => p.id !== patient.id),
                meta: { ...page.meta, total: Math.max(0, page.meta.total - 1) },
              }
            : page,
        );
      }
      return { snapshot };
    },
    onError: (error, patient, ctx) => {
      ctx?.snapshot.forEach(([key, data]) => qc.setQueryData(key, data));
      toast.error(`Couldn't delete ${patient.name}`, {
        description: error instanceof ApiError ? error.message : undefined,
      });
    },
    onSuccess: (_void, patient) => toast.success("Patient deleted", { description: patient.name }),
    onSettled: () => invalidateEverythingPatientRelated(qc),
  });
}
