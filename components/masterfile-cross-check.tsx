"use client"

import { useState } from "react"
import { RoadmapPanel } from "@/components/roadmap-panel"
import { StatusDot } from "@/components/status-badge"
import {
  masterfileFactWells,
  masterfileFactClusters,
  masterfilePlanWells2026,
  masterfilePlanWells2027,
  masterfilePlanClusters2026,
  masterfilePlanClusters2027,
  buildRoadmapForWell,
  buildRoadmapForCluster,
  type RoadmapModule,
  type MasterfileWell,
  type MasterfileCluster,
} from "@/lib/mock-data"
import { ChevronRight, ChevronDown, Database, CheckCircle2, AlertTriangle, CalendarClock } from "lucide-react"

interface MasterfileCrossCheckProps {
  module: RoadmapModule
}

function CoverCell({ covered }: { covered: boolean }) {
  return covered ? (
    <span className="inline-flex size-4 rounded-sm items-center justify-center bg-[oklch(0.62_0.18_145/0.2)] text-[oklch(0.62_0.18_145)] text-[9px] font-bold">+</span>
  ) : (
    <span className="inline-flex size-4 rounded-sm items-center justify-center bg-[oklch(0.52_0.22_25/0.2)] text-[oklch(0.72_0.18_25)] text-[9px] font-bold">!</span>
  )
}

const WELL_STATUS_STYLE: Record<MasterfileWell["wellStatus"], string> = {
  producing:    "bg-[oklch(0.62_0.18_145/0.15)] text-[oklch(0.62_0.18_145)]",
  injection:    "bg-[oklch(0.65_0.15_210/0.15)] text-[oklch(0.65_0.15_210)]",
  idle:         "bg-[oklch(0.72_0.18_70/0.15)]  text-[oklch(0.82_0.15_70)]",
  conservation: "bg-[oklch(0.65_0.15_210/0.15)] text-[oklch(0.65_0.15_210)]",
  liquidated:   "bg-muted/30 text-muted-foreground",
}

const DEADLINE_STYLES = {
  ok:       "bg-[oklch(0.62_0.18_145/0.15)] text-[oklch(0.62_0.18_145)] border-[oklch(0.62_0.18_145/0.3)]",
  warn:     "bg-[oklch(0.72_0.18_70/0.15)]  text-[oklch(0.82_0.15_70)]  border-[oklch(0.72_0.18_70/0.3)]",
  critical: "bg-[oklch(0.52_0.22_25/0.15)]  text-[oklch(0.72_0.18_25)]  border-[oklch(0.52_0.22_25/0.3)]",
}

function getWorstDeadline(roadmap: ReturnType<typeof buildRoadmapForWell>): "ok" | "warn" | "critical" | null {
  return roadmap.reduce<"ok" | "warn" | "critical" | null>((worst, r) => {
    if (!r.deadlineStatus) return worst
    if (r.deadlineStatus === "critical") return "critical"
    if (r.deadlineStatus === "warn" && worst !== "critical") return "warn"
    if (!worst) return "ok"
    return worst
  }, null)
}

