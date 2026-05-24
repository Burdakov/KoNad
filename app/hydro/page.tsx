"use client"

import { AppShell } from "@/components/app-shell"
import { StatusBadge } from "@/components/status-badge"
import { MasterfileCrossCheck } from "@/components/masterfile-cross-check"
import {
  hydroDocs,
  fieldWaterSeries,
  type HydroDocument,
  type HydroDocType,
  type FieldWaterSeries,
} from "@/lib/mock-data"
import { useState } from "react"
import {
  Droplets, AlertTriangle, CheckCircle2, FileText, BarChart3,
  Database, TrendingUp, TrendingDown, Minus, ChevronDown, ChevronRight,
} from "lucide-react"
import {
  ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Area, ReferenceLine, Legend,
} from "recharts"

// ── summary stats ─────────────────────────────────────────────────────────────

function getSummary() {
  const total    = hydroDocs.length
  const critical = hydroDocs.filter((d) => d.status === "critical").length
  const warning  = hydroDocs.filter((d) => d.status === "warning").length
  const ok       = hydroDocs.filter((d) => d.status === "ok").length
  return { total, critical, warning, ok }
}

// ── doc type label map ────────────────────────────────────────────────────────

const DOC_TYPE_ORDER: HydroDocType[] = [
  "reserves", "tsr_water", "pgin", "water_placement", "monitoring",
]

const DOC_TYPE_LABELS: Record<HydroDocType, string> = {
  reserves:       "Подсчёт запасов",
  tsr_water:      "ТСР (вода / ППД)",
  pgin:           "ПГИН",
  water_placement:"Проект размещения вод",
  monitoring:     "Мониторинг подз. вод",
}

// ── status helpers ────────────────────────────────────────────────────────────

const STATUS_STYLE = {
  ok:       "border-[oklch(0.62_0.18_145/0.4)] bg-[oklch(0.62_0.18_145/0.08)] text-[oklch(0.62_0.18_145)]",
  warning:  "border-[oklch(0.72_0.18_70/0.4)]  bg-[oklch(0.72_0.18_70/0.08)]  text-[oklch(0.82_0.15_70)]",
  critical: "border-[oklch(0.52_0.22_25/0.4)]  bg-[oklch(0.52_0.22_25/0.08)]  text-[oklch(0.72_0.18_25)]",
}

function StatusPill({ status }: { status: HydroDocument["status"] }) {
  const labels = { ok: "Актуален", warning: "Внимание", critical: "Нарушение" }
  return (
    <span className={`inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full border ${STATUS_STYLE[status]}`}>
      {status === "ok" ? <CheckCircle2 className="size-2.5" /> : <AlertTriangle className="size-2.5" />}
      {labels[status]}
    </span>
  )
}

// ── days-left badge ───────────────────────────────────────────────────────────

function DaysLeftBadge({ days }: { days: number | null }) {
  if (days === null) return <span className="text-muted-foreground/50 text-[10px]">бессрочно</span>
  if (days < 0) {
    return <span className="text-[oklch(0.72_0.18_25)] font-mono text-[10px] font-semibold">истёк {Math.abs(days)} дн. назад</span>
  }
  if (days < 60) {
    return <span className="text-[oklch(0.82_0.15_70)] font-mono text-[10px] font-semibold">через {days} дн.</span>
  }
  return <span className="text-muted-foreground font-mono text-[10px]">через {days} дн.</span>
}

// ── doc card ──────────────────────────────────────────────────────────────────

