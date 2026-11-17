import { api } from "@/lib/api-client";
import type { DoctorSort, PatientSort } from "@/lib/constants";
import type { Doctor, DoctorDetail, DoctorFacets, DoctorListItem, Paginated, Patient } from "@/lib/types";
import type { DoctorValues } from "@/lib/validation";
import type { PatientPayload } from "@/features/patients/api";

export interface DoctorListParams {
  q?: string;
  specialization?: string[];
  hospital?: string[];
  from?: Date | null;
  to?: Date | null;
  sort?: DoctorSort;
  page?: number;
  limit?: number;
}

export interface DoctorPatientParams {
  q?: string;
  condition?: string[];
  from?: Date | null;
  to?: Date | null;
  sort?: PatientSort;
  page?: number;
  limit?: number;
}

export const doctorsApi = {
  list: (params: DoctorListParams, signal?: AbortSignal) =>
    api<Paginated<DoctorListItem>>("/doctors", { query: { ...params }, signal }),

  get: (id: string, signal?: AbortSignal) =>
    api<{ data: DoctorDetail }>(`/doctors/${id}`, { signal }).then((r) => r.data),

  facets: (signal?: AbortSignal) => api<{ data: DoctorFacets }>("/doctors/facets", { signal }).then((r) => r.data),

  create: (body: DoctorValues) =>
    api<{ data: DoctorListItem }>("/doctors", { method: "POST", body }).then((r) => r.data),

  patients: (id: string, params: DoctorPatientParams, signal?: AbortSignal) =>
    api<Paginated<Patient>>(`/doctors/${id}/patients`, { query: { ...params }, signal }),

  addPatient: (id: string, body: PatientPayload) =>
    api<{ data: Patient }>(`/doctors/${id}/patients`, { method: "POST", body }).then((r) => r.data),

  removePatient: (id: string, patientId: string) =>
    api<void>(`/doctors/${id}/patients/${patientId}`, { method: "DELETE" }),
};

export type { Doctor };
