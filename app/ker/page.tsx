"use client"

import { AppShell } from "@/components/app-shell"
import { StatusBadge, StatusDot } from "@/components/status-badge"
import { MasterfileCrossCheck } from "@/components/masterfile-cross-check"
import { ProductionChart } from "@/components/production-chart"
import { kerEmissionSources, emissionProtocols, type EmissionProtocol } from "@/lib/mock-data"
import { useState } from "react"
import { Leaf, Wind, AlertTriangle, Database, BarChart3, FileText, ExternalLink, FlaskConical } from "lucide-react"
import { cn } from "@/lib/utils"

function ExceedBar({ limit, fact, projected }: { limit: number; fact: number; projected: number }) {
  const max = Math.max(limit * 1.5, projected * 1.1)
  const factPct = Math.min((fact / max) * 100, 100)
  const projPct = Math.min((projected / max) * 100, 100)
  const limitPct = Math.min((limit / max) * 100, 100)

  return (
    <div className="w-full">
      <div className="relative h-3 bg-muted/30 rounded-sm overflow-visible">
        {/* Projected bar (background) */}
        <div
          className="absolute top-0 left-0 h-full rounded-sm bg-[oklch(0.72_0.18_70/0.25)]"
          style={{ width: `${projPct}%` }}
        />
        {/* Fact bar */}
        <div
          className={`absolute top-0 left-0 h-full rounded-sm ${fact > limit ? "bg-[oklch(0.52_0.22_25/0.8)]" : "bg-[oklch(0.62_0.18_145/0.7)]"}`}
          style={{ width: `${factPct}%` }}
        />
        {/* Limit line */}
        <div
          className="absolute top-0 h-full w-px bg-white/60"
          style={{ left: `${limitPct}%` }}
        />
      </div>
      <div className="flex justify-between text-[9px] text-muted-foreground mt-0.5 font-mono">
        <span>факт: {fact.toFixed(1)}</span>
        <span className="text-muted-foreground/60">пред: {limit.toFixed(1)}</span>
      </div>
    </div>
  )
}

// ── Emission Compositions Tab ─────────────────────────────────────────────────

const SOURCE_TYPE_ICON: Record<EmissionProtocol["sourceType"], React.ElementType> = {
  flare: Wind, compressor: Wind, separator: Leaf, tank: Leaf,
}

function PollutantBar({ ratio, substance }: { ratio: number; substance: string }) {
  const pct = Math.min(ratio * 100, 130)
  const isOver = ratio > 1
  const isWarn = ratio > 0.8 && ratio <= 1
  return (
    <div className="flex items-center gap-2 min-w-0">
      <span className="text-[10px] font-mono text-muted-foreground w-10 flex-shrink-0">{substance}</span>
      <div className="flex-1 relative h-2 rounded-full bg-muted overflow-hidden">
        <div
          className={cn("absolute top-0 left-0 h-full rounded-full transition-all",
            isOver ? "bg-destructive" : isWarn ? "bg-yellow-500" : "bg-green-500"
          )}
          style={{ width: `${Math.min(pct, 100)}%` }}
        />
        {isOver && (
          <div className="absolute top-0 right-0 h-full w-1 bg-destructive/40 rounded-full" />
        )}
      </div>
      <span className={cn("text-[10px] font-mono w-8 text-right flex-shrink-0",
        isOver ? "text-destructive font-semibold" : isWarn ? "text-yellow-600" : "text-muted-foreground"
      )}>
        {(ratio * 100).toFixed(0)}%
      </span>
    </div>
  )
}

