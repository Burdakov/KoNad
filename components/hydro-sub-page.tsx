"use client"

import React, { useMemo, useState } from "react"
import { AppShell } from "@/components/app-shell"
import {
  hydroDocs,
  waterWells,
  type HydroDocument,
  type HydroDocType,
  type WaterWell,
} from "@/lib/mock-data"
import { AlertTriangle, CheckCircle2, XCircle, FileText, ChevronDown, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"

// ── shared types ──────────────────────────────────────────────────────────────

export interface HydroSubPageConfig {
  title: string
  subtitle: string
  docTypes: HydroDocType[]
  /** which docCoverage key to check per waterWell */
  wellCoverageKey: keyof WaterWell["docCoverage"]
  icon: React.ElementType
}

// ── status helpers ────────────────────────────────────────────────────────────

const STATUS_STYLE: Record<string, string> = {
  ok:       "border-green-200 bg-green-50 text-green-700",
  warning:  "border-yellow-200 bg-yellow-50 text-yellow-700",
  critical: "border-red-200 bg-red-50 text-red-700",
}

function StatusPill({ status }: { status: HydroDocument["status"] }) {
  const safeStatus = (status === "ok" || status === "warning" || status === "critical") ? status : "ok"
  const labels: Record<string, string> = { ok: "Актуален", warning: "Внимание", critical: "Нарушение" }
  return (
    <span className={cn("inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full border", STATUS_STYLE[safeStatus])}>
      {safeStatus === "ok" ? <CheckCircle2 className="size-2.5" /> : <AlertTriangle className="size-2.5" />}
      {labels[safeStatus]}
    </span>
  )
}

// ── Document table ────────────────────────────────────────────────────────────

function DocTable({ docs }: { docs: HydroDocument[] }) {
  const [expanded, setExpanded] = useState<Set<string>>(new Set())
  const toggle = (id: string) => setExpanded((prev) => {
    const next = new Set(prev)
    next.has(id) ? next.delete(id) : next.add(id)
    return next
  })

  if (docs.length === 0) {
    return (
      <div className="flex items-center justify-center py-12 text-muted-foreground border border-dashed border-border rounded-lg text-sm">
        Нет документов данного типа
      </div>
    )
  }

  return (
    <div className="rounded-lg border border-border overflow-hidden">
      <table className="w-full text-xs">
        <thead>
          <tr className="bg-muted/50 border-b border-border">
            <th className="text-left px-3 py-2.5 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Документ</th>
            <th className="text-left px-3 py-2.5 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Компания / М-е</th>
            <th className="text-left px-3 py-2.5 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Орган</th>
            <th className="text-left px-3 py-2.5 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Утверждён</th>
            <th className="text-left px-3 py-2.5 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Срок действия</th>
            <th className="text-left px-3 py-2.5 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Статус</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border/50">
          {docs.map((doc, idx) => (
            <React.Fragment key={doc.id}>
              <tr
                onClick={() => toggle(doc.id)}
                className={cn(
                  "hover:bg-muted/20 cursor-pointer transition-colors",
                  idx % 2 === 1 && "bg-muted/10"
                )}
              >
                <td className="px-3 py-2.5">
                  <div className="flex items-center gap-1.5">
                    {expanded.has(doc.id)
                      ? <ChevronDown className="size-3 text-muted-foreground flex-shrink-0" />
                      : <ChevronRight className="size-3 text-muted-foreground flex-shrink-0" />
                    }
                    <FileText className="size-3 text-muted-foreground flex-shrink-0" />
                    <div>
                      <div className="font-medium text-foreground font-mono text-[10px]">{doc.docNumber}</div>
                      <div className="text-muted-foreground truncate max-w-[280px]">{doc.docTitle}</div>
                    </div>
                  </div>
                </td>
                <td className="px-3 py-2.5">
                  <div className="text-foreground">{doc.company}</div>
                  <div className="text-muted-foreground">{doc.fieldName}</div>
                </td>
                <td className="px-3 py-2.5 text-muted-foreground">{doc.approvedBy}</td>
                <td className="px-3 py-2.5 font-mono text-muted-foreground">{doc.approvalDate}</td>
                <td className="px-3 py-2.5 font-mono">
                  {doc.expiryDate
                    ? <span className={cn(doc.daysLeft !== null && doc.daysLeft < 180 ? "text-yellow-700 font-semibold" : "text-muted-foreground")}>
                        {doc.expiryDate}
                        {doc.daysLeft !== null && (
                          <span className="ml-1 text-[10px]">({doc.daysLeft} дн.)</span>
                        )}
                      </span>
                    : <span className="text-muted-foreground">Бессрочно</span>
                  }
                </td>
                <td className="px-3 py-2.5"><StatusPill status={doc.status} /></td>
              </tr>
              {expanded.has(doc.id) && (
                <tr className="bg-muted/20">
                  <td colSpan={6} className="px-6 py-3 text-xs text-muted-foreground border-t border-border/30">
                    <span className="font-medium text-foreground">Комментарий: </span>{doc.comment || "—"}
                  </td>
                </tr>
              )}
            </React.Fragment>
          ))}
        </tbody>
      </table>
    </div>
  )
}

// ── Water well coverage matrix ────────────────────────────────────────────────

const COVERAGE_LABELS: Record<keyof WaterWell["docCoverage"], string> = {
  reserves: "Подсчёт запасов",
  tsr_water: "ТСР (вода)",
  pgin: "ПГИН",
  water_placement: "Проект размещения",
}

function WaterWellCoverage({ coverageKey }: { coverageKey: keyof WaterWell["docCoverage"] }) {
  return (
    <div className="rounded-lg border border-border overflow-hidden">
      <div className="bg-muted/50 px-4 py-2.5 border-b border-border">
        <h3 className="text-xs font-semibold text-foreground uppercase tracking-wide">
          Покрытие водозаборных скважин документами — {COVERAGE_LABELS[coverageKey]}
        </h3>
      </div>
      <table className="w-full text-xs">
        <thead>
          <tr className="border-b border-border bg-muted/30">
            <th className="text-left px-4 py-2.5 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Скважина</th>
            <th className="text-left px-4 py-2.5 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Тип</th>
            <th className="text-left px-4 py-2.5 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Месторождение</th>
            <th className="text-left px-4 py-2.5 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Горизонт</th>
            <th className="text-center px-4 py-2.5 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Документ наличие</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border/50">
          {waterWells.map((well) => {
            const hasCoverage = well.docCoverage[coverageKey]
            return (
              <tr key={well.id} className={cn("hover:bg-muted/20 transition-colors", !hasCoverage && "bg-red-50/30")}>
                <td className="px-4 py-2.5">
                  <span className="font-mono font-medium text-foreground">{well.wellName}</span>
                </td>
                <td className="px-4 py-2.5 text-muted-foreground">{well.wellTypeLabel}</td>
                <td className="px-4 py-2.5 text-foreground">{well.fieldName}</td>
                <td className="px-4 py-2.5 text-muted-foreground text-[10px]">{well.aquifer}</td>
                <td className="px-4 py-2.5 text-center">
                  {hasCoverage
                    ? <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-green-700 bg-green-50 border border-green-200 px-2 py-0.5 rounded-full">
                        <CheckCircle2 className="size-3" /> Есть
                      </span>
                    : <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-red-700 bg-red-50 border border-red-200 px-2 py-0.5 rounded-full">
                        <XCircle className="size-3" /> Отсутствует
                      </span>
                  }
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

// ── KPI cards ─────────────────────────────────────────────────────────────────

function KpiCards({ docs }: { docs: HydroDocument[] }) {
  const critical = docs.filter((d) => d.status === "critical").length
  const warning  = docs.filter((d) => d.status === "warning").length
  const ok       = docs.filter((d) => d.status === "ok").length
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
      <div className="rounded-lg border border-border bg-card p-3">
        <div className="text-xs text-muted-foreground mb-0.5">Всего документов</div>
        <div className="text-2xl font-bold text-foreground">{docs.length}</div>
      </div>
      <div className="rounded-lg border border-red-200 bg-red-50 p-3">
        <div className="flex items-center gap-1 text-xs text-red-700 mb-0.5">
          <AlertTriangle className="size-3" /> Нарушения
        </div>
        <div className="text-2xl font-bold text-red-700">{critical}</div>
      </div>
      <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-3">
        <div className="text-xs text-yellow-700 mb-0.5">Внимание</div>
        <div className="text-2xl font-bold text-yellow-700">{warning}</div>
      </div>
      <div className="rounded-lg border border-green-200 bg-green-50 p-3">
        <div className="text-xs text-green-700 mb-0.5">Актуальны</div>
        <div className="text-2xl font-bold text-green-700">{ok}</div>
      </div>
    </div>
  )
}

// ── Main shared component ─────────────────────────────────────────────────────

export function HydroSubPage({ config }: { config: HydroSubPageConfig }) {
  const Icon = config.icon

  const docs = useMemo(
    () => hydroDocs.filter((d) => config.docTypes.includes(d.docType)),
    [config.docTypes]
  )

  const [statusFilter, setStatusFilter] = useState<"all" | "critical" | "warning" | "ok">("all")
  const [companyFilter, setCompanyFilter] = useState<string>("all")

  const companies = useMemo(() => {
    const set = new Set(docs.map((d) => d.company))
    return ["all", ...Array.from(set)]
  }, [docs])

  const filtered = useMemo(() =>
    docs.filter((d) => {
      if (statusFilter !== "all" && d.status !== statusFilter) return false
      if (companyFilter !== "all" && d.company !== companyFilter) return false
      return true
    }),
    [docs, statusFilter, companyFilter]
  )

  return (
    <AppShell>
      {/* Header */}
      <div className="mb-5">
        <div className="flex items-center gap-2.5 mb-1">
          <div className="flex items-center justify-center size-7 rounded bg-primary/10 text-primary">
            <Icon className="size-4" />
          </div>
          <h1 className="text-lg font-bold text-foreground">{config.title}</h1>
          <span className="text-xs text-muted-foreground font-mono bg-muted px-2 py-0.5 rounded border border-border">
            Гидрогеология
          </span>
        </div>
        <p className="text-sm text-muted-foreground ml-9.5">{config.subtitle}</p>
      </div>

      {/* KPI */}
      <KpiCards docs={docs} />

      {/* Filters */}
      <div className="flex items-center gap-2 mb-4 flex-wrap">
        <span className="text-xs text-muted-foreground">Статус:</span>
        {(["all", "critical", "warning", "ok"] as const).map((s) => (
          <button key={s} onClick={() => setStatusFilter(s)}
            className={cn("px-2.5 py-1 text-xs rounded border transition-colors",
              statusFilter === s ? "bg-primary text-primary-foreground border-primary" : "bg-card text-muted-foreground border-border hover:border-primary/50"
            )}>
            {s === "all" ? "Все" : s === "critical" ? "Нарушение" : s === "warning" ? "Внимание" : "Актуально"}
          </button>
        ))}
        <div className="h-4 w-px bg-border" />
        <span className="text-xs text-muted-foreground">Компания:</span>
        <select value={companyFilter} onChange={(e) => setCompanyFilter(e.target.value)}
          className="text-xs border border-border rounded px-2 py-1 bg-card text-foreground focus:outline-none focus:ring-1 focus:ring-ring">
          {companies.map((c) => <option key={c} value={c}>{c === "all" ? "Все" : c}</option>)}
        </select>
        <span className="ml-auto text-xs text-muted-foreground font-mono">{filtered.length} из {docs.length}</span>
      </div>

      {/* Document table */}
      <div className="mb-6">
        <h2 className="text-sm font-semibold text-foreground mb-2">Документы</h2>
        <DocTable docs={filtered} />
      </div>

      {/* Water well coverage */}
      <div>
        <h2 className="text-sm font-semibold text-foreground mb-2">
          Покрытие водозаборных скважин
        </h2>
        <WaterWellCoverage coverageKey={config.wellCoverageKey} />
      </div>
    </AppShell>
  )
}
