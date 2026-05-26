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
  type DF25ChecklistItem,
} from "@/lib/mock-data"
import {
  CheckCircle2, Clock, XCircle, ChevronDown,
  Factory, Drill, Flame, Waves, AlertTriangle,
  ExternalLink,
} from "lucide-react"
import { cn } from "@/lib/utils"

// ─── Constants ────────────────────────────────────────────────────────────────

const TODAY = new Date(2026, 4, 23)

function parseDate(ddmmyyyy: string): Date {
  const [d, m, y] = ddmmyyyy.split(".")
  return new Date(Number(y), Number(m) - 1, Number(d))
}

function daysDiff(a: Date, b: Date) {
  return Math.round((b.getTime() - a.getTime()) / 86400000)
}

function addDays(d: Date, n: number): Date {
  return new Date(d.getTime() + n * 86400000)
}

function fmtDate(d: Date): string {
  return d.toLocaleDateString("ru-RU", { day: "2-digit", month: "2-digit", year: "numeric" })
}

// Timeline window: 01.01.2026 → 31.12.2027
const TIMELINE_START = new Date(2026, 0, 1)
const TIMELINE_END   = new Date(2027, 11, 31)
const TOTAL_DAYS     = daysDiff(TIMELINE_START, TIMELINE_END)

// Label column width
const LABEL_W     = 220
const CANVAS_MIN_W = 640

// Checklist panel: show 7 months before launch
const PANEL_MONTHS = 7

// Row height in the checklist gantt (px) — two-line compact
const ROW_H = 42

// Dependencies: r26 → r27 → r28 (Подсчёт запасов → Техсхема → ПРГР)
// Each entry: { from: itemId, to: itemId }
const DEPENDENCIES: { from: string; to: string }[] = [
  { from: "r26", to: "r27" },
  { from: "r27", to: "r28" },
]

const INFRA_TYPE_ICON: Record<string, React.ElementType> = {
  upn: Factory, gtsu: Flame, bkns: Waves, dns: Drill,
}

const DEPT_COLORS: Record<string, string> = {
  "Блок проектной инвестиционной деятельности":   "#2563eb",
  "Блок главного инженера":                        "#0891b2",
  "Управление промышленной безопасности":          "#dc2626",
  "Управление экологии":                           "#16a34a",
  "Департамент землепользования":                  "#ca8a04",
  "Управление геологии и разработки":              "#9333ea",
  "Управление внутреннего административного контроля": "#ea580c",
}

function pct(days: number, total: number): string {
  return `${Math.max(0, Math.min(100, (days / total) * 100)).toFixed(3)}%`
}

function launchStatus(launchDate: Date): "ok" | "warn" | "critical" {
  const d = daysDiff(TODAY, launchDate)
  if (d < 0)  return "critical"
  if (d < 60) return "warn"
  return "ok"
}

// ─── Types ────────────────────────────────────────────────────────────────────

type PanelObject =
  | { kind: "cluster"; data: MasterfileCluster }
  | { kind: "infra";   data: InfraObject }

// ─── ChecklistGantt (inline panel below clicked row) ─────────────────────────

interface ChecklistGanttProps {
  obj: PanelObject
  onClose: () => void
}

