import Link from 'next/link'
import { ArrowRightIcon, SparklesIcon } from 'lucide-react'
import { buttonVariants } from '@/components/ui/button'
import { ReadinessBadge } from '@/components/prep/readiness-badge'
import { cn } from '@/lib/utils'

const PREVIEW_SKILLS = [
  { title: '커뮤니케이션 역량', readiness: '준비됨' as const },
  { title: '데이터 분석 툴 활용', readiness: '일부 준비' as const },
  { title: '포트폴리오 프로젝트', readiness: '보완 필요' as const },
]

export function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-secondary/40">
      <div
        aria-hidden
        className="pointer-events-none absolute -top-32 -right-24 size-96 rounded-full bg-primary/20 blur-3xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-32 -left-24 size-96 rounded-full bg-success/15 blur-3xl"
      />

      <div className="relative mx-auto grid w-full max-w-[1200px] items-center gap-12 px-4 py-16 sm:px-6 sm:py-24 lg:grid-cols-2 lg:px-12">
        <div className="flex flex-col gap-6">
          <span className="inline-flex w-fit items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
            <SparklesIcon className="size-3.5" strokeWidth={2.5} />
            AI 기반 커리어 인텔리전스
          </span>

          <h1 className="font-heading text-4xl leading-[1.15] font-extrabold tracking-tight text-balance text-foreground sm:text-5xl">
            <span className="block text-primary">AI가 설계하는</span>
            전략적 취업 준비 로드맵
          </h1>

          <p className="text-pretty text-lg leading-relaxed text-muted-foreground">
            전공과 희망 직무, 현재 준비 상황을 입력하세요.
            <br className="hidden sm:block" />
            지금 당신에게 필요한 핵심 역량과 가장 효율적인 준비 순서를 AI가 정리해드립니다.
          </p>

          <div className="flex flex-col gap-3 pt-2 sm:flex-row sm:items-center">
            <Link
              href="/start"
              className={cn(
                buttonVariants({ size: 'lg' }),
                'h-12 w-fit px-6 text-[15px] font-semibold',
              )}
            >
              무료로 취업 준비 시작하기
              <ArrowRightIcon data-icon="inline-end" />
            </Link>
            <span className="text-xs text-muted-foreground">
              로그인 불필요 · 20초 이내 결과 · 완전 무료
            </span>
          </div>
        </div>

        <div className="relative mx-auto w-full max-w-sm">
          <div className="flex flex-col gap-4 rounded-2xl bg-card p-6 ring-1 ring-foreground/10 shadow-xl">
            <div className="flex items-center justify-between gap-2">
              <span className="rounded-full bg-success/12 px-2.5 py-1 text-xs font-semibold text-success">
                분석 완료
              </span>
              <span className="text-xs text-muted-foreground">
                서비스 기획자 · 경영학과
              </span>
            </div>

            <div className="flex flex-col gap-2.5">
              {PREVIEW_SKILLS.map((skill) => (
                <div
                  key={skill.title}
                  className="flex items-center justify-between gap-2 rounded-lg border border-border/70 px-3 py-2.5"
                >
                  <span className="text-sm font-medium text-foreground">
                    {skill.title}
                  </span>
                  <ReadinessBadge level={skill.readiness} />
                </div>
              ))}
            </div>

            <div className="flex items-center gap-3 rounded-lg bg-muted/70 px-3.5 py-3">
              <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary font-heading text-xs font-bold text-primary-foreground">
                1
              </span>
              <p className="text-sm leading-snug font-medium text-foreground">
                포트폴리오 프로젝트 1건부터 시작해보세요
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
