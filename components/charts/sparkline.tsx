/** 12-ish point trend: de-emphasis line with the latest point in the accent. */
export function Sparkline({ values, className }: { values: number[]; className?: string }) {
  if (values.length < 2) return null;
  const w = 96;
  const h = 28;
  const max = Math.max(...values, 1);
  const step = w / (values.length - 1);
  const pts = values.map((v, i) => [i * step, h - 3 - (v / max) * (h - 6)] as const);
  const d = pts.map(([x, y], i) => `${i ? "L" : "M"}${x.toFixed(1)},${y.toFixed(1)}`).join(" ");
  const last = pts[pts.length - 1]!;
  return (
    <svg viewBox={`-2 0 ${w + 4} ${h}`} className={className} width={w} height={h} aria-hidden="true">
      <path d={`${d} L${w},${h} L0,${h} Z`} className="fill-brand" fillOpacity="0.08" />
      <path
        d={d}
        fill="none"
        className="stroke-chart-2"
        strokeWidth="1.5"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
      <circle cx={last[0]} cy={last[1]} r="2.75" className="fill-brand stroke-card" strokeWidth="1.5" />
    </svg>
  );
}
