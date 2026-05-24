"use client"

import { AppShell } from "@/components/app-shell"
import { StatusBadge, StatusDot } from "@/components/status-badge"
import { MasterfileCrossCheck } from "@/components/masterfile-cross-check"
import { wellConservations, type WellConservation } from "@/lib/mock-data"
import { useState } from "react"
import { Drill, CircleDot, AlertTriangle, Database } from "lucide-react"

const statusColors: Record<WellConservation["status"], string> = {
  active: "bg-[oklch(0.62_0.18_145/0.12)] text-[oklch(0.72_0.15_145)]",
  conservation: "bg-[oklch(0.65_0.15_210/0.12)] text-[oklch(0.75_0.12_210)]",
  liquidation: "bg-muted/30 text-muted-foreground",
  mothballed: "bg-[oklch(0.52_0.22_25/0.12)] text-[oklch(0.72_0.18_25)]",
}

const wellTypeLabels: Record<WellConservation["wellType"], string> = {
  production: "Добывающая",
  injection: "Нагнетательная",
  monitoring: "Наблюдательная",
  appraisal: "Разведочная",
}

export default function WellsPage() {
  const [tab, setTab] = useState<"main" | "cross">("main")
  const [filter, setFilter] = useState<"all" | WellConservation["violationSeverity"]>("all")

  const filtered = wellConservations.filter((w) => filter === "all" || w.violationSeverity === filter)
  const critical = wellConservations.filter((w) => w.violationSeverity === "critical").length
  const warning = wellConservations.filter((w) => w.violationSeverity === "warning").length
  const mothballed = wellConservations.filter((w) => w.status === "mothballed").length
  const ok = wellConservations.filter((w) => w.violationSeverity === "ok").length

  return (
    <AppShell>
      <div className="mb-5">
        <h2 className="text-base font-semibold text-foreground text-balance mb-0.5">
          Консервация и ликвидация скважин
        </h2>
        <p className="text-[11px] text-muted-foreground leading-relaxed max-w-2xl">
          Контроль выполнения требований по обращению с фондом скважин: оформление актов консервации/ликвидации, контроль бездействующего фонда, соблюдение сроков плановой консервации.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-5 border-b border-border">
        <button onClick={() => setTab("main")} className={`px-3 py-2 text-xs font-medium transition-colors border-b-2 -mb-px ${tab === "main" ? "border-primary text-foreground" : "border-transparent text-muted-foreground hover:text-foreground"}`}>Реестр скважин</button>
        <button onClick={() => setTab("cross")} className={`flex items-center gap-1.5 px-3 py-2 text-xs font-medium transition-colors border-b-2 -mb-px ${tab === "cross" ? "border-primary text-foreground" : "border-transparent text-muted-foreground hover:text-foreground"}`}><Database className="size-3" /> Сверка с мастерфайлом</button>
      </div>
      {tab === "cross" && <MasterfileCrossCheck module="conservation" />}
      {tab === "main" && (<>

      {/* Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
        {[
          { label: "Скважин в реестре", value: wellConservations.length },
          { label: "Критических нарушений", value: critical, severity: "critical" as const },
          { label: "Предупреждений", value: warning, severity: "warning" as const },
          { label: "Бездействующих", value: mothballed },
        ].map((s) => (
          <div key={s.label} className="rounded-md border border-border bg-card px-4 py-3">
            <div className="flex items-center gap-2 mb-1">
              {"severity" in s && s.severity && <StatusDot severity={s.severity} />}
              <span className="text-[11px] text-muted-foreground">{s.label}</span>
            </div>
            <span className="text-2xl font-bold font-mono text-foreground">{s.value}</span>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2 mb-4">
        {(["all", "critical", "warning", "ok"] as const).map((f) => (
          <button key={f} onClick={() => setFilter(f)}
            className={`text-[11px] px-2.5 py-1 rounded border transition-colors font-mono ${filter === f ? "border-primary/60 bg-primary/10 text-primary" : "border-border text-muted-foreground hover:border-muted-foreground/50"}`}>
            {f === "all" ? "Все" : f === "critical" ? "Критичные" : f === "warning" ? "Предупреждения" : "Норма"}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="rounded-md border border-border bg-card overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-border bg-muted/30">
              <th className="text-left px-3 py-2.5 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Скважина</th>
              <th className="text-left px-3 py-2.5 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider whitespace-nowrap">Тип скважины</th>
              <th className="text-left px-3 py-2.5 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider whitespace-nowrap">Компания / М-е</th>
              <th className="text-left px-3 py-2.5 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider whitespace-nowrap">Статус скважины</th>
              <th className="text-left px-3 py-2.5 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider whitespace-nowrap">Документ</th>
              <th className="text-left px-3 py-2.5 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Требуемые действия / Комментарий</th>
              <th className="text-left px-3 py-2.5 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Нарушение</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((row, idx) => (
              <tr key={row.id} className={`border-b border-border/50 hover:bg-muted/20 transition-colors ${idx % 2 === 0 ? "" : "bg-muted/10"}`}>
                <td className="px-3 py-2.5">
                  <div className="flex items-center gap-2">
                    <Drill className="size-3 text-muted-foreground flex-shrink-0" />
                    <span className="font-mono text-foreground whitespace-nowrap">{row.wellName}</span>
                  </div>
                </td>
                <td className="px-3 py-2.5 text-muted-foreground whitespace-nowrap">{wellTypeLabels[row.wellType]}</td>
                <td className="px-3 py-2.5 whitespace-nowrap">
                  <div className="text-foreground">{row.company}</div>
                  <div className="text-[10px] text-muted-foreground">{row.field}</div>
                </td>
                <td className="px-3 py-2.5 whitespace-nowrap">
                  <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-semibold ${statusColors[row.status]}`}>
                    <CircleDot className="size-3" />
                    {row.statusLabel}
                  </span>
                </td>
                <td className="px-3 py-2.5 whitespace-nowrap">
                  {row.conservationDoc ? (
                    <div>
                      <div className="font-mono text-[10px] text-muted-foreground">{row.conservationDoc}</div>
                      {row.conservationDate && <div className="text-[10px] text-muted-foreground/60">{row.conservationDate}</div>}
                    </div>
                  ) : (
                    <span className="text-[oklch(0.72_0.18_25)] text-[10px] font-semibold">Отсутствует</span>
                  )}
                </td>
                <td className="px-3 py-2.5 max-w-xs">
                  <div className="flex flex-col gap-1">
                    {row.requiredAction && (
                      <span className="flex items-start gap-1 text-[oklch(0.82_0.15_70)]">
                        <AlertTriangle className="size-3 flex-shrink-0 mt-0.5" />
                        {row.requiredAction}
                      </span>
                    )}
                    <span className="text-[10px] text-muted-foreground">{row.comment}</span>
                  </div>
                </td>
                <td className="px-3 py-2.5 whitespace-nowrap">
                  <StatusBadge severity={row.violationSeverity} showLabel size="sm" />
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr><td colSpan={7} className="px-3 py-8 text-center text-muted-foreground">Нет записей</td></tr>
            )}
          </tbody>
        </table>
      </div>
      </>)}
    </AppShell>
  )
}
