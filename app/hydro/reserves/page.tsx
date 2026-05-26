"use client"

import { HydroSubPage } from "@/components/hydro-sub-page"
import { FlaskConical } from "lucide-react"

export default function HydroReservesPage() {
  return (
    <HydroSubPage
      config={{
        title: "Подсчёты запасов подземных вод",
        subtitle: "Утверждённые протоколы ГКЗ/ТКЗ по запасам подземных вод для водозаборных скважин месторождений. Проверка наличия актуальных документов по каждой скважине.",
        docTypes: ["reserves"],
        wellCoverageKey: "reserves",
        icon: FlaskConical,
      }}
    />
  )
}
