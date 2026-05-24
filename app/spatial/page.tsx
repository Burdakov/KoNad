"use client"

import { AppShell } from "@/components/app-shell"
import { StatusBadge, StatusDot } from "@/components/status-badge"
import { MasterfileCrossCheck } from "@/components/masterfile-cross-check"
import { SpatialMap } from "@/components/spatial-map"
import { spatialChecks, type SpatialCheck } from "@/lib/mock-data"
import { useState } from "react"
import { MapPin, Database, Map } from "lucide-react"

const checkTypeColors: Record<SpatialCheck["checkType"], string> = {
  reserves: "text-[oklch(0.65_0.15_210)] bg-[oklch(0.65_0.15_210/0.12)]",
  mining: "text-[oklch(0.72_0.18_70)] bg-[oklch(0.72_0.18_70/0.12)]",
  land: "text-[oklch(0.62_0.18_145)] bg-[oklch(0.62_0.18_145/0.12)]",
}
const checkTypeLabel: Record<SpatialCheck["checkType"], string> = {
  reserves: "Контур запасов",
  mining: "Горный отвод",
  land: "Земельный отвод",
}

const summaryStats = [
  { label: "Всего проверок", value: spatialChecks.length },
  { label: "Критических", value: spatialChecks.filter((c) => c.status === "critical").length, severity: "critical" as const },
  { label: "Предупреждений", value: spatialChecks.filter((c) => c.status === "warning").length, severity: "warning" as const },
  { label: "В норме", value: spatialChecks.filter((c) => c.status === "ok").length, severity: "ok" as const },
]

