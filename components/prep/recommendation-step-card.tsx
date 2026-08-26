import { CheckIcon } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { PrepStep } from '@/lib/mock-analysis'

export function RecommendationStepCard({
  step,
  isLast,
  style,
}: {
  step: PrepStep
  isLast: boolean
  style?: React.CSSProperties
}) {
  return (
    <div
      className="animate-in fade-in slide-in-from-bottom-2 fill-mode-both relative flex gap-4 duration-500"
      style={style}
    >
      <div className="flex flex-col items-center">
        <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary font-heading text-sm font-bold text-primary-foreground">
          {step.order}
        </span>
        {!isLast && <span aria-hidden className="mt-1 w-px flex-1 bg-border" />}
      </div>

      <div className={cn('flex-1', !isLast && 'pb-8')}>
        <div className="rounded-xl border border-border/70 bg-card p-5 sm:p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <span className="inline-flex items-center rounded-md bg-primary/10 px-2 py-0.5 text-xs font-bold text-primary">
              {step.order}단계
            </span>
            <span className="text-xs font-medium text-muted-foreground">
              {step.order === 1 ? '최우선 준비 항목' : step.order === 2 ? '핵심 역량 강화' : '실전 완성'}
            </span>
          </div>
          <h3 className="font-heading text-lg font-bold text-foreground">
            {step.title}
          </h3>

          <div className="mt-4 flex flex-col gap-1">
            <span className="text-xs font-semibold text-muted-foreground">
              왜 먼저 해야 하나요?
            </span>
            <p className="text-sm leading-relaxed text-foreground/90">
              {step.why}
            </p>
          </div>

          <div className="mt-4 flex flex-col gap-2">
            <span className="text-xs font-semibold text-muted-foreground">
              어떻게 준비하나요?
            </span>
            <ul className="flex flex-col gap-1.5">
              {step.how.map((item) => (
                <li
                  key={item}
                  className="flex items-start gap-2 text-sm leading-relaxed text-foreground/90"
                >
                  <CheckIcon
                    className="mt-0.5 size-3.5 shrink-0 text-primary"
                    strokeWidth={2.5}
                  />
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <div className="mt-4 rounded-lg bg-muted/70 px-3.5 py-3">
            <span className="text-xs font-semibold text-muted-foreground">
              다음 행동
            </span>
            <p className="mt-1 text-sm leading-relaxed font-medium text-foreground">
              {step.nextAction}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
