"use client"

import { recentAlerts } from "@/lib/mock-data"
import { StatusDot } from "@/components/status-badge"
import { cn } from "@/lib/utils"

export function AlertsFeed() {
  return (
    <div className="flex flex-col divide-y divide-border/50">
      {recentAlerts.map((alert) => (
        <div
          key={alert.id}
          className={cn(
            "py-3 px-3 flex gap-3 hover:bg-muted/20 transition-colors cursor-default",
            alert.severity === "critical" && "hover:bg-[oklch(0.52_0.22_25/0.05)]"
          )}
        >
          <div className="mt-1 flex-shrink-0">
            <StatusDot severity={alert.severity} />
          </div>
          <div className="flex flex-col gap-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span
                className={cn(
                  "text-[10px] font-mono font-bold px-1.5 py-0.5 rounded",
                  alert.severity === "critical"
                    ? "bg-[oklch(0.52_0.22_25/0.2)] text-[oklch(0.72_0.18_25)]"
                    : "bg-[oklch(0.72_0.18_70/0.15)] text-[oklch(0.82_0.15_70)]"
                )}
              >
                {alert.module}
              </span>
              <span className="text-[11px] text-muted-foreground/70">
                {alert.company} · {alert.field}
              </span>
            </div>
            <p className="text-sm text-foreground/85 leading-snug">{alert.text}</p>
            <span className="text-[10px] text-muted-foreground/50 font-mono">{alert.time}</span>
          </div>
        </div>
      ))}
    </div>
  )
}
