"use client"

import {
  ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ReferenceLine, ResponsiveContainer, Legend, Area,
} from "recharts"
import {
  fieldProductionSeries,
  type FieldProductionSeries,
  getDeviationStatus,
} from "@/lib/mock-data"
import { useState } from "react"
import { AlertTriangle, TrendingUp, Wind, Droplets } from "lucide-react"

// ── helpers ──────────────────────────────────────────────────────────────────

function DeviationAlert({
  label,
  fact,
  plan,
  tolerancePct,
  unit,
  direction = "both",
}: {
  label: string
  fact: number
  plan: number
  tolerancePct: number
  unit: string
  direction?: "over" | "under" | "both"
}) {
  const status = getDeviationStatus(fact, plan, tolerancePct, direction)
  if (status === "ok") return null
  const dev = ((fact - plan) / plan) * 100
  const colorClass =
    status === "critical"
      ? "border-[oklch(0.52_0.22_25/0.4)] bg-[oklch(0.52_0.22_25/0.08)] text-[oklch(0.72_0.18_25)]"
      : "border-[oklch(0.72_0.18_70/0.4)] bg-[oklch(0.72_0.18_70/0.08)] text-[oklch(0.82_0.15_70)]"
  return (
    <div className={`flex items-start gap-2 px-3 py-2 rounded border text-[11px] leading-relaxed ${colorClass}`}>
      <AlertTriangle className="size-3.5 flex-shrink-0 mt-0.5" />
      <span>
        <span className="font-semibold">{label}:</span>{" "}
        факт {fact.toFixed(1)} {unit}, план ТСР {plan.toFixed(1)} {unit}{" "}
        <span className="font-mono">({dev > 0 ? "+" : ""}{dev.toFixed(1)}%)</span>.
        {" "}Допуск ±{tolerancePct}%.{" "}
        {status === "critical" ? "Критическое отклонение." : "Предупреждение."}
      </span>
    </div>
  )
}

// ── custom tooltip ────────────────────────────────────────────────────────────

function CustomTooltip({ active, payload, label, metric }: {
  active?: boolean
  payload?: { name: string; value: number; color: string }[]
  label?: string
  metric: "oil" | "gasUtil" | "emission"
}) {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded border border-border bg-card/95 px-3 py-2.5 shadow-lg text-[11px]">
      <p className="font-semibold text-foreground mb-1.5">{label}</p>
      {payload.map((p) => (
        <div key={p.name} className="flex items-center gap-2 mb-0.5">
          <span className="inline-block size-2 rounded-sm flex-shrink-0" style={{ background: p.color }} />
          <span className="text-muted-foreground">{p.name}:</span>
          <span className="font-mono text-foreground ml-auto pl-3">
            {p.value != null ? p.value.toFixed(metric === "emission" ? 1 : metric === "gasUtil" ? 1 : 1) : "—"}
            {metric === "oil" ? " тыс.т" : metric === "gasUtil" ? "%" : " т"}
          </span>
        </div>
      ))}
    </div>
  )
}

// ── sub-chart ─────────────────────────────────────────────────────────────────

type Metric = "oil" | "gasUtil" | "emission"

