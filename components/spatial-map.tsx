"use client"

import { useState, useMemo } from "react"
import {
  reserveContours,
  miningAllotments,
  mapWells,
  type MapWell,
  type ReserveContour,
  type MiningAllotment,
} from "@/lib/mock-data"
import { MapPin, Circle, AlertTriangle, CalendarClock, Layers } from "lucide-react"

// ─── Field groups ────────────────────────────────────────────────────────────
const FIELDS: { id: string; name: string; label: string }[] = [
  { id: "mf1", name: "Западно-Сибирское",      label: "Западно-Сибирское" },
  { id: "mf2", name: "Северное",               label: "Северное" },
  { id: "mf3", name: "Арктическое",            label: "Арктическое" },
  { id: "mf4", name: "Центральное",            label: "Центральное" },
  { id: "mf5", name: "Арктическое (Блок Д)",  label: "Арктическое (Блок Д)" },
]

// ─── Reserve category colours ────────────────────────────────────────────────
const RESERVE_FILL: Record<string, { fill: string; stroke: string; label: string }> = {
  "В1+В2": { fill: "oklch(0.62 0.18 145 / 0.18)", stroke: "oklch(0.62 0.18 145 / 0.8)", label: "В1+В2" },
  "В1":    { fill: "oklch(0.72 0.18 145 / 0.18)", stroke: "oklch(0.72 0.18 145 / 0.8)", label: "В1"    },
  "В2":    { fill: "oklch(0.62 0.20 160 / 0.18)", stroke: "oklch(0.62 0.20 160 / 0.8)", label: "В2"    },
  "С1":    { fill: "oklch(0.65 0.15 210 / 0.18)", stroke: "oklch(0.65 0.15 210 / 0.8)", label: "С1"    },
  "С2":    { fill: "oklch(0.70 0.12 240 / 0.18)", stroke: "oklch(0.70 0.12 240 / 0.8)", label: "С2"    },
}

// ─── Projection helpers ──────────────────────────────────────────────────────
interface Viewport { minLon: number; maxLon: number; minLat: number; maxLat: number }

function project(
  lon: number,
  lat: number,
  vp: Viewport,
  svgW: number,
  svgH: number,
  pad = 24,
): [number, number] {
  const scaleX = (svgW - pad * 2) / (vp.maxLon - vp.minLon)
  const scaleY = (svgH - pad * 2) / (vp.maxLat - vp.minLat)
  return [
    pad + (lon - vp.minLon) * scaleX,
    svgH - pad - (lat - vp.minLat) * scaleY,
  ]
}

function polygonToSvgPoints(
  polygon: [number, number][],
  vp: Viewport,
  w: number,
  h: number,
): string {
  return polygon.map(([lon, lat]) => project(lon, lat, vp, w, h).join(",")).join(" ")
}

function computeViewport(
  contours: ReserveContour[],
  allotments: MiningAllotment[],
  wells: MapWell[],
  marginFactor = 0.15,
): Viewport {
  const lons: number[] = [
    ...contours.flatMap((c) => c.polygon.map(([lon]) => lon)),
    ...allotments.flatMap((a) => a.polygon.map(([lon]) => lon)),
    ...wells.map((w) => w.lon),
  ]
  const lats: number[] = [
    ...contours.flatMap((c) => c.polygon.map(([, lat]) => lat)),
    ...allotments.flatMap((a) => a.polygon.map(([, lat]) => lat)),
    ...wells.map((w) => w.lat),
  ]
  const minLon = Math.min(...lons)
  const maxLon = Math.max(...lons)
  const minLat = Math.min(...lats)
  const maxLat = Math.max(...lats)
  const mLon = (maxLon - minLon) * marginFactor
  const mLat = (maxLat - minLat) * marginFactor
  return {
    minLon: minLon - mLon,
    maxLon: maxLon + mLon,
    minLat: minLat - mLat,
    maxLat: maxLat + mLat,
  }
}

