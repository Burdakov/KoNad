"use client"

import {
  TrendingUp,
  Leaf,
  Drill,
  ChevronDown,
  Bell,
  RefreshCw,
  ShieldAlert,
  Droplets,
  Rocket,
  ChevronRight,
  FlaskConical,
  Waves,
  BarChart2,
  type LucideIcon,
} from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { useState } from "react"

interface NavItem {
  label: string
  href: string
  icon: LucideIcon
  badge?: number
}

interface NavSection {
  id: string
  label: string
  icon: LucideIcon
  items: NavItem[]
  defaultOpen?: boolean
}

// ─────────────────────────────────────────────────────────────────
// 3 main sections
// ─────────────────────────────────────────────────────────────────
const navSections: NavSection[] = [
  {
    id: "launch",
    label: "Запуск новых объектов",
    icon: Rocket,
    defaultOpen: true,
    items: [
      { label: "Чек-лист и Ганта", href: "/launch", icon: Rocket, badge: 5 },
    ],
  },
  {
    id: "monitoring",
    label: "Мониторинг требований",
    icon: BarChart2,
    defaultOpen: true,
    items: [
      { label: "Технологические схемы (ТСР)", href: "/tsr", icon: TrendingUp, badge: 3 },
      { label: "КЭР / Выбросы", href: "/ker", icon: Leaf, badge: 7 },
      { label: "Консервация / Ликвидация", href: "/wells", icon: Drill, badge: 2 },
    ],
  },
  {
    id: "hydro",
    label: "Гидрогеология",
    icon: Waves,
    defaultOpen: true,
    items: [
      { label: "Подсчёты запасов", href: "/hydro/reserves", icon: FlaskConical, badge: 1 },
      { label: "ТСР (вода / ППД)", href: "/hydro/tsr", icon: Droplets, badge: 2 },
      { label: "Проекты размещения вод", href: "/hydro/placement", icon: Waves, badge: 4 },
    ],
  },
]

function NavSectionBlock({ section, pathname }: { section: NavSection; pathname: string }) {
  const isAnyActive = section.items.some(
    (i) => pathname === i.href || pathname.startsWith(i.href + "/")
  )
  const [open, setOpen] = useState(section.defaultOpen ?? isAnyActive)
  const totalBadge = section.items.reduce((s, i) => s + (i.badge ?? 0), 0)
  const SectionIcon = section.icon

  return (
    <div className="mb-1">
      <button
        onClick={() => setOpen((o) => !o)}
        className={cn(
          "w-full flex items-center gap-2 px-2.5 py-1.5 rounded text-xs font-semibold transition-colors",
          isAnyActive
            ? "text-primary"
            : "text-muted-foreground hover:text-foreground hover:bg-sidebar-accent"
        )}
      >
        <SectionIcon className="size-3.5 flex-shrink-0" />
        <span className="flex-1 text-left uppercase tracking-wide text-[10px]">{section.label}</span>
        {!open && totalBadge > 0 && (
          <span className="text-[10px] font-mono font-semibold px-1.5 py-0.5 rounded bg-destructive/10 text-destructive">
            {totalBadge}
          </span>
        )}
        {open
          ? <ChevronDown className="size-3 flex-shrink-0 opacity-50" />
          : <ChevronRight className="size-3 flex-shrink-0 opacity-50" />
        }
      </button>

      {open && (
        <div className="ml-2 pl-2 border-l border-border flex flex-col gap-0.5 mt-0.5">
          {section.items.map((item) => {
            const Icon = item.icon
            const active = pathname === item.href || pathname.startsWith(item.href + "/")
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-2.5 px-2.5 py-1.5 rounded text-sm transition-colors",
                  active
                    ? "bg-primary/10 text-primary font-medium"
                    : "text-muted-foreground hover:bg-sidebar-accent hover:text-foreground"
                )}
              >
                <Icon className="size-4 flex-shrink-0" />
                <span className="flex-1 truncate">{item.label}</span>
                {item.badge !== undefined && item.badge > 0 && (
                  <span className={cn(
                    "text-[10px] font-mono font-semibold px-1.5 py-0.5 rounded",
                    active
                      ? "bg-primary/15 text-primary"
                      : "bg-destructive/10 text-destructive"
                  )}>
                    {item.badge}
                  </span>
                )}
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  return (
    <div className="flex h-screen overflow-hidden bg-background text-foreground">
      {/* Sidebar */}
      <aside className="flex flex-col w-60 flex-shrink-0 border-r border-sidebar-border bg-sidebar">
        {/* Logo */}
        <div className="flex items-center gap-2.5 px-4 py-4 border-b border-sidebar-border">
          <div className="flex items-center justify-center size-7 rounded bg-primary/15 text-primary">
            <ShieldAlert className="size-4" />
          </div>
          <div className="flex flex-col leading-none">
            <span className="text-sm font-bold tracking-tight text-foreground">КоНад</span>
            <span className="text-[10px] text-muted-foreground">Контроль Надзора</span>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex flex-col gap-1 p-2 flex-1 overflow-y-auto">
          {navSections.map((section) => (
            <NavSectionBlock key={section.id} section={section} pathname={pathname} />
          ))}
        </nav>

        {/* Footer */}
        <div className="px-3 py-3 border-t border-sidebar-border text-[10px] text-muted-foreground/50 font-mono">
          v0.1.0 · прототип
        </div>
      </aside>

      {/* Main */}
      <div className="flex flex-col flex-1 overflow-hidden">
        {/* Topbar */}
        <header className="flex items-center justify-between px-5 py-3 border-b border-border bg-card/80 flex-shrink-0">
          <div className="flex items-center gap-3">
            <h1 className="text-sm font-semibold text-foreground">
              Мониторинг требований надзора за недропользованием
            </h1>
            <span className="hidden sm:flex items-center gap-1 text-[10px] text-muted-foreground font-mono bg-muted px-2 py-0.5 rounded border border-border">
              <span className="size-1.5 rounded-full bg-status-ok animate-pulse inline-block" />
              в реальном времени
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button className="flex items-center gap-1.5 text-[11px] text-muted-foreground hover:text-foreground transition-colors px-2.5 py-1.5 rounded hover:bg-muted">
              <RefreshCw className="size-3.5" />
              <span className="hidden sm:inline">Обновить</span>
            </button>
            <button className="relative flex items-center justify-center size-8 rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-colors">
              <Bell className="size-4" />
              <span className="absolute top-1 right-1 size-2 rounded-full bg-destructive border-2 border-background" />
            </button>
            <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded hover:bg-muted cursor-pointer transition-colors">
              <div className="size-6 rounded-full bg-primary/15 text-primary flex items-center justify-center text-[10px] font-bold">
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