function MetricChart({
  series,
  metric,
}: {
  series: FieldProductionSeries
  metric: Metric
}) {
  const data = series.months.map((m) => ({
    month: m.month,
    isFact: m.isFact,
    fact:     metric === "oil" ? m.oilFact      : metric === "gasUtil" ? m.gasUtilFact  : m.emissionFact,
    plan:     metric === "oil" ? m.oilPlanTsr    : metric === "gasUtil" ? m.gasUtilPlanTsr : m.emissionLimit,
    forecast: metric === "oil" ? m.oilForecast   : metric === "gasUtil" ? null           : m.emissionForecast,
  }))

  const unit    = metric === "oil" ? "тыс.т" : metric === "gasUtil" ? "%" : "т"
  const planKey = metric === "oil" ? "План ТСР" : metric === "gasUtil" ? "Норм. ТСР" : "Предел КЭР"
  const factKey = metric === "oil" ? "Добыча факт" : metric === "gasUtil" ? "Утилизация ПНГ факт" : "Выбросы факт"
  const foreKey = metric === "oil" ? "Прогноз добычи" : metric === "gasUtil" ? "Прогноз утилиз." : "Прогноз выбросов"

  // compute YAxis domain
  const allVals = data.flatMap((d) => [d.fact, d.plan, d.forecast].filter((v) => v != null) as number[])
  const minVal = Math.min(...allVals)
  const maxVal = Math.max(...allVals)
  const pad = (maxVal - minVal) * 0.2
  const yMin = Math.max(0, +(minVal - pad).toFixed(0))
  const yMax = +(maxVal + pad).toFixed(0)

  // last fact month for reference annotations
  const lastFact = data.filter((d) => d.fact != null).at(-1)
  const factVals = data.filter((d) => d.fact != null).map((d) => d.fact as number)
  const planVals = data.map((d) => d.plan)
  const avgFact  = factVals.reduce((a, b) => a + b, 0) / (factVals.length || 1)
  const avgPlan  = planVals.reduce((a, b) => a + b, 0) / (planVals.length || 1)

  const tolerancePct = metric === "gasUtil" ? series.gasUtilTolerancePct ?? 3 : series.oilTolerancePct
  const direction: "over" | "under" | "both" =
    metric === "gasUtil" ? "under" : metric === "emission" ? "over" : "both"

  const alertStatus = getDeviationStatus(avgFact, avgPlan, tolerancePct, direction)
  const alertColor  =
    alertStatus === "critical" ? "oklch(0.52_0.22_25)" :
    alertStatus === "warning"  ? "oklch(0.72_0.18_70)" : "oklch(0.62_0.18_145)"

  return (
    <div>
      <ResponsiveContainer width="100%" height={180}>
        <ComposedChart data={data} margin={{ top: 4, right: 8, left: -10, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.3_0_0/0.15)" />
          <XAxis
            dataKey="month"
            tick={{ fontSize: 10, fill: "oklch(0.65_0_0)" }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            domain={[yMin, yMax]}
            tick={{ fontSize: 10, fill: "oklch(0.65_0_0)" }}
            axisLine={false}
            tickLine={false}
            width={42}
            tickFormatter={(v) => v.toFixed(metric === "emission" ? 1 : 0)}
          />
          <Tooltip content={<CustomTooltip metric={metric} />} />

          {/* Plan / limit — dashed line */}
          <Line
            type="monotone"
            dataKey="plan"
            name={planKey}
            stroke="oklch(0.65_0.15_210)"
            strokeDasharray="6 3"
            strokeWidth={1.5}
            dot={false}
            activeDot={false}
          />

          {/* Forecast area */}
          <Area
            type="monotone"
            dataKey="forecast"
            name={foreKey}
            stroke="oklch(0.72_0.18_70)"
            fill="oklch(0.72_0.18_70/0.08)"
            strokeDasharray="4 3"
            strokeWidth={1.5}
            dot={false}
            connectNulls={false}
          />

          {/* Fact bars */}
          <Bar
            dataKey="fact"
            name={factKey}
            fill={alertColor + "/0.75"}
            radius={[2, 2, 0, 0]}
            maxBarSize={24}
          />

          {/* Tolerance band reference lines */}
          <ReferenceLine
            y={avgPlan * (1 + tolerancePct / 100)}
            stroke="oklch(0.52_0.22_25/0.4)"
            strokeDasharray="2 4"
            strokeWidth={1}
          />
          <ReferenceLine
            y={avgPlan * (1 - tolerancePct / 100)}
            stroke="oklch(0.52_0.22_25/0.4)"
            strokeDasharray="2 4"
            strokeWidth={1}
          />
        </ComposedChart>
      </ResponsiveContainer>
      <div className="flex items-center gap-4 mt-1 text-[10px] text-muted-foreground flex-wrap px-1">
        <span className="flex items-center gap-1.5">
          <span className="inline-block w-4 h-2 rounded-sm" style={{ background: alertColor + "" }} />
          {factKey}
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block w-4 h-0.5 rounded-sm bg-[oklch(0.65_0.15_210)]" style={{ borderTop: "2px dashed oklch(0.65 0.15 210)" }} />
          {planKey}
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block w-4 h-0.5 rounded-sm bg-[oklch(0.72_0.18_70)]" style={{ borderTop: "2px dashed oklch(0.72 0.18 70)" }} />
          {foreKey}
        </span>
        <span className="flex items-center gap-1.5 text-muted-foreground/60">
          <span className="inline-block w-4 h-0.5 rounded-sm bg-[oklch(0.52_0.22_25/0.4)]" />
          Допуск ±{tolerancePct}%
        </span>
      </div>
    </div>
  )
}

// ── main component ────────────────────────────────────────────────────────────

type MetricTab = "oil" | "gasUtil" | "emission"

const METRIC_LABELS: Record<MetricTab, string> = {
  oil:      "Добыча нефти vs ТСР",
  gasUtil:  "Утилизация ПНГ vs ТСР",
  emission: "Выбросы vs КЭР",
}

const METRIC_ICONS: Record<MetricTab, typeof TrendingUp> = {
  oil:      TrendingUp,
  gasUtil:  Droplets,
  emission: Wind,
}

export function ProductionChart() {
  const [selectedField, setSelectedField] = useState<string>(fieldProductionSeries[0].fieldId)
  const [metric, setMetric] = useState<MetricTab>("oil")

  const series = fieldProductionSeries.find((f) => f.fieldId === selectedField) ?? fieldProductionSeries[0]

  // Compute fact averages for alert banner
  const factMonths = series.months.filter((m) => m.isFact)
  const avgOilFact  = factMonths.reduce((s, m) => s + (m.oilFact ?? 0), 0) / factMonths.length
  const avgOilPlan  = series.months.reduce((s, m) => s + m.oilPlanTsr, 0) / series.months.length
  const avgGasFact  = factMonths.reduce((s, m) => s + (m.gasUtilFact ?? 0), 0) / factMonths.length
  const avgGasPlan  = series.months[0].gasUtilPlanTsr
  const avgEmFact   = factMonths.reduce((s, m) => s + (m.emissionFact ?? 0), 0) / factMonths.length
  const avgEmLimit  = series.months[0].emissionLimit

  return (
    <div className="space-y-4">

      {/* Field selector */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-[11px] text-muted-foreground">Месторождение:</span>
        {fieldProductionSeries.map((f) => (
          <button
            key={f.fieldId}
            onClick={() => setSelectedField(f.fieldId)}
            className={`text-[11px] px-2.5 py-1 rounded border transition-colors font-mono ${
              selectedField === f.fieldId
                ? "border-primary/60 bg-primary/10 text-primary"
                : "border-border text-muted-foreground hover:border-muted-foreground/50"
            }`}
          >
            {f.fieldName}
          </button>
        ))}
      </div>

      {/* Metric tabs */}
      <div className="flex gap-1 border-b border-border">
        {(Object.entries(METRIC_LABELS) as [MetricTab, string][]).map(([key, label]) => {
          const Icon = METRIC_ICONS[key]
          return (
            <button
              key={key}
              onClick={() => setMetric(key)}
              className={`flex items-center gap-1.5 px-3 py-2 text-xs font-medium transition-colors border-b-2 -mb-px ${
                metric === key
                  ? "border-primary text-foreground"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              <Icon className="size-3" />
              {label}
            </button>
          )
        })}
      </div>

      {/* Context line */}
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[10px] text-muted-foreground font-mono">
        <span>Документ: <span className="text-foreground">{metric === "emission" ? series.kerDoc : series.tsrDoc}</span></span>
        <span>Период: <span className="text-foreground">янв–дек 2026</span></span>
        <span>Факт: <span className="text-foreground">янв–май 2026 (5 мес.)</span></span>
      </div>

      {/* Deviation alerts */}
      <div className="space-y-1.5">
        {metric === "oil" && (
          <DeviationAlert
            label="Добыча нефти (ср. мес.)"
            fact={avgOilFact}
            plan={avgOilPlan}
            tolerancePct={series.oilTolerancePct}
            unit="тыс.т"
            direction="both"
          />
        )}
        {metric === "gasUtil" && (
          <DeviationAlert
            label="Утилизация ПНГ (ср. мес.)"
            fact={avgGasFact}
            plan={avgGasPlan}
            tolerancePct={series.gasUtilTolerancePct ?? 3}
            unit="%"
            direction="under"
          />
        )}
        {metric === "emission" && (
          <DeviationAlert
            label="Выбросы ФУ (ср. мес.)"
            fact={avgEmFact}
            plan={avgEmLimit}
            tolerancePct={10}
            unit="т"
            direction="over"
          />
        )}
      </div>

      {/* Chart */}
      <div className="rounded-md border border-border bg-card p-4">
        <MetricChart series={series} metric={metric} />
      </div>

      {/* Annotation about forecast */}
      <p className="text-[10px] text-muted-foreground leading-relaxed">
        Пунктирная жёлтая линия — прогноз до конца года на основе тренда. Красные пунктирные линии — границы допустимого отклонения (±{series.oilTolerancePct}% для добычи). Серая пунктирная линия — плановый показатель ТСР/КЭР.
      </p>
    </div>
  )
}