// ─── Single-field SVG panel ──────────────────────────────────────────────────
function FieldPanel({
  fieldId,
  showReserves,
  showMining,
  showPlan,
  hoveredWell,
  setHoveredWell,
  onSelectWell,
}: {
  fieldId: string
  showReserves: boolean
  showMining: boolean
  showPlan: boolean
  hoveredWell: string | null
  setHoveredWell: (id: string | null) => void
  onSelectWell: (w: MapWell) => void
}) {
  const contours    = reserveContours.filter((c) => c.fieldId === fieldId)
  const allotments  = miningAllotments.filter((a) => a.fieldId === fieldId)
  const wells       = mapWells.filter((w) => w.fieldId === fieldId)
  const SVG_W = 400
  const SVG_H = 260

  const vp = useMemo(
    () => computeViewport(contours, allotments, wells),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [fieldId],
  )

  if (contours.length === 0 && allotments.length === 0 && wells.length === 0) return null

  const proj = (lon: number, lat: number) => project(lon, lat, vp, SVG_W, SVG_H)

  return (
    <svg
      viewBox={`0 0 ${SVG_W} ${SVG_H}`}
      className="w-full h-full"
      style={{ overflow: "visible" }}
    >
      {/* ── Grid lines (subtle) */}
      <defs>
        <pattern id={`grid-${fieldId}`} width="40" height="40" patternUnits="userSpaceOnUse">
          <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="0.3" className="text-border/30" />
        </pattern>
      </defs>
      <rect width={SVG_W} height={SVG_H} fill={`url(#grid-${fieldId})`} />

      {/* ── Mining allotment boundaries */}
      {showMining && allotments.map((a) => (
        <polygon
          key={a.id}
          points={polygonToSvgPoints(a.polygon, vp, SVG_W, SVG_H)}
          fill="none"
          stroke={a.status === "pending"
            ? "oklch(0.65 0.15 210 / 0.6)"
            : "oklch(0.72 0.18 70 / 0.8)"}
          strokeWidth="1.5"
          strokeDasharray={a.status === "pending" ? "5 3" : undefined}
        />
      ))}

      {/* ── Reserve contours (filled polygons, behind wells) */}
      {showReserves && contours.map((c) => {
        const style = RESERVE_FILL[c.category] ?? RESERVE_FILL["С2"]
        return (
          <polygon
            key={c.id}
            points={polygonToSvgPoints(c.polygon, vp, SVG_W, SVG_H)}
            fill={style.fill}
            stroke={style.stroke}
            strokeWidth="1"
          >
            <title>{c.fieldName} — Контур {c.category}</title>
          </polygon>
        )
      })}

      {/* ── Reserve category labels */}
      {showReserves && contours.map((c) => {
        const centLon = c.polygon.reduce((s, [lon]) => s + lon, 0) / c.polygon.length
        const centLat = c.polygon.reduce((s, [, lat]) => s + lat, 0) / c.polygon.length
        const [cx, cy] = proj(centLon, centLat)
        const style = RESERVE_FILL[c.category] ?? RESERVE_FILL["С2"]
        return (
          <text
            key={`lbl-${c.id}`}
            x={cx} y={cy}
            textAnchor="middle" dominantBaseline="middle"
            fontSize="8"
            fontWeight="700"
            fill={style.stroke}
            style={{ fontFamily: "monospace", pointerEvents: "none", userSelect: "none" }}
          >
            {c.category}
          </text>
        )
      })}

      {/* ── Wells */}
      {wells.map((w) => {
        if (w.dataType === "plan" && !showPlan) return null
        const [cx, cy] = proj(w.lon, w.lat)
        const isHovered = hoveredWell === w.id
        const r = isHovered ? 7 : 5

        // Colors
        let fill: string
        let stroke: string
        if (w.violation === "critical") {
          fill = "oklch(0.52 0.22 25 / 0.9)"
          stroke = "oklch(0.52 0.22 25)"
        } else if (w.violation === "warning") {
          fill = "oklch(0.72 0.18 70 / 0.9)"
          stroke = "oklch(0.72 0.18 70)"
        } else if (w.dataType === "plan" && w.inProductionPlan) {
          // Плановые в плане добычи — красный контур
          fill = "oklch(0.52 0.22 25 / 0.2)"
          stroke = "oklch(0.52 0.22 25)"
        } else if (w.inProductionPlan) {
          fill = "oklch(0.62 0.18 145 / 0.9)"
          stroke = "oklch(0.62 0.18 145)"
        } else {
          fill = "oklch(0.6 0.0 0 / 0.4)"
          stroke = "oklch(0.6 0.0 0 / 0.7)"
        }

        return (
          <g
            key={w.id}
            transform={`translate(${cx},${cy})`}
            style={{ cursor: "pointer" }}
            onMouseEnter={() => setHoveredWell(w.id)}
            onMouseLeave={() => setHoveredWell(null)}
            onClick={() => onSelectWell(w)}
          >
            {/* Pulse ring for plan wells in production plan */}
            {w.dataType === "plan" && w.inProductionPlan && (
              <circle r={r + 3} fill="none" stroke="oklch(0.52 0.22 25 / 0.35)" strokeWidth="1" strokeDasharray="2 2" />
            )}
            {/* Violation halo */}
            {w.violation && (
              <circle r={r + 4} fill="none" stroke={w.violation === "critical" ? "oklch(0.52 0.22 25 / 0.3)" : "oklch(0.72 0.18 70 / 0.3)"} strokeWidth="2" />
            )}
            {/* Main dot */}
            {w.dataType === "plan" ? (
              <rect
                x={-r} y={-r} width={r * 2} height={r * 2}
                rx="1"
                fill={fill} stroke={stroke} strokeWidth="1.5"
              />
            ) : (
              <circle r={r} fill={fill} stroke={stroke} strokeWidth="1.5" />
            )}
            {/* Well name label on hover */}
            {isHovered && (
              <text
                x={0} y={-(r + 5)}
                textAnchor="middle"
                fontSize="9"
                fontWeight="600"
                fill="oklch(0.95 0 0)"
                stroke="oklch(0.1 0 0)"
                strokeWidth="2"
                paintOrder="stroke"
                style={{ fontFamily: "monospace", pointerEvents: "none", userSelect: "none" }}
              >
                {w.wellName}
              </text>
            )}
          </g>
        )
      })}
    </svg>
  )
}

