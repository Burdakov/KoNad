"use client"

import { HydroSubPage } from "@/components/hydro-sub-page"
import { Waves } from "lucide-react"

export default function HydroPlacementPage() {
  return (
    <HydroSubPage
      config={{
        title: "Проекты размещения попутно добытых вод",
        subtitle: "Проекты размещения пластовых вод и ПГИН (проекты геологического изучения недр) для поглощающих скважин. Контроль наличия разрешительных документов по каждому водозабору.",
        docTypes: ["water_placement", "pgin"],
        wellCoverageKey: "pgin",
        icon: Waves,
      }}
    />
  )
}
