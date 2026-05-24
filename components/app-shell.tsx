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
  Rocket,
  ChevronRight,
  BookKey,
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

interface NavGroup {
  label: string
  icon: LucideIcon
  items: NavItem[]
  defaultOpen?: boolean
}

// ─────────────────────────────────────────────────────────────────
// Pinned top items (always visible, not collapsible)
// ─────────────────────────────────────────────────────────────────
const pinnedItems: NavItem[] = [
  { label: "Главная", href: "/", icon: LayoutDashboard },
  { label: "Запуск объектов", href: "/launch", icon: Rocket, badge: 5 },
]

// ─────────────────────────────────────────────────────────────────
// Collapsible groups
// ─────────────────────────────────────────────────────────────────
const navGroups: NavGroup[] = [
  {
    label: "Недропользование",
    icon: Database,
    defaultOpen: true,
    items: [
      { label: "Мастерфайл", href: "/masterfile", icon: Database, badge: 4 },
      { label: "ТСР / Госплан", href: "/tsr", icon: TrendingUp, badge: 3 },
      { label: "Земельные отводы", href: "/land", icon: LandPlot, badge: 2 },
      { label: "Пространственные", href: "/spatial", icon: Map, badge: 6 },
      { label: "Отчётность", href: "/reporting", icon: ScrollText, badge: 2 },
    ],
  },
  {
    label: "Лицензирование",
    icon: BookKey,
    defaultOpen: true,
    items: [
      { label: "Лицензии и требования", href: "/license", icon: FileText, badge: 2 },
    ],
  },
  {
    label: "Технология",
    icon: Flame,
    defaultOpen: true,
    items: [
      { label: "ОПО", href: "/opo", icon: Flame, badge: 2 },
      { label: "Консервация", href: "/wells", icon: Drill, badge: 2 },
    ],
  },
  {
    label: "Экология",
    icon: Leaf,
    defaultOpen: true,
    items: [
      { label: "КЭР", href: "/ker", icon: Leaf, badge: 4 },
    ],
  },
  {
    label: "Гидрогеология",
    icon: Droplets,
    defaultOpen: true,
    items: [
      { label: "Гидрогеология", href: "/hydro", icon: Droplets, badge: 4 },
    ],
  },
]

function NavGroupItem({ group, pathname }: { group: NavGroup; pathname: string }) {
  const isAnyActive = group.items.some((i) => i.href === pathname)
  const [open, setOpen] = useState(group.defaultOpen ?? isAnyActive)
  const totalBadge = group.items.reduce((s, i) => s + (i.badge ?? 0), 0)
  const GroupIcon = group.icon

  return (
    <div className="mb-0.5">
      {/* Group header */}
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded text-xs font-semibold text-muted-foreground hover:text-foreground hover:bg-sidebar-accent transition-colors"
      >
        <GroupIcon className="size-3.5 flex-shrink-0" />
        <span className="flex-1 text-left uppercase tracking-wide text-[10px]">{group.label}</span>
        {!open && totalBadge > 0 && (
          <span className="text-[10px] font-mono font-semibold px-1.5 py-0.5 rounded bg-destructive/10 text-destructive">
            {totalBadge}
          </span>
        )}
        {open ? (
          <ChevronDown className="size-3 flex-shrink-0 opacity-50" />
        ) : (
          <ChevronRight className="size-3 flex-shrink-0 opacity-50" />
        )}
      </button>

      {/* Group items */}
      {open && (
        <div className="ml-2 pl-2 border-l border-border flex flex-col gap-0.5 mt-0.5">
          {group.items.map((item) => {
            const Icon = item.icon
            const active = pathname === item.href
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
                  <span className="text-[10px] font-mono font-semibold px-1.5 py-0.5 rounded bg-destructive/10 text-destructive">
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
      <aside className="flex flex-col w-60 flex-shrink-0 border-r border-border bg-sidebar">
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
        <nav className="flex flex-col gap-0 p-2 flex-1 overflow-y-auto">
          {/* Pinned items */}
          <div className="flex flex-col gap-0.5 mb-3">
            {pinnedItems.map((item) => {
              const Icon = item.icon
              const active = pathname === item.href
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-2.5 px-2.5 py-2 rounded text-sm font-medium transition-colors",
                    active
                      ? "bg-primary/10 text-primary"
                      : "text-foreground hover:bg-sidebar-accent"
                  )}
                >
                  <Icon className="size-4 flex-shrink-0" />
                  <span className="flex-1 truncate">{item.label}</span>
                  {item.badge !== undefined && item.badge > 0 && (
                    <span className="text-[10px] font-mono font-semibold px-1.5 py-0.5 rounded bg-destructive/10 text-destructive">
                      {item.badge}
                    </span>
                  )}
                </Link>
              )
            })}
          </div>

          {/* Divider */}
          <div className="h-px bg-border mb-3" />

          {/* Grouped nav */}
          {navGroups.map((group) => (
            <NavGroupItem key={group.label} group={group} pathname={pathname} />
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
            <button
              className="flex items-center gap-1.5 text-[11px] text-muted-foreground hover:text-foreground transition-colors px-2.5 py-1.5 rounded hover:bg-muted"
              title="Обновить данные"
            >
              <RefreshCw className="size-3.5" />
              <span className="hidden sm:inline">Обновить</span>
            </button>
            <button
              className="relative flex items-center justify-center size-8 rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
              title="Уведомления"
            >
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