// ─── Well tooltip panel ───────────────────────────────────────────────────────
function WellTooltip({ well, onClose }: { well: MapWell; onClose: () => void }) {
  return (
    <div className="absolute top-3 right-3 z-10 w-56 rounded-md border border-border bg-card shadow-lg p-3 text-[11px]">
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex items-center gap-1.5">
          {well.dataType === "plan"
            ? <CalendarClock className="size-3.5 text-[oklch(0.65_0.15_210)] flex-shrink-0" />
            : <Circle className="size-3.5 text-[oklch(0.62_0.18_145)] flex-shrink-0" />
          }
          <span className="font-mono font-bold text-foreground">{well.wellName}</span>
        </div>
        <button onClick={onClose} className="text-muted-foreground hover:text-foreground text-[10px] leading-none">✕</button>
      </div>
      <div className="space-y-1 text-muted-foreground">
        <div><span className="text-foreground/60">Компания:</span> {well.company}</div>
        <div>
          <span className="text-foreground/60">Тип:</span>{" "}
          <span className={well.dataType === "plan" ? "text-[oklch(0.65_0.15_210)]" : "text-[oklch(0.62_0.18_145)]"}>
            {well.dataType === "plan" ? "Плановый" : "Фактический"}
          </span>
        </div>
        {well.dataType === "plan" && well.plannedLaunchDate && (
          <div><span className="text-foreground/60">Запуск:</span> <span className="font-mono">{well.plannedLaunchDate}</span></div>
        )}
        {well.dataType === "fact" && well.oilRateToday != null && (
          <div><span className="text-foreground/60">Дебит:</span> <span className="font-mono">{well.oilRateToday} т/сут</span></div>
        )}
        <div>
          <span className="text-foreground/60">В плане добычи:</span>{" "}
          <span className={well.inProductionPlan ? "text-[oklch(0.62_0.18_145)]" : "text-muted-foreground"}>
            {well.inProductionPlan ? "Да" : "Нет"}
          </span>
        </div>
        {well.violation && (
          <div className={`flex items-center gap-1 font-semibold ${
            well.violation === "critical" ? "text-[oklch(0.72_0.18_25)]" : "text-[oklch(0.82_0.15_70)]"
          }`}>
            <AlertTriangle className="size-3" />
            {well.violation === "critical" ? "Критическое нарушение" : "Предупреждение"}
          </div>
        )}
        <div className="font-mono text-[10px] text-muted-foreground/60 pt-1 border-t border-border/50 mt-1">
          {well.lon.toFixed(4)}°E · {well.lat.toFixed(4)}°N
        </div>
      </div>
    </div>
  )
}

