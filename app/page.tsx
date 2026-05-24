import { AppShell } from "@/components/app-shell"
import { KpiCards } from "@/components/kpi-cards"
import { CheckModulesGrid } from "@/components/check-modules-grid"
import { HierarchyTable } from "@/components/hierarchy-table"
import { AlertsFeed } from "@/components/alerts-feed"
import { RefreshCw } from "lucide-react"

export default function DashboardPage() {
  const now = new Date().toLocaleString("ru-RU", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })

  return (
    <AppShell>
      {/* Page header */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="text-base font-semibold text-foreground text-balance">
            Сводный дашборд надзорных проверок
          </h2>
          <p className="text-[11px] text-muted-foreground font-mono mt-0.5">
            Данные актуальны на: {now}
          </p>
        </div>
        <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground font-mono">
          <RefreshCw className="size-3" />
          Автообновление: 5 мин.
        </div>
      </div>

      {/* KPI row */}
      <section aria-label="Ключевые показатели" className="mb-5">
        <KpiCards />
      </section>

      {/* Main content: left = modules + table, right = alerts */}
      <div className="flex flex-col gap-5 xl:flex-row xl:items-start">
        {/* Left column */}
        <div className="flex flex-col gap-5 flex-1 min-w-0">
          {/* Check modules */}
          <section>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Модули проверки
              </h3>
              <span className="text-[10px] text-muted-foreground font-mono">8 модулей · 312 объектов</span>
            </div>
            <CheckModulesGrid />
          </section>

          {/* Hierarchy table */}
          <section>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Иерархия объектов с нарушениями
              </h3>
              <span className="text-[10px] text-muted-foreground font-mono hidden sm:inline">
                Компания → М-е → Участок → Куст → Скважина
              </span>
            </div>
            <HierarchyTable />
          </section>
        </div>

        {/* Right column — alerts */}
        <div className="xl:w-96 xl:flex-shrink-0">
          <section>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Последние нарушения
              </h3>
              <span className="text-[10px] text-muted-foreground font-mono">6 из 70</span>
            </div>
            <div className="rounded-md border border-border bg-card overflow-hidden">
              <AlertsFeed />
            </div>
          </section>
        </div>
      </div>
    </AppShell>
  )
}
