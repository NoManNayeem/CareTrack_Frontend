import { format, formatDistanceToNowStrict, isToday, isYesterday } from "date-fns";

const integer = new Intl.NumberFormat("en-US");
const compact = new Intl.NumberFormat("en-US", { notation: "compact", maximumFractionDigits: 1 });

export const formatNumber = (n: number) => integer.format(n);
export const formatCompact = (n: number) => (Math.abs(n) < 10_000 ? integer.format(n) : compact.format(n));

export function formatDate(value: string | Date, pattern = "d MMM yyyy") {
  return format(new Date(value), pattern);
}

export function formatRelativeDay(value: string | Date) {
  const d = new Date(value);
  if (isToday(d)) return "Today";
  if (isYesterday(d)) return "Yesterday";
  return `${formatDistanceToNowStrict(d)} ago`;
}

export function initials(name: string) {
  const parts = name
    .replace(/^dr\.?\s+/i, "")
    .split(/\s+/)
    .filter(Boolean);
  return ((parts[0]?.[0] ?? "") + (parts.length > 1 ? parts[parts.length - 1]![0] : "")).toUpperCase();
}

/** Percent change vs a previous value; null when there is no baseline. */
export function percentChange(current: number, previous: number): number | null {
  if (previous === 0) return current === 0 ? 0 : null;
  return ((current - previous) / previous) * 100;
}

export function pluralize(count: number, singular: string, plural = `${singular}s`) {
  return `${formatNumber(count)} ${count === 1 ? singular : plural}`;
}
