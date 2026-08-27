import { Compass } from 'lucide-react'
import { StageProgress } from '@/components/prep/stage-progress'

export function AppHeader({ stage }: { stage: number }) {
  return (
    <header className="sticky top-0 z-40 border-b border-border/70 bg-background/85 backdrop-blur-sm">
      <div className="mx-auto flex h-14 w-full max-w-3xl items-center justify-between px-4 sm:px-6">
        <div className="flex items-center gap-2">
          <span className="flex size-7 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Compass className="size-4" strokeWidth={2.25} />
          </span>
          <span className="font-heading text-[15px] font-bold tracking-tight text-foreground">
            Career Map
          </span>
        </div>
        <StageProgress current={stage} />
      </div>
    </header>
  )
}
