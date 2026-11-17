import { parseAsIsoDate, parseAsStringLiteral } from "nuqs";

export const RANGES = ["7d", "30d", "90d", "12m", "custom"] as const;
export type RangeKey = (typeof RANGES)[number];

export const dashboardParsers = {
  range: parseAsStringLiteral(RANGES).withDefault("30d"),
  from: parseAsIsoDate,
  to: parseAsIsoDate,
};

export const RANGE_LABEL: Record<Exclude<RangeKey, "custom">, { short: string; long: string; days: number }> = {
  "7d": { short: "7D", long: "last 7 days", days: 7 },
  "30d": { short: "30D", long: "last 30 days", days: 30 },
  "90d": { short: "90D", long: "last 90 days", days: 90 },
  "12m": { short: "12M", long: "last 12 months", days: 365 },
};