// ─── Legend ───────────────────────────────────────────────────────────────────
function MapLegend() {
  return (
    <div className="flex flex-wrap gap-x-4 gap-y-1.5 p-2.5 rounded-md border border-border bg-card/80 text-[10px]">
      <span className="font-semibold text-muted-foreground uppercase tracking-wide text-[9px] w-full">Легенда</span>
      {/* Wells */}
      <span className="flex items-center gap-1.5">
        <svg width="12" height="12" viewBox="-6 -6 12 12">
          <circle r="5" fill="oklch(0.62 0.18 145 / 0.9)" stroke="oklch(0.62 0.18 145)" strokeWidth="1.5" />
        </svg>
        Скважина (факт, план добычи)
      </span>
      <span className="flex items-center gap-1.5">
        <svg width="12" height="12" viewBox="-6 -6 12 12">
          <rect x="-5" y="-5" width="10" height="10" rx="1" fill="oklch(0.52 0.22 25 / 0.2)" stroke="oklch(0.52 0.22 25)" strokeWidth="1.5" strokeDasharray="2 2" />
        </svg>
        Скважина (план, красный = в плане добычи)
      </span>
      <span className="flex items-center gap-1.5">
        <svg width="12" height="12" viewBox="-6 -6 12 12">
          <circle r="5" fill="oklch(0.52 0.22 25 / 0.9)" stroke="oklch(0.52 0.22 25)" strokeWidth="1.5" />
        </svg>
        Критическое нарушение
      </span>
      <span className="flex items-center gap-1.5">
        <svg width="12" height="12" viewBox="-6 -6 12 12">
          <circle r="5" fill="oklch(0.72 0.18 70 / 0.9)" stroke="oklch(0.72 0.18 70)" strokeWidth="1.5" />
        </svg>
        Предупреждение
      </span>
      {/* Contours */}
      {Object.entries(RESERVE_FILL).map(([cat, s]) => (
        <span key={cat} className="flex items-center gap-1.5">
          <svg width="12" height="10" viewBox="0 0 12 10">
            <rect x="0" y="0" width="12" height="10" fill={s.fill} stroke={s.stroke} strokeWidth="1" />
          </svg>
          Запасы {s.label}
        </span>
      ))}
      <span className="flex items-center gap-1.5">
        <svg width="22" height="10" viewBox="0 0 22 10">
          <line x1="0" y1="5" x2="22" y2="5" stroke="oklch(0.72 0.18 70 / 0.8)" strokeWidth="1.5" />
        </svg>
        Горный отвод (действующий)
      </span>
      <span className="flex items-center gap-1.5">
        <svg width="22" height="10" viewBox="0 0 22 10">
          <line x1="0" y1="5" x2="22" y2="5" stroke="oklch(0.65 0.15 210 / 0.6)" strokeWidth="1.5" strokeDasharray="5 3" />
        </svg>
        Горный отвод (в оформлении)
      </span>
    </div>
  )
}

