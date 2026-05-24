"use client"

import { AppShell } from "@/components/app-shell"
import { StatusBadge, StatusDot } from "@/components/status-badge"
import { landDocuments, type LandDocument } from "@/lib/mock-data"
import { useState } from "react"
import { LandPlot, AlertTriangle, Calendar } from "lucide-react"

const docTypeColors: Record<LandDocument["docType"], string> = {
  lease: "bg-[oklch(0.65_0.15_210/0.12)] text-[oklch(0.75_0.12_210)]",
  easement: "bg-[oklch(0.7_0.12_280/0.12)] text-[oklch(0.78_0.1_280)]",
  allotment: "bg-[oklch(0.72_0.18_70/0.12)] text-[oklch(0.82_0.15_70)]",
  permit: "bg-[oklch(0.62_0.18_145/0.12)] text-[oklch(0.72_0.15_145)]",
}

function DaysLeftCell({ days }: { days: number }) {
  if (days < 0) {
    return <span className="font-mono text-[oklch(0.72_0.18_25)] font-semibold">просрочен {Math.abs(days)} дн.</span>
  }
  if (days <= 60) {
    return <span className="font-mono text-[oklch(0.82_0.15_70)] font-semibold">{days} дн. осталось</span>
  }
  return <span className="font-mono text-muted-foreground">{days} дн.</span>
}

export default function LandPage() {
  const [filter, setFilter] = useState<"all" | "critical" | "warning" | "ok">("all")

  const filtered = landDocuments.filter((d) => filter === "all" || d.status === filter)

  const critical = landDocuments.filter((d) => d.status === "critical").length
  const warning = landDocuments.filter((d) => d.status === "warning").length
  const ok = landDocuments.filter((d) => d.status === "ok").length
  const totalArea = landDocuments.reduce((s, d) => s + d.area, 0).toFixed(1)

  return (
    <AppShell>
      <div className="mb-5">
        <h2 className="text-base font-semibold text-foreground text-balance mb-0.5">
          Земельные отводы и документация
        </h2>
        <p className="text-[11px] text-muted-foreground leading-relaxed max-w-2xl">
          Контроль наличия и актуальности разрешительной документации на пользование землёй: договора аренды, землеотводные акты, сервитуты и разрешения на использование земельных участков.
        </p>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
        {[
          { label: "Всего документов", value: landDocuments.length },
          { label: "Просроченные", value: critical, severity: "critical" as const },
          { label: "Истекают в 60 дн.", value: warning, severity: "warning" as const },
          { label: "Площадь, га", value: totalArea },
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
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`text-[11px] px-2.5 py-1 rounded border transition-colors font-mono ${
              filter === f
                ? "border-primary/60 bg-primary/10 text-primary"
                : "border-border text-muted-foreground hover:border-muted-foreground/50"
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
              <th className="text-left px-3 py-2.5 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Тип документа</th>
              <th className="text-left px-3 py-2.5 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider whitespace-nowrap">Реквизиты</th>
              <th className="text-left px-3 py-2.5 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider whitespace-nowrap">Компания / М-е</th>
              <th className="text-left px-3 py-2.5 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Объект</th>
              <th className="text-right px-3 py-2.5 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider whitespace-nowrap">Площадь, га</th>
              <th className="text-left px-3 py-2.5 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider whitespace-nowrap">Действует до</th>
              <th className="text-left px-3 py-2.5 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider whitespace-nowrap">Остаток</th>
              <th className="text-left px-3 py-2.5 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Статус</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((row, idx) => (
              <tr
                key={row.id}
                className={`border-b border-border/50 hover:bg-muted/20 transition-colors ${idx % 2 === 0 ? "" : "bg-muted/10"}`}
              >
                <td className="px-3 py-2.5 whitespace-nowrap">
                  <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold ${docTypeColors[row.docType]}`}>
                    <LandPlot className="size-3" />
                    {row.docTypeLabel}
                  </span>
                </td>
                <td className="px-3 py-2.5 font-mono text-muted-foreground text-[10px] whitespace-nowrap">{row.docNumber}</td>
                <td className="px-3 py-2.5 whitespace-nowrap">
                  <div className="text-foreground">{row.company}</div>
                  <div className="text-[10px] text-muted-foreground">{row.field}</div>
                </td>
                <td className="px-3 py-2.5 text-muted-foreground max-w-[160px]">{row.object}</td>
                <td className="px-3 py-2.5 text-right font-mono text-muted-foreground whitespace-nowrap">{row.area}</td>
                <td className="px-3 py-2.5 font-mono text-muted-foreground whitespace-nowrap text-[10px]">
                  <div className="flex items-center gap-1">
                    <Calendar className="size-3" />
                    {row.validTo}
                  </div>
                </td>
                <td className="px-3 py-2.5 whitespace-nowrap">
                  <DaysLeftCell days={row.daysLeft} />
                </td>
                <td className="px-3 py-2.5 whitespace-nowrap">
                  <div className="flex flex-col gap-1">
                    <StatusBadge severity={row.status} showLabel size="sm" />
                    {row.status !== "ok" && (
                      <span className="text-[10px] text-muted-foreground flex items-start gap-1 max-w-[140px]">
                        <AlertTriangle className="size-3 flex-shrink-0 mt-0.5 text-[oklch(0.72_0.18_70)]" />
                        {row.comment}
                      </span>
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
    </AppShell>
  )
}
