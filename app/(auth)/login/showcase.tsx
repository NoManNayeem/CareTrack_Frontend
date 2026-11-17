import { ConditionDot } from "@/components/feedback/condition-badge";
import { CONDITION_META, CONDITIONS } from "@/lib/constants";

/* A quiet, product-true preview (not stock art): an admissions trend and the census bar. */
const POINTS = [18, 22, 19, 27, 24, 31, 29, 35, 33, 41, 38, 46];
const CENSUS = { critical: 7, under_observation: 12, recovering: 18, stable: 28, discharged: 35 } as const;

function TrendPreview() {
  const w = 320;
  const h = 96;
  const max = Math.max(...POINTS);
  const step = w / (POINTS.length - 1);
  const pts = POINTS.map((v, i) => [i * step, h - (v / max) * (h - 8)] as const);
  const line = pts.map(([x, y], i) => `${i ? "L" : "M"}${x.toFixed(1)},${y.toFixed(1)}`).join(" ");
  const last = pts[pts.length - 1]!;
  return (
    <svg viewBox={`0 0 ${w} ${h + 4}`} className="h-auto w-full" aria-hidden="true">
      {[0.25, 0.5, 0.75].map((t) => (
        <line key={t} x1="0" x2={w} y1={h * t} y2={h * t} className="stroke-chart-grid" strokeWidth="1" />
      ))}
      <path d={`${line} L${w},${h} L0,${h} Z`} className="fill-brand" fillOpacity="0.1" />
      <path
        d={line}
        fill="none"
        className="stroke-brand"
        strokeWidth="2"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
      <circle cx={last[0] - 1} cy={last[1]} r="4" className="fill-brand stroke-card" strokeWidth="2" />
    </svg>
  );
}

export function LoginShowcase() {
  return (
    <aside className="relative hidden overflow-hidden border-l bg-muted/40 lg:flex lg:items-center lg:justify-center">
      <div className="w-full max-w-[460px] px-10">
        <p className="mb-6 max-w-sm text-[15px] leading-relaxed text-muted-foreground">
          <span className="font-medium text-foreground">Doctors, patients and admissions in one place.</span> Search,
          filter and spot trends across every department.
        </p>
        <div className="space-y-4 rounded-xl border bg-card p-5 shadow-hairline">
          <div className="flex items-baseline justify-between">
            <div>
              <p className="text-xs text-muted-foreground">Admissions · last 12 weeks</p>
              <p className="mt-1 text-2xl font-semibold tracking-tight">
                363 <span className="ml-1 align-middle text-xs font-medium text-success">+18.4%</span>
              </p>
            </div>
            <span className="rounded-md border px-1.5 py-0.5 text-xs text-muted-foreground">Weekly</span>
          </div>
          <TrendPreview />
          <div className="space-y-2.5 border-t pt-4">
            <p className="text-xs text-muted-foreground">Current census</p>
            <div className="flex h-2 gap-[2px] overflow-hidden rounded-full">
              {CONDITIONS.map((c) => (
                <span key={c} style={{ flexGrow: CENSUS[c], backgroundColor: `var(--condition-${c})` }} />
              ))}
            </div>
            <ul className="flex flex-wrap gap-x-4 gap-y-1.5 text-xs">
              {CONDITIONS.map((c) => (
                <li key={c} className="flex items-center gap-1.5 text-muted-foreground">
                  <ConditionDot condition={c} />
                  <span className="truncate">{CONDITION_META[c].label}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </aside>
  );
}
