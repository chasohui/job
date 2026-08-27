import type { LucideIcon } from 'lucide-react'

export function StepIllustration({
  icon: Icon,
  tintClassName,
}: {
  icon: LucideIcon
  tintClassName: string
}) {
  return (
    <div
      className={`relative flex h-48 w-full items-center justify-center overflow-hidden rounded-3xl border border-border/60 ${tintClassName}`}
    >
      <div
        aria-hidden
        className="absolute -top-8 -right-8 size-28 rounded-full bg-current opacity-10"
      />
      <div
        aria-hidden
        className="absolute -bottom-10 -left-6 size-24 rounded-full bg-current opacity-10"
      />
      <Icon className="relative size-14" strokeWidth={1.5} />
    </div>
  )
}
