"use client";

import { subDays } from "date-fns";
import { Activity, BedDouble, Stethoscope, UsersRound } from "lucide-react";
import { useRouter } from "next/navigation";
import { useQueryStates } from "nuqs";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { AdmissionsChart } from "@/components/charts/admissions-chart";
import { AgeColumns } from "@/components/charts/age-columns";
import { CensusBar } from "@/components/charts/census-bar";
import { ChartCard, SimpleTable } from "@/components/charts/chart-card";
import { HorizontalBars, type BarDatum } from "@/components/charts/horizontal-bars";
import { KpiTile } from "@/components/charts/kpi-tile";
import { ConditionDot } from "@/components/feedback/condition-badge";
import { ErrorState } from "@/components/feedback/error-state";
import { DateRangeFilter } from "@/components/filters/date-range-filter";
import { PageHeader } from "@/components/layout/page-header";
import { CONDITION_META, CONDITIONS } from "@/lib/constants";
import { toIsoDay, toUtcDate } from "@/lib/dates";
import { formatDate, formatNumber, percentChange } from "@/lib/format";
import { useOverview } from "./hooks";
import { RecentAdmissions } from "./recent-admissions";
import { dashboardParsers, RANGE_LABEL, type RangeKey } from "./search-params";

function resolveRange(range: RangeKey, from: Date | null, to: Date | null) {
  if (range === "custom" && from && to) return { from: toIsoDay(from), to: toIsoDay(to) };
  const days = RANGE_LABEL[range === "custom" ? "30d" : range].days;
  const today = toUtcDate(new Date());
  return { from: toIsoDay(toUtcDate(subDays(today, days - 1))), to: toIsoDay(today) };
}

