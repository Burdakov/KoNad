"use client"

import { AppShell } from "@/components/app-shell"
import { GanttChart } from "@/components/gantt-chart"
import { buildAllLaunchGanttRows, masterfilePlanClusters2026, masterfilePlanClusters2027, type GanttRow } from "@/lib/mock-data"
import { useMemo, useState } from "react"
import { Rocket, AlertTriangle, Clock, CheckCircle2, Filter } from "lucide-react"

const STATUS_LABEL: Record<string, string> = {
  critical: "Критично",
  warn:     "Внимание",
  ok:       "В норме",
}

const STATUS_STYLE: Record<string, string> = {
  critical: "bg-red-50 text-red-700 border-red-200",
  warn:     "bg-yellow-50 text-yellow-700 border-yellow-200",
  ok:       "bg-green-50 text-green-700 border-green-200",
}

export default function LaunchPage() {
  const allRows = useMemo(() => buildAllLaunchGanttRows(), [])

  const [yearFilter, setYearFilter]       = useState<"all" | "2026" | "2027">("all")
  const [statusFilter, setStatusFilter]   = useState<"all" | "critical" | "warn" | "ok">("all")
  const [companyFilter, setCompanyFilter] = useState<string>("all")

  // Unique companies
  const companies = useMemo(() => {
    const set = new Set(allRows.map((r) => r.company))
    return ["all", ...Array.from(set)]
  }, [allRows])

  const filteredRows = useMemo<GanttRow[]>(() => {
    return allRows.filter((row) => {
      if (statusFilter !== "all" && row.deadlineStatus !== statusFilter) return false
      if (companyFilter !== "all" && row.company !== companyFilter) return false
      if (yearFilter !== "all") {
        const launchYear = row.plannedLaunchDate.split(".")[2]
        if (launchYear !== yearFilter) return false
      }
      return true
    })
  }, [allRows, yearFilter, statusFilter, companyFilter])

  // Summary counts
  const criticalCount = allRows.filter((r) => r.deadlineStatus === "critical").length
  const warnCount     = allRows.filter((r) => r.deadlineStatus === "warn").length
  const okCount       = allRows.filter((r) => r.deadlineStatus === "ok").length

  // Unique objects
  const objectCount2026 = masterfilePlanClusters2026.length
  const objectCount2027 = masterfilePlanClusters2027.length

  return (
    <AppShell>
      {/* Page header */}
      <div className="mb-5">
        <div className="flex items-center gap-2.5 mb-1">
          <div className="flex items-center justify-center size-7 rounded bg-primary/10 text-primary">
            <Rocket className="size-4" />
          </div>
          <h1 className="text-lg font-bold text-foreground">Запуск объектов</h1>
          <span className="text-xs text-muted-foreground font-mono bg-muted px-2 py-0.5 rounded border border-border">
            Дорожные карты
          </span>
        </div>
        <p className="text-sm text-muted-foreground ml-9.5">
          Новые кустовые площадки из мастерфайла, для которых ещё не оформлены документы.
          Для каждого объекта автоматически сформирована дорожная карта по всем пакетам документов.
        </p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
        <div className="rounded-lg border border-border bg-card p-3">
          <div className="text-xs text-muted-foreground mb-0.5">Объектов 2026</div>
          <div className="text-2xl font-bold text-foreground">{objectCount2026}</div>
          <div className="text-[10px] text-muted-foreground mt-0.5">кустовых площадок</div>
        </div>
        <div className="rounded-lg border border-border bg-card p-3">
          <div className="text-xs text-muted-foreground mb-0.5">Объектов 2027</div>
          <div className="text-2xl font-bold text-foreground">{objectCount2027}</div>
          <div className="text-[10px] text-muted-foreground mt-0.5">кустовых площадок</div>
        </div>
        <div className="rounded-lg border border-red-200 bg-red-50 p-3">
          <div className="flex items-center gap-1 text-xs text-red-700 mb-0.5">
            <AlertTriangle className="size-3" /> Критично
          </div>
          <div className="text-2xl font-bold text-red-700">{criticalCount}</div>
          <div className="text-[10px] text-red-600 mt-0.5">пакетов не успевают</div>
        </div>
        <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-3">
          <div className="flex items-center gap-1 text-xs text-yellow-700 mb-0.5">
            <Clock className="size-3" /> Под контролем
          </div>
          <div className="text-2xl font-bold text-yellow-700">{warnCount}</div>
          <div className="text-[10px] text-yellow-600 mt-0.5">{'< 30 р.д. запаса'}</div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-2 mb-4 flex-wrap">
        <Filter className="size-3.5 text-muted-foreground flex-shrink-0" />
        <span className="text-xs text-muted-foreground">Фильтр:</span>

        {/* Year */}
        <div className="flex gap-1">
          {(["all", "2026", "2027"] as const).map((y) => (
            <button
              key={y}
              onClick={() => setYearFilter(y)}
              className={`px-2.5 py-1 text-xs rounded border transition-colors ${
                yearFilter === y
                  ? "bg-primary text-white border-primary"
                  : "bg-card text-muted-foreground border-border hover:border-primary/50"
              }`}
            >
              {y === "all" ? "Все годы" : y}
            </button>
          ))}
        </div>

        <div className="h-4 w-px bg-border" />

        {/* Status */}
        <div className="flex gap-1">
          {(["all", "critical", "warn", "ok"] as const).map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-2.5 py-1 text-xs rounded border transition-colors ${
                statusFilter === s
                  ? s === "all"
                    ? "bg-primary text-white border-primary"
                    : `border ${STATUS_STYLE[s]} font-medium`
                  : "bg-card text-muted-foreground border-border hover:border-primary/50"
              }`}
            >
              {s === "all" ? "Все статусы" : STATUS_LABEL[s]}
            </button>
          ))}
        </div>

        <div className="h-4 w-px bg-border" />

        {/* Company */}
        <select
          value={companyFilter}
          onChange={(e) => setCompanyFilter(e.target.value)}
          className="text-xs border border-border rounded px-2 py-1 bg-card text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
        >
          {companies.map((c) => (
            <option key={c} value={c}>{c === "all" ? "Все компании" : c}</option>
          ))}
        </select>

        {/* Result count */}
        <span className="ml-auto text-xs text-muted-foreground font-mono">
          {filteredRows.length} пакетов документов
        </span>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 mb-3 text-[10px] text-muted-foreground flex-wrap">
        <span className="font-semibold uppercase tracking-wide">Легенда:</span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block size-2 rounded-full bg-green-600" /> Документы успевают до запуска
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block size-2 rounded-full bg-yellow-500" /> {'< 30 рабочих дней запаса'}
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block size-2 rounded-full bg-red-600" /> Документы не успевают
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block size-2 rotate-45 border-2 border-blue-600 bg-white" /> Плановая дата запуска
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block w-4 h-px bg-primary/70" /> Сегодня
        </span>
      </div>

      {/* Gantt chart */}
      {filteredRows.length > 0 ? (
        <GanttChart rows={filteredRows} />
      ) : (
        <div className="flex flex-col items-center justify-center py-16 text-muted-foreground border border-dashed border-border rounded-lg">
          <CheckCircle2 className="size-8 mb-2 opacity-30" />
          <p className="text-sm">Нет объектов по выбранным фильтрам</p>
        </div>
      )}
    </AppShell>
  )
}
