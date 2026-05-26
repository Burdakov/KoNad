"use client"

import { AppShell } from "@/components/app-shell"
import { GanttChart } from "@/components/gantt-chart"
import { ProgramGantt } from "@/components/program-gantt"
import {
  buildAllLaunchGanttRows,
  masterfilePlanClusters2026,
  masterfilePlanClusters2027,
  masterfileClusters,
  df25Requirements,
  clusterChecklistItems,
  type GanttRow,
  type DF25Requirement,
  type ClusterChecklistItem,
  type ChecklistStatus,
} from "@/lib/mock-data"
import { useMemo, useState } from "react"
import {
  Rocket, AlertTriangle, Clock, CheckCircle2, Filter,
  MapPin, ListChecks, BarChart2, ChevronDown, ChevronRight,
  ExternalLink, XCircle,
} from "lucide-react"
import { cn } from "@/lib/utils"

// ── constants ─────────────────────────────────────────────────────────────────

const STATUS_LABEL: Record<string, string> = { critical: "Критично", warn: "Внимание", ok: "В норме" }
const STATUS_STYLE: Record<string, string> = {
  critical: "bg-red-50 text-red-700 border-red-200",
  warn:     "bg-yellow-50 text-yellow-700 border-yellow-200",
  ok:       "bg-green-50 text-green-700 border-green-200",
}

const CHECKLIST_STYLE: Record<ChecklistStatus, string> = {
  done:     "bg-green-50 text-green-700 border-green-200",
  pending:  "bg-gray-50 text-gray-500 border-gray-200",
  critical: "bg-red-50 text-red-700 border-red-200",
}
const CHECKLIST_LABEL: Record<ChecklistStatus, string> = {
  done: "Выполнено", pending: "Ожидает", critical: "Нарушение",
}

// ── Checklist tab ─────────────────────────────────────────────────────────────

