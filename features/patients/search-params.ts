import { parseAsArrayOf, parseAsInteger, parseAsIsoDate, parseAsString, parseAsStringLiteral } from "nuqs";
import { AGE_GROUPS, CONDITIONS, GENDERS, PATIENT_SORTS, type AgeGroup, type PatientSort } from "@/lib/constants";

export const patientListParsers = {
  q: parseAsString.withDefault(""),
  condition: parseAsArrayOf(parseAsStringLiteral(CONDITIONS)).withDefault([]),
  gender: parseAsArrayOf(parseAsStringLiteral(GENDERS)).withDefault([]),
  age: parseAsStringLiteral(Object.keys(AGE_GROUPS) as AgeGroup[]),
  doctor: parseAsString,
  from: parseAsIsoDate,
  to: parseAsIsoDate,
  sort: parseAsStringLiteral(Object.keys(PATIENT_SORTS) as PatientSort[]).withDefault("admitted_desc"),
  page: parseAsInteger.withDefault(1),
  limit: parseAsInteger.withDefault(10),
};

/** Doctor-scoped list on the doctor detail page — prefixed so it never collides with other state. */
export const doctorPatientParsers = {
  pq: parseAsString.withDefault(""),
  pcondition: parseAsArrayOf(parseAsStringLiteral(CONDITIONS)).withDefault([]),
  pfrom: parseAsIsoDate,
  pto: parseAsIsoDate,
  ppage: parseAsInteger.withDefault(1),
};
