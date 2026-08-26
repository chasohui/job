'use client'

import type { LucideIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface ErrorStateProps {
  icon: LucideIcon
  title: string
  description: string
  actionLabel: string
  onAction: () => void
}

export function ErrorState({
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction,
}: ErrorStateProps) {
  return (
    <div className="mx-auto flex w-full max-w-md flex-col items-center gap-6 px-4 pt-24 pb-20 text-center sm:px-6">
      <span className="animate-in fade-in zoom-in-95 flex size-16 items-center justify-center rounded-2xl bg-destructive/10 text-destructive duration-500">
        <Icon className="size-8" strokeWidth={1.75} />
      </span>
      <div className="animate-in fade-in slide-in-from-bottom-2 flex flex-col gap-2 duration-500">
        <h2 className="font-heading text-xl font-bold text-foreground">
          {title}
        </h2>
        <p className="text-sm leading-relaxed text-pretty text-muted-foreground">
          {description}
        </p>
      </div>
      <Button
        size="lg"
        onClick={onAction}
        className="h-11 min-w-40 text-[15px] font-semibold"
      >
        {actionLabel}
      </Button>
    </div>
  )
}
