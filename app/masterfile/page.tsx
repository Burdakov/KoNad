"use client"

import { useState } from "react"
import { AppShell } from "@/components/app-shell"
import { StatusDot } from "@/components/status-badge"
import { RoadmapPanel } from "@/components/roadmap-panel"
import {
  masterfileFactWells,
  masterfilePlanWells2026,
  masterfilePlanWells2027,
  masterfileFactClusters,
  masterfilePlanClusters2026,
  masterfilePlanClusters2027,
  masterfileWells,
  masterfileClusters,
  buildRoadmapForWell,
  buildRoadmapForCluster,
  type MasterfileWell,
  type MasterfileCluster,
  type RoadmapModule,
} from "@/lib/mock-data"
import {
  ChevronRight,
  ChevronDown,
  Drill,
  Database,
  AlertTriangle,
  CalendarClock,
  BarChart3,
} from "lucide-react"

type Tab = "fact" | "plan2026" | "plan2027"
type SubView = "clusters" | "wells"

const MODULE_COLS: { key: RoadmapModule; label: string }[] = [
  { key: "spatial",      label: "ПРОСТ" },
  { key: "tsr",          label: "ТСР" },
  { key: "land",         label: "ЗЕМЛЯ" },
  { key: "opo",          label: "ОПО" },
  { key: "ker",          label: "КЭР" },
  { key: "conservation", label: "КОНС" },
  { key: "license",      label: "ЛИЦ" },
  { key: "reporting",    label: "ОТЧЁТ" },
]

function CoverageCell({ covered }: { covered: boolean }) {
  return covered ? (
    <span className="inline-flex size-4 rounded-sm bg-[oklch(0.62_0.18_145/0.2)] text-[oklch(0.62_0.18_145)] text-[9px] font-bold items-center justify-center">+</span>
  ) : (
    <span className="inline-flex size-4 rounded-sm bg-[oklch(0.52_0.22_25/0.2)] text-[oklch(0.72_0.18_25)] text-[9px] font-bold items-center justify-center">!</span>
  )
}

function coverageScore(cov: MasterfileWell["docCoverage"] | MasterfileCluster["docCoverage"]) {
  const vals = Object.values(cov)
  const covered = vals.filter(Boolean).length
  return { covered, total: vals.length, missing: vals.length - covered }
}

const WELL_STATUS_STYLE: Record<MasterfileWell["wellStatus"], string> = {
  producing:    "bg-[oklch(0.62_0.18_145/0.15)] text-[oklch(0.62_0.18_145)]",
  injection:    "bg-[oklch(0.65_0.15_210/0.15)] text-[oklch(0.65_0.15_210)]",
  idle:         "bg-[oklch(0.72_0.18_70/0.15)]  text-[oklch(0.82_0.15_70)]",
  conservation: "bg-[oklch(0.65_0.15_210/0.15)] text-[oklch(0.65_0.15_210)]",
  liquidated:   "bg-muted/30 text-muted-foreground",
}

function DeadlineBadge({ status }: { status: "ok" | "warn" | "critical" | null }) {
  if (!status) return null
  const styles = {
    ok:       "bg-[oklch(0.62_0.18_145/0.15)] text-[oklch(0.62_0.18_145)] border-[oklch(0.62_0.18_145/0.3)]",
    warn:     "bg-[oklch(0.72_0.18_70/0.15)]  text-[oklch(0.82_0.15_70)]  border-[oklch(0.72_0.18_70/0.3)]",
    critical: "bg-[oklch(0.52_0.22_25/0.15)]  text-[oklch(0.72_0.18_25)]  border-[oklch(0.52_0.22_25/0.3)]",
  }
  const labels = { ok: "успевает", warn: "мало времени", critical: "не успевает" }
  return (
    <span className={`text-[9px] font-semibold px-1.5 py-0.5 rounded border ${styles[status]}`}>
      {labels[status]}
    </span>
  )
}