function ChecklistGantt({ obj, onClose }: ChecklistGanttProps) {
  const launchDateStr =
    obj.kind === "cluster" ? (obj.data.plannedLaunchDate ?? "") : obj.data.plannedLaunchDate
  const launchDate = parseDate(launchDateStr)

  // Timeline: PANEL_MONTHS before launch
  const ganttStart = useMemo(() => {
    const d = new Date(launchDate)
    d.setMonth(d.getMonth() - PANEL_MONTHS)
    d.setDate(1)
    return d
  }, [launchDateStr])
  const ganttDays = daysDiff(ganttStart, launchDate)

  // Build status map
  const statusMap: Record<string, ChecklistStatus> = useMemo(() => {
    if (obj.kind === "cluster") {
      const items = clusterChecklistItems.filter((ci) => ci.clusterId === obj.data.id)
      const m: Record<string, ChecklistStatus> = {}
      df25ChecklistItems.forEach((item, idx) => {
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

  const objectName = obj.kind === "cluster" ? obj.data.clusterName : obj.data.name
  const fieldName  = obj.kind === "cluster" ? obj.data.fieldName   : obj.data.fieldName
  const Icon = obj.kind === "infra" ? (INFRA_TYPE_ICON[obj.data.type] ?? Factory) : Drill

  // Key press close
  useEffect(() => {
    const h = (e: KeyboardEvent) => { if (e.key === "Escape") onClose() }
    document.addEventListener("keydown", h)
    return () => document.removeEventListener("keydown", h)
  }, [onClose])

  // Compute bar geometry for each item
  interface BarData {
    item: DF25ChecklistItem
    status: ChecklistStatus
    barStartPct: number
    barWidthPct: number
    barColor: string
    startDate: Date
    endDate: Date
    daysLeft: number
  }

  const bars: BarData[] = useMemo(() => df25ChecklistItems.map((item, idx) => {
    const daysLeft   = df25ChecklistDays[idx] ?? 30
    const endDate    = launchDate
    const startDate  = addDays(launchDate, -daysLeft)
    const startOff   = daysDiff(ganttStart, startDate)
    const barW       = daysLeft
    const baseColor  = DEPT_COLORS[item.department] ?? "#6b7280"
    const status     = statusMap[item.id] ?? "pending"
    return {
      item,
      status,
      barStartPct: (startOff / ganttDays) * 100,
      barWidthPct: (barW    / ganttDays) * 100,
      barColor: status === "done"     ? "#16a34a"
              : status === "critical" ? "#dc2626"
              : baseColor,
      startDate,
      endDate,
      daysLeft,
    }
  }), [ganttDays, statusMap, launchDate, ganttStart])

  // Month labels
  const months = useMemo(() => {
    const list: { label: string; offsetPct: number }[] = []
    const d = new Date(ganttStart)
    while (d <= launchDate) {
      list.push({
        label: d.toLocaleDateString("ru-RU", { month: "short", year: "2-digit" }),
        offsetPct: (daysDiff(ganttStart, new Date(d)) / ganttDays) * 100,
      })
      d.setMonth(d.getMonth() + 1)
    }
    return list
  }, [ganttStart, ganttDays, launchDate])

  // Layout constants
  // Month col width = text width of "янв. 26 г." (~38px at 7px font) + 10px padding
  const MONTH_COL = 48     // px per month column (text + 5px padding each side)
  const LABEL_COL = 480    // px — wider, more informative label column
  const GANTT_COL = months.length * MONTH_COL  // exact: no wasted space
  const HEADER_H  = 24    // px

  // SVG arrow layer: dependency lines
  // We need to compute bar end-x for each item to draw FS arrows
  const svgArrows = useMemo(() => {
    return DEPENDENCIES.map(({ from, to }) => {
      const fromIdx = df25ChecklistItems.findIndex((i) => i.id === from)
      const toIdx   = df25ChecklistItems.findIndex((i) => i.id === to)
      if (fromIdx < 0 || toIdx < 0) return null

      const fromBar = bars[fromIdx]
      const toBar   = bars[toIdx]

      const x1 = ((fromBar.barStartPct + fromBar.barWidthPct) / 100) * GANTT_COL
      const x2 = (toBar.barStartPct / 100) * GANTT_COL
      const y1 = HEADER_H + fromIdx * ROW_H + ROW_H / 2
      const y2 = HEADER_H + toIdx   * ROW_H + ROW_H / 2

      return { x1, y1, x2, y2, key: `${from}-${to}` }
    }).filter(Boolean) as { x1: number; y1: number; x2: number; y2: number; key: string }[]
  }, [bars])

  const totalHeight = HEADER_H + df25ChecklistItems.length * ROW_H

  return (
    <div className="border border-border rounded-b-lg bg-card overflow-hidden">
      {/* Panel header */}
      <div className="flex items-center gap-3 px-4 py-2.5 border-b border-border bg-muted/40">
        <div className="flex items-center justify-center size-7 rounded bg-primary/10 text-primary flex-shrink-0">
          <Icon className="size-4" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-sm font-semibold text-foreground">{objectName}</div>
          <div className="text-[10px] text-muted-foreground">
            {fieldName}{" · Запуск: "}<span className="font-mono font-medium">{launchDateStr}</span>
          </div>
        </div>
        {/* Progress summary */}
        <div className="flex items-center gap-4 text-[11px] mr-4">
          <span className="text-green-700 font-medium">{done} выполнено</span>
          {critical > 0 && <span className="text-red-700 font-medium">{critical} нарушений</span>}
          <span className="text-muted-foreground">{total - done - critical} ожидает</span>
          <div className="flex items-center gap-1.5">
            <div className="w-20 h-1.5 rounded-full bg-muted overflow-hidden">
              <div className="h-full bg-primary rounded-full" style={{ width: `${progress}%` }} />
            </div>
            <span className="font-mono font-semibold text-foreground">{progress}%</span>
          </div>
        </div>
        <button
          onClick={onClose}
          className="flex-shrink-0 text-[10px] text-muted-foreground hover:text-foreground border border-border rounded px-2 py-0.5 hover:bg-muted transition-colors"
        >
          Свернуть
        </button>
      </div>

      {/* Scrollable table */}
      <div className="overflow-x-auto overflow-y-auto" style={{ maxHeight: 680 }}>
        <div style={{ minWidth: LABEL_COL + GANTT_COL, position: "relative" }}>

          {/* Column headers */}
          <div
            className="flex sticky top-0 z-20 bg-muted border-b border-border"
            style={{ height: HEADER_H }}
          >
            <div
              className="flex items-center px-3 border-r border-border flex-shrink-0 text-[10px] font-semibold text-muted-foreground uppercase tracking-wide"
              style={{ width: LABEL_COL }}
            >
              Требование
            </div>
            {/* Each month gets its own fixed-width cell */}
            {months.map((m, mi) => (
              <div
                key={m.label}
                className={cn(
                  "flex items-center justify-center text-muted-foreground border-l border-border/40 flex-shrink-0 select-none",
                  mi === months.length - 1 && "border-r-2 border-r-red-500/50"
                )}
                style={{ width: MONTH_COL, fontSize: 8, lineHeight: 1, padding: "0 5px" }}
              >
                {m.label}
              </div>
            ))}
          </div>

          {/* SVG arrow layer — absolute over the gantt column */}
          <svg
            className="absolute pointer-events-none z-10"
            style={{
              left: LABEL_COL,
              top: 0,
              width: GANTT_COL,
              height: totalHeight,
              overflow: "visible",
            }}
          >
            <defs>
              <marker id="arrow" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
                <path d="M0,0 L0,6 L6,3 z" fill="#9333ea" />
              </marker>
            </defs>
            {svgArrows.map(({ x1, y1, x2, y2, key }) => {
              // Route: right from bar end, down, then left to bar start
              const midX = (x1 + x2) / 2
              return (
                <g key={key}>
                  <path
                    d={`M ${x1} ${y1} C ${x1 + 20} ${y1}, ${x2 - 20} ${y2}, ${x2} ${y2}`}
                    fill="none"
                    stroke="#9333ea"
                    strokeWidth="1.5"
                    strokeDasharray="4 3"
                    markerEnd="url(#arrow)"
                    opacity="0.75"
                  />
                </g>
              )
            })}
          </svg>

          {/* Data rows */}
          {df25ChecklistItems.map((item, idx) => {
            const bar    = bars[idx]
            const status = bar.status
            const deptColor = DEPT_COLORS[item.department] ?? "#6b7280"
            const deptShort = item.department
              .replace("Управление ", "Упр. ")
              .replace("Блок ", "")
              .replace("Департамент ", "Деп. ")

            const barLeftPx  = Math.max(0, (bar.barStartPct / 100) * GANTT_COL)
            const barWidthPx = Math.max(2, Math.min(
              (bar.barWidthPct / 100) * GANTT_COL,
              GANTT_COL - barLeftPx
            ))

            return (
              <div
                key={item.id}
                className={cn(
                  "flex border-b border-border/40 hover:bg-muted/10 transition-colors",
                  idx % 2 === 1 && "bg-muted/5"
                )}
                style={{ height: ROW_H }}
              >
                {/* Label column — wider, more informative */}
                <div
                  className="flex items-center gap-2 px-2 border-r border-border/40 flex-shrink-0 min-w-0"
                  style={{ width: LABEL_COL }}
                >
                  {/* Dept color strip */}
                  <div className="w-0.5 self-stretch flex-shrink-0 rounded-full my-1.5" style={{ background: deptColor }} />
                  {/* Status icon */}
                  <div className="flex-shrink-0">
                    {status === "done"
                      ? <CheckCircle2 className="size-3 text-green-600" />
                      : status === "critical"
                        ? <XCircle className="size-3 text-red-600" />
                        : <Clock className="size-3 text-gray-400" />
                    }
                  </div>
                  {/* Name + meta — two lines */}
                  <div className="flex-1 min-w-0 flex flex-col justify-center leading-none gap-0.5">
                    <span className="text-[11px] text-foreground leading-tight truncate" title={item.requirement}>
                      {item.requirement}
                    </span>
                    <div className="flex items-center gap-2 min-w-0">
                      {/* Dept */}
                      <span className="text-[9px] font-medium shrink-0" style={{ color: deptColor }}>
                        {deptShort}
                      </span>
                      <span className="text-[9px] text-muted-foreground/50 shrink-0">·</span>
                      {/* Responsible */}
                      <span className="text-[9px] text-muted-foreground font-mono shrink-0">
                        {item.responsible}
                      </span>
                      <span className="text-[9px] text-muted-foreground/50 shrink-0">·</span>
                      {/* Dates */}
                      <span className="text-[9px] text-muted-foreground font-mono shrink-0 whitespace-nowrap">
                        {fmtDate(bar.startDate).slice(0, 5)}&nbsp;–&nbsp;{fmtDate(bar.endDate).slice(0, 5)}
                      </span>
                      {/* Doc link */}
                      {item.docLink && (
                        <a
                          href={item.docLink}
                          onClick={(e) => e.stopPropagation()}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary hover:text-primary/70 shrink-0"
                          title="Открыть документ"
                        >
                          <ExternalLink className="size-2.5" />
                        </a>
                      )}
                    </div>
                  </div>
                </div>

                {/* Gantt area — fixed pixel columns */}
                <div className="relative flex-shrink-0" style={{ width: GANTT_COL }}>
                  {/* Month grid lines (pixel-based) */}
                  {months.map((_, mi) => (
                    <div
                      key={mi}
                      className="absolute top-0 bottom-0 w-px bg-border/30"
                      style={{ left: mi * MONTH_COL }}
                    />
                  ))}
                  {/* Bar */}
                  <div
                    className="absolute rounded-sm"
                    style={{
                      left:       barLeftPx,
                      width:      barWidthPx,
                      top:        "50%",
                      height:     10,
                      transform:  "translateY(-50%)",
                      background: bar.barColor,
                      opacity:    status === "pending" ? 0.45 : 0.85,
                    }}
                    title={`${item.requirement} · за ${bar.daysLeft} дн.`}
                  />
                  {/* Launch line */}
                  <div
                    className="absolute top-0 bottom-0 w-0.5 bg-red-400/40"
                    style={{ left: GANTT_COL - 1 }}
                  />
                </div>
              </div>
            )
          })}

          {/* Legend */}
          <div className="flex flex-wrap gap-x-4 gap-y-1 px-4 py-2.5 border-t border-border bg-muted/30 text-[9px] text-muted-foreground">
            {Object.entries(DEPT_COLORS).map(([dept, color]) => (
              <span key={dept} className="flex items-center gap-1">
                <span className="inline-block size-2 rounded-sm flex-shrink-0" style={{ background: color }} />
                {dept.replace("Управление ", "Упр. ").replace("Блок ", "").replace("Департамент ", "Деп. ")}
              </span>
            ))}
            <span className="flex items-center gap-1 ml-auto">
              <svg width="20" height="8">
                <line x1="0" y1="4" x2="16" y2="4" stroke="#9333ea" strokeWidth="1.5" strokeDasharray="4 3" />
                <path d="M14,1 L14,7 L19,4 z" fill="#9333ea" />
              </svg>
              Зависимость (ФН→ФЗ)
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── TimelineRow ──────────────────────────────────────────────────────────────

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
  const launchDate   = parseDate(launchDateStr)
  const launchOffset = daysDiff(TIMELINE_START, launchDate)
  const daysUntil    = daysDiff(TODAY, launchDate)
  const todayOffset  = daysDiff(TIMELINE_START, TODAY)

  return (
    <div
      className={cn(
        "flex border-b border-border/50 cursor-pointer group transition-colors",
        isSelected ? "bg-primary/5 border-primary/20" : "hover:bg-muted/30",
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
          {isSelected && <ChevronDown className="size-3 text-primary flex-shrink-0 ml-auto" />}
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
          style={{ left: pct(todayOffset, TOTAL_DAYS) }}
        />
        {/* Background readiness track */}
        <div
          className="absolute top-1/2 -translate-y-1/2 rounded"
          style={{
            left:    pct(Math.max(0, launchOffset - 180), TOTAL_DAYS),
            width:   pct(Math.min(180, launchOffset), TOTAL_DAYS),
            height:  10,
            background: barColor,
            opacity: 0.18,
          }}
        />
        {/* Filled portion */}
        <div
          className="absolute top-1/2 -translate-y-1/2 rounded"
          style={{
            left:    pct(Math.max(0, launchOffset - 180), TOTAL_DAYS),
            width:   pct(Math.min(180, launchOffset) * (checklistDone / checklistTotal), TOTAL_DAYS),
            height:  10,
            background: barColor,
            opacity: 0.85,
          }}
        />
        {/* Launch diamond */}
        <div
          className="absolute top-1/2 z-20"
          style={{
            left:      pct(launchOffset, TOTAL_DAYS),
            transform: "translate(-50%, -50%) rotate(45deg)",
            width: 10, height: 10,
            background: status === "critical" ? "#dc2626" : status === "warn" ? "#ca8a04" : "#16a34a",
            border: "2px solid white",
          }}
          title={`Запуск: ${launchDateStr} (${daysUntil >= 0 ? `через ${daysUntil} дн.` : `просрочен на ${-daysUntil} дн.`})`}
        />
      </div>
    </div>
  )
}

// ─── MonthHeader ──────────────────────────────────────────────────────────────

function MonthHeader() {
  const months: { label: string; offset: number }[] = []
  const d = new Date(TIMELINE_START)
  while (d <= TIMELINE_END) {
    months.push({
      label:  d.toLocaleDateString("ru-RU", { month: "short", year: "2-digit" }),
      offset: daysDiff(TIMELINE_START, new Date(d)),
    })
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
            style={{ left: pct(m.offset, TOTAL_DAYS) }}
          >
            {m.label}
          </div>
        ))}
        <div
          className="absolute top-0 bottom-0 w-0.5 bg-blue-400/60 z-10"
          style={{ left: pct(todayOffset, TOTAL_DAYS) }}
        >
          <span className="absolute top-0 left-1 text-[8px] text-blue-600 font-semibold whitespace-nowrap">сегодня</span>
        </div>
      </div>
    </div>
  )
}

// ─── Main export ──────────────────────────────────────────────────────────────

function makeObjId(obj: PanelObject) {
  return `${obj.kind}:${obj.kind === "cluster" ? obj.data.id : obj.data.id}`
}

export function ProgramGantt() {
  const [selectedObj, setSelectedObj] = useState<PanelObject | null>(null)

  const planClusters = useMemo(
    () => masterfileClusters.filter((c) => c.dataType === "plan"),
    []
  )

  // Group by fieldName
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

  function clusterStats(clusterId: string) {
    const items = clusterChecklistItems.filter((ci) => ci.clusterId === clusterId)
    return {
      done:     items.filter((i) => i.status === "done").length,
      critical: items.filter((i) => i.status === "critical").length,
      total:    df25ChecklistItems.length,
    }
  }

  function infraStats(infra: InfraObject) {
    const vals = Object.values(infra.checklistStatus) as ChecklistStatus[]
    return {
      done:     vals.filter((v) => v === "done").length,
      critical: vals.filter((v) => v === "critical").length,
      total:    df25ChecklistItems.length,
    }
  }

  function handleSelect(obj: PanelObject) {
    setSelectedObj((prev) => {
      if (!prev) return obj
      return makeObjId(prev) === makeObjId(obj) ? null : obj
    })
  }

  const panelRef = useRef<HTMLDivElement>(null)

  // Auto-scroll the checklist panel into view when it opens
  useEffect(() => {
    if (selectedObj && panelRef.current) {
      setTimeout(() => {
        panelRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })
      }, 60)
    }
  }, [selectedObj])

  // Flatten rows in render order to know where to inject the panel
  type RowEntry =
    | { type: "field-header"; fieldName: string }
    | { type: "infra";   obj: InfraObject }
    | { type: "cluster"; obj: MasterfileCluster }

  const rows: RowEntry[] = useMemo(() => {
    const list: RowEntry[] = []
    for (const [fieldName, { clusters, infra }] of fieldGroups) {
      list.push({ type: "field-header", fieldName })
      for (const inf of infra)      list.push({ type: "infra",   obj: inf })
      for (const cls of clusters)   list.push({ type: "cluster", obj: cls })
    }
    return list
  }, [fieldGroups])

  return (
    <div className="flex flex-col gap-0">
      {/* ── Timeline (scrollable) ── */}
      <div className="border border-border rounded-lg overflow-hidden bg-card">
        <div className="overflow-x-auto overflow-y-auto" style={{ maxHeight: 440 }}>
          <div style={{ minWidth: LABEL_W + CANVAS_MIN_W }}>
            <MonthHeader />

            {rows.map((row) => {
              if (row.type === "field-header") {
                return (
                  <div
                    key={`fh-${row.fieldName}`}
                    className="flex items-center border-b border-border bg-muted/60 px-3 py-1 sticky z-10"
                    style={{ top: 28, minWidth: LABEL_W + CANVAS_MIN_W }}
                  >
                    <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">{row.fieldName}</span>
                  </div>
                )
              }

              if (row.type === "infra") {
                const inf      = row.obj
                const stats    = infraStats(inf)
                const ls       = launchStatus(parseDate(inf.plannedLaunchDate))
                const panelObj: PanelObject = { kind: "infra", data: inf }
                const isSelected = selectedObj?.kind === "infra" && selectedObj.data.id === inf.id

                return (
                  <TimelineRow
                    key={`inf-${inf.id}`}
                    label={inf.name}
                    sublabel={inf.company}
                    typeLabel={inf.typeLabel}
                    launchDateStr={inf.plannedLaunchDate}
                    status={ls}
                    checklistDone={stats.done}
                    checklistTotal={stats.total}
                    checklistCritical={stats.critical}
                    isSelected={isSelected}
                    onClick={() => handleSelect(panelObj)}
                    barColor="#0891b2"
                  />
                )
              }

              // cluster
              const cls      = row.obj
              const stats    = clusterStats(cls.id)
              const ls       = launchStatus(parseDate(cls.plannedLaunchDate ?? "01.12.2026"))
              const panelObj: PanelObject = { kind: "cluster", data: cls }
              const isSelected = selectedObj?.kind === "cluster" && selectedObj.data.id === cls.id

              return (
                <TimelineRow
                  key={`cls-${cls.id}`}
                  label={cls.clusterName}
                  sublabel={cls.fieldName}
                  typeLabel="Куст"
                  launchDateStr={cls.plannedLaunchDate ?? "01.12.2026"}
                  status={ls}
                  checklistDone={stats.done}
                  checklistTotal={stats.total}
                  checklistCritical={stats.critical}
                  isSelected={isSelected}
                  onClick={() => handleSelect(panelObj)}
                  barColor="#16a34a"
                />
              )
            })}
          </div>
        </div>
      </div>

      {/* ── Checklist panel — renders BELOW the timeline in normal doc flow ── */}
      {selectedObj && (
        <div ref={panelRef}>
          <ChecklistGantt obj={selectedObj} onClose={() => setSelectedObj(null)} />
        </div>
      )}
    </div>
  )
}