function ChecklistTab() {
  const planClusters = masterfileClusters.filter((c) => c.dataType === "plan")
  const [selectedCluster, setSelectedCluster] = useState(planClusters[0]?.id ?? "")
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set())

  const toggleCategory = (cat: string) =>
    setExpandedCategories((prev) => {
      const next = new Set(prev)
      next.has(cat) ? next.delete(cat) : next.add(cat)
      return next
    })

  const clusterItems = useMemo<ClusterChecklistItem[]>(
    () => clusterChecklistItems.filter((ci) => ci.clusterId === selectedCluster),
    [selectedCluster]
  )

  const itemMap = useMemo(() => {
    const m = new Map<string, ClusterChecklistItem>()
    clusterItems.forEach((ci) => m.set(ci.requirementId, ci))
    return m
  }, [clusterItems])

  const doneCount     = clusterItems.filter((ci) => ci.status === "done").length
  const criticalCount = clusterItems.filter((ci) => ci.status === "critical").length
  const pendingCount  = clusterItems.filter((ci) => ci.status === "pending").length
  const total         = df25Requirements.length
  const progress      = Math.round((doneCount / total) * 100)

  // Group requirements by category
  const categories = useMemo(() => {
    const map = new Map<string, DF25Requirement[]>()
    df25Requirements.forEach((r) => {
      if (!map.has(r.category)) map.set(r.category, [])
      map.get(r.category)!.push(r)
    })
    return Array.from(map.entries())
  }, [])

  const cluster = planClusters.find((c) => c.id === selectedCluster)

  return (
    <div>
      {/* Cluster selector */}
      <div className="flex items-center gap-3 mb-4 flex-wrap">
        <span className="text-xs text-muted-foreground">Объект:</span>
        <div className="flex gap-1.5 flex-wrap">
          {planClusters.map((c) => {
            const items = clusterChecklistItems.filter((ci) => ci.clusterId === c.id)
            const hasCrit = items.some((ci) => ci.status === "critical")
            return (
              <button
                key={c.id}
                onClick={() => setSelectedCluster(c.id)}
                className={cn(
                  "px-3 py-1.5 text-xs rounded-md border transition-colors font-medium",
                  selectedCluster === c.id
                    ? "bg-primary text-primary-foreground border-primary"
                    : hasCrit
                      ? "bg-red-50 text-red-700 border-red-200 hover:border-red-400"
                      : "bg-card text-muted-foreground border-border hover:border-primary/50"
                )}
              >
                {c.clusterName}
                {hasCrit && <span className="ml-1 text-red-500">!</span>}
              </button>
            )
          })}
        </div>
      </div>

      {cluster && (
        <div className="flex items-center gap-4 mb-4 p-3 rounded-lg bg-muted/50 border border-border text-xs">
          <span className="font-semibold text-foreground">{cluster.clusterName} — {cluster.fieldName}</span>
          <span className="text-muted-foreground">{cluster.company}</span>
          <span className="text-muted-foreground">Запуск: <span className="font-mono font-medium text-foreground">{cluster.plannedLaunchDate}</span></span>
          <div className="ml-auto flex items-center gap-3">
            <span className="text-green-700 font-medium">{doneCount} выполнено</span>
            <span className="text-red-700 font-medium">{criticalCount} нарушений</span>
            <span className="text-muted-foreground">{pendingCount} ожидает</span>
          </div>
        </div>
      )}

      {/* Progress bar */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs text-muted-foreground">Готовность</span>
          <span className="text-xs font-mono font-semibold text-foreground">{progress}%</span>
        </div>
        <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
          <div
            className="h-full rounded-full bg-primary transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Requirements by category */}
      <div className="space-y-1">
        {categories.map(([cat, reqs]) => {
          const catItems = reqs.map((r) => itemMap.get(r.id))
          const catDone     = catItems.filter((ci) => ci?.status === "done").length
          const catCritical = catItems.filter((ci) => ci?.status === "critical").length
          const isOpen = expandedCategories.has(cat)

          return (
            <div key={cat} className="rounded-lg border border-border overflow-hidden">
              <button
                onClick={() => toggleCategory(cat)}
                className="w-full flex items-center gap-2 px-3 py-2.5 bg-muted/40 hover:bg-muted/70 transition-colors text-left"
              >
                {isOpen
                  ? <ChevronDown className="size-3.5 text-muted-foreground flex-shrink-0" />
                  : <ChevronRight className="size-3.5 text-muted-foreground flex-shrink-0" />
                }
                <span className="flex-1 text-sm font-medium text-foreground">{cat}</span>
                {catCritical > 0 && (
                  <span className="flex items-center gap-1 text-[10px] font-semibold text-red-700 bg-red-50 border border-red-200 px-1.5 py-0.5 rounded-full">
                    <XCircle className="size-2.5" />{catCritical}
                  </span>
                )}
                <span className="text-[10px] text-muted-foreground font-mono ml-1">
                  {catDone}/{reqs.length}
                </span>
              </button>

              {isOpen && (
                <div className="divide-y divide-border/50">
                  {reqs.map((req) => {
                    const ci = itemMap.get(req.id)
                    const status: ChecklistStatus = ci?.status ?? "pending"
                    return (
                      <div key={req.id} className="flex items-start gap-3 px-3 py-2.5 bg-card hover:bg-muted/20 transition-colors">
                        <div className="flex-shrink-0 mt-0.5">
                          {status === "done"
                            ? <CheckCircle2 className="size-4 text-green-600" />
                            : status === "critical"
                              ? <XCircle className="size-4 text-red-600" />
                              : <Clock className="size-4 text-gray-400" />
                          }
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-foreground leading-snug">{req.requirement}</p>
                          <div className="flex items-center gap-2 mt-1 flex-wrap">
                            <span className="text-[10px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded">{req.department}</span>
                            <span className="text-[10px] text-muted-foreground font-mono">{req.basis}</span>
                            <span className="text-[10px] text-muted-foreground">за {req.daysBeforeLaunch} дн. до запуска</span>
                            {ci?.completedDate && (
                              <span className="text-[10px] text-green-700 font-mono">{ci.completedDate}</span>
                            )}
                          </div>
                          {ci?.note && (
                            <p className="mt-1 text-[11px] text-red-700 bg-red-50 border border-red-100 rounded px-2 py-1">{ci.note}</p>
                          )}
                        </div>
                        <span className={cn("flex-shrink-0 text-[10px] font-semibold px-2 py-0.5 rounded-full border", CHECKLIST_STYLE[status])}>
                          {CHECKLIST_LABEL[status]}
                        </span>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ── Spatial analysis tab ──────────────────────────────────────────────────────

const SPATIAL_CHECKS = [
  { key: "land",    label: "Земельный отвод оформлен",                icon: MapPin },
  { key: "spatial", label: "Промышленные категории (В1+В2) подтверждены", icon: CheckCircle2 },
  { key: "горный",  label: "Попадает в границы горного отвода",       icon: MapPin },
] as const

// Горный отвод — производное: если есть license + spatial, считаем "в горном отводе"
function inMiningAllotment(cluster: typeof masterfileClusters[0]) {
  return cluster.docCoverage.license && cluster.docCoverage.spatial
}

function SpatialTab() {
  const planClusters = masterfileClusters.filter((c) => c.dataType === "plan")

  return (
    <div>
      <p className="text-sm text-muted-foreground mb-4">
        Пространственный анализ для плановых кустовых площадок: наличие земельного отвода,
        подтверждение промышленных категорий запасов на проектный фонд скважин и попадание в горный отвод.
      </p>

      <div className="overflow-x-auto rounded-lg border border-border">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-muted/50 border-b border-border">
              <th className="text-left px-4 py-2.5 text-xs font-semibold text-muted-foreground w-48">Объект</th>
              <th className="text-left px-4 py-2.5 text-xs font-semibold text-muted-foreground">Месторождение</th>
              <th className="text-left px-4 py-2.5 text-xs font-semibold text-muted-foreground">Год запуска</th>
              {SPATIAL_CHECKS.map((c) => (
                <th key={c.key} className="text-center px-3 py-2.5 text-xs font-semibold text-muted-foreground max-w-36">
                  {c.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border/50">
            {planClusters.map((cluster) => {
              const checks = {
                land:    cluster.docCoverage.land,
                spatial: cluster.docCoverage.spatial,
                горный:  inMiningAllotment(cluster),
              }
              const allOk = Object.values(checks).every(Boolean)
              const anyFail = Object.values(checks).some((v) => !v)

              return (
                <tr key={cluster.id} className={cn(
                  "hover:bg-muted/20 transition-colors",
                  anyFail && "bg-red-50/30"
                )}>
                  <td className="px-4 py-2.5">
                    <div className="font-medium text-foreground">{cluster.clusterName}</div>
                    <div className="text-[10px] text-muted-foreground">{cluster.company.slice(0, 22)}</div>
                  </td>
                  <td className="px-4 py-2.5 text-sm text-foreground">{cluster.fieldName}</td>
                  <td className="px-4 py-2.5 text-sm font-mono text-foreground">{cluster.plannedYear}</td>
                  {(["land", "spatial", "горный"] as const).map((key) => (
                    <td key={key} className="px-3 py-2.5 text-center">
                      {checks[key]
                        ? <span className="inline-flex items-center justify-center size-6 rounded-full bg-green-100 text-green-700">
                            <CheckCircle2 className="size-3.5" />
                          </span>
                        : <span className="inline-flex items-center justify-center size-6 rounded-full bg-red-100 text-red-600">
                            <XCircle className="size-3.5" />
                          </span>
                      }
                    </td>
                  ))}
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 mt-3 text-[10px] text-muted-foreground">
        <span className="flex items-center gap-1.5">
          <span className="inline-flex size-4 rounded-full bg-green-100 items-center justify-center">
            <CheckCircle2 className="size-2.5 text-green-700" />
          </span>
          Документ / условие выполнено
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-flex size-4 rounded-full bg-red-100 items-center justify-center">
            <XCircle className="size-2.5 text-red-600" />
          </span>
          Отсутствует / не подтверждено
        </span>
      </div>
    </div>
  )
}

// ── Gantt tab ─────────────────────────────────────────────────────────────────

function GanttTab() {
  const allRows = useMemo(() => buildAllLaunchGanttRows(), [])
  const [yearFilter, setYearFilter]       = useState<"all" | "2026" | "2027">("all")
  const [statusFilter, setStatusFilter]   = useState<"all" | "critical" | "warn" | "ok">("all")
  const [companyFilter, setCompanyFilter] = useState<string>("all")

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

  return (
    <div>
      {/* Filters */}
      <div className="flex items-center gap-2 mb-4 flex-wrap">
        <Filter className="size-3.5 text-muted-foreground flex-shrink-0" />
        <span className="text-xs text-muted-foreground">Фильтр:</span>
        <div className="flex gap-1">
          {(["all", "2026", "2027"] as const).map((y) => (
            <button key={y} onClick={() => setYearFilter(y)}
              className={cn("px-2.5 py-1 text-xs rounded border transition-colors",
                yearFilter === y ? "bg-primary text-primary-foreground border-primary" : "bg-card text-muted-foreground border-border hover:border-primary/50"
              )}>
              {y === "all" ? "Все годы" : y}
            </button>
          ))}
        </div>
        <div className="h-4 w-px bg-border" />
        <div className="flex gap-1">
          {(["all", "critical", "warn", "ok"] as const).map((s) => (
            <button key={s} onClick={() => setStatusFilter(s)}
              className={cn("px-2.5 py-1 text-xs rounded border transition-colors",
                statusFilter === s
                  ? s === "all" ? "bg-primary text-primary-foreground border-primary" : cn("border font-medium", STATUS_STYLE[s])
                  : "bg-card text-muted-foreground border-border hover:border-primary/50"
              )}>
              {s === "all" ? "Все статусы" : STATUS_LABEL[s]}
            </button>
          ))}
        </div>
        <div className="h-4 w-px bg-border" />
        <select value={companyFilter} onChange={(e) => setCompanyFilter(e.target.value)}
          className="text-xs border border-border rounded px-2 py-1 bg-card text-foreground focus:outline-none focus:ring-1 focus:ring-ring">
          {companies.map((c) => <option key={c} value={c}>{c === "all" ? "Все компании" : c}</option>)}
        </select>
        <span className="ml-auto text-xs text-muted-foreground font-mono">{filteredRows.length} пакетов</span>
      </div>

      {filteredRows.length > 0
        ? <GanttChart rows={filteredRows} />
        : <div className="flex flex-col items-center justify-center py-16 text-muted-foreground border border-dashed border-border rounded-lg">
            <CheckCircle2 className="size-8 mb-2 opacity-30" />
            <p className="text-sm">Нет объектов по выбранным фильтрам</p>
          </div>
      }
    </div>
  )
}

// ── Main page ─────────────────────────────────────────────────────────────────

type TabId = "checklist" | "spatial" | "gantt"

const TABS: { id: TabId; label: string; icon: React.ElementType }[] = [
  { id: "checklist", label: "Чек-лист ДФ25",          icon: ListChecks },
  { id: "spatial",   label: "Пространственный анализ", icon: MapPin },
  { id: "gantt",     label: "Диаграмма Ганта",         icon: BarChart2 },
]

export default function LaunchPage() {
  const [activeTab, setActiveTab] = useState<TabId>("checklist")

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

      {/* Tabs */}
      <div className="flex gap-0.5 mb-4 border-b border-border">        {TABS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={cn(
              "flex items-center gap-1.5 px-4 py-2 text-sm border-b-2 transition-colors -mb-px",
              activeTab === id
                ? "border-primary text-primary font-medium"
                : "border-transparent text-muted-foreground hover:text-foreground"
            )}
          >
            <Icon className="size-3.5" />
            {label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {activeTab === "checklist" && <ChecklistTab />}
      {activeTab === "spatial"   && <SpatialTab />}
      {activeTab === "gantt"     && <GanttTab />}
    </AppShell>
  )
}
