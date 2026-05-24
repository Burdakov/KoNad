"use client"

import { useState, useRef } from "react"
import type { GanttRow } from "@/lib/mock-data"
import { ChevronDown, ChevronRight, AlertTriangle, CheckCircle2, Clock } from "lucide-react"
import { cn } from "@/lib/utils"

// ─── Constants ───────────────────────────────────────────────────────────────
const DAY_WIDTH_PX = 3          // px per calendar day in the timeline
const LABEL_COL_W  = 280        // px for the sticky label column
const ROW_H        = 36         // px per row
const HEADER_H     = 48         // px for month/day header
const TOTAL_DAYS   = 480        // how many calendar days to show (~16 months)

const TODAY_OFFSET = 0          // day 0 = 23.05.2026

// ─── Helpers ─────────────────────────────────────────────────────────────────
function monthHeaders(totalDays: number): { label: string; startDay: number; widthDays: number }[] {
  const start = new Date(2026, 4, 23) // 23.05.2026
  const headers: { label: string; startDay: number; widthDays: number }[] = []
  let cursor = new Date(start)
  let day = 0
  while (day < totalDays) {
    const monthStart = day
    const month = cursor.getMonth()
    const year  = cursor.getFullYear()
    const label = cursor.toLocaleString("ru-RU", { month: "short", year: "2-digit" })
    // advance to start of next month
    cursor = new Date(year, month + 1, 1)
    const daysInSegment = Math.min(
      Math.round((cursor.getTime() - new Date(start.getTime() + day * 86400000).getTime()) / 86400000),
      totalDays - day
    )
    headers.push({ label, startDay: monthStart, widthDays: daysInSegment })
    day += daysInSegment
  }
  return headers
}

const STATUS_COLOR: Record<string, string> = {
  ok:       "#16a34a",
  warn:     "#ca8a04",
  critical: "#dc2626",
}

const STATUS_BG: Record<string, string> = {
  ok:       "#dcfce7",
  warn:     "#fef9c3",
  critical: "#fee2e2",
}

function StatusIcon({ status }: { status: string }) {
  if (status === "critical") return <AlertTriangle className="size-3 text-red-600 flex-shrink-0" />
  if (status === "warn")     return <Clock className="size-3 text-yellow-600 flex-shrink-0" />
  return <CheckCircle2 className="size-3 text-green-600 flex-shrink-0" />
}

// ─── Single row ──────────────────────────────────────────────────────────────
function GanttRowBar({
  row,
  expanded,
  onToggle,
}: {
  row: GanttRow
  expanded: boolean
  onToggle: () => void
}) {
  const barLeft  = (row.startOffset) * DAY_WIDTH_PX
  const barWidth = Math.max(row.totalCalendarDays * DAY_WIDTH_PX, 8)
  const milestoneX = row.daysUntilLaunch * DAY_WIDTH_PX

  return (
    <>
      {/* Main row */}
      <div className="flex items-center border-b border-border/60 hover:bg-muted/30 transition-colors" style={{ height: ROW_H }}>
        {/* Sticky label */}
        <div
          className="flex items-center gap-1.5 px-2 flex-shrink-0 bg-background border-r border-border/60 cursor-pointer select-none"
          style={{ width: LABEL_COL_W, height: ROW_H }}
          onClick={onToggle}
        >
          {expanded
            ? <ChevronDown className="size-3 text-muted-foreground flex-shrink-0" />
            : <ChevronRight className="size-3 text-muted-foreground flex-shrink-0" />}
          <span
            className="text-[10px] font-semibold px-1.5 py-0.5 rounded text-white flex-shrink-0"
            style={{ background: row.moduleColor }}
          >
            {row.module.toUpperCase().slice(0, 5)}
          </span>
          <span className="text-xs text-foreground truncate">{row.moduleTitle}</span>
        </div>

        {/* Timeline cell */}
        <div className="relative flex-1 overflow-hidden" style={{ height: ROW_H }}>
          {/* Bar */}
          <div
            className="absolute top-1/2 -translate-y-1/2 rounded-sm opacity-90"
            style={{
              left: barLeft,
              width: barWidth,
              height: 14,
              background: STATUS_COLOR[row.deadlineStatus] ?? "#6b7280",
              opacity: 0.75,
            }}
            title={`${row.moduleTitle}: ${row.totalCalendarDays} дн.`}
          />
          {/* Milestone diamond */}
          {row.daysUntilLaunch >= 0 && row.daysUntilLaunch < TOTAL_DAYS && (
            <div
              className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2"
              style={{ left: milestoneX }}
              title={`Плановый запуск: ${row.plannedLaunchDate}`}
            >
              <div
                className="size-3 rotate-45 border-2"
                style={{
                  borderColor: STATUS_COLOR[row.deadlineStatus],
                  background: "#fff",
                }}
              />
            </div>
          )}
        </div>
      </div>

      {/* Expanded steps */}
      {expanded && row.steps.map((step, i) => {
        const stepLeft  = step.startOffset * DAY_WIDTH_PX
        const stepWidth = Math.max(step.durationDays * DAY_WIDTH_PX, 6)
        return (
          <div key={i} className="flex items-center border-b border-border/30 bg-muted/20" style={{ height: ROW_H - 4 }}>
            {/* Label */}
            <div
              className="flex items-center gap-1.5 px-3 flex-shrink-0 border-r border-border/40"
              style={{ width: LABEL_COL_W, height: ROW_H - 4 }}
            >
              <span className="text-[10px] text-muted-foreground font-mono w-4 text-right flex-shrink-0">{i + 1}.</span>
              <span className="text-[10px] text-foreground truncate" title={step.label}>{step.label}</span>
            </div>
            {/* Step bar */}
            <div className="relative flex-1 overflow-hidden" style={{ height: ROW_H - 4 }}>
              <div
                className="absolute top-1/2 -translate-y-1/2 rounded-sm"
                style={{
                  left: stepLeft,
                  width: stepWidth,
                  height: 10,
                  background: STATUS_COLOR[step.status] ?? "#6b7280",
                  opacity: 0.45,
                }}
                title={`${step.department} — ${step.durationDays} р.д.`}
              />
              {/* Dept label inside bar if wide enough */}
              {stepWidth > 60 && (
                <span
                  className="absolute top-1/2 -translate-y-1/2 text-[9px] font-medium truncate px-1"
                  style={{ left: stepLeft, maxWidth: stepWidth, color: STATUS_COLOR[step.status] }}
                >
                  {step.department}
                </span>
              )}
            </div>
          </div>
        )
      })}
    </>
  )
}

