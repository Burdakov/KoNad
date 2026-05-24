"use client"

import { useState } from "react"
import { ChevronDown, ChevronRight, CalendarDays, Building2, CheckCircle2, Circle } from "lucide-react"
import { type RoadmapItem, type RoadmapModule } from "@/lib/mock-data"

const MODULE_COLORS: Record<RoadmapModule, string> = {
  spatial: "bg-[oklch(0.65_0.15_210/0.15)] text-[oklch(0.65_0.15_210)] border-[oklch(0.65_0.15_210/0.3)]",
  tsr:     "bg-[oklch(0.72_0.18_70/0.15)]  text-[oklch(0.82_0.15_70)]  border-[oklch(0.72_0.18_70/0.3)]",
  land:    "bg-[oklch(0.62_0.18_145/0.15)] text-[oklch(0.62_0.18_145)] border-[oklch(0.62_0.18_145/0.3)]",
  opo:     "bg-[oklch(0.52_0.22_25/0.15)]  text-[oklch(0.72_0.18_25)]  border-[oklch(0.52_0.22_25/0.3)]",
  ker:     "bg-[oklch(0.62_0.18_145/0.15)] text-[oklch(0.62_0.18_145)] border-[oklch(0.62_0.18_145/0.3)]",
  conservation: "bg-[oklch(0.72_0.18_70/0.15)] text-[oklch(0.82_0.15_70)] border-[oklch(0.72_0.18_70/0.3)]",
  license: "bg-[oklch(0.65_0.15_210/0.15)] text-[oklch(0.65_0.15_210)] border-[oklch(0.65_0.15_210/0.3)]",
  reporting:"bg-[oklch(0.7_0.12_280/0.15)] text-[oklch(0.7_0.12_280)]  border-[oklch(0.7_0.12_280/0.3)]",
}

const MODULE_LABELS: Record<RoadmapModule, string> = {
  spatial: "ПРОСТ",
  tsr: "ТСР",
  land: "ЗЕМЛЯ",
  opo: "ОПО",
  ker: "КЭР",
  conservation: "КОНС",
  license: "ЛИЦ",
  reporting: "ОТЧЁТ",
}

interface RoadmapPanelProps {
  items: RoadmapItem[]
  objectName: string
}

export function RoadmapPanel({ items, objectName }: RoadmapPanelProps) {
  const [expanded, setExpanded] = useState<Record<string, boolean>>({})

  if (items.length === 0) {
    return (
      <div className="flex items-center gap-2 py-4 px-3 text-xs text-[oklch(0.62_0.18_145)]">
        <CheckCircle2 className="size-4 flex-shrink-0" />
        <span>Объект полностью обеспечен документами по всем модулям.</span>
      </div>
    )
  }

  const totalDays = Math.max(...items.map((i) => i.totalDays))

  return (
    <div className="space-y-2">
      {/* Summary banner */}
      <div className="flex flex-wrap items-center gap-2 p-2.5 rounded-md border border-[oklch(0.52_0.22_25/0.35)] bg-[oklch(0.52_0.22_25/0.08)]">
        <span className="text-[11px] text-[oklch(0.72_0.18_25)] font-medium leading-relaxed">
          Объект <span className="font-mono">{objectName}</span> ведёт добычу без полного пакета документов.
          Выявлено пробелов: <span className="font-semibold">{items.length}</span>.
          Ориентировочный срок устранения: <span className="font-semibold">{totalDays} р.д.</span>
        </span>
        <div className="flex flex-wrap gap-1 ml-auto">
          {items.map((item) => (
            <span
              key={item.module}
              className={`text-[9px] font-semibold px-1.5 py-0.5 rounded border ${MODULE_COLORS[item.module]}`}
            >
              {MODULE_LABELS[item.module]}
            </span>
          ))}
        </div>
      </div>

      {/* Roadmap items */}
      {items.map((item) => {
        const isOpen = expanded[item.module] ?? false
        return (
          <div
            key={item.module}
            className="rounded-md border border-border bg-card overflow-hidden"
          >
            {/* Header */}
            <button
              onClick={() => setExpanded((prev) => ({ ...prev, [item.module]: !isOpen }))}
              className="w-full flex items-center gap-2 px-3 py-2.5 text-left hover:bg-muted/20 transition-colors"
            >
              <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded border flex-shrink-0 ${MODULE_COLORS[item.module]}`}>
                {MODULE_LABELS[item.module]}
              </span>
              <span className="text-xs font-medium text-foreground flex-1 text-balance">{item.moduleTitle}</span>
              <span className="text-[10px] text-muted-foreground font-mono flex-shrink-0 mr-1">
                {item.totalDays} р.д. / {item.steps.length} шагов
              </span>
              {isOpen ? <ChevronDown className="size-3.5 text-muted-foreground flex-shrink-0" /> : <ChevronRight className="size-3.5 text-muted-foreground flex-shrink-0" />}
            </button>

            {/* Steps */}
            {isOpen && (
              <div className="border-t border-border">
                {item.steps.map((step, idx) => {
                  const isLast = idx === item.steps.length - 1
                  return (
                    <div
                      key={step.order}
                      className={`flex gap-3 px-3 py-2.5 ${!isLast ? "border-b border-border/40" : ""}`}
                    >
                      {/* Step indicator */}
                      <div className="flex flex-col items-center flex-shrink-0 pt-0.5">
                        <div className="size-5 rounded-full border border-border bg-muted/30 flex items-center justify-center">
                          <span className="text-[9px] font-mono text-muted-foreground">{step.order}</span>
                        </div>
                        {!isLast && <div className="w-px flex-1 bg-border/50 mt-1" />}
                      </div>
                      {/* Content */}
                      <div className="flex-1 min-w-0 pb-1">
                        <p className="text-[11px] text-foreground leading-relaxed">{step.action}</p>
                        <div className="flex flex-wrap items-center gap-3 mt-1.5">
                          <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
                            <Building2 className="size-3" />
                            {step.department}
                          </span>
                          <span className="flex items-center gap-1 text-[10px] text-muted-foreground font-mono">
                            <CalendarDays className="size-3" />
                            до {step.targetDate}
                          </span>
                          <span className="text-[10px] text-muted-foreground font-mono">
                            {step.daysToComplete} р.д.
                          </span>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
