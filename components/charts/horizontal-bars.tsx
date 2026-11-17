"use client";

import { Bar, BarChart, CartesianGrid, LabelList, XAxis, YAxis } from "recharts";
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart";
import { formatNumber } from "@/lib/format";

export interface BarDatum {
  id: string;
  label: string;
  value: number;
  sublabel?: string;
}

/**
 * Ranked horizontal bars: ≤ 18px thick, 4px rounded data-end, value at the tip,
 * a single hue (identity comes from the axis label, not colour).
 */
export function HorizontalBars({
  data,
  valueLabel,
  onSelect,
  labelWidth = 150,
  rowHeight = 30,
}: {
  data: BarDatum[];
  valueLabel: string;
  onSelect?: (d: BarDatum) => void;
  labelWidth?: number;
  rowHeight?: number;
}) {
  const config = { value: { label: valueLabel, color: "var(--chart-1)" } } satisfies ChartConfig;
  const height = Math.max(160, data.length * rowHeight + 16);

  return (
    <ChartContainer config={config} className="aspect-auto w-full" style={{ height }}>
      <BarChart
        data={data}
        layout="vertical"
        margin={{ top: 0, right: 44, bottom: 0, left: 0 }}
        barCategoryGap={rowHeight > 26 ? 8 : 5}
        accessibilityLayer
      >
        <CartesianGrid horizontal={false} stroke="var(--chart-grid)" />
        <XAxis type="number" hide allowDecimals={false} />
        <YAxis
          type="category"
          dataKey="label"
          width={labelWidth}
          tickLine={false}
          axisLine={false}
          interval={0}
          tick={({ x, y, payload, index }) => {
            const d = data[index];
            const text = String(payload.value);
            const short = text.length > 22 ? `${text.slice(0, 21)}…` : text;
            return (
              <g transform={`translate(${x},${y})`}>
                <text
                  x={-8}
                  y={0}
                  dy={4}
                  textAnchor="end"
                  fontSize={12.5}
                  fill="var(--foreground)"
                  className={onSelect ? "cursor-pointer hover:underline" : undefined}
                  onClick={onSelect && d ? () => onSelect(d) : undefined}
                >
                  <title>{text}</title>
                  {short}
                </text>
              </g>
            );
          }}
        />
        <ChartTooltip
          cursor={{ fill: "var(--muted)", opacity: 0.7 }}
          content={
            <ChartTooltipContent
              indicator="dot"
              labelFormatter={(_, payload) => {
                const d = payload?.[0]?.payload as BarDatum | undefined;
                return d ? `${d.label}${d.sublabel ? ` · ${d.sublabel}` : ""}` : "";
              }}
            />
          }
        />
        <Bar
          dataKey="value"
          fill="var(--color-value)"
          radius={[0, 4, 4, 0]}
          maxBarSize={18}
          animationDuration={600}
          className={onSelect ? "cursor-pointer" : undefined}
          onClick={onSelect ? (entry: { payload?: BarDatum }) => entry.payload && onSelect(entry.payload) : undefined}
        >
          <LabelList
            dataKey="value"
            position="right"
            offset={8}
            fontSize={12}
            fill="var(--muted-foreground)"
            formatter={(v: unknown) => formatNumber(Number(v))}
          />
        </Bar>
      </BarChart>
    </ChartContainer>
  );
}
