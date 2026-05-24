"use client"

import { AppShell } from "@/components/app-shell"
import { StatusBadge, StatusDot } from "@/components/status-badge"
import { reportingObligations } from "@/lib/mock-data"
import { useState } from "react"
import { ScrollText, CheckCircle2, XCircle, AlertTriangle, Calendar } from "lucide-react"

export default function ReportingPage() {
  const [filter, setFilter] = useState<"all" | "critical" | "warning" | "ok">("all")

  const filtered = reportingObligations.filter((r) => filter === "all" || r.status === filter)
  const critical = reportingObligations.filter((r) => r.status === "critical").length
  const warning = reportingObligations.filter((r) => r.status === "warning").length
  const ok = reportingObligations.filter((r) => r.status === "ok").length
  const notSubmitted = reportingObligations.filter((r) => !r.submittedDate).length

  return (
    <AppShell>
      <div className="mb-5">
        <h2 className="text-base font-semibold text-foreground text-balance mb-0.5">
          Регламентная и статистическая отчётность
        </h2>
        <p className="text-[11px] text-muted-foreground leading-relaxed max-w-2xl">
          Контроль полноты и своевременности предоставления обязательной отчётности. Проверка соответствия данных отчётов: ТСР, КЭР, данным ИС ИПР и бухгалтерской отчётности (баланс газа).
        </p>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
        {[
          { label: "Всего обязательств", value: reportingObligations.length },
          { label: "Критических нарушений", value: critical, severity: "critical" as const },
          { label: "Расхождения данных", value: warning, severity: "warning" as const },
          { label: "Не представлено", value: notSubmitted, severity: notSubmitted > 0 ? "critical" as const : "ok" as const },
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
            {f === "all" ? "Все" : f === "critical" ? "Критичные" : f === "warning" ? "Расхождения" : "Норма"}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="rounded-md border border-border bg-card overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-border bg-muted/30">
              <th className="text-left px-3 py-2.5 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Вид отчёта</th>
              <th className="text-left px-3 py-2.5 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider whitespace-nowrap">Нормативная база</th>
              <th className="text-left px-3 py-2.5 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider whitespace-nowrap">Компания / М-е</th>
              <th className="text-left px-3 py-2.5 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider whitespace-nowrap">Срок сдачи</th>
              <th className="text-left px-3 py-2.5 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider whitespace-nowrap">Факт. сдача</th>
              <th className="text-left px-3 py-2.5 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Расхождения / Комментарий</th>
              <th className="text-left px-3 py-2.5 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Статус</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((row, idx) => (
              <tr key={row.id} className={`border-b border-border/50 hover:bg-muted/20 transition-colors ${idx % 2 === 0 ? "" : "bg-muted/10"}`}>
                <td className="px-3 py-2.5">
                  <div className="flex items-center gap-2">
                    <ScrollText className="size-3 text-muted-foreground flex-shrink-0" />
                    <span className="text-foreground font-medium">{row.reportType}</span>
                  </div>
                </td>
                <td className="px-3 py-2.5 text-muted-foreground text-[10px] whitespace-nowrap">{row.regulatoryBase}</td>
                <td className="px-3 py-2.5 whitespace-nowrap">
                  <div className="text-foreground">{row.company}</div>
                  <div className="text-[10px] text-muted-foreground">{row.field}</div>
                </td>
                <td className="px-3 py-2.5 font-mono text-muted-foreground whitespace-nowrap text-[10px]">
                  <div className="flex items-center gap-1">
                    <Calendar className="size-3" />
                    {row.deadline}
                  </div>
                </td>
                <td className="px-3 py-2.5 whitespace-nowrap">
                  {row.submittedDate ? (
                    <div className="flex items-center gap-1.5 font-mono text-[10px]">
                      <CheckCircle2 className="size-3 text-[oklch(0.62_0.18_145)]" />
                      <span className="text-[oklch(0.72_0.15_145)]">{row.submittedDate}</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1.5 text-[oklch(0.72_0.18_25)] font-semibold text-[10px]">
                      <XCircle className="size-3" />
                      Не сдан
                    </div>
                  )}
                </td>
                <td className="px-3 py-2.5 max-w-xs">
                  {row.discrepancy ? (
                    <div className="flex flex-col gap-1">
                      <span className="flex items-start gap-1 text-[oklch(0.82_0.15_70)]">
                        <AlertTriangle className="size-3 flex-shrink-0 mt-0.5" />
                        <span className="text-[10px]">{row.discrepancy}</span>
                      </span>
                      <span className="text-[10px] text-muted-foreground">{row.comment}</span>
                    </div>
                  ) : (
                    <span className="text-[10px] text-muted-foreground">{row.comment}</span>
                  )}
                </td>
                <td className="px-3 py-2.5 whitespace-nowrap">
                  <StatusBadge severity={row.status} showLabel size="sm" />
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr><td colSpan={7} className="px-3 py-8 text-center text-muted-foreground">Нет записей</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Note */}
      <div className="mt-4 p-3 rounded-md border border-border bg-card/50">
        <p className="text-[11px] text-muted-foreground leading-relaxed">
          <span className="text-foreground font-medium">Перекрёстная проверка:</span> Данные отчётности автоматически сопоставляются с показателями ТСР, нормативами КЭР и фондом скважин из ИС ИПР. Расхождения более 5% фиксируются как предупреждения; более 10% — как критические нарушения.
        </p>
      </div>
    </AppShell>
  )
}