function EmissionCompositionsTab() {
  const [quarterFilter, setQuarterFilter] = useState<"all" | "Q3-2025" | "Q4-2025" | "Q1-2026">("all")
  const [fieldFilter, setFieldFilter] = useState<string>("all")

  const fields = ["all", ...Array.from(new Set(emissionProtocols.map((p) => p.fieldName)))]

  const filtered = emissionProtocols.filter((p) => {
    if (quarterFilter !== "all" && p.quarter !== quarterFilter) return false
    if (fieldFilter !== "all" && p.fieldName !== fieldFilter) return false
    return true
  })

  // Count exceedances
  const exceedCount = filtered.filter((p) => p.pollutants.some((pl) => pl.ratio > 1)).length

  return (
    <div>
      <p className="text-sm text-muted-foreground mb-4">
        Ежеквартальные протоколы определения составов выбросов по источникам НВОС.
        Для каждого протокола — концентрации загрязняющих веществ и сравнение с нормативом ПДВ (разовый максимум, мг/м³).
      </p>

      {/* Summary strip */}
      <div className="flex items-center gap-4 mb-4 p-3 rounded-lg bg-muted/50 border border-border text-xs">
        <span className="text-muted-foreground">Протоколов: <span className="font-semibold text-foreground">{filtered.length}</span></span>
        <span className="text-muted-foreground">Источников: <span className="font-semibold text-foreground">{new Set(filtered.map((p) => p.source)).size}</span></span>
        {exceedCount > 0
          ? <span className="flex items-center gap-1 text-destructive font-semibold">
              <AlertTriangle className="size-3" /> {exceedCount} протокола с превышением ПДВ
            </span>
          : <span className="text-green-700 font-medium">Превышений ПДВ не зафиксировано</span>
        }
      </div>

      {/* Filters */}
      <div className="flex items-center gap-2 mb-4 flex-wrap">
        <span className="text-xs text-muted-foreground">Квартал:</span>
        {(["all", "Q3-2025", "Q4-2025", "Q1-2026"] as const).map((q) => (
          <button key={q} onClick={() => setQuarterFilter(q)}
            className={cn("px-2.5 py-1 text-xs rounded border transition-colors",
              quarterFilter === q ? "bg-primary text-primary-foreground border-primary" : "bg-card text-muted-foreground border-border hover:border-primary/50"
            )}>
            {q === "all" ? "Все кварталы" : q}
          </button>
        ))}
        <div className="h-4 w-px bg-border" />
        <span className="text-xs text-muted-foreground">Месторождение:</span>
        <select value={fieldFilter} onChange={(e) => setFieldFilter(e.target.value)}
          className="text-xs border border-border rounded px-2 py-1 bg-card text-foreground focus:outline-none focus:ring-1 focus:ring-ring">
          {fields.map((f) => <option key={f} value={f}>{f === "all" ? "Все месторождения" : f}</option>)}
        </select>
      </div>

      {/* Protocol cards */}
      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
        {filtered.map((protocol) => {
          const SourceIcon = SOURCE_TYPE_ICON[protocol.sourceType]
          const hasExceed = protocol.pollutants.some((p) => p.ratio > 1)
          return (
            <div key={protocol.id}
              className={cn("rounded-lg border bg-card p-4 flex flex-col gap-3",
                hasExceed ? "border-destructive/40 bg-destructive/5" : "border-border"
              )}>
              {/* Header */}
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <div className={cn("flex-shrink-0 flex items-center justify-center size-7 rounded",
                    hasExceed ? "bg-destructive/10 text-destructive" : "bg-muted text-muted-foreground"
                  )}>
                    <SourceIcon className="size-3.5" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-sm font-medium text-foreground truncate">{protocol.source}</div>
                    <div className="text-[10px] text-muted-foreground">{protocol.fieldName} · {protocol.company.slice(0, 20)}</div>
                  </div>
                </div>
                {hasExceed && (
                  <span className="flex-shrink-0 flex items-center gap-0.5 text-[10px] font-semibold text-destructive bg-destructive/10 border border-destructive/20 px-1.5 py-0.5 rounded-full">
                    <AlertTriangle className="size-2.5" /> Превышение
                  </span>
                )}
              </div>

              {/* Meta */}
              <div className="flex items-center gap-3 text-[10px] text-muted-foreground">
                <span className="font-mono font-medium text-foreground">{protocol.quarter}</span>
                <span>от {protocol.date}</span>
                <a href={`#${protocol.docRef}`}
                  className="ml-auto flex items-center gap-1 text-primary hover:underline">
                  <FileText className="size-3" />
                  {protocol.docRef}
                  <ExternalLink className="size-2.5" />
                </a>
              </div>

              {/* Pollutant bars */}
              <div className="space-y-1.5 pt-1 border-t border-border/50">
                {protocol.pollutants.map((pl) => (
                  <div key={pl.substance} className="flex items-center gap-1.5">
                    <PollutantBar ratio={pl.ratio} substance={pl.substance} />
                    <span className="text-[10px] font-mono text-muted-foreground flex-shrink-0 w-24 text-right">
                      {pl.measured} / {pl.limitPdv} {pl.unit}
                    </span>
                  </div>
                ))}
              </div>

              {/* Legend */}
              <div className="text-[9px] text-muted-foreground/70 pt-0.5 border-t border-border/30">
                Бар — % от ПДВ мг/м³ · красный = превышение норматива
              </div>
            </div>
          )
        })}
      </div>

      {filtered.length === 0 && (
        <div className="flex items-center justify-center py-16 text-muted-foreground border border-dashed border-border rounded-lg text-sm">
          Нет протоколов по выбранным фильтрам
        </div>
      )}
    </div>
  )
}

