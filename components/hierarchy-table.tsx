"use client"

import { useState } from "react"
import { hierarchyRows, type HierarchyRow } from "@/lib/mock-data"
import { StatusBadge } from "@/components/status-badge"
import { cn } from "@/lib/utils"
import { ChevronRight, Building2, MapPin, Layers, Circle, Drill } from "lucide-react"

const LEVEL_ICONS = {
  company: Building2,
  field: MapPin,
  area: Layers,
  cluster: Circle,
  well: Drill,
}

const LEVEL_LABELS = {
  company: "Компания",
  field: "Месторождение",
  area: "Участок недр",
  cluster: "Куст",
  well: "Скважина",
}

const LEVEL_INDENT = {
  company: 0,
  field: 1,
  area: 2,
  cluster: 3,
  well: 4,
}

const VIOLATION_COLS = [
  { key: "spatial", label: "ПРОСТ" },
  { key: "tsr", label: "ТСР" },
  { key: "land", label: "ЗЕМЛЯ" },
  { key: "opo", label: "ОПО" },
  { key: "ker", label: "КЭР" },
  { key: "conservation", label: "КОНС" },
  { key: "license", label: "ЛИЦ" },
  { key: "reporting", label: "ОТЧЁТ" },
  { key: "hydro", label: "ГИДРО" },
] as const

function ViolationCell({ value }: { value: number }) {
  if (value === 0) {
    return <span className="text-muted-foreground/40 text-xs font-mono">—</span>
  }
  return (
    <span className="text-xs font-mono font-semibold text-[oklch(0.72_0.18_25)]">{value}</span>
  )
}

export function HierarchyTable() {
  const [expanded, setExpanded] = useState<Set<string>>(
    new Set(["c1", "f1", "a1", "cl1"])
  )

  function toggle(id: string) {
    setExpanded((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  // Build visible rows respecting expand state
  const visible: HierarchyRow[] = []
  function addRows(parentId: string | null, rows: HierarchyRow[]) {
    for (const row of rows) {
      if (row.parentId !== parentId) continue
      visible.push(row)
      const hasChildren = rows.some((r) => r.parentId === row.id)
      if (hasChildren && expanded.has(row.id)) {
        addRows(row.id, rows)
      }
    }
  }
  addRows(null, hierarchyRows)

  return (
    <div className="overflow-x-auto rounded-md border border-border">
      <table className="w-full text-sm border-collapse min-w-[900px]">
        <thead>
          <tr className="border-b border-border bg-muted/30">
            <th className="text-left py-2 px-3 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider w-full">
              Объект
            </th>
            <th className="py-2 px-2 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider text-center whitespace-nowrap">
              Статус
            </th>
            {VIOLATION_COLS.map((col) => (
              <th
                key={col.key}
                className="py-2 px-2 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider text-center whitespace-nowrap"
                title={col.label}
              >
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {visible.map((row) => {
            const Icon = LEVEL_ICONS[row.level]
            const indent = LEVEL_INDENT[row.level]
            const hasChildren = hierarchyRows.some((r) => r.parentId === row.id)
            const isExpanded = expanded.has(row.id)
            const totalViolations = Object.values(row.violations).reduce((a, b) => a + b, 0)

            return (
              <tr
                key={row.id}
                className={cn(
                  "border-b border-border/50 hover:bg-muted/20 transition-colors",
                  row.status === "critical" && "hover:bg-[oklch(0.52_0.22_25/0.05)]",
                  row.status === "warning" && "hover:bg-[oklch(0.72_0.18_70/0.05)]",
                )}
              >
                <td className="py-2 px-3">
                  <div
                    className="flex items-center gap-2"
                    style={{ paddingLeft: `${indent * 20}px` }}
                  >
                    {hasChildren ? (
                      <button
                        onClick={() => toggle(row.id)}
                        className="flex items-center justify-center size-4 text-muted-foreground hover:text-foreground transition-colors flex-shrink-0"
                        aria-label={isExpanded ? "Свернуть" : "Развернуть"}
                      >
                        <ChevronRight
                          className={cn("size-3.5 transition-transform", isExpanded && "rotate-90")}
                        />
                      </button>
                    ) : (
                      <span className="size-4 flex-shrink-0" />
                    )}
                    <Icon
                      className={cn(
                        "size-3.5 flex-shrink-0",
                        row.status === "critical"
                          ? "text-[oklch(0.72_0.18_25)]"
                          : row.status === "warning"
                          ? "text-[oklch(0.82_0.15_70)]"
                          : "text-muted-foreground"
                      )}
                    />
                    <span
                      className={cn(
                        "text-sm leading-tight",
                        row.level === "company" && "font-semibold text-foreground",
                        row.level === "field" && "font-medium text-foreground/90",
                        (row.level === "area" || row.level === "cluster" || row.level === "well") &&
                          "text-foreground/75"
                      )}
                    >
                      {row.name}
                    </span>
                    <span className="text-[10px] text-muted-foreground/50 hidden lg:inline">
                      {LEVEL_LABELS[row.level]}
                    </span>
                  </div>
                </td>
                <td className="py-2 px-2 text-center">
                  {totalViolations > 0 ? (
                    <StatusBadge severity={row.status} count={totalViolations} size="sm" />
                  ) : (
                    <StatusBadge severity="ok" showLabel={false} size="sm" count={0} />
                  )}
                </td>
                {VIOLATION_COLS.map((col) => (
                  <td key={col.key} className="py-2 px-2 text-center">
                    <ViolationCell value={row.violations[col.key]} />
                  </td>
                ))}
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