function ClusterRow({
  cluster,
  module,
  isPlanned,
  expandedRoadmap,
  setExpandedRoadmap,
}: {
  cluster: MasterfileCluster
  module: RoadmapModule
  isPlanned: boolean
  expandedRoadmap: string | null
  setExpandedRoadmap: (v: string | null) => void
}) {
  const roadmap = buildRoadmapForCluster(cluster)
  const moduleRoadmap = roadmap.filter((r) => r.module === module)
  const isOpen = expandedRoadmap === `c-${cluster.id}`
  const worst = getWorstDeadline(moduleRoadmap)

  return (
    <div className="rounded-md border border-border bg-card overflow-hidden">
      <div className="flex items-center gap-2 px-3 py-2.5">
        {isPlanned ? <CalendarClock className="size-3.5 text-[oklch(0.65_0.15_210)] flex-shrink-0" /> : <AlertTriangle className="size-3.5 text-[oklch(0.72_0.18_25)] flex-shrink-0" />}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[11px] font-mono font-semibold text-foreground">{cluster.clusterName}</span>
            <span className="text-[10px] text-muted-foreground">{cluster.fieldName}</span>
            <span className="text-[10px] text-muted-foreground">{cluster.company}</span>
            {isPlanned && worst && (
              <span className={`text-[9px] font-semibold px-1.5 py-0.5 rounded border ${DEADLINE_STYLES[worst]}`}>
                {worst === "critical" ? "не успевает" : worst === "warn" ? "мало времени" : "успевает"}
              </span>
            )}
          </div>
          <div className="text-[10px] text-muted-foreground font-mono mt-0.5">
            {isPlanned
              ? `${cluster.wellCount} скв. · план ${cluster.plannedTotalOilRate} т/сут · запуск ${cluster.plannedLaunchDate}`
              : `${cluster.wellCount} скв. · ${cluster.totalOilRate} т/сут · запуск ${cluster.launchDate}`
            }
          </div>
        </div>
        <CoverCell covered={cluster.docCoverage[module]} />
        <button
          onClick={() => setExpandedRoadmap(isOpen ? null : `c-${cluster.id}`)}
          className="text-[10px] px-2 py-1 rounded border border-[oklch(0.52_0.22_25/0.4)] bg-[oklch(0.52_0.22_25/0.08)] text-[oklch(0.72_0.18_25)] hover:bg-[oklch(0.52_0.22_25/0.15)] transition-colors flex items-center gap-1 whitespace-nowrap flex-shrink-0">
          Дорожная карта
          {isOpen ? <ChevronDown className="size-3" /> : <ChevronRight className="size-3" />}
        </button>
      </div>
      {isOpen && (
        <div className="border-t border-border px-3 py-3 bg-muted/10">
          <RoadmapPanel
            items={moduleRoadmap}
            objectName={cluster.clusterName}
            plannedLaunchDate={cluster.plannedLaunchDate}
          />
        </div>
      )}
    </div>
  )
}

function WellRow({
  well,
  module,
  isPlanned,
  expandedRoadmap,
  setExpandedRoadmap,
}: {
  well: MasterfileWell
  module: RoadmapModule
  isPlanned: boolean
  expandedRoadmap: string | null
  setExpandedRoadmap: (v: string | null) => void
}) {
  const roadmap = buildRoadmapForWell(well)
  const moduleRoadmap = roadmap.filter((r) => r.module === module)
  const isOpen = expandedRoadmap === `w-${well.id}`
  const worst = getWorstDeadline(moduleRoadmap)

  return (
    <div className="rounded-md border border-border bg-card overflow-hidden">
      <div className="flex items-center gap-2 px-3 py-2.5">
        {isPlanned ? <CalendarClock className="size-3.5 text-[oklch(0.65_0.15_210)] flex-shrink-0" /> : <AlertTriangle className="size-3.5 text-[oklch(0.82_0.15_70)] flex-shrink-0" />}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[11px] font-mono font-semibold text-foreground">{well.wellName}</span>
            <span className={`text-[9px] px-1.5 py-0.5 rounded font-semibold ${WELL_STATUS_STYLE[well.wellStatus]}`}>{well.wellStatusLabel}</span>
            <span className="text-[10px] text-muted-foreground">{well.clusterName} / {well.fieldName}</span>
            <span className="text-[10px] text-muted-foreground">{well.company}</span>
            {isPlanned && worst && (
              <span className={`text-[9px] font-semibold px-1.5 py-0.5 rounded border ${DEADLINE_STYLES[worst]}`}>
                {worst === "critical" ? "не успевает" : worst === "warn" ? "мало времени" : "успевает"}
              </span>
            )}
          </div>
          <div className="text-[10px] text-muted-foreground font-mono mt-0.5">
            {isPlanned
              ? `план ${well.plannedOilRate ?? "—"} т/сут · запуск ${well.plannedLaunchDate ?? "—"}`
              : `${well.oilRateToday != null ? `${well.oilRateToday} т/сут · ` : ""}накоп. ${well.oilCumTst} тыс.т · запуск ${well.launchDate}`
            }
          </div>
        </div>
        <CoverCell covered={well.docCoverage[module]} />
        <button
          onClick={() => setExpandedRoadmap(isOpen ? null : `w-${well.id}`)}
          className="text-[10px] px-2 py-1 rounded border border-[oklch(0.52_0.22_25/0.4)] bg-[oklch(0.52_0.22_25/0.08)] text-[oklch(0.72_0.18_25)] hover:bg-[oklch(0.52_0.22_25/0.15)] transition-colors flex items-center gap-1 whitespace-nowrap flex-shrink-0">
          Дорожная карта
          {isOpen ? <ChevronDown className="size-3" /> : <ChevronRight className="size-3" />}
        </button>
      </div>
      {isOpen && (
        <div className="border-t border-border px-3 py-3 bg-muted/10">
          <RoadmapPanel
            items={moduleRoadmap}
            objectName={`скв. ${well.wellName}`}
            plannedLaunchDate={well.plannedLaunchDate}
          />
        </div>
      )}
    </div>
  )
}