function DocCard({ doc, expanded, onToggle }: {
  doc: HydroDocument
  expanded: boolean
  onToggle: () => void
}) {
  return (
    <div className={`rounded-md border transition-colors ${
      doc.status === "critical"
        ? "border-[oklch(0.52_0.22_25/0.35)] bg-[oklch(0.52_0.22_25/0.04)]"
        : doc.status === "warning"
        ? "border-[oklch(0.72_0.18_70/0.35)] bg-[oklch(0.72_0.18_70/0.04)]"
        : "border-border bg-card"
    }`}>
      <button
        onClick={onToggle}
        className="w-full text-left px-4 py-3 flex items-start gap-3"
      >
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <StatusPill status={doc.status} />
            <span className="text-[10px] text-muted-foreground font-mono">{doc.docNumber}</span>
            <span className="text-[10px] text-muted-foreground">{doc.company}</span>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-muted/50 text-muted-foreground">{doc.fieldName}</span>
          </div>
          <p className="text-sm font-medium text-foreground leading-tight text-balance">{doc.docTitle}</p>
          <div className="flex flex-wrap gap-x-4 gap-y-0.5 mt-1 text-[10px] text-muted-foreground">
            <span>Утверждён: <span className="text-foreground">{doc.approvalDate}</span></span>
            {doc.expiryDate && <span>Действует до: <span className="text-foreground">{doc.expiryDate}</span></span>}
            <DaysLeftBadge days={doc.daysLeft} />
          </div>
        </div>
        {expanded
          ? <ChevronDown className="size-4 text-muted-foreground flex-shrink-0 mt-0.5" />
          : <ChevronRight className="size-4 text-muted-foreground flex-shrink-0 mt-0.5" />}
      </button>
      {expanded && (
        <div className="px-4 pb-3 border-t border-border/50 pt-3 space-y-1.5 text-[11px]">
          <p>
            <span className="text-muted-foreground">Орган:</span>{" "}
            <span className="text-foreground">{doc.approvedBy}</span>
          </p>
          <p className="text-foreground leading-relaxed">{doc.comment}</p>
        </div>
      )}
    </div>
  )
}

// ── water chart ───────────────────────────────────────────────────────────────

