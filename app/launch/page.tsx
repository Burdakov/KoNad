"use client"

import { AppShell } from "@/components/app-shell"
import { ProgramGantt } from "@/components/program-gantt"
import {
  buildAllLaunchGanttRows,
  masterfilePlanClusters2026,
  masterfilePlanClusters2027,
  masterfileClusters,
  df25Requirements,
  clusterChecklistItems,
} from "@/lib/mock-data"
import { useMemo } from "react"
import { Rocket, AlertTriangle, Clock } from "lucide-react"

// ── Main page ─────────────────────────────────────────────────────────────────

export default function LaunchPage() {
  const allRows         = useMemo(() => buildAllLaunchGanttRows(), [])
  const criticalCount   = allRows.filter((r) => r.deadlineStatus === "critical").length
  const warnCount       = allRows.filter((r) => r.deadlineStatus === "warn").length
  const objectCount2026 = masterfilePlanClusters2026.length
  const objectCount2027 = masterfilePlanClusters2027.length

  const totalChecklist  = masterfileClusters.filter((c) => c.dataType === "plan").length * df25Requirements.length
  const doneChecklist   = clusterChecklistItems.filter((ci) => ci.status === "done").length
  const critChecklist   = clusterChecklistItems.filter((ci) => ci.status === "critical").length

  return (
    <AppShell>
      {/* Page header */}
      <div className="mb-5">
        <div className="flex items-center gap-2.5 mb-1">
          <div className="flex items-center justify-center size-7 rounded bg-primary/10 text-primary">
            <Rocket className="size-4" />
          </div>
          <h1 className="text-lg font-bold text-foreground">Запуск новых объектов</h1>
          <span className="text-xs text-muted-foreground font-mono bg-muted px-2 py-0.5 rounded border border-border">
            ДФ25 + Анализ + Ганта
          </span>
        </div>
        <p className="text-sm text-muted-foreground ml-9.5">
          Анализ готовности новых кустовых площадок: чек-лист требований ДФ25 по подразделениям,
          пространственная проверка отводов и категорий запасов, дорожные карты оформления документов.
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
            <AlertTriangle className="size-3" /> Нарушений ДФ25
          </div>
          <div className="text-2xl font-bold text-red-700">{critChecklist}</div>
          <div className="text-[10px] text-red-600 mt-0.5">
            из {totalChecklist} требований — {doneChecklist} выполнено
          </div>
        </div>
        <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-3">
          <div className="flex items-center gap-1 text-xs text-yellow-700 mb-0.5">
            <Clock className="size-3" /> Ганта — под риском
          </div>
          <div className="text-2xl font-bold text-yellow-700">{criticalCount + warnCount}</div>
          <div className="text-[10px] text-yellow-600 mt-0.5">{criticalCount} крит. / {warnCount} пред.</div>
        </div>
      </div>

      {/* === Анализ производственной программы: интерактивный Ганта === */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-2">
          <h2 className="text-sm font-semibold text-foreground">Анализ производственной программы</h2>
          <span className="text-[10px] text-muted-foreground bg-muted px-2 py-0.5 rounded border border-border font-mono">
            Мастерфайл · ДФ25 (инфраструктура)
          </span>
        </div>
        <p className="text-xs text-muted-foreground mb-3">
          Объекты инфраструктуры и кустовые площадки на общей оси времени. Нажмите на строку — откроется чек-лист ДФ25 с диаграммой Ганта, построенной от даты запуска назад.
        </p>
        <ProgramGantt />
      </div>

    </AppShell>
  )
}