export function DashboardView() {
  const [state, setState] = useQueryStates(dashboardParsers, { history: "replace" });
  const router = useRouter();
  const params = resolveRange(state.range, state.from, state.to);
  const { data, error, isPending, refetch } = useOverview(params);

  const periodLabel =
    state.range === "custom" && state.from && state.to
      ? `${formatDate(params.from, "d MMM")} – ${formatDate(params.to, "d MMM yyyy")}`
      : RANGE_LABEL[state.range === "custom" ? "30d" : state.range].long;
  const vsLabel =
    state.range === "custom"
      ? "vs previous period"
      : `vs previous ${RANGE_LABEL[state.range].long.replace("last ", "")}`;

  if (error && !data)
    return <ErrorState error={error} onRetry={() => void refetch()} title="Couldn't load the dashboard" />;

  const t = data?.totals;
  const topDoctors: BarDatum[] = (data?.topDoctors ?? []).map((d) => ({
    id: d.id,
    label: d.name,
    value: d.patients,
    sublabel: d.specialization,
  }));
  const specs = data?.bySpecialization ?? [];
  // All 16 specializations are shown: folding the tail into "Other" would create the largest bar.
  const specBars: BarDatum[] = specs.map((s) => ({
    id: s.specialization,
    label: s.specialization,
    value: s.patients,
    sublabel: `${s.doctors} doctors`,
  }));
  // Severity order (critical → discharged) — the order the condition palette was validated in.
  const byCondition = data
    ? CONDITIONS.map((c) => data.byCondition.find((b) => b.condition === c) ?? { condition: c, count: 0 })
    : [];
  const activePatients = t ? t.patients - (data!.byCondition.find((c) => c.condition === "discharged")?.count ?? 0) : 0;

  return (
    <div className="space-y-5">
      <PageHeader
        title="Dashboard"
        description={`Doctors, patients and admissions · ${periodLabel}`}
        actions={
          <>
            <ToggleGroup
              type="single"
              variant="outline"
              size="sm"
              value={state.range === "custom" ? "" : state.range}
              onValueChange={(v) => v && void setState({ range: v as RangeKey, from: null, to: null })}
              aria-label="Date range"
            >
              {(Object.keys(RANGE_LABEL) as Array<keyof typeof RANGE_LABEL>).map((k) => (
                <ToggleGroupItem
                  key={k}
                  value={k}
                  className="h-8 px-3 text-xs data-[state=on]:bg-secondary data-[state=on]:font-semibold"
                  aria-label={RANGE_LABEL[k].long}
                >
                  {RANGE_LABEL[k].short}
                </ToggleGroupItem>
              ))}
            </ToggleGroup>
            <DateRangeFilter
              title="Custom"
              align="end"
              from={state.range === "custom" ? state.from : null}
              to={state.range === "custom" ? state.to : null}
              onChange={({ from, to }) =>
                void setState(from && to ? { range: "custom", from, to } : { range: "30d", from: null, to: null })
              }
            />
          </>
        }
      />

      <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
        <KpiTile
          label="Total doctors"
          icon={<Stethoscope className="size-3.5" />}
          value={t?.doctors}
          isLoading={isPending}
          hint={t && `${t.doctorsAdded > 0 ? `+${formatNumber(t.doctorsAdded)}` : "None"} added in ${periodLabel}`}
          trend={t && t.doctorsAdded > 0 ? data?.timeline.map((p) => p.doctorsAdded) : undefined}
        />
        <KpiTile
          label="Total patients"
          icon={<UsersRound className="size-3.5" />}
          value={t?.patients}
          isLoading={isPending}
          hint={t && `${formatNumber(activePatients)} under active care · ${t.avgPatientsPerDoctor} per doctor`}
        />
        <KpiTile
          label="Admissions"
          icon={<BedDouble className="size-3.5" />}
          value={t?.admissions}
          isLoading={isPending}
          delta={t ? { value: percentChange(t.admissions, t.previousAdmissions), period: vsLabel } : null}
          trend={data?.timeline.map((p) => p.admissions)}
        />
        <KpiTile
          label="Critical now"
          icon={<ConditionDot condition="critical" />}
          value={t?.critical}
          isLoading={isPending}
          hint={
            t &&
            `${activePatients ? ((t.critical / activePatients) * 100).toFixed(1) : 0}% of patients under active care`
          }
        />
      </div>

      <div className="grid grid-cols-1 gap-3 lg:grid-cols-12">
        <ChartCard
          className="lg:col-span-8"
          title="Admissions over time"
          subtitle={
            data ? `${formatNumber(t!.admissions)} admissions · grouped by ${data.range.granularity}` : "Loading…"
          }
          isLoading={isPending}
          table={
            data && (
              <SimpleTable
                head={["Period", "Admissions", "Critical"]}
                rows={data.timeline.map((p) => [
                  formatDate(p.date, data.range.granularity === "month" ? "MMM yyyy" : "d MMM yyyy"),
                  formatNumber(p.admissions),
                  formatNumber(p.critical),
                ])}
              />
            )
          }
        >
          {data && <AdmissionsChart data={data.timeline} granularity={data.range.granularity} />}
        </ChartCard>

        <ChartCard
          className="lg:col-span-4"
          title="Patient condition"
          subtitle="Current status of every patient"
          isLoading={isPending}
          table={
            data && (
              <SimpleTable
                head={["Condition", "Patients"]}
                rows={byCondition.map((c) => [CONDITION_META[c.condition].label, formatNumber(c.count)])}
              />
            )
          }
        >
          {data && <CensusBar data={byCondition} onSelect={(c) => router.push(`/patients?condition=${c}`)} />}
        </ChartCard>
      </div>

      <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
        <ChartCard
          title="Patients per doctor"
          subtitle="Top 10 caseloads · select a doctor to open their profile"
          isLoading={isPending}
          table={
            data && (
              <SimpleTable
                head={["Doctor", "Specialization", "Patients"]}
                rows={data.topDoctors.map((d) => [d.name, d.specialization, formatNumber(d.patients)])}
              />
            )
          }
        >
          {data && (
            <HorizontalBars
              data={topDoctors}
              valueLabel="Patients"
              onSelect={(d) => router.push(`/doctors/${d.id}`)}
              labelWidth={160}
              rowHeight={38}
            />
          )}
        </ChartCard>
        <ChartCard
          title="Patients by specialization"
          subtitle="Patient caseload across all 16 specialities"
          isLoading={isPending}
          table={
            data && (
              <SimpleTable
                head={["Specialization", "Doctors", "Patients"]}
                rows={specs.map((s) => [s.specialization, formatNumber(s.doctors), formatNumber(s.patients)])}
              />
            )
          }
        >
          {data && <HorizontalBars data={specBars} valueLabel="Patients" labelWidth={170} rowHeight={24} />}
        </ChartCard>
      </div>

      <div className="grid grid-cols-1 gap-3 lg:grid-cols-12">
        <ChartCard
          className="lg:col-span-5"
          title="Age distribution"
          subtitle="All patients by age band"
          isLoading={isPending}
          table={
            data && (
              <SimpleTable
                head={["Age", "Patients"]}
                rows={data.ageBands.map((b) => [b.band, formatNumber(b.count)])}
              />
            )
          }
        >
          {data && <AgeColumns data={data.ageBands} />}
        </ChartCard>
        <div className="lg:col-span-7">
          <RecentAdmissions />
        </div>
      </div>

      <p className="flex items-center gap-1.5 text-xs text-subtle-foreground">
        <Activity className="size-3" /> Figures update automatically after any change to doctors or patients.
      </p>
    </div>
  );
}