export function MasterfileCrossCheck({ module }: MasterfileCrossCheckProps) {
  const [expandedRoadmap, setExpandedRoadmap] = useState<string | null>(null)

  // Факт: объекты с пробелом именно в данном модуле
  const missingFactClusters = masterfileFactClusters.filter((c) => !c.docCoverage[module])
  const missingFactWells    = masterfileFactWells.filter((w) => !w.docCoverage[module])

  // Планы 2026: объекты с пробелом
  const missingPlanClusters2026 = masterfilePlanClusters2026.filter((c) => !c.docCoverage[module])
  const missingPlanWells2026    = masterfilePlanWells2026.filter((w) => !w.docCoverage[module])

  // Планы 2027: объекты с пробелом
  const missingPlanClusters2027 = masterfilePlanClusters2027.filter((c) => !c.docCoverage[module])
  const missingPlanWells2027    = masterfilePlanWells2027.filter((w) => !w.docCoverage[module])

  const totalFact = missingFactClusters.length + missingFactWells.length
  const totalPlan = missingPlanClusters2026.length + missingPlanWells2026.length
    + missingPlanClusters2027.length + missingPlanWells2027.length

  const allClear = totalFact === 0 && totalPlan === 0

  return (
    <div className="space-y-4">
      {/* Header banner */}
      <div className={`flex flex-wrap items-start gap-3 p-3 rounded-md border ${
        allClear
          ? "border-[oklch(0.62_0.18_145/0.35)] bg-[oklch(0.62_0.18_145/0.06)]"
          : "border-[oklch(0.52_0.22_25/0.35)] bg-[oklch(0.52_0.22_25/0.06)]"
      }`}>
        <Database className={`size-4 flex-shrink-0 mt-0.5 ${allClear ? "text-[oklch(0.62_0.18_145)]" : "text-[oklch(0.72_0.18_25)]"}`} />
        <div className="flex-1 min-w-0">
          <p className={`text-[11px] font-medium leading-relaxed ${allClear ? "text-[oklch(0.62_0.18_145)]" : "text-[oklch(0.72_0.18_25)]"}`}>
            {allClear
              ? "Все фактические и плановые объекты обеспечены документами по данному модулю."
              : `Мастерфайл: ${totalFact > 0 ? `${totalFact} факт. объект${totalFact !== 1 ? "а/ов" : ""}` : ""}${totalFact > 0 && totalPlan > 0 ? " и " : ""}${totalPlan > 0 ? `${totalPlan} план. объект${totalPlan !== 1 ? "а/ов" : ""}` : ""} без документов в данном модуле.`
            }
          </p>
          {!allClear && (
            <p className="text-[10px] text-muted-foreground mt-1 leading-relaxed">
              Для плановых объектов дорожная карта учитывает дату запуска как жёсткий дедлайн оформления документов.
            </p>
          )}
        </div>
        <div className="flex items-center gap-3 text-[10px] text-muted-foreground font-mono flex-shrink-0">
          {allClear ? (
            <span className="flex items-center gap-1 text-[oklch(0.62_0.18_145)]"><CheckCircle2 className="size-3.5" /> 100% покрытие</span>
          ) : (
            <>
              {totalFact > 0 && <span className="flex items-center gap-1"><StatusDot severity="critical" /> {totalFact} факт</span>}
              {totalPlan > 0 && <span className="flex items-center gap-1"><StatusDot severity="warning" /> {totalPlan} план</span>}
            </>
          )}
        </div>
      </div>

      {allClear && (
        <div className="text-[11px] text-muted-foreground text-center py-6">
          Нет объектов с пробелами в данном модуле.
        </div>
      )}

      {/* ─── ФАКТИЧЕСКИЕ ОБЪЕКТЫ ─────────────────────────────────────────────── */}
      {missingFactClusters.length > 0 && (
        <section>
          <h4 className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">
            Фактические кусты без документов ({missingFactClusters.length})
          </h4>
          <div className="space-y-1.5">
            {missingFactClusters.map((cluster) => (
              <ClusterRow key={cluster.id} cluster={cluster} module={module} isPlanned={false}
                expandedRoadmap={expandedRoadmap} setExpandedRoadmap={setExpandedRoadmap} />
            ))}
          </div>
        </section>
      )}

      {missingFactWells.length > 0 && (
        <section>
          <h4 className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">
            Фактические скважины без документов ({missingFactWells.length})
          </h4>
          <div className="space-y-1.5">
            {missingFactWells.map((well) => (
              <WellRow key={well.id} well={well} module={module} isPlanned={false}
                expandedRoadmap={expandedRoadmap} setExpandedRoadmap={setExpandedRoadmap} />
            ))}
          </div>
        </section>
      )}

      {/* ─── ПЛАНОВЫЕ ОБЪЕКТЫ 2026 ───────────────────────────────────────────── */}
      {(missingPlanClusters2026.length > 0 || missingPlanWells2026.length > 0) && (
        <section>
          <div className="flex items-center gap-2 mb-2">
            <CalendarClock className="size-3.5 text-[oklch(0.65_0.15_210)]" />
            <h4 className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
              Плановые объекты 2026 — требуется оформить до запуска ({missingPlanClusters2026.length + missingPlanWells2026.length})
            </h4>
          </div>
          <div className="space-y-1.5">
            {missingPlanClusters2026.map((cluster) => (
              <ClusterRow key={cluster.id} cluster={cluster} module={module} isPlanned={true}
                expandedRoadmap={expandedRoadmap} setExpandedRoadmap={setExpandedRoadmap} />
            ))}
            {missingPlanWells2026.map((well) => (
              <WellRow key={well.id} well={well} module={module} isPlanned={true}
                expandedRoadmap={expandedRoadmap} setExpandedRoadmap={setExpandedRoadmap} />
            ))}
          </div>
        </section>
      )}

      {/* ─── ПЛАНОВЫЕ ОБЪЕКТЫ 2027 ───────────────────────────────────────────── */}
      {(missingPlanClusters2027.length > 0 || missingPlanWells2027.length > 0) && (
        <section>
          <div className="flex items-center gap-2 mb-2">
            <CalendarClock className="size-3.5 text-[oklch(0.65_0.15_210)]" />
            <h4 className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
              Плановые объекты 2027 — требуется оформить до запуска ({missingPlanClusters2027.length + missingPlanWells2027.length})
            </h4>
          </div>
          <div className="space-y-1.5">
            {missingPlanClusters2027.map((cluster) => (
              <ClusterRow key={cluster.id} cluster={cluster} module={module} isPlanned={true}
                expandedRoadmap={expandedRoadmap} setExpandedRoadmap={setExpandedRoadmap} />
            ))}
            {missingPlanWells2027.map((well) => (
              <WellRow key={well.id} well={well} module={module} isPlanned={true}
                expandedRoadmap={expandedRoadmap} setExpandedRoadmap={setExpandedRoadmap} />
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
