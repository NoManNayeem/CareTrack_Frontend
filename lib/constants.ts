export const APP_NAME = "CareTrack";

export const SPECIALIZATIONS = [
  "Cardiology",
  "Dermatology",
  "Endocrinology",
  "Gastroenterology",
  "General Medicine",
  "Nephrology",
  "Neurology",
  "Obstetrics & Gynecology",
  "Oncology",
  "Ophthalmology",
  "Orthopedics",
  "Pediatrics",
  "Psychiatry",
  "Pulmonology",
  "Radiology",
  "Urology",
] as const;
export type Specialization = (typeof SPECIALIZATIONS)[number];

/** Ordered by clinical severity — this order drives badges, filters and the census bar. */
export const CONDITIONS = ["critical", "under_observation", "recovering", "stable", "discharged"] as const;
export type Condition = (typeof CONDITIONS)[number];

export const CONDITION_META: Record<Condition, { label: string; description: string }> = {
  critical: { label: "Critical", description: "Needs immediate attention" },
  under_observation: { label: "Under observation", description: "Being monitored closely" },
  recovering: { label: "Recovering", description: "Improving under treatment" },
  stable: { label: "Stable", description: "Vitals within normal range" },
  discharged: { label: "Discharged", description: "Released from care" },
};

export const GENDERS = ["female", "male", "other"] as const;
export type Gender = (typeof GENDERS)[number];
export const GENDER_LABEL: Record<Gender, string> = { female: "Female", male: "Male", other: "Other" };

export const DOCTOR_SORTS = {
  newest: "Newest first",
  oldest: "Oldest first",
  name_asc: "Name A–Z",
  name_desc: "Name Z–A",
} as const;
export type DoctorSort = keyof typeof DOCTOR_SORTS;

export const PATIENT_SORTS = {
  admitted_desc: "Recently admitted",
  admitted_asc: "Earliest admitted",
  name_asc: "Name A–Z",
  name_desc: "Name Z–A",
} as const;
export type PatientSort = keyof typeof PATIENT_SORTS;

export const AGE_GROUPS = {
  child: { label: "0–17", min: 0, max: 17 },
  young: { label: "18–39", min: 18, max: 39 },
  middle: { label: "40–64", min: 40, max: 64 },
  senior: { label: "65+", min: 65, max: 130 },
} as const;
export type AgeGroup = keyof typeof AGE_GROUPS;

export const PAGE_SIZES = [10, 20, 50] as const;
