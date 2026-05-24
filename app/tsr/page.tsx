"use client"

import { AppShell } from "@/components/app-shell"
import { StatusBadge, StatusDot } from "@/components/status-badge"
import { MasterfileCrossCheck } from "@/components/masterfile-cross-check"
import { ProductionChart } from "@/components/production-chart"
import { tsrIndicators, tsrResearchPrograms } from "@/lib/mock-data"
import { useState } from "react"
import { TrendingUp, TrendingDown, Minus, FlaskConical, Database, BarChart3 } from "lucide-react"

function DeviationCell({ dev, controlled }: { dev: number; controlled: boolean }) {
  const abs = Math.abs(dev)
  const isOver = dev > 0
  const severity = abs > 10 ? "critical" : abs > 3 ? "warning" : "ok"
  const colorClass =
    severity === "critical"
      ? "text-[oklch(0.72_0.18_25)]"
      : severity === "warning"
      ? "text-[oklch(0.82_0.15_70)]"
      : "text-[oklch(0.72_0.15_145)]"
  const Icon = abs < 1 ? Minus : isOver ? TrendingUp : TrendingDown

  return (
    <span className={`inline-flex items-center gap-1 font-mono ${colorClass}`}>
      <Icon className="size-3" />
      {dev > 0 ? "+" : ""}
      {dev.toFixed(1)}%
      {controlled && abs > 3 && (
        <span className="ml-1 text-[9px] px-1 py-0.5 rounded bg-current/10">контр.</span>
      )}
    </span>
  )
}

