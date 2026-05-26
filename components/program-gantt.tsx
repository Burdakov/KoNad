"use client"

import { useMemo, useState, useRef, useEffect } from "react"
import {
  masterfileClusters,
  infraObjects,
  df25ChecklistItems,
  df25ChecklistDays,
  clusterChecklistItems,
  type MasterfileCluster,
  type InfraObject,
  type ChecklistStatus,
} from "@/lib/mock-data"
import {
  CheckCircle2, Clock, XCircle, ChevronRight, X,
  Factory, Drill, Flame, Waves, AlertTriangle,
} from "lucide-react"
import { cn } from "@/lib/utils"

// ─── Constants ────────────────────────────────────────────────────────────────

// Mock "today" matches the rest of the app: 23.05.2026
const TODAY = new Date(2026, 4, 23)

function parseDate(ddmmyyyy: string): Date {
  const [d, m, y] = ddmmyyyy.split(".")
  return new Date(Number(y), Number(m) - 1, Number(d))
}

function daysDiff(a: Date, b: Date) {
  return Math.round((b.getTime() - a.getTime()) / 86400000)
}

// ── Timeline window: 01.01.2026 → 31.12.2027
const TIMELINE_START = new Date(2026, 0, 1)
const TIMELINE_END   = new Date(2027, 11, 31)
const TOTAL_DAYS     = daysDiff(TIMELINE_START, TIMELINE_END)

// Label column width
const LABEL_W = 220
// Minimum gantt canvas width
const CANVAS_MIN_W = 640

const INFRA_TYPE_ICON: Record<string, React.ElementType> = {
  upn: Factory, gtsu: Flame, bkns: Waves, dns: Drill,
}

const STATUS_COLOR: Record<ChecklistStatus, string> = {
  done:     "#16a34a",
  pending:  "#6b7280",
  critical: "#dc2626",
}
const STATUS_BG: Record<ChecklistStatus, string> = {
  done:     "#f0fdf4",
  pending:  "#f9fafb",
  critical: "#fef2f2",
}

