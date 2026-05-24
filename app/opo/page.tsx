"use client"

import { AppShell } from "@/components/app-shell"
import { StatusBadge, StatusDot } from "@/components/status-badge"
import { MasterfileCrossCheck } from "@/components/masterfile-cross-check"
import { opoObjects } from "@/lib/mock-data"
import { useState } from "react"
import { Flame, Calendar, Shield, Database } from "lucide-react"

const classColors: Record<string, string> = {
  I: "bg-[oklch(0.52_0.22_25/0.2)] text-[oklch(0.72_0.18_25)] border border-[oklch(0.52_0.22_25/0.4)]",
  II: "bg-[oklch(0.72_0.18_70/0.15)] text-[oklch(0.82_0.15_70)] border border-[oklch(0.72_0.18_70/0.3)]",
  III: "bg-[oklch(0.65_0.15_210/0.12)] text-[oklch(0.75_0.12_210)] border border-[oklch(0.65_0.15_210/0.3)]",
  IV: "bg-muted/30 text-muted-foreground border border-border",
}

function DaysLeftCell({ days }: { days: number }) {
  if (days < 0) return <span className="font-mono text-[oklch(0.72_0.18_25)] font-semibold">просрочен {Math.abs(days)} дн.</span>
  if (days <= 60) return <span className="font-mono text-[oklch(0.82_0.15_70)] font-semibold">{days} дн.</span>
  return <span className="font-mono text-muted-foreground">{days} дн.</span>
}

export default function OpoPage() {
  const [tab, setTab] = useState<"main" | "cross">("main")
  const [filter, setFilter] = useState<"all" | "critical" | "warning" | "ok">("all")

  const filtered = opoObjects.filter((o) => filter === "all" || o.status === filter)
  const critical = opoObjects.filter((o) => o.status === "critical").length
  const warning = opoObjects.filter((o) => o.status === "warning").length
  const ok = opoObjects.filter((o) => o.status === "ok").length

  return (
    <AppShell>
      <div className="mb-5">
        <h2 className="text-base font-semibold text-foreground text-balance mb-0.5">
          Опасные производственные объекты (ОПО)
        </h2>
        <p className="text-[11px] text-muted-foreground leading-relaxed max-w-2xl">
          Контроль наличия действующих разрешений на эксплуатацию ОПО. При отсутствии или просрочке разрешения эксплуатация объекта запрещена. Классы опасности: I — чрезвычайно высокая, II — высокая, III — средняя, IV — низкая.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-5 border-b border-border">
        <button onClick={() => setTab("main")} className={`px-3 py-2 text-xs font-medium transition-colors border-b-2 -mb-px ${tab === "main" ? "border-primary text-foreground" : "border-transparent text-muted-foreground hover:text-foreground"}`}>Реестр ОПО</button>
        <button onClick={() => setTab("cross")} className={`flex items-center gap-1.5 px-3 py-2 text-xs font-medium transition-colors border-b-2 -mb-px ${tab === "cross" ? "border-primary text-foreground" : "border-transparent text-muted-foreground hover:text-foreground"}`}><Database className="size-3" /> Сверка с мастерфайлом</button>
      </div>
      {tab === "cross" && <MasterfileCrossCheck module="opo" />}
      {tab === "main" && (<>

      {/* Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
        {[
          { label: "Всего объектов", value: opoObjects.length },
          { label: "Просроченные", value: critical, severity: "critical" as const },
          { label: "Истекают в 60 дн.", value: warning, severity: "warning" as const },
          { label: "В порядке", value: ok, severity: "ok" as const },
        ].map((s) => (
          <div key={s.label} className="rounded-md border border-border bg-card px-4 py-3">
            <div className="flex items-center gap-2 mb-1">
              <StatusDot severity={s.severity} />
              <span className="text-[11px] text-muted-foreground">{s.label}</span>
            </div>
            <span className="text-2xl font-bold font-mono text-foreground">{s.value}</span>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2 mb-4">
        {(["all", "critical", "warning", "ok"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`text-[11px] px-2.5 py-1 rounded border transition-colors font-mono ${
              filter === f ? "border-primary/60 bg-primary/10 text-primary" : "border-border text-muted-foreground hover:border-muted-foreground/50"
            }`}
          >
            {f === "all" ? "Все" : f === "critical" ? "Просроченные" : f === "warning" ? "Истекают" : "Норма"}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="rounded-md border border-border bg-card overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-border bg-muted/30">
              <th className="text-left px-3 py-2.5 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Объект ОПО</th>
              <th className="text-left px-3 py-2.5 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider whitespace-nowrap">Класс</th>
              <th className="text-left px-3 py-2.5 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider whitespace-nowrap">Компания / М-е</th>
              <th className="text-left px-3 py-2.5 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Тип документа</th>
              <th className="text-left px-3 py-2.5 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider whitespace-nowrap">Номер</th>
              <th className="text-left px-3 py-2.5 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider whitespace-nowrap">Действует до</th>
              <th className="text-left px-3 py-2.5 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider whitespace-nowrap">Остаток</th>
              <th className="text-left px-3 py-2.5 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Статус / Комментарий</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((row, idx) => (
              <tr
                key={row.id}
                className={`border-b border-border/50 hover:bg-muted/20 transition-colors ${idx % 2 === 0 ? "" : "bg-muted/10"}`}
              >
                <td className="px-3 py-2.5">
                  <div className="flex items-center gap-2">
                    <Flame className={`size-3 flex-shrink-0 ${row.opoClass === "I" ? "text-[oklch(0.72_0.18_25)]" : "text-muted-foreground"}`} />
                    <span className="text-foreground">{row.name}</span>
                  </div>
                </td>
                <td className="px-3 py-2.5 whitespace-nowrap">
                  <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold ${classColors[row.opoClass]}`}>
                    <Shield className="size-3" />
                    {row.opoClass}
                  </span>
                </td>
                <td className="px-3 py-2.5 whitespace-nowrap">
                  <div className="text-foreground">{row.company}</div>
                  <div className="text-[10px] text-muted-foreground">{row.field}</div>
                </td>
                <td className="px-3 py-2.5 text-muted-foreground">{row.docType}</td>
                <td className="px-3 py-2.5 font-mono text-muted-foreground text-[10px] whitespace-nowrap">{row.docNumber}</td>
                <td className="px-3 py-2.5 font-mono text-muted-foreground whitespace-nowrap text-[10px]">
                  <div className="flex items-center gap-1">
                    <Calendar className="size-3" />
                    {row.validTo}
                  </div>
                </td>
                <td className="px-3 py-2.5 whitespace-nowrap">
                  <DaysLeftCell days={row.daysLeft} />
                </td>
                <td className="px-3 py-2.5">
                  <div className="flex flex-col gap-1">
                    <StatusBadge severity={row.status} showLabel size="sm" />
                    {row.status !== "ok" && (
                      <span className="text-[10px] text-muted-foreground max-w-[160px] leading-relaxed">{row.comment}</span>
                    )}
                  </div>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr><td colSpan={8} className="px-3 py-8 text-center text-muted-foreground">Нет записей</td></tr>
            )}
          </tbody>
        </table>
      </div>
      </>)}
    </AppShell>
  )
}
