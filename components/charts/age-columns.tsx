"use client";

import { Bar, BarChart, CartesianGrid, LabelList, XAxis, YAxis } from "recharts";
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart";
import { formatNumber } from "@/lib/format";

const config = { count: { label: "Patients", color: "var(--chart-1)" } } satisfies ChartConfig;

export function AgeColumns({ data }: { data: Array<{ band: string; count: number }> }) {
  return (
    <ChartContainer config={config} className="aspect-auto h-[220px] w-full">
      <BarChart data={data} margin={{ top: 20, right: 8, bottom: 0, left: 0 }} accessibilityLayer>
        <CartesianGrid vertical={false} stroke="var(--chart-grid)" />
        <XAxis
          dataKey="band"
          tickLine={false}
          axisLine={{ stroke: "var(--border-strong)" }}
          tickMargin={8}
          tick={{ fill: "var(--chart-axis)", fontSize: 12 }}
        />
        <YAxis
          allowDecimals={false}
          tickLine={false}
          axisLine={false}
          width={36}
          tickMargin={4}
          tick={{ fill: "var(--chart-axis)", fontSize: 12 }}
        />
        <ChartTooltip
          cursor={{ fill: "var(--muted)", opacity: 0.7 }}
          content={<ChartTooltipContent indicator="dot" labelFormatter={(l) => `Age ${l}`} />}
        />
        <Bar dataKey="count" fill="var(--color-count)" radius={[4, 4, 0, 0]} maxBarSize={24} animationDuration={600}>
          <LabelList
            dataKey="count"
            position="top"
            offset={6}
            fontSize={12}
            fill="var(--muted-foreground)"
            formatter={(v: unknown) => formatNumber(Number(v))}
          />
        </Bar>
      </BarChart>
    </ChartContainer>
  );
}
