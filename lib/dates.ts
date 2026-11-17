import { endOfMonth, startOfDay, startOfMonth, startOfYear, subDays } from "date-fns";

/** Calendar date picked in local time → the same calendar date at UTC midnight (API format). */
export function toUtcDate(local: Date): Date {
  return new Date(Date.UTC(local.getFullYear(), local.getMonth(), local.getDate()));
}

/** UTC-midnight date (from the URL) → a local Date on the same calendar day (for the picker). */
export function fromUtcDate(utc: Date): Date {
  return new Date(utc.getUTCFullYear(), utc.getUTCMonth(), utc.getUTCDate());
}

export function toIsoDay(date: Date): string {
  return date.toISOString().slice(0, 10);
}

export interface DatePreset {
  id: string;
  label: string;
  range: () => { from: Date; to: Date };
}

export const DATE_PRESETS: DatePreset[] = [
  { id: "today", label: "Today", range: () => ({ from: startOfDay(new Date()), to: new Date() }) },
  { id: "7d", label: "Last 7 days", range: () => ({ from: subDays(new Date(), 6), to: new Date() }) },
  { id: "30d", label: "Last 30 days", range: () => ({ from: subDays(new Date(), 29), to: new Date() }) },
  { id: "90d", label: "Last 90 days", range: () => ({ from: subDays(new Date(), 89), to: new Date() }) },
  { id: "mtd", label: "This month", range: () => ({ from: startOfMonth(new Date()), to: endOfMonth(new Date()) }) },
  { id: "ytd", label: "Year to date", range: () => ({ from: startOfYear(new Date()), to: new Date() }) },
];
