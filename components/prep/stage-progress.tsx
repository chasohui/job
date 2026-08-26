import { cn } from '@/lib/utils'
import { CheckIcon } from 'lucide-react'

const STAGES = ['입력', '확인', '분석', '결과']

export function StageProgress({ current }: { current: number }) {
  return (
    <ol className="flex items-center gap-1.5 sm:gap-2" aria-label="진행 단계">
      {STAGES.map((label, index) => {
        const isDone = index < current
        const isActive = index === current

        return (
          <li key={label} className="flex items-center gap-1.5 sm:gap-2">
            <div className="flex items-center gap-1.5">
              <span
                className={cn(
                  'flex size-5 items-center justify-center rounded-full text-[10px] font-bold transition-colors',
                  isDone && 'bg-primary text-primary-foreground',
                  isActive &&
                    'bg-primary/12 text-primary ring-2 ring-primary/30',
                  !isDone && !isActive && 'bg-muted text-muted-foreground',
                )}
                aria-current={isActive ? 'step' : undefined}
              >
                {isDone ? <CheckIcon className="size-3" strokeWidth={3} /> : index + 1}
              </span>
              <span
                className={cn(
                  'hidden text-xs font-medium sm:inline',
                  isActive ? 'text-foreground' : 'text-muted-foreground',
                )}
              >
                {label}
              </span>
            </div>
            {index < STAGES.length - 1 && (
              <span
                aria-hidden
                className={cn(
                  'h-px w-3 sm:w-6',
                  isDone ? 'bg-primary' : 'bg-border',
                )}
              />
            )}
          </li>
        )
      })}
    </ol>
  )
}
