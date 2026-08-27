import { ReadinessBadge } from '@/components/prep/readiness-badge'
import type { CoreSkill } from '@/lib/mock-analysis'

export function SkillCard({
  skill,
  index,
}: {
  skill: CoreSkill
  index: number
}) {
  return (
    <div className="flex flex-col gap-2.5 rounded-xl border border-border/70 bg-card p-4 sm:p-5">
      <div className="flex items-center justify-between gap-2">
        <span className="font-heading text-sm font-bold text-primary tabular-nums">
          {String(index + 1).padStart(2, '0')}
        </span>
        <ReadinessBadge level={skill.readiness} />
      </div>
      <h3 className="text-[15px] font-semibold text-foreground">
        {skill.title}
      </h3>
      <p className="text-sm leading-relaxed text-muted-foreground">
        {skill.description}
      </p>
    </div>
  )
}