function WaterChart({ series }: { series: FieldWaterSeries }) {
  const data = series.months.map((m) => ({
    month: m.month,
    injectionFact:    m.injectionFact,
    injectionPlan:    m.injectionPlanTsr,
    injectionForecast: m.injectionForecast,
    disposalFact:    m.disposalFact,
    disposalLimit:   m.disposalLimit,
    disposalForecast: m.disposalForecast,
  }))

  const hasExpired = series.prvDoc === null || series.prvDoc.includes("ИСТЁК")
  const overInjection = series.months
    .filter((m) => m.injectionFact != null)
    .some((m) => (m.injectionFact! / m.injectionPlanTsr - 1) * 100 > series.injectionTolerancePct)

  return (
    <div className="space-y-3">
      {/* alerts */}
      {(hasExpired || overInjection) && (
        <div className="space-y-1.5">
          {hasExpired && (
            <div className="flex items-start gap-2 px-3 py-2 rounded border border-[oklch(0.52_0.22_25/0.4)] bg-[oklch(0.52_0.22_25/0.08)] text-[oklch(0.72_0.18_25)] text-[11px]">
              <AlertTriangle className="size-3.5 flex-shrink-0 mt-0.5" />
              <span>
                <span className="font-semibold">ТСР (водный раздел) истёк.</span>{" "}
                Закачка ведётся без действующей технологической схемы разработки водонасыщенных пластов.
              </span>
            </div>
          )}
          {overInjection && (
            <div className="flex items-start gap-2 px-3 py-2 rounded border border-[oklch(0.72_0.18_70/0.4)] bg-[oklch(0.72_0.18_70/0.08)] text-[oklch(0.82_0.15_70)] text-[11px]">
              <TrendingUp className="size-3.5 flex-shrink-0 mt-0.5" />
              <span>
                <span className="font-semibold">Превышение закачки.</span>{" "}
                Фактический объём закачки превышает план ТСР на более чем {series.injectionTolerancePct}%.
              </span>
            </div>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Injection chart */}
        <div className="rounded-md border border-border bg-card p-4">
          <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-3">
            Закачка для ППД, тыс.м³
          </p>
          <ResponsiveContainer width="100%" height={160}>
            <ComposedChart data={data} margin={{ top: 4, right: 8, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.3_0_0/0.12)" />
              <XAxis dataKey="month" tick={{ fontSize: 10, fill: "oklch(0.65_0_0)" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: "oklch(0.65_0_0)" }} axisLine={false} tickLine={false} width={38} />
              <Tooltip
                contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: "6px", fontSize: 11 }}
                formatter={(v: number) => [`${v.toFixed(0)} тыс.м³`]}
              />
              <Line type="monotone" dataKey="injectionPlan" name="План ТСР" stroke="oklch(0.65_0.15_210)" strokeDasharray="5 3" strokeWidth={1.5} dot={false} />
              <Area type="monotone" dataKey="injectionForecast" name="Прогноз" stroke="oklch(0.72_0.18_70)" fill="oklch(0.72_0.18_70/0.08)" strokeDasharray="4 3" strokeWidth={1.5} dot={false} connectNulls={false} />
              <Bar dataKey="injectionFact" name="Закачка факт" fill="oklch(0.55_0.18_220/0.7)" radius={[2, 2, 0, 0]} maxBarSize={22} />
            </ComposedChart>
          </ResponsiveContainer>
        </div>

        {/* Disposal chart */}
        <div className="rounded-md border border-border bg-card p-4">
          <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-3">
            Захоронение пластовых вод, тыс.м³
          </p>
          <ResponsiveContainer width="100%" height={160}>
            <ComposedChart data={data} margin={{ top: 4, right: 8, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.3_0_0/0.12)" />
              <XAxis dataKey="month" tick={{ fontSize: 10, fill: "oklch(0.65_0_0)" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: "oklch(0.65_0_0)" }} axisLine={false} tickLine={false} width={38} />
              <Tooltip
                contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: "6px", fontSize: 11 }}
                formatter={(v: number) => [`${v.toFixed(0)} тыс.м³`]}
              />
              <ReferenceLine y={data[0].disposalLimit} stroke="oklch(0.52_0.22_25/0.5)" strokeDasharray="3 4" strokeWidth={1.5} label={{ value: "Предел ПРВ", fontSize: 9, fill: "oklch(0.72_0.18_25)" }} />
              <Area type="monotone" dataKey="disposalForecast" name="Прогноз" stroke="oklch(0.72_0.18_70)" fill="oklch(0.72_0.18_70/0.08)" strokeDasharray="4 3" strokeWidth={1.5} dot={false} connectNulls={false} />
              <Bar dataKey="disposalFact" name="Захоронение факт" fill="oklch(0.55_0.18_220/0.7)" radius={[2, 2, 0, 0]} maxBarSize={22} />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[10px] text-muted-foreground px-1">
        <span>ТСР (вода): <span className="font-mono text-foreground">{series.tsrDoc}</span></span>
        <span>ПРВ: <span className={`font-mono ${series.prvDoc?.includes("ИСТЁК") ? "text-[oklch(0.72_0.18_25)]" : "text-foreground"}`}>{series.prvDoc ?? "—"}</span></span>
        <span>Допуск закачки: <span className="text-foreground">±{series.injectionTolerancePct}%</span></span>
      </div>
    </div>
  )
}

// ── coverage matrix ───────────────────────────────────────────────────────────

function CoverageMatrix() {
  const companies = [...new Set(hydroDocs.map((d) => d.company))]
  const fields    = [...new Set(hydroDocs.map((d) => d.fieldName))]

  return (
    <div className="overflow-x-auto rounded-md border border-border">
      <table className="w-full text-[11px] border-collapse min-w-[600px]">
        <thead>
          <tr className="border-b border-border bg-muted/30">
            <th className="text-left py-2 px-3 text-[10px] font-semibold text-muted-foreground uppercase">Месторождение</th>
            {DOC_TYPE_ORDER.map((t) => (
              <th key={t} className="py-2 px-2 text-[10px] font-semibold text-muted-foreground uppercase text-center whitespace-nowrap">
                {DOC_TYPE_LABELS[t]}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {fields.map((field) => {
            const fieldDocs = hydroDocs.filter((d) => d.fieldName === field)
            return (
              <tr key={field} className="border-b border-border/50 hover:bg-muted/10">
                <td className="py-2 px-3">
                  <span className="font-medium text-foreground">{field}</span>
                  <span className="block text-[10px] text-muted-foreground">
                    {fieldDocs[0]?.company}
                  </span>
                </td>
                {DOC_TYPE_ORDER.map((docType) => {
                  const doc = fieldDocs.find((d) => d.docType === docType)
                  if (!doc) return (
                    <td key={docType} className="py-2 px-2 text-center">
                      <span className="text-muted-foreground/30 text-xs">—</span>
                    </td>
                  )
                  return (
                    <td key={docType} className="py-2 px-2 text-center">
                      <StatusBadge severity={doc.status} showLabel={false} count={0} size="sm" />
                    </td>
                  )
                })}
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

// ── page ──────────────────────────────────────────────────────────────────────

type Tab = "docs" | "chart" | "coverage" | "cross"

export default function HydroPage() {
  const [tab, setTab] = useState<Tab>("docs")
  const [expandedDoc, setExpandedDoc] = useState<string | null>(null)
  const [filterType, setFilterType] = useState<HydroDocType | "all">("all")
  const [filterStatus, setFilterStatus] = useState<"all" | "critical" | "warning" | "ok">("all")
  const [selectedField, setSelectedField] = useState<string>(fieldWaterSeries[0].fieldId)

  const summary = getSummary()

  const filteredDocs = hydroDocs.filter((d) => {
    if (filterType !== "all" && d.docType !== filterType) return false
    if (filterStatus !== "all" && d.status !== filterStatus) return false
    return true
  })

  const waterSeries = fieldWaterSeries.find((f) => f.fieldId === selectedField) ?? fieldWaterSeries[0]

  const tabs: { key: Tab; label: string; icon: typeof FileText }[] = [
    { key: "docs",     label: "Документы",      icon: FileText },
    { key: "coverage", label: "Матрица покрытия", icon: BarChart3 },
    { key: "chart",    label: "Водопользование",  icon: Droplets },
    { key: "cross",    label: "Сверка объектов",  icon: Database },
  ]

  return (
    <AppShell>
      <div className="mb-5">
        <h2 className="text-base font-semibold text-foreground text-balance mb-0.5">
          Гидрогеология и водопользование
        </h2>
        <p className="text-[11px] text-muted-foreground leading-relaxed max-w-2xl">
          Контроль документального сопровождения гидрогеологических работ: подсчёты запасов, программы ПГИН, проекты размещения и захоронения подземных вод, технологические схемы водонасыщенных пластов (ППД), программы мониторинга.
        </p>
      </div>

      {/* Summary stat cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
        {[
          { label: "Всего документов", value: summary.total },
          { label: "Нарушений",        value: summary.critical, severity: "critical" as const },
          { label: "Предупреждений",   value: summary.warning,  severity: "warning"  as const },
          { label: "Актуальных",       value: summary.ok,       severity: "ok"       as const },
        ].map((s) => (
          <div key={s.label} className="rounded-md border border-border bg-card px-4 py-3">
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">{s.label}</p>
            <div className="flex items-end gap-2">
              <span className={`text-2xl font-semibold tabular-nums leading-none ${
                s.severity === "critical" ? "text-[oklch(0.72_0.18_25)]" :
                s.severity === "warning"  ? "text-[oklch(0.82_0.15_70)]" :
                s.severity === "ok"       ? "text-[oklch(0.62_0.18_145)]" : "text-foreground"
              }`}>{s.value}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-1 mb-5 border-b border-border">
        {tabs.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`flex items-center gap-1.5 px-3 py-2 text-xs font-medium transition-colors border-b-2 -mb-px ${
              tab === key
                ? "border-primary text-foreground"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            <Icon className="size-3" />
            {label}
          </button>
        ))}
      </div>

      {/* ── Docs tab ── */}
      {tab === "docs" && (
        <div className="space-y-4">
          {/* Filters */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex flex-wrap gap-1.5">
              <button
                onClick={() => setFilterType("all")}
                className={`text-[10px] px-2 py-1 rounded border transition-colors ${filterType === "all" ? "border-primary/60 bg-primary/10 text-primary" : "border-border text-muted-foreground hover:border-muted-foreground/50"}`}
              >
                Все типы
              </button>
              {DOC_TYPE_ORDER.map((t) => (
                <button
                  key={t}
                  onClick={() => setFilterType(t)}
                  className={`text-[10px] px-2 py-1 rounded border transition-colors ${filterType === t ? "border-primary/60 bg-primary/10 text-primary" : "border-border text-muted-foreground hover:border-muted-foreground/50"}`}
                >
                  {DOC_TYPE_LABELS[t]}
                </button>
              ))}
            </div>
            <div className="flex gap-1.5 ml-auto">
              {(["all", "critical", "warning", "ok"] as const).map((s) => (
                <button
                  key={s}
                  onClick={() => setFilterStatus(s)}
                  className={`text-[10px] px-2 py-1 rounded border transition-colors ${filterStatus === s ? "border-primary/60 bg-primary/10 text-primary" : "border-border text-muted-foreground hover:border-muted-foreground/50"}`}
                >
                  {s === "all" ? "Все" : s === "critical" ? "Нарушения" : s === "warning" ? "Предупр." : "Актуальные"}
                </button>
              ))}
            </div>
          </div>

          {/* Group by type */}
          {DOC_TYPE_ORDER.filter((t) => filterType === "all" || filterType === t).map((docType) => {
            const docs = filteredDocs.filter((d) => d.docType === docType)
            if (!docs.length) return null
            return (
              <div key={docType}>
                <h3 className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                  {DOC_TYPE_LABELS[docType]}
                  <span className="ml-2 font-normal">({docs.length})</span>
                </h3>
                <div className="space-y-2">
                  {docs.map((doc) => (
                    <DocCard
                      key={doc.id}
                      doc={doc}
                      expanded={expandedDoc === doc.id}
                      onToggle={() => setExpandedDoc(expandedDoc === doc.id ? null : doc.id)}
                    />
                  ))}
                </div>
              </div>
            )
          })}

          {filteredDocs.length === 0 && (
            <div className="text-center py-12 text-muted-foreground text-sm">
              Документы не найдены
            </div>
          )}
        </div>
      )}

      {/* ── Coverage matrix tab ── */}
      {tab === "coverage" && (
        <div className="space-y-4">
          <p className="text-[11px] text-muted-foreground leading-relaxed">
            Статус гидрогеологического документального покрытия по каждому месторождению и типу документа.
          </p>
          <div className="flex flex-wrap gap-3 text-[10px]">
            {(["ok", "warning", "critical"] as const).map((s) => (
              <span key={s} className="flex items-center gap-1.5 text-muted-foreground">
                <StatusBadge severity={s} showLabel={false} count={0} size="sm" />
                {s === "ok" ? "Актуален" : s === "warning" ? "Внимание" : "Нарушение / просрочен"}
              </span>
            ))}
          </div>
          <CoverageMatrix />
        </div>
      )}

      {/* ── Water usage chart tab ── */}
      {tab === "chart" && (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[11px] text-muted-foreground">Месторождение:</span>
            {fieldWaterSeries.map((f) => (
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
          <WaterChart series={waterSeries} />
        </div>
      )}

      {/* ── Cross-check tab ── */}
      {tab === "cross" && (
        <MasterfileCrossCheck module="hydro" />
      )}
    </AppShell>
  )
}
