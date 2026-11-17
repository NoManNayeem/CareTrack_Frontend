import { z } from "zod";
import { CONDITIONS, GENDERS, SPECIALIZATIONS } from "./constants";

/* Client-side schemas mirror the API's rules so users get instant feedback;
   the API re-validates everything and its field errors are mapped back onto the form. */

const personName = z
  .string()
  .trim()
  .min(2, { error: "Name must be at least 2 characters" })
  .max(80, { error: "Name must be at most 80 characters" });

const phone = z
  .string()
  .trim()
  .min(7, { error: "Phone number is too short", abort: true })
  .max(20, { error: "Phone number is too long" })
  .regex(/^\+?[\d\s\-()]+$/, { error: "Use digits, spaces, +, - or ( )" });

export const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, { error: "Email is required" })
    .pipe(z.email({ error: "Enter a valid email" })),
  password: z.string().min(1, { error: "Password is required" }),
});
export type LoginValues = z.infer<typeof loginSchema>;

export const doctorSchema = z.object({
  name: personName,
  specialization: z.enum(SPECIALIZATIONS, { error: "Choose a specialization" }),
  hospital: z
    .string()
    .trim()
    .min(2, { error: "Hospital must be at least 2 characters" })
    .max(120, { error: "Hospital must be at most 120 characters" }),
  phone,
  email: z
    .string()
    .trim()
    .min(1, { error: "Email is required" })
    .pipe(z.email({ error: "Enter a valid email" })),
});
export type DoctorValues = z.infer<typeof doctorSchema>;

export const patientSchema = z.object({
  name: personName,
  age: z
    .number({ error: "Age is required" })
    .int({ error: "Whole years only" })
    .min(0, { error: "Age cannot be negative" })
    .max(130, { error: "Age looks too high" }),
  gender: z.enum(GENDERS, { error: "Choose a gender" }),
  phone,
  email: z.union([z.literal(""), z.email({ error: "Enter a valid email" })]),
  condition: z.enum(CONDITIONS, { error: "Choose a condition" }),
  diagnosis: z
    .string()
    .trim()
    .min(2, { error: "Diagnosis must be at least 2 characters" })
    .max(120, { error: "Diagnosis must be at most 120 characters" }),
  admissionDate: z
    .date({ error: "Admission date is required" })
    .refine((d) => d.getTime() <= Date.now(), { error: "Admission date cannot be in the future" }),
  notes: z.string().trim().max(1000, { error: "Notes must be at most 1000 characters" }),
  doctorId: z.string().optional(),
});
export type PatientValues = z.infer<typeof patientSchema>;
