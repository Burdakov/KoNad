"use client"

import { kpiCards } from "@/lib/mock-data"
import { cn } from "@/lib/utils"
import {
  AlertTriangle,
  CheckCircle2,
  Drill,
  XCircle,
} from "lucide-react"

const icons = {
  critical: XCircle,
  warning: AlertTriangle,
  ok: CheckCircle2,
  info: Drill,
}

const colors = {
  critical: {
    icon: "text-[oklch(0.72_0.18_25)]",
    value: "text-[oklch(0.72_0.18_25)]",
    border: "border-[oklch(0.52_0.22_25/0.4)]",
    glow: "shadow-[0_0_0_1px_oklch(0.52_0.22_25/0.2)]",
  },
  warning: {
    icon: "text-[oklch(0.82_0.15_70)]",
    value: "text-[oklch(0.82_0.15_70)]",
    border: "border-[oklch(0.72_0.18_70/0.4)]",
    glow: "shadow-[0_0_0_1px_oklch(0.72_0.18_70/0.2)]",
  },
  ok: {
    icon: "text-[oklch(0.72_0.15_145)]",
    value: "text-[oklch(0.72_0.15_145)]",
    border: "border-[oklch(0.62_0.18_145/0.4)]",
    glow: "shadow-[0_0_0_1px_oklch(0.62_0.18_145/0.2)]",
  },
  info: {
    icon: "text-[oklch(0.75_0.12_210)]",
    value: "text-[oklch(0.75_0.12_210)]",
    border: "border-[oklch(0.65_0.15_210/0.4)]",
    glow: "shadow-[0_0_0_1px_oklch(0.65_0.15_210/0.2)]",
  },
}

export function KpiCards() {
  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      {kpiCards.map((card) => {
        const Icon = icons[card.severity as keyof typeof icons] ?? Drill
        const c = colors[card.severity as keyof typeof colors]
        return (
          <div
            key={card.id}
            className={cn(
              "rounded-md border bg-card p-4 flex flex-col gap-2",
              c.border,
              c.glow
            )}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground leading-tight text-balance">
                {card.label}
              </span>
              <Icon className={cn("size-4 flex-shrink-0", c.icon)} />
            </div>
            <div className="flex items-baseline gap-1">
              <span className={cn("text-3xl font-mono font-bold tabular-nums", c.value)}>
                {card.value.toLocaleString("ru-RU")}
              </span>
              {card.unit && (
                <span className="text-sm text-muted-foreground font-mono">{card.unit}</span>
              )}
            </div>
            <p className="text-[11px] text-muted-foreground leading-relaxed">{card.description}</p>
          </div>
        )
      })}
    </div>
  )
}
