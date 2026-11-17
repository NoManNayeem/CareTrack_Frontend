import { api } from "@/lib/api-client";
import type { PatientSort } from "@/lib/constants";
import { toIsoDay } from "@/lib/dates";
import type { Paginated, Patient } from "@/lib/types";
import type { PatientValues } from "@/lib/validation";

export interface PatientListParams {
  q?: string;
  condition?: string[];
  gender?: string[];
  doctor?: string | null;
  minAge?: number;
  maxAge?: number;
  from?: Date | null;
  to?: Date | null;
  sort?: PatientSort;
  page?: number;
  limit?: number;
}

/** Shape sent to the API (dates as YYYY-MM-DD, empty optionals as ""). */
export interface PatientPayload {
  name: string;
  age: number;
  gender: string;
  phone: string;
  email: string;
  condition: string;
  diagnosis: string;
  admissionDate: string;
  notes: string;
  doctor?: string;
}

export function toPatientPayload(values: PatientValues): PatientPayload {
  const { doctorId, admissionDate, ...rest } = values;
  const local = admissionDate;
  const day = new Date(Date.UTC(local.getFullYear(), local.getMonth(), local.getDate()));
  return { ...rest, admissionDate: toIsoDay(day), ...(doctorId && { doctor: doctorId }) };
}

export const patientsApi = {
  list: (params: PatientListParams, signal?: AbortSignal) =>
    api<Paginated<Patient>>("/patients", { query: { ...params }, signal }),

  update: (id: string, body: Partial<PatientPayload>) =>
    api<{ data: Patient }>(`/patients/${id}`, { method: "PATCH", body }).then((r) => r.data),

  remove: (id: string) => api<void>(`/patients/${id}`, { method: "DELETE" }),
};
