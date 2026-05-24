"use client"

import { checkModules } from "@/lib/mock-data"
import { cn } from "@/lib/utils"

export function CheckModulesGrid() {
  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
      {checkModules.map((mod) => {
        const total = mod.critical + mod.warning + mod.ok
        const critPct = (mod.critical / total) * 100
        const warnPct = (mod.warning / total) * 100
        const okPct = (mod.ok / total) * 100
        const hasCritical = mod.critical > 0
        const hasWarning = mod.warning > 0 && !hasCritical

        return (
          <div
            key={mod.id}
            className={cn(
              "rounded-md border bg-card p-3 flex flex-col gap-2.5",
              hasCritical
                ? "border-[oklch(0.52_0.22_25/0.4)]"
                : hasWarning
                ? "border-[oklch(0.72_0.18_70/0.4)]"
                : "border-border"
            )}
          >
            <div className="flex items-start justify-between gap-1">
              <span
                className={cn(
                  "text-[10px] font-mono font-bold px-1.5 py-0.5 rounded",
                  hasCritical
                    ? "bg-[oklch(0.52_0.22_25/0.2)] text-[oklch(0.72_0.18_25)]"
                    : hasWarning
                    ? "bg-[oklch(0.72_0.18_70/0.15)] text-[oklch(0.82_0.15_70)]"
                    : "bg-[oklch(0.62_0.18_145/0.15)] text-[oklch(0.72_0.15_145)]"
                )}
              >
                {mod.code}
              </span>
            </div>
            <p className="text-[11px] text-muted-foreground leading-snug line-clamp-2">
              {mod.title}
            </p>

            {/* stacked bar */}
            <div className="flex h-1.5 w-full rounded-full overflow-hidden gap-px">
              {mod.critical > 0 && (
                <div
                  style={{ width: `${critPct}%` }}
                  className="bg-[oklch(0.52_0.22_25)] rounded-l-full"
                  title={`${mod.critical} критических`}
                />
              )}
              {mod.warning > 0 && (
                <div
                  style={{ width: `${warnPct}%` }}
                  className={cn(
                    "bg-[oklch(0.72_0.18_70)]",
                    mod.critical === 0 && "rounded-l-full"
                  )}
                  title={`${mod.warning} предупреждений`}
                />
              )}
              {mod.ok > 0 && (
                <div
                  style={{ width: `${okPct}%` }}
                  className={cn(
                    "bg-[oklch(0.62_0.18_145/0.5)] rounded-r-full",
                    mod.critical === 0 && mod.warning === 0 && "rounded-l-full"
                  )}
                  title={`${mod.ok} в норме`}
                />
              )}
            </div>

            <div className="flex items-center justify-between text-[10px] font-mono">
              <span className="text-[oklch(0.72_0.18_25)] font-semibold">{mod.critical} крит.</span>
              <span className="text-[oklch(0.82_0.15_70)]">{mod.warning} пред.</span>
              <span className="text-muted-foreground">{mod.ok} ок</span>
            </div>

            <p className="text-[9px] text-muted-foreground/50 font-mono">
              Проверено: {mod.lastChecked}
            </p>
          </div>
        )
      })}
    </div>
  )
}
