import { type ViolationSeverity } from "@/lib/mock-data"
import { cn } from "@/lib/utils"

interface StatusBadgeProps {
  severity: ViolationSeverity
  count?: number
  showLabel?: boolean
  size?: "sm" | "md"
  className?: string
}

const config: Record<
  ViolationSeverity,
  { label: string; dot: string; bg: string; text: string }
> = {
  critical: {
    label: "Критично",
    dot: "bg-[oklch(0.52_0.22_25)]",
    bg: "bg-[oklch(0.52_0.22_25/0.15)]",
    text: "text-[oklch(0.72_0.18_25)]",
  },
  warning: {
    label: "Предупреждение",
    dot: "bg-[oklch(0.72_0.18_70)]",
    bg: "bg-[oklch(0.72_0.18_70/0.15)]",
    text: "text-[oklch(0.82_0.15_70)]",
  },
  ok: {
    label: "Норма",
    dot: "bg-[oklch(0.62_0.18_145)]",
    bg: "bg-[oklch(0.62_0.18_145/0.15)]",
    text: "text-[oklch(0.72_0.15_145)]",
  },
  unknown: {
    label: "Неизвестно",
    dot: "bg-[oklch(0.52_0.008_240)]",
    bg: "bg-[oklch(0.52_0.008_240/0.15)]",
    text: "text-[oklch(0.62_0.008_240)]",
  },
  info: {
    label: "Информация",
    dot: "bg-[oklch(0.65_0.15_210)]",
    bg: "bg-[oklch(0.65_0.15_210/0.15)]",
    text: "text-[oklch(0.75_0.12_210)]",
  },
} as Record<ViolationSeverity, { label: string; dot: string; bg: string; text: string }>

export function StatusBadge({
  severity,
  count,
  showLabel = false,
  size = "md",
  className,
}: StatusBadgeProps) {
  const c = config[severity] ?? config.unknown
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded font-mono font-semibold",
        size === "sm" ? "px-1.5 py-0.5 text-[10px]" : "px-2 py-0.5 text-xs",
        c.bg,
        c.text,
        className
      )}
    >
      <span className={cn("rounded-full flex-shrink-0", size === "sm" ? "size-1.5" : "size-2", c.dot)} />
      {count !== undefined ? count : showLabel ? c.label : null}
    </span>
  )
}

export function StatusDot({ severity }: { severity: ViolationSeverity }) {
  const c = config[severity] ?? config.unknown
  return (
    <span
      className={cn(
        "inline-block size-2 rounded-full flex-shrink-0",
        c.dot,
        severity === "critical" && "animate-pulse"
      )}
    />
  )
}