export default function TsrPage() {
  const [tab, setTab] = useState<"main" | "chart" | "cross">("main")
  const [innerTab, setInnerTab] = useState<"indicators" | "research">("indicators")

  const criticalCount = tsrIndicators.filter((i) => i.status === "critical").length
  const warningCount = tsrIndicators.filter((i) => i.status === "warning").length
  const researchCritical = tsrResearchPrograms.filter((p) => p.status === "critical").length

  return (
    <AppShell>
      <div className="mb-5">
        <h2 className="text-base font-semibold text-foreground text-balance mb-0.5">
          Технологические схемы разработки / Госплан
        </h2>
        <p className="text-[11px] text-muted-foreground leading-relaxed max-w-2xl">
          Сравнение фактических показателей добычи с плановыми значениями ТСР. Контролируемые показатели: добыча нефти, утилизация ПНГ. Дополнительные: жидкость, вода, ГДИ.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-5 border-b border-border">
        <button onClick={() => setTab("main")} className={`px-3 py-2 text-xs font-medium transition-colors border-b-2 -mb-px ${tab === "main" ? "border-primary text-foreground" : "border-transparent text-muted-foreground hover:text-foreground"}`}>
          Показатели
        </button>
        <button onClick={() => setTab("chart")} className={`flex items-center gap-1.5 px-3 py-2 text-xs font-medium transition-colors border-b-2 -mb-px ${tab === "chart" ? "border-primary text-foreground" : "border-transparent text-muted-foreground hover:text-foreground"}`}>
          <BarChart3 className="size-3" /> График по месяцам
        </button>
        <button onClick={() => setTab("cross")} className={`flex items-center gap-1.5 px-3 py-2 text-xs font-medium transition-colors border-b-2 -mb-px ${tab === "cross" ? "border-primary text-foreground" : "border-transparent text-muted-foreground hover:text-foreground"}`}>
          <Database className="size-3" /> Сверка с мастерфайлом
        </button>
      </div>

      {tab === "chart" && <ProductionChart />}
      {tab === "cross" && <MasterfileCrossCheck module="tsr" />}
      {tab === "main" && (<>

      {/* Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
        {[
          { label: "Показателей", value: tsrIndicators.length },
          { label: "Критических", value: criticalCount, severity: "critical" as const },
          { label: "Предупреждений", value: warningCount, severity: "warning" as const },
          { label: "Нарушений ПИР", value: researchCritical, severity: researchCritical > 0 ? "critical" as const : "ok" as const },
        ].map((s) => (
          <div key={s.label} className="rounded-md border border-border bg-card px-4 py-3">
            <div className="flex items-center gap-2 mb-1">
              {s.severity && <StatusDot severity={s.severity} />}
              <span className="text-[11px] text-muted-foreground">{s.label}</span>
            </div>
            <span className="text-2xl font-bold font-mono text-foreground">{s.value}</span>
          </div>
        ))}
      </div>

      {/* Tabs (inner) */}
      <div className="flex gap-1 mb-4 border-b border-border">
        {(["indicators", "research"] as const).map((t) => (
          <button key={t} onClick={() => setInnerTab(t)}
            className={`px-3 py-2 text-xs font-medium transition-colors border-b-2 -mb-px ${innerTab === t ? "border-primary text-foreground" : "border-transparent text-muted-foreground hover:text-foreground"}`}>
            {t === "indicators" ? "Показатели ТСР" : "Программа исследовательских работ"}
          </button>
        ))}
      </div>

      {innerTab === "indicators" && (
        <div className="rounded-md border border-border bg-card overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="text-left px-3 py-2.5 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider whitespace-nowrap">Компания / М-е</th>
                <th className="text-left px-3 py-2.5 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider whitespace-nowrap">Показатель</th>
                <th className="text-left px-3 py-2.5 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider whitespace-nowrap">Тип</th>
                <th className="text-right px-3 py-2.5 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider whitespace-nowrap">План ТСР</th>
                <th className="text-right px-3 py-2.5 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider whitespace-nowrap">Факт (НГ)</th>
                <th className="text-right px-3 py-2.5 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider whitespace-nowrap">Откл., %</th>
                <th className="text-left px-3 py-2.5 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider whitespace-nowrap">Документ ТСР</th>
                <th className="text-left px-3 py-2.5 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Статус</th>
              </tr>
            </thead>
            <tbody>
              {tsrIndicators.map((row, idx) => (
                <tr
                  key={row.id}
                  className={`border-b border-border/50 hover:bg-muted/20 transition-colors ${idx % 2 === 0 ? "" : "bg-muted/10"}`}
                >
                  <td className="px-3 py-2.5 whitespace-nowrap">
                    <div className="text-foreground">{row.company}</div>
                    <div className="text-[10px] text-muted-foreground">{row.field}</div>
                  </td>
                  <td className="px-3 py-2.5 font-medium text-foreground whitespace-nowrap">{row.indicator}</td>
                  <td className="px-3 py-2.5 whitespace-nowrap">
                    <span className={`text-[10px] px-1.5 py-0.5 rounded font-semibold ${
                      row.controlled
                        ? "bg-[oklch(0.52_0.22_25/0.15)] text-[oklch(0.72_0.18_25)]"
                        : "bg-muted/40 text-muted-foreground"
                    }`}>
                      {row.controlled ? "контр." : "доп."}
                    </span>
                  </td>
                  <td className="px-3 py-2.5 text-right font-mono text-muted-foreground whitespace-nowrap">
                    {row.planTsr.toLocaleString("ru-RU")} {row.unit}
                  </td>
                  <td className="px-3 py-2.5 text-right font-mono text-foreground whitespace-nowrap">
                    {row.factYtd.toLocaleString("ru-RU")} {row.unit}
                  </td>
                  <td className="px-3 py-2.5 text-right whitespace-nowrap">
                    <DeviationCell dev={row.deviation} controlled={row.controlled} />
                  </td>
                  <td className="px-3 py-2.5 text-muted-foreground font-mono text-[10px] whitespace-nowrap">{row.tsrDoc}</td>
                  <td className="px-3 py-2.5 whitespace-nowrap">
                    <StatusBadge severity={row.status} showLabel size="sm" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {innerTab === "research" && (
        <div className="rounded-md border border-border bg-card overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="text-left px-3 py-2.5 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider whitespace-nowrap">Компания / М-е</th>
                <th className="text-left px-3 py-2.5 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Вид работ</th>
                <th className="text-left px-3 py-2.5 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider whitespace-nowrap">Плановый объём</th>
                <th className="text-left px-3 py-2.5 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider whitespace-nowrap">Фактический объём</th>
                <th className="text-left px-3 py-2.5 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Комментарий</th>
                <th className="text-left px-3 py-2.5 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Статус</th>
              </tr>
            </thead>
            <tbody>
              {tsrResearchPrograms.map((row, idx) => (
                <tr
                  key={row.id}
                  className={`border-b border-border/50 hover:bg-muted/20 transition-colors ${idx % 2 === 0 ? "" : "bg-muted/10"}`}
                >
                  <td className="px-3 py-2.5 whitespace-nowrap">
                    <div className="text-foreground">{row.company}</div>
                    <div className="text-[10px] text-muted-foreground">{row.field}</div>
                  </td>
                  <td className="px-3 py-2.5">
                    <div className="flex items-center gap-2">
                      <FlaskConical className="size-3 text-muted-foreground flex-shrink-0" />
                      <span className="text-foreground">{row.workType}</span>
                    </div>
                  </td>
                  <td className="px-3 py-2.5 font-mono text-muted-foreground whitespace-nowrap">{row.plannedQ}</td>
                  <td className="px-3 py-2.5 font-mono text-foreground whitespace-nowrap">{row.actualQ}</td>
                  <td className="px-3 py-2.5 text-muted-foreground max-w-xs">{row.comment}</td>
                  <td className="px-3 py-2.5 whitespace-nowrap">
                    <StatusBadge severity={row.status} showLabel size="sm" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      </>)}
    </AppShell>
  )
}