// ─── Main SpatialMap export ───────────────────────────────────────────────────
export function SpatialMap() {
  const [activeField, setActiveField] = useState<string>("all")
  const [showReserves, setShowReserves] = useState(true)
  const [showMining, setShowMining]     = useState(true)
  const [showPlan, setShowPlan]         = useState(true)
  const [hoveredWell, setHoveredWell]   = useState<string | null>(null)
  const [selectedWell, setSelectedWell] = useState<MapWell | null>(null)

  const visibleFields = activeField === "all"
    ? FIELDS.filter((f) => mapWells.some((w) => w.fieldId === f.id))
    : FIELDS.filter((f) => f.id === activeField)

  // Count plan wells in production plan (highlighted red)
  const planInProd = mapWells.filter((w) => w.dataType === "plan" && w.inProductionPlan).length
  const factViolated = mapWells.filter((w) => w.dataType === "fact" && w.violation).length

  return (
    <div className="space-y-3">
      {/* Controls */}
      <div className="flex flex-wrap items-center gap-2">
        {/* Field selector */}
        <div className="flex flex-wrap gap-1">
          <button
            onClick={() => setActiveField("all")}
            className={`text-[11px] px-2.5 py-1 rounded border transition-colors font-mono ${
              activeField === "all"
                ? "border-primary/60 bg-primary/10 text-primary"
                : "border-border text-muted-foreground hover:border-muted-foreground/50"
            }`}
          >
            Все м-я
          </button>
          {FIELDS.map((f) => (
            <button
              key={f.id}
              onClick={() => setActiveField(f.id)}
              className={`text-[11px] px-2.5 py-1 rounded border transition-colors font-mono ${
                activeField === f.id
                  ? "border-primary/60 bg-primary/10 text-primary"
                  : "border-border text-muted-foreground hover:border-muted-foreground/50"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Layer toggles */}
        <div className="flex gap-1 ml-auto">
          <button
            onClick={() => setShowReserves((v) => !v)}
            className={`flex items-center gap-1 text-[11px] px-2 py-1 rounded border transition-colors ${
              showReserves
                ? "border-[oklch(0.62_0.18_145/0.5)] bg-[oklch(0.62_0.18_145/0.12)] text-[oklch(0.62_0.18_145)]"
                : "border-border text-muted-foreground"
            }`}
          >
            <Layers className="size-3" /> Запасы
          </button>
          <button
            onClick={() => setShowMining((v) => !v)}
            className={`flex items-center gap-1 text-[11px] px-2 py-1 rounded border transition-colors ${
              showMining
                ? "border-[oklch(0.72_0.18_70/0.5)] bg-[oklch(0.72_0.18_70/0.12)] text-[oklch(0.82_0.15_70)]"
                : "border-border text-muted-foreground"
            }`}
          >
            <Layers className="size-3" /> Горн. отводы
          </button>
          <button
            onClick={() => setShowPlan((v) => !v)}
            className={`flex items-center gap-1 text-[11px] px-2 py-1 rounded border transition-colors ${
              showPlan
                ? "border-[oklch(0.52_0.22_25/0.5)] bg-[oklch(0.52_0.22_25/0.12)] text-[oklch(0.72_0.18_25)]"
                : "border-border text-muted-foreground"
            }`}
          >
            <CalendarClock className="size-3" /> План
          </button>
        </div>
      </div>

      {/* Info strip */}
      <div className="flex flex-wrap gap-4 px-3 py-2 rounded-md border border-border bg-card text-[11px]">
        <span className="text-muted-foreground">
          <span className="font-mono text-[oklch(0.52_0.22_25)] font-semibold">{planInProd}</span> плановых скв. в плане добычи мастерфайла <span className="text-[oklch(0.52_0.22_25)]">(отмечены красным)</span>
        </span>
        <span className="text-muted-foreground">
          <span className="font-mono text-[oklch(0.72_0.18_25)] font-semibold">{factViolated}</span> нарушений по пространственным данным
        </span>
        <span className="text-muted-foreground text-[10px]">
          Нажмите на скважину для детальной информации
        </span>
      </div>

      {/* Map grid */}
      <div className={`grid gap-3 ${visibleFields.length === 1 ? "grid-cols-1" : "grid-cols-1 lg:grid-cols-2"}`}>
        {visibleFields.map((f) => (
          <div key={f.id} className="rounded-md border border-border bg-card overflow-hidden">
            {/* Panel header */}
            <div className="flex items-center justify-between px-3 py-2 border-b border-border bg-muted/20">
              <div className="flex items-center gap-2">
                <MapPin className="size-3.5 text-muted-foreground" />
                <span className="text-[11px] font-semibold text-foreground">{f.name}</span>
              </div>
              <div className="flex items-center gap-3 text-[10px] text-muted-foreground font-mono">
                <span>{mapWells.filter((w) => w.fieldId === f.id && w.dataType === "fact").length} факт.</span>
                {mapWells.some((w) => w.fieldId === f.id && w.dataType === "plan") && (
                  <span className="text-[oklch(0.72_0.18_25)]">
                    +{mapWells.filter((w) => w.fieldId === f.id && w.dataType === "plan").length} план.
                  </span>
                )}
                {mapWells.some((w) => w.fieldId === f.id && w.violation) && (
                  <span className="text-[oklch(0.72_0.18_25)] flex items-center gap-1">
                    <AlertTriangle className="size-3" />
                    {mapWells.filter((w) => w.fieldId === f.id && w.violation).length} нар.
                  </span>
                )}
              </div>
            </div>

            {/* SVG map panel */}
            <div className="relative" style={{ height: activeField === "all" ? 220 : 380 }}>
              <FieldPanel
                fieldId={f.id}
                showReserves={showReserves}
                showMining={showMining}
                showPlan={showPlan}
                hoveredWell={hoveredWell}
                setHoveredWell={setHoveredWell}
                onSelectWell={setSelectedWell}
              />
              {selectedWell && selectedWell.fieldId === f.id && (
                <WellTooltip well={selectedWell} onClose={() => setSelectedWell(null)} />
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Legend */}
      <MapLegend />
    </div>
  )
}
