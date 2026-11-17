/* Response shapes of the CareTrack REST API (mirrors CareTrack_Backend DTOs). */

export interface PageMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface Paginated<T> {
  data: T[];
  meta: PageMeta;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: "admin";
  lastLoginAt: string | null;
}

export interface Doctor {
  id: string;
  name: string;
  specialization: Specialization;
  hospital: string;
  phone: string;
  email: string;
  createdAt: string;
  updatedAt: string;
}

export interface DoctorListItem extends Doctor {
  patientCount: number;
}

export interface DoctorDetail extends Doctor {
  stats: {
    totalPatients: number;
    byCondition: Record<Condition, number>;
    lastAdmissionAt: string | null;
  };
}

export interface DoctorFacets {
  specializations: Specialization[];
  hospitals: string[];
}

export interface Patient {
  id: string;
  name: string;
  age: number;
  gender: Gender;
  phone: string;
  email: string | null;
  condition: Condition;
  diagnosis: string;
  admissionDate: string;
  notes: string | null;
  doctor: { id: string; name: string; specialization: Specialization } | null;
  createdAt: string;
  updatedAt: string;
}

export type Granularity = "day" | "week" | "month";

export interface Overview {
  range: { from: string; to: string; previousFrom: string; previousTo: string; granularity: Granularity };
  totals: {
    doctors: number;
    patients: number;
    critical: number;
    admissions: number;
    previousAdmissions: number;
    doctorsAdded: number;
    avgPatientsPerDoctor: number;
  };
  byCondition: Array<{ condition: Condition; count: number }>;
  timeline: Array<{ date: string; admissions: number; critical: number; doctorsAdded: number }>;
  topDoctors: Array<{ id: string; name: string; specialization: Specialization; patients: number }>;
  bySpecialization: Array<{ specialization: Specialization; doctors: number; patients: number }>;
  ageBands: Array<{ band: string; count: number }>;
}

export interface FieldIssue {
  location: "body" | "query" | "params";
  field: string;
  message: string;
}

import type { Condition, Gender, Specialization } from "./constants";
export type { Condition, Gender, Specialization };
