import {
  parseAsArrayOf,
  parseAsBoolean,
  parseAsInteger,
  parseAsIsoDate,
  parseAsString,
  parseAsStringLiteral,
} from "nuqs";
import { DOCTOR_SORTS, SPECIALIZATIONS, type DoctorSort } from "@/lib/constants";

/** URL is the source of truth for list state: shareable, back-button friendly, no global store. */
export const doctorListParsers = {
  q: parseAsString.withDefault(""),
  specialization: parseAsArrayOf(parseAsStringLiteral(SPECIALIZATIONS)).withDefault([]),
  hospital: parseAsArrayOf(parseAsString).withDefault([]),
  from: parseAsIsoDate,
  to: parseAsIsoDate,
  sort: parseAsStringLiteral(Object.keys(DOCTOR_SORTS) as DoctorSort[]).withDefault("newest"),
  page: parseAsInteger.withDefault(1),
  limit: parseAsInteger.withDefault(10),
};

export const newDoctorParser = { new: parseAsBoolean.withDefault(false) };