// ─── Object group header ──────────────────────────────────────────────────────
function ObjectGroupHeader({ label, company, status, daysUntilLaunch, launchDate }: {
  label: string
  company: string
  status: "ok" | "warn" | "critical"
  daysUntilLaunch: number
  launchDate: string
}) {
  return (
    <div
      className="flex items-center gap-2 px-3 border-b border-border sticky top-0 z-10"
      style={{ height: 32, background: STATUS_BG[status] ?? "#f9fafb" }}
    >
      <StatusIcon status={status} />
      <span className="text-xs font-semibold text-foreground">{label}</span>
      <span className="text-[10px] text-muted-foreground">·</span>
      <span className="text-[10px] text-muted-foreground truncate">{company}</span>
      <span className="ml-auto text-[10px] font-mono" style={{ color: STATUS_COLOR[status] }}>
        {daysUntilLaunch >= 0 ? `${daysUntilLaunch} дн. до запуска (${launchDate})` : `Просрочен (${launchDate})`}
      </span>
    </div>
  )
}

// ─── Public component ─────────────────────────────────────────────────────────
interface GanttChartProps {
  rows: GanttRow[]
}

export function GanttChart({ rows }: GanttChartProps) {
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set())
  const timelineRef = useRef<HTMLDivElement>(null)
  const headers = monthHeaders(TOTAL_DAYS)
  const timelineWidth = TOTAL_DAYS * DAY_WIDTH_PX

  function toggle(id: string) {
    setExpandedIds((prev) => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  // Group by objectLabel
  const groups = rows.reduce<Record<string, GanttRow[]>>((acc, row) => {
    if (!acc[row.objectLabel]) acc[row.objectLabel] = []
    acc[row.objectLabel].push(row)
    return acc
  }, {})

  const totalWidth = LABEL_COL_W + timelineWidth

  return (
    <div className="border border-border rounded-lg overflow-hidden bg-background">
      {/* Sticky header row */}
      <div className="flex" style={{ minWidth: totalWidth }}>
        {/* Label col header */}
        <div
          className="flex-shrink-0 flex items-end px-3 pb-1 border-r border-b border-border bg-muted/40 text-[10px] font-semibold text-muted-foreground uppercase tracking-wide"
          style={{ width: LABEL_COL_W, height: HEADER_H }}
        >
          Пакет документов
        </div>
        {/* Month headers */}
        <div className="relative flex-1 border-b border-border bg-muted/40" style={{ height: HEADER_H }}>
          <div className="absolute inset-0 flex" ref={timelineRef}>
            {headers.map((h) => (
              <div
                key={h.startDay}
                className="flex items-end px-1 pb-1 border-r border-border/40 flex-shrink-0 text-[10px] text-muted-foreground font-mono"
                style={{ width: h.widthDays * DAY_WIDTH_PX, height: HEADER_H }}
              >
                {h.label}
              </div>
            ))}
          </div>
          {/* Today line */}
          <div
            className="absolute top-0 bottom-0 w-px bg-primary/70 z-10"
            style={{ left: TODAY_OFFSET * DAY_WIDTH_PX }}
          >
            <span className="absolute -top-0 left-1 text-[9px] text-primary font-semibold whitespace-nowrap">сегодня</span>
          </div>
        </div>
      </div>

      {/* Scrollable body */}
      <div className="overflow-x-auto overflow-y-auto" style={{ maxHeight: "70vh" }}>
        <div style={{ minWidth: totalWidth }}>
          {Object.entries(groups).map(([label, groupRows]) => {
            const firstRow = groupRows[0]
            // Determine worst status in the group
            const worstStatus = groupRows.some(r => r.deadlineStatus === "critical") ? "critical"
              : groupRows.some(r => r.deadlineStatus === "warn") ? "warn"
              : "ok"

            return (
              <div key={label} className="relative">
                {/* Object header */}
                <div className="flex sticky left-0" style={{ minWidth: totalWidth }}>
                  <ObjectGroupHeader
                    label={label}
                    company={firstRow.company}
                    status={worstStatus}
                    daysUntilLaunch={firstRow.daysUntilLaunch}
                    launchDate={firstRow.plannedLaunchDate}
                  />
                </div>

                {/* Today vertical line across all rows */}
                <div className="relative">
                  {groupRows.map((row) => (
                    <GanttRowBar
                      key={row.id}
                      row={row}
                      expanded={expandedIds.has(row.id)}
                      onToggle={() => toggle(row.id)}
                    />
                  ))}
                  {/* Today line overlay */}
                  <div
                    className="absolute top-0 bottom-0 w-px bg-primary/30 pointer-events-none"
                    style={{ left: LABEL_COL_W + TODAY_OFFSET * DAY_WIDTH_PX }}
                  />
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
