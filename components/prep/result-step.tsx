'use client'

import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { ArrowRightIcon, ClipboardCopyIcon, PrinterIcon, RotateCcwIcon, Sparkle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { SectionHeader } from '@/components/prep/section-header'
import { SkillCard } from '@/components/prep/skill-card'
import { RecommendationStepCard } from '@/components/prep/recommendation-step-card'
import type { AnalysisResult, PrepInput } from '@/lib/mock-analysis'
import { formatAnalysisAsText } from '@/lib/export-analysis'
import { getChecklistStorageKey, loadChecklist, setChecklistItem } from '@/lib/checklist-storage'

interface ResultStepProps {
  input: PrepInput
  analysis: AnalysisResult
  onRestart: () => void
}

export function ResultStep({ input, analysis, onRestart }: ResultStepProps) {
  const [checklist, setChecklist] = useState<Record<number, boolean>>({})
  const checklistKey = getChecklistStorageKey(input)

  useEffect(() => {
    setChecklist(loadChecklist(checklistKey))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [checklistKey])

  function handleToggleStep(order: number) {
    setChecklist((prev) => {
      const nextChecked = !prev[order]
      setChecklistItem(checklistKey, order, nextChecked)
      return { ...prev, [order]: nextChecked }
    })
  }

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(formatAnalysisAsText(input, analysis))
      toast.success('결과를 복사했어요. 원하는 곳에 붙여넣어보세요.')
    } catch {
      toast.error('복사에 실패했습니다. 다시 시도해주세요.')
    }
  }

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-14 px-4 pt-10 pb-24 sm:px-6 sm:pt-14">
      {/* 1. 분석 요약 */}
      <section className="animate-in fade-in slide-in-from-bottom-3 flex flex-col gap-4 duration-500">
        <div className="flex flex-wrap gap-1.5">
          {analysis.tags.map((tag) => (
            <Badge key={tag} variant="secondary">
              {tag}
            </Badge>
          ))}
        </div>
        <h1 className="font-heading text-2xl leading-[1.3] font-bold tracking-tight text-balance text-foreground sm:text-3xl">
          {input.role.trim() || '희망 직무'}를 준비하는
          <br />
          {input.major.trim() || '전공'} 전공자를 분석했어요.
        </h1>
        <div className="flex items-start gap-2.5 rounded-xl bg-primary/6 p-4 ring-1 ring-primary/15">
          <Sparkle className="mt-0.5 size-4 shrink-0 text-primary" strokeWidth={2.25} />
          <p className="text-[15px] leading-relaxed font-medium text-foreground">
            {analysis.summary}
          </p>
        </div>
      </section>

      {/* 2. 핵심 역량 및 준비 수준 / 보완 필요 역량 */}
      <section className="flex flex-col gap-6">
        <SectionHeader
          title="직무 핵심 역량 및 내 준비 수준"
          description="희망 직무에 필요한 핵심 역량과 현재 내 준비도를 함께 진단했어요."
        />
        <div className="grid gap-3 sm:grid-cols-2">
          {analysis.coreSkills.map((skill, index) => (
            <SkillCard key={skill.id} skill={skill} index={index} />
          ))}
        </div>

        {/* 보완이 필요한 역량 */}
        {analysis.gapSkills && analysis.gapSkills.length > 0 && (
          <div className="flex flex-col gap-3.5 rounded-xl border border-destructive/20 bg-destructive/5 p-5 sm:p-6">
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-destructive">
                보완이 필요한 역량
              </span>
              <span className="text-xs text-muted-foreground">
                (현재 준비 상황을 바탕으로 분석한 보완 필요 항목)
              </span>
            </div>
            <ul className="flex flex-col gap-3">
              {analysis.gapSkills.map((gap) => (
                <li key={gap.id} className="flex flex-col gap-0.5 rounded-lg bg-background/60 p-3 ring-1 ring-destructive/10">
                  <span className="text-sm font-semibold text-foreground">
                    {gap.title}
                  </span>
                  <span className="text-sm leading-relaxed text-muted-foreground">
                    {gap.description}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </section>

      {/* 4. 추천 준비 순서 */}
      <section className="flex flex-col gap-5">
        <SectionHeader
          title="이 순서대로 준비해보세요"
          description="번호 순서대로 따라가면 지금 필요한 준비를 놓치지 않아요."
        />
        <div className="flex flex-col">
          {analysis.steps.map((step, index) => (
            <RecommendationStepCard
              key={step.order}
              step={step}
              isLast={index === analysis.steps.length - 1}
              checked={!!checklist[step.order]}
              onToggleChecked={() => handleToggleStep(step.order)}
              style={{ animationDelay: `${index * 120}ms` }}
            />
          ))}
        </div>
      </section>

      {/* 5. 다음 행동 강조 */}
      <section className="animate-in fade-in slide-in-from-bottom-2 flex flex-col gap-4 rounded-2xl bg-highlight p-6 duration-500 sm:p-8">
        <span className="text-sm font-semibold text-highlight-foreground/70">
          {analysis.finalAction.message}
        </span>
        <p className="font-heading text-lg leading-snug font-bold text-balance text-highlight-foreground sm:text-xl">
          {analysis.finalAction.detail}
        </p>
        <Button
          size="lg"
          onClick={() =>
            toast.success('좋아요! 이 단계부터 준비를 시작해보세요.')
          }
          className="print:hidden h-12 w-fit bg-highlight-foreground text-highlight hover:bg-highlight-foreground/85 sm:px-6"
        >
          준비 시작하기
          <ArrowRightIcon data-icon="inline-end" />
        </Button>
      </section>

      {/* 6. 결과 내보내기 및 다시 분석하기 */}
      <div className="print:hidden flex flex-wrap items-center justify-center gap-2">
        <Button variant="outline" onClick={handleCopy}>
          <ClipboardCopyIcon data-icon="inline-start" />
          결과 복사하기
        </Button>
        <Button variant="outline" onClick={() => window.print()}>
          <PrinterIcon data-icon="inline-start" />
          인쇄하기
        </Button>
        <Button
          variant="ghost"
          onClick={onRestart}
          className="text-muted-foreground hover:text-foreground"
        >
          <RotateCcwIcon data-icon="inline-start" />
          다시 분석하기
        </Button>
      </div>
    </div>
  )
}
