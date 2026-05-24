"use client"

import { useState } from "react"
import { RoadmapPanel } from "@/components/roadmap-panel"
import { StatusDot } from "@/components/status-badge"
import {
  masterfileWells,
  masterfileClusters,
  buildRoadmapForWell,
  buildRoadmapForCluster,
  type RoadmapModule,
  type MasterfileWell,
  type MasterfileCluster,
} from "@/lib/mock-data"
import { ChevronRight, ChevronDown, Database, CheckCircle2, AlertTriangle } from "lucide-react"

interface MasterfileCrossCheckProps {
  /** Фильтровать только объекты с пробелом именно в этом модуле */
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

export function MasterfileCrossCheck({ module }: MasterfileCrossCheckProps) {
  const [expandedRoadmap, setExpandedRoadmap] = useState<string | null>(null)

  // Объекты с пробелом именно в данном модуле
  const missingClusters = masterfileClusters.filter((c) => !c.docCoverage[module])
  const missingWells    = masterfileWells.filter((w) => !w.docCoverage[module])

  const allClear = missingClusters.length === 0 && missingWells.length === 0

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
              ? "Все объекты добычи из мастерфайла обеспечены документами по данному модулю."
              : `Мастерфайл содержит объекты добычи, не обеспеченные документами в данном модуле: ${missingClusters.length} куст${missingClusters.length !== 1 ? "а/ов" : ""}, ${missingWells.length} скважин${missingWells.length !== 1 ? "" : "а"}.`
            }
          </p>
          {!allClear && (
            <p className="text-[10px] text-muted-foreground mt-1 leading-relaxed">
              Для каждого объекта ниже сформирована дорожная карта с шагами оформления документов, ответственными подразделениями и предельными сроками.
            </p>
          )}
        </div>
        <div className="flex items-center gap-3 text-[10px] text-muted-foreground font-mono flex-shrink-0">
          {allClear ? (
            <span className="flex items-center gap-1 text-[oklch(0.62_0.18_145)]"><CheckCircle2 className="size-3.5" /> 100% покрытие</span>
          ) : (
            <>
              <span className="flex items-center gap-1"><StatusDot severity="critical" /> {missingClusters.length} кустов</span>
              <span className="flex items-center gap-1"><StatusDot severity="warning" /> {missingWells.length} скважин</span>
            </>
          )}
        </div>
      </div>

      {allClear && (
        <div className="text-[11px] text-muted-foreground text-center py-6">
          Нет объектов с пробелами в данном модуле.
        </div>
      )}

      {/* Missing clusters */}
      {missingClusters.length > 0 && (
        <div>
          <h4 className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">
            Кусты без документов в данном модуле ({missingClusters.length})
          </h4>
          <div className="space-y-1.5">
            {missingClusters.map((cluster) => {
              const roadmap = buildRoadmapForCluster(cluster)
              const moduleRoadmap = roadmap.filter((r) => r.module === module)
              const isOpen = expandedRoadmap === `c-${cluster.id}`
              return (
                <div key={cluster.id} className="rounded-md border border-border bg-card overflow-hidden">
                  <div className="flex items-center gap-2 px-3 py-2.5">
                    <AlertTriangle className="size-3.5 text-[oklch(0.72_0.18_25)] flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-[11px] font-mono font-semibold text-foreground">{cluster.clusterName}</span>
                        <span className="text-[10px] text-muted-foreground">{cluster.fieldName}</span>
                        <span className="text-[10px] text-muted-foreground">{cluster.company}</span>
                      </div>
                      <div className="text-[10px] text-muted-foreground font-mono mt-0.5">
                        {cluster.wellCount} скв. · {cluster.totalOilRate} т/сут · запуск {cluster.launchDate}
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
                      <RoadmapPanel items={moduleRoadmap} objectName={cluster.clusterName} />
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Missing wells */}
      {missingWells.length > 0 && (
        <div>
          <h4 className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">
            Скважины без документов в данном модуле ({missingWells.length})
          </h4>
          <div className="space-y-1.5">
            {missingWells.map((well) => {
              const roadmap = buildRoadmapForWell(well)
              const moduleRoadmap = roadmap.filter((r) => r.module === module)
              const isOpen = expandedRoadmap === `w-${well.id}`
              return (
                <div key={well.id} className="rounded-md border border-border bg-card overflow-hidden">
                  <div className="flex items-center gap-2 px-3 py-2.5">
                    <AlertTriangle className="size-3.5 text-[oklch(0.82_0.15_70)] flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-[11px] font-mono font-semibold text-foreground">{well.wellName}</span>
                        <span className={`text-[9px] px-1.5 py-0.5 rounded font-semibold ${WELL_STATUS_STYLE[well.wellStatus]}`}>{well.wellStatusLabel}</span>
                        <span className="text-[10px] text-muted-foreground">{well.clusterName} / {well.fieldName}</span>
                        <span className="text-[10px] text-muted-foreground">{well.company}</span>
                      </div>
                      <div className="text-[10px] text-muted-foreground font-mono mt-0.5">
                        {well.oilRateToday != null ? `${well.oilRateToday} т/сут · ` : ""}накоп. {well.oilCumTst} тыс.т · запуск {well.launchDate}
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
                      <RoadmapPanel items={moduleRoadmap} objectName={`скв. ${well.wellName}`} />
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