export default function KerPage() {
  const [tab, setTab] = useState<"main" | "compositions" | "chart" | "cross">("main")
  const [filter, setFilter] = useState<"all" | "critical" | "warning" | "ok">("all")
  const [typeFilter, setTypeFilter] = useState<"all" | "flare" | "stationary">("all")

  const filtered = kerEmissionSources.filter((k) => {
    if (filter !== "all" && k.status !== filter) return false
    if (typeFilter === "flare" && k.sourceType !== "flare") return false
    if (typeFilter === "stationary" && k.sourceType !== "stationary") return false
    return true
  })

  const critical = kerEmissionSources.filter((k) => k.status === "critical").length
  const warning = kerEmissionSources.filter((k) => k.status === "warning").length
  const ok = kerEmissionSources.filter((k) => k.status === "ok").length
  const flares = kerEmissionSources.filter((k) => k.sourceType === "flare").length

  return (
    <AppShell>
      <div className="mb-5">
        <h2 className="text-base font-semibold text-foreground text-balance mb-0.5">
          Комплексные экологические разрешения (КЭР)
        </h2>
        <p className="text-[11px] text-muted-foreground leading-relaxed max-w-2xl">
          Контроль наличия КЭР и соответствия фактических выбросов загрязняющих веществ нормативам, установленным в КЭР. Особый контроль — факельные установки. Превышение нормативов — серьёзное нарушение.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-5 border-b border-border">
        <button onClick={() => setTab("main")} className={`px-3 py-2 text-xs font-medium transition-colors border-b-2 -mb-px ${tab === "main" ? "border-primary text-foreground" : "border-transparent text-muted-foreground hover:text-foreground"}`}>Источники выбросов</button>
        <button onClick={() => setTab("compositions")} className={`flex items-center gap-1.5 px-3 py-2 text-xs font-medium transition-colors border-b-2 -mb-px ${tab === "compositions" ? "border-primary text-foreground" : "border-transparent text-muted-foreground hover:text-foreground"}`}><FlaskConical className="size-3" /> Составы выбросов</button>
        <button onClick={() => setTab("chart")} className={`flex items-center gap-1.5 px-3 py-2 text-xs font-medium transition-colors border-b-2 -mb-px ${tab === "chart" ? "border-primary text-foreground" : "border-transparent text-muted-foreground hover:text-foreground"}`}><BarChart3 className="size-3" /> График по месяцам</button>
        <button onClick={() => setTab("cross")} className={`flex items-center gap-1.5 px-3 py-2 text-xs font-medium transition-colors border-b-2 -mb-px ${tab === "cross" ? "border-primary text-foreground" : "border-transparent text-muted-foreground hover:text-foreground"}`}><Database className="size-3" /> Сверка с мастерфайлом</button>
      </div>
      {tab === "chart" && <ProductionChart />}
      {tab === "cross" && <MasterfileCrossCheck module="ker" />}
      {tab === "compositions" && <EmissionCompositionsTab />}
      {tab === "main" && (<>

      {/* Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
        {[
          { label: "Источников выбросов", value: kerEmissionSources.length },
          { label: "Превышение нормативов", value: critical, severity: "critical" as const },
          { label: "Прогноз превышения", value: warning, severity: "warning" as const },
          { label: "Факельных установок", value: flares },
        ].map((s) => (
          <div key={s.label} className="rounded-md border border-border bg-card px-4 py-3">
            <div className="flex items-center gap-2 mb-1">
              {"severity" in s && s.severity && <StatusDot severity={s.severity} />}
              <span className="text-[11px] text-muted-foreground">{s.label}</span>
            </div>
            <span className="text-2xl font-bold font-mono text-foreground">{s.value}</span>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2 mb-4">
        <span className="text-[11px] text-muted-foreground mr-1">Статус:</span>
        {(["all", "critical", "warning", "ok"] as const).map((f) => (
          <button key={f} onClick={() => setFilter(f)}
            className={`text-[11px] px-2.5 py-1 rounded border transition-colors font-mono ${filter === f ? "border-primary/60 bg-primary/10 text-primary" : "border-border text-muted-foreground hover:border-muted-foreground/50"}`}>
            {f === "all" ? "Все" : f === "critical" ? "Превышение" : f === "warning" ? "Прогноз" : "Норма"}
          </button>
        ))}
        <span className="text-[11px] text-muted-foreground ml-4 mr-1">Источник:</span>
        {(["all", "flare", "stationary"] as const).map((t) => (
          <button key={t} onClick={() => setTypeFilter(t)}
            className={`text-[11px] px-2.5 py-1 rounded border transition-colors font-mono ${typeFilter === t ? "border-primary/60 bg-primary/10 text-primary" : "border-border text-muted-foreground hover:border-muted-foreground/50"}`}>
            {t === "all" ? "Все" : t === "flare" ? "Факельные уст." : "Стационарные"}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="rounded-md border border-border bg-card overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-border bg-muted/30">
              <th className="text-left px-3 py-2.5 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Источник выброса</th>
              <th className="text-left px-3 py-2.5 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider whitespace-nowrap">Компания / М-е</th>
              <th className="text-left px-3 py-2.5 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Загрязняющее в-во</th>
              <th className="text-right px-3 py-2.5 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider whitespace-nowrap">Норматив КЭР, т/г</th>
              <th className="text-right px-3 py-2.5 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider whitespace-nowrap">Факт НГ, т</th>
              <th className="text-right px-3 py-2.5 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider whitespace-nowrap">Прогноз г., т</th>
              <th className="text-left px-3 py-2.5 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider min-w-[120px]">Заполненность</th>
              <th className="text-left px-3 py-2.5 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Статус</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((row, idx) => (
              <tr key={row.id} className={`border-b border-border/50 hover:bg-muted/20 transition-colors ${idx % 2 === 0 ? "" : "bg-muted/10"}`}>
                <td className="px-3 py-2.5">
                  <div className="flex items-center gap-2">
                    {row.sourceType === "flare"
                      ? <Wind className="size-3 text-[oklch(0.72_0.18_70)] flex-shrink-0" />
                      : <Leaf className="size-3 text-muted-foreground flex-shrink-0" />
                    }
                    <div>
                      <div className="text-foreground">{row.sourceName}</div>
                      <div className="text-[10px] text-muted-foreground">{row.sourceTypeLabel}</div>
                    </div>
                  </div>
                </td>
                <td className="px-3 py-2.5 whitespace-nowrap">
                  <div className="text-foreground">{row.company}</div>
                  <div className="text-[10px] text-muted-foreground">{row.field}</div>
                </td>
                <td className="px-3 py-2.5 text-muted-foreground max-w-[140px]">{row.pollutant}</td>
                <td className="px-3 py-2.5 text-right font-mono text-muted-foreground whitespace-nowrap">{row.limitTonYear.toFixed(1)}</td>
                <td className={`px-3 py-2.5 text-right font-mono font-semibold whitespace-nowrap ${row.factYtd > row.limitTonYear ? "text-[oklch(0.72_0.18_25)]" : "text-foreground"}`}>
                  {row.factYtd.toFixed(1)}
                </td>
                <td className={`px-3 py-2.5 text-right font-mono whitespace-nowrap ${row.projectedYear > row.limitTonYear ? "text-[oklch(0.82_0.15_70)]" : "text-muted-foreground"}`}>
                  {row.projectedYear.toFixed(1)}
                </td>
                <td className="px-3 py-2.5 min-w-[120px]">
                  <ExceedBar limit={row.limitTonYear} fact={row.factYtd} projected={row.projectedYear} />
                </td>
                <td className="px-3 py-2.5">
                  <div className="flex flex-col gap-1">
                    <StatusBadge severity={row.status} showLabel size="sm" />
                    {row.status !== "ok" && (
                      <span className="text-[10px] text-muted-foreground flex items-start gap-1 max-w-[140px]">
                        <AlertTriangle className="size-3 flex-shrink-0 mt-0.5 text-[oklch(0.72_0.18_70)]" />
                        {row.exceedance > 0 && `+${row.exceedance.toFixed(1)}%`}
                      </span>
                    )}
                  </div>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr><td colSpan={8} className="px-3 py-8 text-center text-muted-foreground">Нет записей</td></tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="mt-3 flex items-center gap-4 text-[10px] text-muted-foreground">
        <div className="flex items-center gap-1.5"><span className="inline-block w-3 h-2 rounded-sm bg-[oklch(0.52_0.22_25/0.8)]" /> Факт (превышение)</div>
        <div className="flex items-center gap-1.5"><span className="inline-block w-3 h-2 rounded-sm bg-[oklch(0.62_0.18_145/0.7)]" /> Факт (норма)</div>
        <div className="flex items-center gap-1.5"><span className="inline-block w-3 h-2 rounded-sm bg-[oklch(0.72_0.18_70/0.25)]" /> Прогноз год</div>
        <div className="flex items-center gap-1.5"><span className="inline-block w-px h-3 bg-white/60" /> Предельное значение</div>
      </div>
      </>)}
    </AppShell>
  )
}