// ─── Plan readiness summary for a cluster ────────────────────────────────────
function planReadinessStatus(cluster: MasterfileCluster): "ok" | "warn" | "critical" {
  const roadmap = buildRoadmapForCluster(cluster)
  if (roadmap.some((r) => r.deadlineStatus === "critical")) return "critical"
  if (roadmap.some((r) => r.deadlineStatus === "warn")) return "warn"
  return "ok"
}

export default function MasterfilePage() {
  const [tab, setTab]             = useState<Tab>("fact")
  const [view, setView]           = useState<SubView>("clusters")
  const [filterMissing, setFilterMissing] = useState(false)
  const [expandedCluster, setExpandedCluster] = useState<string | null>(null)
  const [expandedRoadmap, setExpandedRoadmap] = useState<string | null>(null)

  // ─── Data selection by tab ────────────────────────────────────────────────
  const clusters = tab === "fact"
    ? masterfileFactClusters
    : tab === "plan2026"
    ? masterfilePlanClusters2026
    : masterfilePlanClusters2027

  const wells = tab === "fact"
    ? masterfileFactWells
    : tab === "plan2026"
    ? masterfilePlanWells2026
    : masterfilePlanWells2027

  const filteredClusters = filterMissing
    ? clusters.filter((c) => Object.values(c.docCoverage).some((v) => !v))
    : clusters

  const filteredWells = filterMissing
    ? wells.filter((w) => Object.values(w.docCoverage).some((v) => !v))
    : wells

  const isPlanned = tab !== "fact"

  // ─── KPI computation ─────────────────────────────────────────────────────
  const totalMissingClusters = clusters.filter((c) => Object.values(c.docCoverage).some((v) => !v)).length
  const totalMissingWells    = wells.filter((w) => Object.values(w.docCoverage).some((v) => !v)).length
  const criticalPlanClusters = isPlanned
    ? clusters.filter((c) => planReadinessStatus(c) === "critical").length
    : null

  const planTotalOilRate = isPlanned
    ? clusters.reduce((s, c) => s + (c.plannedTotalOilRate ?? 0), 0)
    : null

  const tabs: { key: Tab; label: string; count: number; icon?: React.ReactNode }[] = [
    {
      key: "fact",
      label: "Факт",
      count: masterfileFactClusters.length,
    },
    {
      key: "plan2026",
      label: "Планы 2026",
      count: masterfilePlanClusters2026.length,
      icon: <CalendarClock className="size-3" />,
    },
    {
      key: "plan2027",
      label: "Планы 2027",
      count: masterfilePlanClusters2027.length,
      icon: <CalendarClock className="size-3" />,
    },
  ]

  return (
    <AppShell>
      {/* Header */}
      <div className="mb-5">
        <div className="flex items-start gap-2 mb-0.5">
          <Database className="size-4 text-primary flex-shrink-0 mt-0.5" />
          <h2 className="text-base font-semibold text-foreground text-balance">
            Мастерфайл — сводные данные по добыче
          </h2>
        </div>
        <p className="text-[11px] text-muted-foreground leading-relaxed max-w-3xl pl-6">
          Центральный реестр фактических и плановых объектов добычи (кусты, скважины).
          Плановые объекты до конца 2027 года сверяются с планами во всех модулях надзора (ТСР, ЗЕМЛЯ, ОПО, КЭР, ЛИЦ).
          Дорожные карты формируются для каждого объекта с учётом плановой даты запуска как жёсткого дедлайна.
        </p>
      </div>

      {/* Tab switcher (Fact / Plans 2026 / Plans 2027) */}
      <div className="flex gap-1 border-b border-border mb-5">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`flex items-center gap-1.5 px-3 py-2 text-xs font-medium transition-colors border-b-2 -mb-px whitespace-nowrap ${
              t.key === tab
                ? "border-primary text-foreground"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            {t.icon}
            {t.label}
            <span className={`text-[9px] font-mono px-1 py-0.5 rounded ${t.key === tab ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"}`}>
              {t.count}
            </span>
          </button>
        ))}
      </div>

      {/* KPI row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
        <div className="rounded-md border border-border bg-card px-4 py-3">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[11px] text-muted-foreground">Кустов{isPlanned ? " в плане" : ""}</span>
          </div>
          <span className="text-2xl font-bold font-mono text-foreground">{clusters.length}</span>
        </div>
        <div className="rounded-md border border-border bg-card px-4 py-3">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[11px] text-muted-foreground">Скважин{isPlanned ? " в плане" : ""}</span>
          </div>
          <span className="text-2xl font-bold font-mono text-foreground">{wells.length}</span>
        </div>
        {isPlanned ? (
          <>
            <div className="rounded-md border border-border bg-card px-4 py-3">
              <div className="flex items-center gap-2 mb-1">
                <StatusDot severity="critical" />
                <span className="text-[11px] text-muted-foreground">Не успевают оформить</span>
              </div>
              <span className="text-2xl font-bold font-mono text-[oklch(0.72_0.18_25)]">{criticalPlanClusters}</span>
            </div>
            <div className="rounded-md border border-border bg-card px-4 py-3">
              <div className="flex items-center gap-2 mb-1">
                <BarChart3 className="size-3 text-muted-foreground" />
                <span className="text-[11px] text-muted-foreground">Плановый дебит, т/сут</span>
              </div>
              <span className="text-2xl font-bold font-mono text-foreground">{planTotalOilRate?.toFixed(0)}</span>
            </div>
          </>
        ) : (
          <>
            <div className="rounded-md border border-border bg-card px-4 py-3">
              <div className="flex items-center gap-2 mb-1">
                <StatusDot severity="critical" />
                <span className="text-[11px] text-muted-foreground">Кустов без документов</span>
              </div>
              <span className="text-2xl font-bold font-mono text-[oklch(0.72_0.18_25)]">{totalMissingClusters}</span>
            </div>
            <div className="rounded-md border border-border bg-card px-4 py-3">
              <div className="flex items-center gap-2 mb-1">
                <StatusDot severity="warning" />
                <span className="text-[11px] text-muted-foreground">Скважин без документов</span>
              </div>
              <span className="text-2xl font-bold font-mono text-[oklch(0.82_0.15_70)]">{totalMissingWells}</span>
            </div>
          </>
        )}
      </div>

      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-2 mb-4">
        <div className="flex gap-1 border-b border-border">
          {(["clusters", "wells"] as const).map((v) => (
            <button key={v} onClick={() => setView(v)}
              className={`px-3 py-1.5 text-xs font-medium transition-colors border-b-2 -mb-px ${v === view ? "border-primary text-foreground" : "border-transparent text-muted-foreground hover:text-foreground"}`}>
              {v === "clusters" ? "Кусты" : "Скважины"}
            </button>
          ))}
        </div>
        <button
          onClick={() => setFilterMissing((p) => !p)}
          className={`ml-auto flex items-center gap-1.5 text-[11px] px-2.5 py-1.5 rounded border transition-colors ${filterMissing ? "border-[oklch(0.52_0.22_25/0.6)] bg-[oklch(0.52_0.22_25/0.1)] text-[oklch(0.72_0.18_25)]" : "border-border text-muted-foreground hover:border-muted-foreground/50"}`}>
          <AlertTriangle className="size-3" />
          Только с пробелами
        </button>
      </div>

      {/* ─── CLUSTERS VIEW ─────────────────────────────────────────────────────── */}
      {view === "clusters" && (
        <div className="space-y-2">
          {filteredClusters.map((cluster) => {
            const score = coverageScore(cluster.docCoverage)
            const roadmap = buildRoadmapForCluster(cluster)
            const isRoadmapOpen = expandedRoadmap === cluster.id
            const isWellsOpen = expandedCluster === cluster.id
            const clusterWells = (isPlanned ? wells : masterfileWells).filter((w) => w.clusterId === cluster.id)
            const readiness = isPlanned ? planReadinessStatus(cluster) : null

            // Overall deadline status across all modules
            const worstDeadline = roadmap.reduce<"ok" | "warn" | "critical" | null>((worst, r) => {
              if (!r.deadlineStatus) return worst
              if (r.deadlineStatus === "critical") return "critical"
              if (r.deadlineStatus === "warn" && worst !== "critical") return "warn"
              if (!worst) return "ok"
              return worst
            }, null)

            return (
              <div key={cluster.id} className="rounded-md border border-border bg-card overflow-hidden">
                {/* Cluster row */}
                <div className="flex items-center gap-2 px-3 py-2.5">
                  <Drill className="size-3.5 text-muted-foreground flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-semibold text-foreground font-mono">{cluster.clusterName}</span>
                      <span className="text-[10px] text-muted-foreground">{cluster.company}</span>
                      <span className="text-[10px] text-muted-foreground">{cluster.fieldName}</span>
                      {isPlanned && worstDeadline && <DeadlineBadge status={worstDeadline} />}
                    </div>
                    <div className="flex items-center gap-3 mt-0.5 flex-wrap">
                      {isPlanned ? (
                        <>
                          <span className="text-[10px] text-muted-foreground font-mono">
                            {cluster.wellCount} скв. · план {cluster.plannedTotalOilRate} т/сут
                          </span>
                          <span className="text-[10px] text-[oklch(0.65_0.15_210)] font-mono font-semibold">
                            запуск: {cluster.plannedLaunchDate}
                          </span>
                        </>
                      ) : (
                        <>
                          <span className="text-[10px] text-muted-foreground font-mono">
                            {cluster.wellCount} скв. · {cluster.producingCount} доб. · {cluster.totalOilRate} т/сут
                          </span>
                          <span className="text-[10px] text-muted-foreground font-mono">запуск: {cluster.launchDate}</span>
                        </>
                      )}
                    </div>
                  </div>
                  {/* Coverage cells */}
                  <div className="flex items-center gap-1 flex-shrink-0">
                    {MODULE_COLS.map(({ key, label }) => (
                      <div key={key} className="flex flex-col items-center gap-0.5">
                        <span className="text-[8px] text-muted-foreground font-mono">{label}</span>
                        <CoverageCell covered={cluster.docCoverage[key]} />
                      </div>
                    ))}
                  </div>
                  {/* Score + controls */}
                  <div className="flex items-center gap-2 flex-shrink-0 ml-2">
                    <span className={`text-[10px] font-mono font-semibold ${score.missing > 0 ? "text-[oklch(0.72_0.18_25)]" : "text-[oklch(0.62_0.18_145)]"}`}>
                      {score.covered}/{score.total}
                    </span>
                    {roadmap.length > 0 && (
                      <button onClick={() => setExpandedRoadmap(isRoadmapOpen ? null : cluster.id)}
                        className="text-[10px] px-2 py-1 rounded border border-[oklch(0.52_0.22_25/0.4)] bg-[oklch(0.52_0.22_25/0.08)] text-[oklch(0.72_0.18_25)] hover:bg-[oklch(0.52_0.22_25/0.15)] transition-colors flex items-center gap-1">
                        Дорожная карта
                        {isRoadmapOpen ? <ChevronDown className="size-3" /> : <ChevronRight className="size-3" />}
                      </button>
                    )}
                    {clusterWells.length > 0 && (
                      <button onClick={() => setExpandedCluster(isWellsOpen ? null : cluster.id)}
                        className="text-[10px] text-muted-foreground hover:text-foreground transition-colors flex items-center gap-0.5">
                        {isWellsOpen ? <ChevronDown className="size-3" /> : <ChevronRight className="size-3" />}
                      </button>
                    )}
                  </div>
                </div>

                {/* Roadmap */}
                {isRoadmapOpen && (
                  <div className="border-t border-border px-3 py-3 bg-muted/10">
                    <RoadmapPanel
                      items={roadmap}
                      objectName={cluster.clusterName}
                      plannedLaunchDate={cluster.plannedLaunchDate}
                    />
                  </div>
                )}

                {/* Wells in cluster */}
                {isWellsOpen && clusterWells.length > 0 && (
                  <div className="border-t border-border">
                    {clusterWells.map((well) => {
                      const ws = coverageScore(well.docCoverage)
                      const wellRoadmap = buildRoadmapForWell(well)
                      const isWellRoadmapOpen = expandedRoadmap === well.id
                      const wellWorstDeadline = wellRoadmap.reduce<"ok" | "warn" | "critical" | null>((worst, r) => {
                        if (!r.deadlineStatus) return worst
                        if (r.deadlineStatus === "critical") return "critical"
                        if (r.deadlineStatus === "warn" && worst !== "critical") return "warn"
                        if (!worst) return "ok"
                        return worst
                      }, null)
                      return (
                        <div key={well.id} className="border-b border-border/50 last:border-0">
                          <div className="flex items-center gap-2 px-5 py-2">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="text-[11px] font-mono text-foreground">{well.wellName}</span>
                                <span className={`text-[9px] px-1.5 py-0.5 rounded font-semibold ${WELL_STATUS_STYLE[well.wellStatus]}`}>
                                  {well.wellStatusLabel}
                                </span>
                                <span className="text-[10px] text-muted-foreground">{well.wellTypeLabel}</span>
                                {isPlanned && wellWorstDeadline && <DeadlineBadge status={wellWorstDeadline} />}
                              </div>
                              <div className="flex items-center gap-3 mt-0.5 flex-wrap">
                                {isPlanned ? (
                                  <>
                                    {well.plannedOilRate != null && (
                                      <span className="text-[10px] text-muted-foreground font-mono">план {well.plannedOilRate} т/сут</span>
                                    )}
                                    <span className="text-[10px] text-[oklch(0.65_0.15_210)] font-mono font-semibold">
                                      запуск: {well.plannedLaunchDate}
                                    </span>
                                  </>
                                ) : (
                                  <>
                                    {well.oilRateToday != null && (
                                      <span className="text-[10px] text-muted-foreground font-mono">{well.oilRateToday} т/сут</span>
                                    )}
                                    <span className="text-[10px] text-muted-foreground font-mono">накоп.: {well.oilCumTst} тыс.т</span>
                                    <span className="text-[10px] text-muted-foreground font-mono">запуск: {well.launchDate}</span>
                                  </>
                                )}
                              </div>
                            </div>
                            <div className="flex items-center gap-1 flex-shrink-0">
                              {MODULE_COLS.map(({ key }) => (
                                <CoverageCell key={key} covered={well.docCoverage[key]} />
                              ))}
                            </div>
                            <div className="flex items-center gap-2 flex-shrink-0 ml-2">
                              <span className={`text-[10px] font-mono font-semibold ${ws.missing > 0 ? "text-[oklch(0.72_0.18_25)]" : "text-[oklch(0.62_0.18_145)]"}`}>
                                {ws.covered}/{ws.total}
                              </span>
                              {wellRoadmap.length > 0 && (
                                <button onClick={() => setExpandedRoadmap(isWellRoadmapOpen ? null : well.id)}
                                  className="text-[10px] px-2 py-0.5 rounded border border-[oklch(0.52_0.22_25/0.4)] bg-[oklch(0.52_0.22_25/0.08)] text-[oklch(0.72_0.18_25)] hover:bg-[oklch(0.52_0.22_25/0.15)] transition-colors flex items-center gap-1">
                                  Дорожная карта {isWellRoadmapOpen ? <ChevronDown className="size-3" /> : <ChevronRight className="size-3" />}
                                </button>
                              )}
                            </div>
                          </div>
                          {isWellRoadmapOpen && (
                            <div className="px-5 pb-3 bg-muted/10">
                              <RoadmapPanel
                                items={wellRoadmap}
                                objectName={`скв. ${well.wellName}`}
                                plannedLaunchDate={well.plannedLaunchDate}
                              />
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            )
          })}
          {filteredClusters.length === 0 && (
            <div className="text-center text-[11px] text-muted-foreground py-10">
              Нет объектов{filterMissing ? " с пробелами в документах" : ""} для выбранного периода.
            </div>
          )}
        </div>
      )}

      {/* ─── WELLS FLAT VIEW ───────────────────────────────────────────────────── */}
      {view === "wells" && (
        <div className="rounded-md border border-border bg-card overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="text-left px-3 py-2.5 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider whitespace-nowrap">Скважина</th>
                <th className="text-left px-3 py-2.5 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider whitespace-nowrap">Куст / М-е / Компания</th>
                <th className="text-left px-3 py-2.5 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider whitespace-nowrap">Статус</th>
                {isPlanned ? (
                  <>
                    <th className="text-right px-3 py-2.5 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider whitespace-nowrap">Плановый дебит</th>
                    <th className="text-left px-3 py-2.5 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider whitespace-nowrap">Дата запуска</th>
                    <th className="text-left px-3 py-2.5 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider whitespace-nowrap">Готовность</th>
                  </>
                ) : (
                  <>
                    <th className="text-right px-3 py-2.5 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider whitespace-nowrap">Дебит, т/сут</th>
                    <th className="text-right px-3 py-2.5 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider whitespace-nowrap">Накоп., тыс.т</th>
                  </>
                )}
                {MODULE_COLS.map(({ label }) => (
                  <th key={label} className="text-center px-1.5 py-2.5 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider whitespace-nowrap">{label}</th>
                ))}
                <th className="text-center px-3 py-2.5 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider whitespace-nowrap">Покрытие</th>
                <th className="text-left px-3 py-2.5 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider whitespace-nowrap">Дорожная карта</th>
              </tr>
            </thead>
            <tbody>
              {filteredWells.map((well, idx) => {
                const score = coverageScore(well.docCoverage)
                const roadmap = buildRoadmapForWell(well)
                const isOpen = expandedRoadmap === well.id
                const worstDeadline = roadmap.reduce<"ok" | "warn" | "critical" | null>((worst, r) => {
                  if (!r.deadlineStatus) return worst
                  if (r.deadlineStatus === "critical") return "critical"
                  if (r.deadlineStatus === "warn" && worst !== "critical") return "warn"
                  if (!worst) return "ok"
                  return worst
                }, null)
                return (
                  <>
                    <tr key={well.id} className={`border-b border-border/50 hover:bg-muted/20 transition-colors ${idx % 2 === 0 ? "" : "bg-muted/10"}`}>
                      <td className="px-3 py-2 font-mono text-foreground whitespace-nowrap">{well.wellName}</td>
                      <td className="px-3 py-2 whitespace-nowrap">
                        <div className="text-foreground">{well.clusterName}</div>
                        <div className="text-[10px] text-muted-foreground">{well.fieldName} · {well.company}</div>
                      </td>
                      <td className="px-3 py-2 whitespace-nowrap">
                        <span className={`text-[10px] px-1.5 py-0.5 rounded font-semibold ${WELL_STATUS_STYLE[well.wellStatus]}`}>{well.wellStatusLabel}</span>
                      </td>
                      {isPlanned ? (
                        <>
                          <td className="px-3 py-2 text-right font-mono text-muted-foreground whitespace-nowrap">
                            {well.plannedOilRate != null ? `${well.plannedOilRate} т/сут` : "—"}
                          </td>
                          <td className="px-3 py-2 font-mono text-[oklch(0.65_0.15_210)] whitespace-nowrap font-semibold text-[11px]">
                            {well.plannedLaunchDate ?? "—"}
                          </td>
                          <td className="px-3 py-2 whitespace-nowrap">
                            {worstDeadline ? <DeadlineBadge status={worstDeadline} /> : <span className="text-[10px] text-[oklch(0.62_0.18_145)]">готово</span>}
                          </td>
                        </>
                      ) : (
                        <>
                          <td className="px-3 py-2 text-right font-mono text-muted-foreground whitespace-nowrap">
                            {well.oilRateToday != null ? well.oilRateToday : "—"}
                          </td>
                          <td className="px-3 py-2 text-right font-mono text-muted-foreground whitespace-nowrap">{well.oilCumTst}</td>
                        </>
                      )}
                      {MODULE_COLS.map(({ key }) => (
                        <td key={key} className="px-1.5 py-2 text-center">
                          <CoverageCell covered={well.docCoverage[key]} />
                        </td>
                      ))}
                      <td className="px-3 py-2 text-center">
                        <span className={`text-[10px] font-mono font-semibold ${score.missing > 0 ? "text-[oklch(0.72_0.18_25)]" : "text-[oklch(0.62_0.18_145)]"}`}>
                          {score.covered}/{score.total}
                        </span>
                      </td>
                      <td className="px-3 py-2">
                        {roadmap.length > 0 ? (
                          <button onClick={() => setExpandedRoadmap(isOpen ? null : well.id)}
                            className="text-[10px] px-2 py-0.5 rounded border border-[oklch(0.52_0.22_25/0.4)] bg-[oklch(0.52_0.22_25/0.08)] text-[oklch(0.72_0.18_25)] hover:bg-[oklch(0.52_0.22_25/0.15)] transition-colors flex items-center gap-1 whitespace-nowrap">
                            {roadmap.length} пробел{roadmap.length > 1 ? "а" : ""}
                            {isOpen ? <ChevronDown className="size-3" /> : <ChevronRight className="size-3" />}
                          </button>
                        ) : (
                          <span className="text-[10px] text-[oklch(0.62_0.18_145)]">полный пакет</span>
                        )}
                      </td>
                    </tr>
                    {isOpen && (
                      <tr key={`${well.id}-roadmap`} className="bg-muted/10">
                        <td colSpan={isPlanned ? 15 : 14} className="px-5 py-3">
                          <RoadmapPanel
                            items={roadmap}
                            objectName={`скв. ${well.wellName}`}
                            plannedLaunchDate={well.plannedLaunchDate}
                          />
                        </td>
                      </tr>
                    )}
                  </>
                )
              })}
              {filteredWells.length === 0 && (
                <tr>
                  <td colSpan={isPlanned ? 15 : 14} className="text-center text-[11px] text-muted-foreground py-10">
                    Нет скважин{filterMissing ? " с пробелами в документах" : ""} для выбранного периода.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Legend */}
      <div className="mt-4 flex flex-wrap items-center gap-4 text-[10px] text-muted-foreground">
        <span className="flex items-center gap-1.5">
          <span className="inline-flex size-4 rounded-sm bg-[oklch(0.62_0.18_145/0.2)] text-[oklch(0.62_0.18_145)] text-[9px] font-bold items-center justify-center">+</span>
          документы в порядке
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-flex size-4 rounded-sm bg-[oklch(0.52_0.22_25/0.2)] text-[oklch(0.72_0.18_25)] text-[9px] font-bold items-center justify-center">!</span>
          отсутствуют / не соответствуют
        </span>
        {isPlanned && (
          <>
            <span className="flex items-center gap-1.5">
              <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded border bg-[oklch(0.62_0.18_145/0.15)] text-[oklch(0.62_0.18_145)] border-[oklch(0.62_0.18_145/0.3)]">успевает</span>
              документы успеют оформить до запуска
            </span>
            <span className="flex items-center gap-1.5">
              <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded border bg-[oklch(0.72_0.18_70/0.15)] text-[oklch(0.82_0.15_70)] border-[oklch(0.72_0.18_70/0.3)]">мало времени</span>
              менее 30 р.д. до запуска
            </span>
            <span className="flex items-center gap-1.5">
              <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded border bg-[oklch(0.52_0.22_25/0.15)] text-[oklch(0.72_0.18_25)] border-[oklch(0.52_0.22_25/0.3)]">не успевает</span>
              сроки оформления превышают дату запуска
            </span>
          </>
        )}
      </div>
    </AppShell>
  )
}