const DEPT_COLORS: Record<string, string> = {
  "Блок проектной инвестиционной деятельности": "#2563eb",
  "Блок главного инженера":                     "#0891b2",
  "Управление промышленной безопасности":       "#dc2626",
  "Управление экологии":                        "#16a34a",
  "Департамент землепользования":               "#ca8a04",
  "Управление геологии и разработки":           "#9333ea",
  "Управление внутреннего административного контроля": "#ea580c",
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function pct(days: number): string {
  return `${Math.max(0, Math.min(100, (days / TOTAL_DAYS) * 100)).toFixed(3)}%`
}

function launchStatus(launchDate: Date): "ok" | "warn" | "critical" {
  const d = daysDiff(TODAY, launchDate)
  if (d < 0)   return "critical"
  if (d < 60)  return "warn"
  return "ok"
}

// ─── ChecklistPanel (slide-out to the right) ──────────────────────────────────

type PanelObject =
  | { kind: "cluster"; data: MasterfileCluster }
  | { kind: "infra";   data: InfraObject }

interface ChecklistPanelProps {
  obj: PanelObject
  onClose: () => void
}

function ChecklistPanel({ obj, onClose }: ChecklistPanelProps) {
  const launchDateStr =
    obj.kind === "cluster"
      ? (obj.data.plannedLaunchDate ?? "")
      : obj.data.plannedLaunchDate
  const launchDate = parseDate(launchDateStr)

  // Determine status map
  const statusMap: Record<string, ChecklistStatus> = useMemo(() => {
    if (obj.kind === "cluster") {
      const items = clusterChecklistItems.filter((ci) => ci.clusterId === obj.data.id)
      const m: Record<string, ChecklistStatus> = {}
      // Map df25ChecklistItems by index to clusterChecklistItems
      df25ChecklistItems.forEach((item, idx) => {
        // Legacy DF25 requirements use different IDs — use positional mapping
        // clusterChecklistItems use df01..df31; df25ChecklistItems use r1..r31
        const legacyId = `df${String(idx + 1).padStart(2, "0")}`
        const ci = items.find((i) => i.requirementId === legacyId)
        m[item.id] = ci?.status ?? "pending"
      })
      return m
    }
    return obj.data.checklistStatus as Record<string, ChecklistStatus>
  }, [obj])

  const done     = df25ChecklistItems.filter((i) => statusMap[i.id] === "done").length
  const critical = df25ChecklistItems.filter((i) => statusMap[i.id] === "critical").length
  const total    = df25ChecklistItems.length
  const progress = Math.round((done / total) * 100)

  // Timeline: show last 6 months before launch
  const ganttStart = new Date(launchDate)
  ganttStart.setMonth(ganttStart.getMonth() - 6)
  const ganttDays = daysDiff(ganttStart, launchDate)

  const panelRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose() }
    document.addEventListener("keydown", handleKey)
    return () => document.removeEventListener("keydown", handleKey)
  }, [onClose])

  const objectName = obj.kind === "cluster" ? obj.data.clusterName : obj.data.name
  const Icon = obj.kind === "infra" ? (INFRA_TYPE_ICON[obj.data.type] ?? Factory) : Drill

  return (
    <div
      ref={panelRef}
      className="flex flex-col bg-card border-l border-border h-full overflow-hidden"
      style={{ width: 540 }}
    >
      {/* Header */}
      <div className="flex items-center gap-2.5 px-4 py-3 border-b border-border flex-shrink-0">
        <div className="flex items-center justify-center size-7 rounded bg-primary/10 text-primary">
          <Icon className="size-4" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-sm font-semibold text-foreground truncate">{objectName}</div>
          <div className="text-[10px] text-muted-foreground">
            {obj.kind === "cluster" ? obj.data.fieldName : obj.data.fieldName}
            {" · Запуск: "}
            <span className="font-mono font-medium">{launchDateStr}</span>
          </div>
        </div>
        <button
          onClick={onClose}
          className="flex-shrink-0 flex items-center justify-center size-7 rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
          aria-label="Закрыть"
        >
          <X className="size-4" />
        </button>
      </div>

      {/* Progress */}
      <div className="px-4 py-2.5 border-b border-border flex-shrink-0 space-y-1.5">
        <div className="flex items-center justify-between text-xs">
          <span className="text-muted-foreground">Готовность к запуску</span>
          <span className="font-mono font-semibold text-foreground">{progress}%</span>
        </div>
        <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
          <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${progress}%` }} />
        </div>
        <div className="flex items-center gap-3 text-[10px]">
          <span className="text-green-700 font-medium">{done} выполнено</span>
          {critical > 0 && <span className="text-red-700 font-medium">{critical} нарушений</span>}
          <span className="text-muted-foreground">{total - done - critical} ожидает</span>
        </div>
      </div>

      {/* Gantt — scrollable */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden">
        {/* Gantt header — month labels */}
        <div className="sticky top-0 z-10 bg-muted/80 border-b border-border flex" style={{ height: 28 }}>
          <div className="flex-shrink-0 bg-muted/80 border-r border-border" style={{ width: LABEL_W }} />
          <div className="flex-1 relative overflow-hidden">
            {Array.from({ length: 7 }, (_, i) => {
              const d = new Date(ganttStart)
              d.setMonth(d.getMonth() + i)
              const offset = daysDiff(ganttStart, d)
              return (
                <div
                  key={i}
                  className="absolute top-0 bottom-0 flex items-center pl-1 text-[9px] text-muted-foreground border-l border-border/40"
                  style={{ left: pct(offset) }}
                >
                  {d.toLocaleDateString("ru-RU", { month: "short" })}
                </div>
              )
            })}
            {/* Launch marker */}
            <div
              className="absolute top-0 bottom-0 w-0.5 bg-red-500/70"
              style={{ left: "100%" }}
              title="Дата запуска"
            />
          </div>
        </div>

        {/* Rows — one per checklist item */}
        {df25ChecklistItems.map((item, idx) => {
          const status    = statusMap[item.id] ?? "pending"
          const daysLeft  = df25ChecklistDays[idx] ?? 30
          // Bar: from (launchDate - daysLeft) to launchDate, relative to ganttStart
          const barStart  = daysDiff(ganttStart, new Date(launchDate.getTime() - daysLeft * 86400000))
          const barPct    = (daysLeft / ganttDays) * 100
          const barLeft   = (barStart / ganttDays) * 100
          const barColor  = DEPT_COLORS[item.department] ?? "#6b7280"

          return (
            <div
              key={item.id}
              className="flex border-b border-border/40 hover:bg-muted/20 transition-colors"
              style={{ minHeight: 28 }}
            >
              {/* Label */}
              <div
                className="flex items-center gap-1.5 px-2 flex-shrink-0 border-r border-border/40"
                style={{ width: LABEL_W }}
              >
                {status === "done"
                  ? <CheckCircle2 className="size-3 flex-shrink-0 text-green-600" />
                  : status === "critical"
                    ? <XCircle className="size-3 flex-shrink-0 text-red-600" />
                    : <Clock className="size-3 flex-shrink-0 text-gray-400" />
                }
                <span className="text-[10px] text-foreground leading-tight truncate flex-1" title={item.requirement}>
                  {item.requirement}
                </span>
              </div>

              {/* Bar in timeline */}
              <div className="flex-1 relative">
                {/* Bar */}
                <div
                  className="absolute top-1/2 -translate-y-1/2 rounded-sm"
                  style={{
                    left:    `${Math.max(0, barLeft).toFixed(2)}%`,
                    width:   `${Math.min(barPct, 100 - Math.max(0, barLeft)).toFixed(2)}%`,
                    height:  14,
                    background: status === "done"
                      ? "#16a34a"
                      : status === "critical"
                        ? "#dc2626"
                        : barColor,
                    opacity: status === "pending" ? 0.45 : 0.85,
                  }}
                  title={`${item.requirement} · за ${daysLeft} дн. · ${item.department}`}
                />
                {/* Launch line */}
                <div className="absolute top-0 bottom-0 w-px bg-red-400/40" style={{ left: "100%" }} />
              </div>
            </div>
          )
        })}

        {/* Department legend */}
        <div className="p-3 border-t border-border mt-1">
          <div className="text-[10px] text-muted-foreground font-medium mb-1.5">Подразделения:</div>
          <div className="flex flex-wrap gap-x-3 gap-y-1">
            {Object.entries(DEPT_COLORS).map(([dept, color]) => (
              <span key={dept} className="flex items-center gap-1 text-[9px] text-muted-foreground">
                <span className="inline-block size-2 rounded-sm flex-shrink-0" style={{ background: color }} />
                {dept.replace("Управление ", "Упр. ").replace("Блок ", "").replace("Департамент ", "Деп. ")}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Program Timeline row ─────────────────────────────────────────────────────

interface TimelineRowProps {
  label: string
  sublabel?: string
  typeLabel: string
  launchDateStr: string
  status: "ok" | "warn" | "critical"
  checklistDone: number
  checklistTotal: number
  checklistCritical: number
  isSelected: boolean
  onClick: () => void
  barColor: string
}

function TimelineRow({
  label, sublabel, typeLabel, launchDateStr, status,
  checklistDone, checklistTotal, checklistCritical,
  isSelected, onClick, barColor,
}: TimelineRowProps) {
  const launchDate  = parseDate(launchDateStr)
  const launchOffset = daysDiff(TIMELINE_START, launchDate)
  const daysUntil    = daysDiff(TODAY, launchDate)
  const todayOffset  = daysDiff(TIMELINE_START, TODAY)

  return (
    <div
      className={cn(
        "flex border-b border-border/50 cursor-pointer group transition-colors",
        isSelected ? "bg-primary/5 border-primary/30" : "hover:bg-muted/30",
      )}
      style={{ minHeight: 40 }}
      onClick={onClick}
      role="button"
      aria-pressed={isSelected}
    >
      {/* Label */}
      <div
        className={cn(
          "flex flex-col justify-center px-3 flex-shrink-0 border-r transition-colors",
          isSelected ? "border-primary/30 bg-primary/5" : "border-border/50"
        )}
        style={{ width: LABEL_W }}
      >
        <div className="flex items-center gap-1.5 min-w-0">
          <span className={cn(
            "text-[9px] font-semibold px-1 py-0.5 rounded flex-shrink-0",
            status === "critical" ? "bg-red-100 text-red-700"
            : status === "warn"   ? "bg-yellow-100 text-yellow-700"
            :                       "bg-green-100 text-green-700"
          )}>
            {typeLabel}
          </span>
          <span className="text-xs font-medium text-foreground truncate">{label}</span>
          {isSelected && <ChevronRight className="size-3 text-primary flex-shrink-0 ml-auto" />}
        </div>
        {sublabel && (
          <span className="text-[9px] text-muted-foreground truncate mt-0.5 pl-0.5">{sublabel}</span>
        )}
        <div className="flex items-center gap-2 mt-0.5">
          <span className="text-[9px] text-muted-foreground font-mono">{checklistDone}/{checklistTotal}</span>
          {checklistCritical > 0 && (
            <span className="flex items-center gap-0.5 text-[9px] text-red-600 font-semibold">
              <AlertTriangle className="size-2.5" />{checklistCritical}
            </span>
          )}
        </div>
      </div>

      {/* Timeline canvas */}
      <div className="flex-1 relative overflow-hidden" style={{ minWidth: CANVAS_MIN_W }}>
        {/* Today line */}
        <div
          className="absolute top-0 bottom-0 w-px bg-blue-400/50 z-10"
          style={{ left: pct(todayOffset) }}
        />

        {/* Checklist readiness bar (from launch-180d to launch) */}
        <div
          className="absolute top-1/2 -translate-y-1/2 rounded"
          style={{
            left:       pct(Math.max(0, launchOffset - 180)),
            width:      pct(Math.min(180, launchOffset)),
            height:     10,
            background: barColor,
            opacity:    0.25,
          }}
        />

        {/* Completed portion of bar */}
        <div
          className="absolute top-1/2 -translate-y-1/2 rounded"
          style={{
            left:       pct(Math.max(0, launchOffset - 180)),
            width:      pct(Math.min(180, launchOffset) * (checklistDone / checklistTotal)),
            height:     10,
            background: barColor,
            opacity:    0.85,
          }}
        />

        {/* Launch diamond marker */}
        <div
          className="absolute top-1/2 -translate-y-1/2 z-20"
          style={{ left: pct(launchOffset), transform: "translate(-50%, -50%) rotate(45deg)", width: 10, height: 10,
            background: status === "critical" ? "#dc2626" : status === "warn" ? "#ca8a04" : "#16a34a",
            border: "2px solid white",
          }}
          title={`Запуск: ${launchDateStr} (${daysUntil >= 0 ? `через ${daysUntil} дн.` : `просрочен на ${-daysUntil} дн.`})`}
        />
      </div>
    </div>
  )
}

// ─── Month header ─────────────────────────────────────────────────────────────

function MonthHeader() {
  const months: { label: string; offset: number }[] = []
  const d = new Date(TIMELINE_START)
  while (d <= TIMELINE_END) {
    months.push({ label: d.toLocaleDateString("ru-RU", { month: "short", year: "2-digit" }), offset: daysDiff(TIMELINE_START, new Date(d)) })
    d.setMonth(d.getMonth() + 1)
  }
  const todayOffset = daysDiff(TIMELINE_START, TODAY)

  return (
    <div className="flex flex-shrink-0 border-b border-border sticky top-0 z-20 bg-muted" style={{ height: 28 }}>
      <div className="flex-shrink-0 bg-muted border-r border-border flex items-center px-3" style={{ width: LABEL_W }}>
        <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">Объект</span>
      </div>
      <div className="flex-1 relative overflow-hidden" style={{ minWidth: CANVAS_MIN_W }}>
        {months.map((m) => (
          <div
            key={m.offset}
            className="absolute top-0 bottom-0 flex items-center pl-1 border-l border-border/40 text-[9px] text-muted-foreground"
            style={{ left: pct(m.offset) }}
          >
            {m.label}
          </div>
        ))}
        {/* Today */}
        <div
          className="absolute top-0 bottom-0 w-0.5 bg-blue-400/60 z-10"
          style={{ left: pct(todayOffset) }}
        >
          <span className="absolute -top-0 left-1 text-[8px] text-blue-600 font-semibold whitespace-nowrap">сегодня</span>
        </div>
      </div>
    </div>
  )
}

// ─── Main export ──────────────────────────────────────────────────────────────

export function ProgramGantt() {
  const [selectedObj, setSelectedObj] = useState<PanelObject | null>(null)

  const planClusters = useMemo(
    () => masterfileClusters.filter((c) => c.dataType === "plan"),
    []
  )

  // Group clusters + infra by fieldName
  const fieldGroups = useMemo(() => {
    const map = new Map<string, { clusters: MasterfileCluster[]; infra: InfraObject[] }>()
    for (const c of planClusters) {
      if (!map.has(c.fieldName)) map.set(c.fieldName, { clusters: [], infra: [] })
      map.get(c.fieldName)!.clusters.push(c)
    }
    for (const inf of infraObjects) {
      if (!map.has(inf.fieldName)) map.set(inf.fieldName, { clusters: [], infra: [] })
      map.get(inf.fieldName)!.infra.push(inf)
    }
    return Array.from(map.entries())
  }, [planClusters])

  function clusterChecklistStats(clusterId: string) {
    const items = clusterChecklistItems.filter((ci) => ci.clusterId === clusterId)
    return {
      done:     items.filter((i) => i.status === "done").length,
      critical: items.filter((i) => i.status === "critical").length,
      total:    df25ChecklistItems.length,
    }
  }

  function infraChecklistStats(infra: InfraObject) {
    const vals = Object.values(infra.checklistStatus) as ChecklistStatus[]
    return {
      done:     vals.filter((v) => v === "done").length,
      critical: vals.filter((v) => v === "critical").length,
      total:    df25ChecklistItems.length,
    }
  }

  const handleSelect = (obj: PanelObject) => {
    setSelectedObj((prev) => {
      if (!prev) return obj
      const sameId = prev.kind === obj.kind && (
        (prev.kind === "cluster" && obj.kind === "cluster" && prev.data.id === obj.data.id) ||
        (prev.kind === "infra"   && obj.kind === "infra"   && prev.data.id === obj.data.id)
      )
      return sameId ? null : obj
    })
  }

  return (
    <div className="flex border border-border rounded-lg overflow-hidden bg-card">
      {/* Left: timeline */}
      <div className="flex-1 overflow-x-auto overflow-y-auto" style={{ maxHeight: 480 }}>
        <div style={{ minWidth: LABEL_W + CANVAS_MIN_W }}>
          <MonthHeader />

          {fieldGroups.map(([fieldName, { clusters, infra }]) => (
            <div key={fieldName}>
              {/* Field header */}
              <div
                className="flex items-center border-b border-border bg-muted/60 px-3 py-1 sticky top-7 z-10"
                style={{ minWidth: LABEL_W + CANVAS_MIN_W }}
              >
                <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">{fieldName}</span>
              </div>

              {/* Infra objects first */}
              {infra.map((inf) => {
                const stats = infraChecklistStats(inf)
                const ls    = launchStatus(parseDate(inf.plannedLaunchDate))
                const InfraIcon = INFRA_TYPE_ICON[inf.type] ?? Factory
                const isSelected = selectedObj?.kind === "infra" && selectedObj.data.id === inf.id
                return (
                  <TimelineRow
                    key={inf.id}
                    label={inf.name}
                    sublabel={inf.company}
                    typeLabel={inf.typeLabel}
                    launchDateStr={inf.plannedLaunchDate}
                    status={ls}
                    checklistDone={stats.done}
                    checklistTotal={stats.total}
                    checklistCritical={stats.critical}
                    isSelected={isSelected}
                    onClick={() => handleSelect({ kind: "infra", data: inf })}
                    barColor="#0891b2"
                  />
                )
              })}

              {/* Cluster pads */}
              {clusters.map((c) => {
                const stats = clusterChecklistStats(c.id)
                const ls    = launchStatus(parseDate(c.plannedLaunchDate ?? "01.12.2099"))
                const isSelected = selectedObj?.kind === "cluster" && selectedObj.data.id === c.id
                return (
                  <TimelineRow
                    key={c.id}
                    label={c.clusterName}
                    sublabel={`${c.plannedTotalOilRate ? c.plannedTotalOilRate + " т/сут · " : ""}${c.company}`}
                    typeLabel="Куст"
                    launchDateStr={c.plannedLaunchDate ?? ""}
                    status={ls}
                    checklistDone={stats.done}
                    checklistTotal={stats.total}
                    checklistCritical={stats.critical}
                    isSelected={isSelected}
                    onClick={() => handleSelect({ kind: "cluster", data: c })}
                    barColor="#2563eb"
                  />
                )
              })}
            </div>
          ))}

          {/* Legend */}
          <div className="flex items-center gap-5 px-4 py-2 border-t border-border text-[9px] text-muted-foreground bg-muted/30">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-sm bg-blue-600 opacity-80 inline-block" />Кустовые площадки
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-sm bg-cyan-600 opacity-80 inline-block" />Объекты инфраструктуры
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rotate-45 inline-block bg-green-600 border border-white" />Дата запуска
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-0.5 h-3 bg-blue-400 inline-block" />Сегодня
            </span>
            <span className="ml-auto text-muted-foreground/70">Нажмите на строку, чтобы открыть чек-лист</span>
          </div>
        </div>
      </div>

      {/* Right: slide-out checklist panel */}
      {selectedObj && (
        <ChecklistPanel obj={selectedObj} onClose={() => setSelectedObj(null)} />
      )}
    </div>
  )
}
