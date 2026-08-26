import { cn } from '@/lib/utils'
import type { ReadinessLevel } from '@/lib/mock-analysis'
import { CheckIcon, CircleDashedIcon, TriangleAlertIcon } from 'lucide-react'

const config: Record<
  ReadinessLevel,
  { icon: typeof CheckIcon; className: string }
> = {
  준비됨: {
    icon: CheckIcon,
    className: 'bg-success/12 text-success border-success/25',
  },
  '일부 준비': {
    icon: CircleDashedIcon,
    className: 'bg-highlight/14 text-highlight-foreground border-highlight/30',
  },
  '보완 필요': {
    icon: TriangleAlertIcon,
    className: 'bg-destructive/10 text-destructive border-destructive/25',
  },
}

export function ReadinessBadge({ level }: { level: ReadinessLevel }) {
  const { icon: Icon, className } = config[level]

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium whitespace-nowrap',
        className,
      )}
    >
      <Icon className="size-3.5" strokeWidth={2.5} />
      {level}
    </span>
  )
}