export default function SpatialPage() {
  const [tab, setTab] = useState<"map" | "main" | "cross">("map")
  const [filter, setFilter] = useState<"all" | SpatialCheck["status"]>("all")
  const [typeFilter, setTypeFilter] = useState<"all" | SpatialCheck["checkType"]>("all")

  const filtered = spatialChecks.filter((c) => {
    if (filter !== "all" && c.status !== filter) return false
    if (typeFilter !== "all" && c.checkType !== typeFilter) return false
    return true
  })

  return (
    <AppShell>
      <div className="mb-5">
        <h2 className="text-base font-semibold text-foreground text-balance mb-0.5">
          Пространственные проверки
        </h2>
        <p className="text-[11px] text-muted-foreground leading-relaxed max-w-2xl">
          Сравнение координат забоев и стволов скважин с контурами запасов промышленных категорий, границами горных отводов (ПРГР) и земельных отводов.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-5 border-b border-border">
        <button onClick={() => setTab("map")} className={`flex items-center gap-1.5 px-3 py-2 text-xs font-medium transition-colors border-b-2 -mb-px ${tab === "map" ? "border-primary text-foreground" : "border-transparent text-muted-foreground hover:text-foreground"}`}>
          <Map className="size-3" /> Карта
        </button>
        <button onClick={() => setTab("main")} className={`px-3 py-2 text-xs font-medium transition-colors border-b-2 -mb-px ${tab === "main" ? "border-primary text-foreground" : "border-transparent text-muted-foreground hover:text-foreground"}`}>
          Нарушения
        </button>
        <button onClick={() => setTab("cross")} className={`flex items-center gap-1.5 px-3 py-2 text-xs font-medium transition-colors border-b-2 -mb-px ${tab === "cross" ? "border-primary text-foreground" : "border-transparent text-muted-foreground hover:text-foreground"}`}>
          <Database className="size-3" /> Сверка с мастерфайлом
        </button>
      </div>

      {tab === "map" && <SpatialMap />}
      {tab === "cross" && <MasterfileCrossCheck module="spatial" />}
      {tab === "main" && (<>

      {/* Summary row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
        {summaryStats.map((s) => (
          <div key={s.label} className="rounded-md border border-border bg-card px-4 py-3">
            <div className="flex items-center gap-2 mb-1">
              {s.severity && <StatusDot severity={s.severity} />}
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
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`text-[11px] px-2.5 py-1 rounded border transition-colors font-mono ${
              filter === f
                ? "border-primary/60 bg-primary/10 text-primary"
                : "border-border text-muted-foreground hover:border-muted-foreground/50"
            }`}
          >
            {f === "all" ? "Все" : f === "critical" ? "Критичные" : f === "warning" ? "Предупреждения" : "Норма"}
          </button>
        ))}
        <span className="text-[11px] text-muted-foreground ml-4 mr-1">Тип:</span>
        {(["all", "reserves", "mining", "land"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTypeFilter(t)}
            className={`text-[11px] px-2.5 py-1 rounded border transition-colors font-mono ${
              typeFilter === t
                ? "border-primary/60 bg-primary/10 text-primary"
                : "border-border text-muted-foreground hover:border-muted-foreground/50"
            }`}
          >
            {t === "all" ? "Все" : checkTypeLabel[t]}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="rounded-md border border-border bg-card overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-border bg-muted/30">
              <th className="text-left px-3 py-2.5 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider whitespace-nowrap">Скважина</th>
              <th className="text-left px-3 py-2.5 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider whitespace-nowrap">Компания / М-е</th>
              <th className="text-left px-3 py-2.5 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider whitespace-nowrap">Вид проверки</th>
              <th className="text-left px-3 py-2.5 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider whitespace-nowrap">Превышение</th>
              <th className="text-left px-3 py-2.5 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider whitespace-nowrap">Дата обнаружения</th>
              <th className="text-left px-3 py-2.5 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Описание нарушения</th>
              <th className="text-left px-3 py-2.5 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider whitespace-nowrap">Статус</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((row, idx) => (
              <tr
                key={row.id}
                className={`border-b border-border/50 transition-colors hover:bg-muted/20 ${idx % 2 === 0 ? "" : "bg-muted/10"}`}
              >
                <td className="px-3 py-2.5">
                  <div className="flex items-center gap-2">
                    <MapPin className="size-3 text-muted-foreground flex-shrink-0" />
                    <span className="font-mono text-foreground whitespace-nowrap">{row.wellName}</span>
                  </div>
                </td>
                <td className="px-3 py-2.5 whitespace-nowrap">
                  <div className="text-foreground">{row.company}</div>
                  <div className="text-[10px] text-muted-foreground">{row.field}</div>
                </td>
                <td className="px-3 py-2.5 whitespace-nowrap">
                  <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold ${checkTypeColors[row.checkType]}`}>
                    {checkTypeLabel[row.checkType]}
                  </span>
                  <div className="text-[10px] text-muted-foreground mt-0.5">{row.checkTypeLabel}</div>
                </td>
                <td className="px-3 py-2.5 font-mono whitespace-nowrap">
                  {row.deviation != null ? (
                    <span className={row.status === "critical" ? "text-[oklch(0.72_0.18_25)]" : row.status === "warning" ? "text-[oklch(0.82_0.15_70)]" : "text-[oklch(0.72_0.15_145)]"}>
                      {row.deviation} м
                    </span>
                  ) : (
                    <span className="text-[oklch(0.72_0.15_145)]">—</span>
                  )}
                </td>
                <td className="px-3 py-2.5 text-muted-foreground font-mono whitespace-nowrap text-[10px]">{row.detectedAt}</td>
                <td className="px-3 py-2.5 text-muted-foreground max-w-xs">{row.comment}</td>
                <td className="px-3 py-2.5 whitespace-nowrap">
                  <StatusBadge severity={row.status} showLabel size="sm" />
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={7} className="px-3 py-8 text-center text-muted-foreground text-xs">Нет записей по выбранным фильтрам</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Info block */}
      <div className="mt-4 p-3 rounded-md border border-border bg-card/50">
        <p className="text-[11px] text-muted-foreground leading-relaxed">
          <span className="text-foreground font-medium">Методология:</span> Координаты забоев скважин и инклинометрические данные стволов сравниваются с актуализированными векторными контурами из подсчётных планов. Горные отводы — по ПРГР, утверждённым в Роснедра. Земельные отводы — по загруженным договорам аренды и землеотводным актам.
        </p>
      </div>
      </>)}
    </AppShell>
  )
}
