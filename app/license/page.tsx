"use client"

import { AppShell } from "@/components/app-shell"
import { StatusBadge, StatusDot } from "@/components/status-badge"
import { MasterfileCrossCheck } from "@/components/masterfile-cross-check"
import { licenses } from "@/lib/mock-data"
import { useState } from "react"
import { FileText, ChevronDown, ChevronRight, Calendar, CheckCircle2, XCircle, Clock, Database } from "lucide-react"

const licTypeColors: Record<string, string> = {
  НЭ: "bg-[oklch(0.65_0.15_210/0.12)] text-[oklch(0.75_0.12_210)]",
  НП: "bg-[oklch(0.72_0.18_70/0.12)] text-[oklch(0.82_0.15_70)]",
  "НЭ+НП": "bg-[oklch(0.62_0.18_145/0.12)] text-[oklch(0.72_0.15_145)]",
  ГЗ: "bg-muted/30 text-muted-foreground",
}

function DaysLeftCell({ days }: { days: number }) {
  if (days <= 0) return <span className="font-mono text-[oklch(0.72_0.18_25)] font-semibold">истекла</span>
  if (days <= 90) return <span className="font-mono text-[oklch(0.82_0.15_70)] font-semibold">{days} дн.</span>
  return <span className="font-mono text-muted-foreground">{days} дн.</span>
}

function WorkProgramRow({ items }: { items: { item: string; deadline: string; done: boolean; status: "critical" | "warning" | "ok" | "info" | "unknown" }[] }) {
  return (
    <ul className="flex flex-col gap-1 mt-1">
      {items.map((wp, i) => (
        <li key={i} className="flex items-start gap-2 text-[10px]">
          {wp.done
            ? <CheckCircle2 className="size-3 text-[oklch(0.62_0.18_145)] flex-shrink-0 mt-0.5" />
            : wp.status === "critical"
            ? <XCircle className="size-3 text-[oklch(0.52_0.22_25)] flex-shrink-0 mt-0.5" />
            : <Clock className="size-3 text-[oklch(0.72_0.18_70)] flex-shrink-0 mt-0.5" />
          }
          <span className={`flex-1 ${wp.status === "critical" && !wp.done ? "text-[oklch(0.72_0.18_25)]" : "text-muted-foreground"}`}>
            {wp.item}
            <span className="ml-1 text-muted-foreground/60 font-mono">({wp.deadline})</span>
          </span>
        </li>
      ))}
    </ul>
  )
}

export default function LicensePage() {
  const [tab, setTab] = useState<"main" | "cross">("main")
  const [expanded, setExpanded] = useState<Set<string>>(new Set())
  const [filter, setFilter] = useState<"all" | "critical" | "warning" | "ok">("all")

  const toggle = (id: string) => setExpanded((prev) => {
    const next = new Set(prev)
    next.has(id) ? next.delete(id) : next.add(id)
    return next
  })

  const filtered = licenses.filter((l) => filter === "all" || l.status === filter)
  const critical = licenses.filter((l) => l.status === "critical").length
  const warning = licenses.filter((l) => l.status === "warning").length
  const ok = licenses.filter((l) => l.status === "ok").length

  return (
    <AppShell>
      <div className="mb-5">
        <h2 className="text-base font-semibold text-foreground text-balance mb-0.5">
          Лицензирование недропользования
        </h2>
        <p className="text-[11px] text-muted-foreground leading-relaxed max-w-2xl">
          Контроль выполнения условий пользования недрами: сроки действия лицензий, выполнение программы работ (геологическое изучение, бурение), окончание лицензий на разведку и добычу.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-5 border-b border-border">
        <button onClick={() => setTab("main")} className={`px-3 py-2 text-xs font-medium transition-colors border-b-2 -mb-px ${tab === "main" ? "border-primary text-foreground" : "border-transparent text-muted-foreground hover:text-foreground"}`}>Лицензии</button>
        <button onClick={() => setTab("cross")} className={`flex items-center gap-1.5 px-3 py-2 text-xs font-medium transition-colors border-b-2 -mb-px ${tab === "cross" ? "border-primary text-foreground" : "border-transparent text-muted-foreground hover:text-foreground"}`}><Database className="size-3" /> Сверка с мастерфайлом</button>
      </div>
      {tab === "cross" && <MasterfileCrossCheck module="license" />}
      {tab === "main" && (<>

      {/* Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
        {[
          { label: "Всего лицензий", value: licenses.length },
          { label: "Критических нарушений", value: critical, severity: "critical" as const },
          { label: "Предупреждений", value: warning, severity: "warning" as const },
          { label: "В норме", value: ok, severity: "ok" as const },
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

      {/* License cards */}
      <div className="flex flex-col gap-3">
        {filtered.map((lic) => {
          const isOpen = expanded.has(lic.id)
          return (
            <div key={lic.id} className="rounded-md border border-border bg-card overflow-hidden">
              {/* Header row */}
              <button
                onClick={() => toggle(lic.id)}
                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-muted/20 transition-colors text-left"
              >
                <FileText className="size-4 text-muted-foreground flex-shrink-0" />
                <div className="flex flex-1 flex-wrap items-center gap-x-4 gap-y-1 min-w-0">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${licTypeColors[lic.licenseType]}`}>
                    {lic.licenseType}
                  </span>
                  <span className="font-mono text-sm font-semibold text-foreground">{lic.licenseNumber}</span>
                  <span className="text-xs text-muted-foreground">{lic.company}</span>
                  <span className="text-[11px] text-muted-foreground/70">{lic.field}</span>
                </div>
                <div className="flex items-center gap-3 flex-shrink-0">
                  <div className="text-right hidden sm:block">
                    <div className="text-[10px] text-muted-foreground font-mono flex items-center gap-1">
                      <Calendar className="size-3" />{lic.expiryDate}
                    </div>
                    <DaysLeftCell days={lic.daysLeft} />
                  </div>
                  <StatusBadge severity={lic.status} showLabel size="sm" />
                  {isOpen ? <ChevronDown className="size-4 text-muted-foreground" /> : <ChevronRight className="size-4 text-muted-foreground" />}
                </div>
              </button>

              {/* Expanded: work program */}
              {isOpen && (
                <div className="border-t border-border px-4 py-3 bg-muted/10">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">Общая информация</p>
                      <dl className="flex flex-col gap-1 text-xs">
                        {[
                          ["Лицензиат", lic.company],
                          ["Участок", lic.field],
                          ["Тип лицензии", lic.licenseTypeLabel],
                          ["Выдана", lic.issuedDate],
                          ["Истекает", lic.expiryDate],
                          ["Осталось", `${lic.daysLeft} дней`],
                        ].map(([k, v]) => (
                          <div key={k} className="flex gap-2">
                            <dt className="text-muted-foreground w-28 flex-shrink-0">{k}:</dt>
                            <dd className="text-foreground">{v}</dd>
                          </div>
                        ))}
                      </dl>
                    </div>
                    <div>
                      <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">Программа работ</p>
                      <WorkProgramRow items={lic.workProgram} />
                      {lic.comment && (
                        <p className="mt-2 text-[10px] text-muted-foreground border-t border-border/50 pt-2">{lic.comment}</p>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )
        })}
        {filtered.length === 0 && (
          <div className="rounded-md border border-border bg-card px-4 py-8 text-center text-muted-foreground text-xs">Нет записей</div>
        )}
      </div>
      </>)}
    </AppShell>
  )
}
