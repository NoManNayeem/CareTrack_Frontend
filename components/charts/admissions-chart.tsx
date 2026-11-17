"use client";

import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart";
import { formatDate, formatNumber } from "@/lib/format";
import type { Granularity, Overview } from "@/lib/types";

const config = {
  admissions: { label: "Admissions", color: "var(--chart-1)" },
  critical: { label: "Admitted critical", color: "var(--condition-critical)" },
} satisfies ChartConfig;

const tickFormat: Record<Granularity, string> = { day: "d MMM", week: "d MMM", month: "MMM yy" };
const labelFormat: Record<Granularity, (d: string) => string> = {
  day: (d) => formatDate(d, "EEE, d MMM yyyy"),
  week: (d) => `Week of ${formatDate(d, "d MMM yyyy")}`,
  month: (d) => formatDate(d, "MMMM yyyy"),
};

/** Single series (admissions) → no legend box; the card title names it. */
export function AdmissionsChart({ data, granularity }: { data: Overview["timeline"]; granularity: Granularity }) {
  return (
    <ChartContainer config={config} className="aspect-auto h-[260px] w-full">
      <AreaChart data={data} margin={{ top: 8, right: 12, bottom: 0, left: -8 }} accessibilityLayer>
        <CartesianGrid vertical={false} stroke="var(--chart-grid)" />
        <XAxis
          dataKey="date"
          tickLine={false}
          axisLine={{ stroke: "var(--border-strong)" }}
          tickMargin={8}
          minTickGap={28}
          tickFormatter={(d: string) => formatDate(d, tickFormat[granularity])}
          tick={{ fill: "var(--chart-axis)", fontSize: 12 }}
        />
        <YAxis
          allowDecimals={false}
          tickLine={false}
          axisLine={false}
          width={40}
          tickMargin={4}
          tick={{ fill: "var(--chart-axis)", fontSize: 12 }}
          tickFormatter={(v: number) => formatNumber(v)}
        />
        <ChartTooltip
          cursor={{ stroke: "var(--border-strong)", strokeWidth: 1 }}
          content={
            <ChartTooltipContent
              indicator="dot"
              labelFormatter={(_, payload) => labelFormat[granularity](String(payload?.[0]?.payload?.date ?? ""))}
            />
          }
        />
        <Area
          dataKey="admissions"
          type="monotone"
          stroke="var(--color-admissions)"
          strokeWidth={2}
          fill="var(--color-admissions)"
          fillOpacity={0.1}
          activeDot={{ r: 4, strokeWidth: 2, stroke: "var(--card)" }}
          animationDuration={700}
        />
        {/* Critical admissions ride along in the tooltip only — keeps the chart single-series. */}
        <Area dataKey="critical" stroke="transparent" fill="transparent" activeDot={false} isAnimationActive={false} />
      </AreaChart>
    </ChartContainer>
  );
}
