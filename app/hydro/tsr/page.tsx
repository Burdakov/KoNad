"use client"

import { HydroSubPage } from "@/components/hydro-sub-page"
import { Droplets } from "lucide-react"

export default function HydroTsrPage() {
  return (
    <HydroSubPage
      config={{
        title: "ТСР по водоснабжению и ППД",
        subtitle: "Технические схемы разработки в части водоснабжения и поддержания пластового давления (ППД). Проверка соответствия водозаборных скважин наличию действующих ТСР.",
        docTypes: ["tsr_water"],
        wellCoverageKey: "tsr_water",
        icon: Droplets,
      }}
    />
  )
}
