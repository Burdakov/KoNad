"use client"

import {
  LayoutDashboard,
  Map,
  TrendingUp,
  LandPlot,
  Flame,
  Leaf,
  Drill,
  ScrollText,
  FileText,
  ChevronDown,
  Bell,
  RefreshCw,
  ShieldAlert,
  Database,
  Droplets,
} from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"

const navItems = [
  { label: "Дашборд", href: "/", icon: LayoutDashboard },
  { label: "Мастерфайл", href: "/masterfile", icon: Database, badge: 4 },
  { label: "Пространственные", href: "/spatial", icon: Map, badge: 6 },
  { label: "ТСР / Госплан", href: "/tsr", icon: TrendingUp, badge: 3 },
  { label: "Земельные отводы", href: "/land", icon: LandPlot, badge: 2 },
  { label: "ОПО", href: "/opo", icon: Flame, badge: 2 },
  { label: "КЭР", href: "/ker", icon: Leaf, badge: 4 },
  { label: "Консервация", href: "/wells", icon: Drill, badge: 2 },
  { label: "Лицензирование", href: "/license", icon: FileText, badge: 2 },
  { label: "Отчётность", href: "/reporting", icon: ScrollText, badge: 2 },
  { label: "Гидрогеология", href: "/hydro", icon: Droplets, badge: 4 },
]

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  return (
    <div className="flex h-screen overflow-hidden bg-background text-foreground">
      {/* Sidebar */}
      <aside className="flex flex-col w-56 flex-shrink-0 border-r border-border bg-sidebar">
        {/* Logo */}
        <div className="flex items-center gap-2.5 px-4 py-4 border-b border-sidebar-border">
          <div className="flex items-center justify-center size-7 rounded bg-primary/20 text-primary">
            <ShieldAlert className="size-4" />
          </div>
          <div className="flex flex-col leading-none">
            <span className="text-sm font-bold tracking-tight text-sidebar-foreground">КоНад</span>
            <span className="text-[10px] text-muted-foreground">Контроль Надзора</span>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex flex-col gap-0.5 p-2 flex-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-2.5 px-2.5 py-2 rounded text-sm transition-colors group",
                  pathname === item.href
                    ? "bg-sidebar-accent text-sidebar-foreground font-medium"
                    : "text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-foreground"
                )}
              >
                <Icon className="size-4 flex-shrink-0" />
                <span className="flex-1 truncate">{item.label}</span>
                {item.badge !== undefined && item.badge > 0 && (
                  <span className="text-[10px] font-mono font-semibold px-1.5 py-0.5 rounded bg-[oklch(0.52_0.22_25/0.3)] text-[oklch(0.72_0.18_25)]">
                    {item.badge}
                  </span>
                )}
              </Link>
            )
          })}
        </nav>

        {/* Footer */}
        <div className="px-3 py-3 border-t border-sidebar-border text-[10px] text-muted-foreground/50 font-mono">
          v0.1.0 · прототип
        </div>
      </aside>

      {/* Main */}
      <div className="flex flex-col flex-1 overflow-hidden">
        {/* Topbar */}
        <header className="flex items-center justify-between px-5 py-3 border-b border-border bg-card/50 flex-shrink-0">
          <div className="flex items-center gap-3">
            <h1 className="text-sm font-semibold text-foreground">
              Мониторинг требований надзора за недропользованием
            </h1>
            <span className="hidden sm:flex items-center gap-1 text-[10px] text-muted-foreground font-mono bg-muted/40 px-2 py-0.5 rounded">
              <span className="size-1.5 rounded-full bg-[oklch(0.62_0.18_145)] animate-pulse inline-block" />
              в реальном времени
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              className="flex items-center gap-1.5 text-[11px] text-muted-foreground hover:text-foreground transition-colors px-2.5 py-1.5 rounded hover:bg-muted/40"
              title="Обновить данные"
            >
              <RefreshCw className="size-3.5" />
              <span className="hidden sm:inline">Обновить</span>
            </button>
            <button
              className="relative flex items-center justify-center size-8 rounded hover:bg-muted/40 text-muted-foreground hover:text-foreground transition-colors"
              title="Уведомления"
            >
              <Bell className="size-4" />
              <span className="absolute top-1 right-1 size-2 rounded-full bg-[oklch(0.52_0.22_25)] border border-background" />
            </button>
            <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded hover:bg-muted/40 cursor-pointer transition-colors">
              <div className="size-6 rounded-full bg-primary/20 text-primary flex items-center justify-center text-[10px] font-bold">
                ИП
              </div>
              <span className="text-[11px] text-muted-foreground hidden sm:inline">Инспектор</span>
              <ChevronDown className="size-3 text-muted-foreground hidden sm:inline" />
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-5">
          {children}
        </main>
      </div>
    </div>
  )
}
