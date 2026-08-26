'use client'

import { CheckIcon, Compass } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Spinner } from '@/components/ui/spinner'
import { getLoadingMessages } from '@/lib/mock-analysis'

export function LoadingStep({ activePhase }: { activePhase: number }) {
  const messages = getLoadingMessages()

  return (
    <div className="mx-auto flex w-full max-w-md flex-col items-center gap-10 px-4 pt-20 pb-20 text-center sm:px-6">
      <div className="relative flex size-24 items-center justify-center">
        <span className="absolute inset-0 animate-ping rounded-full bg-primary/15" />
        <span className="absolute inset-3 rounded-full bg-primary/10" />
        <span className="relative flex size-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-sm">
          <Compass className="size-7 animate-[spin_5s_linear_infinite]" strokeWidth={2} />
        </span>
      </div>

      <div className="flex flex-col gap-1.5">
        <h2 className="font-heading text-xl font-bold text-foreground">
          입력하신 내용을 분석하고 있어요
        </h2>
        <p className="text-sm text-muted-foreground">
          잠시만 기다려주시면 준비 순서를 정리해드릴게요.
        </p>
      </div>

      <ol className="flex w-full flex-col gap-3 text-left">
        {messages.map((message, index) => {
          const isDone = index < activePhase
          const isActive = index === activePhase

          return (
            <li
              key={message}
              className={cn(
                'flex items-center gap-3 rounded-xl border px-4 py-3 transition-all duration-300',
                isActive
                  ? 'border-primary/25 bg-primary/6'
                  : 'border-border/70 bg-card',
                !isDone && !isActive && 'opacity-45',
              )}
            >
              <span
                className={cn(
                  'flex size-6 shrink-0 items-center justify-center rounded-full',
                  isDone && 'bg-success/15 text-success',
                  isActive && 'text-primary',
                  !isDone && !isActive && 'bg-muted text-muted-foreground',
                )}
              >
                {isDone ? (
                  <CheckIcon className="size-3.5" strokeWidth={3} />
                ) : isActive ? (
                  <Spinner className="size-4" />
                ) : (
                  <span className="size-1.5 rounded-full bg-current" />
                )}
              </span>
              <span
                className={cn(
                  'text-sm leading-snug',
                  isActive
                    ? 'font-medium text-foreground'
                    : 'text-muted-foreground',
                )}
              >
                {message}
              </span>
            </li>
          )
        })}
      </ol>
    </div>
  )
}
