import Link from 'next/link'
import { ArrowRightIcon, SparklesIcon } from 'lucide-react'
import { buttonVariants } from '@/components/ui/button'
import { HeroIllustration } from '@/components/landing/hero-illustration'
import { cn } from '@/lib/utils'

export function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-secondary/40">
      <div
        aria-hidden
        className="pointer-events-none absolute -top-32 -right-24 size-96 rounded-full bg-highlight/15 blur-3xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-32 -left-24 size-96 rounded-full bg-success/15 blur-3xl"
      />

      <div className="relative mx-auto grid w-full max-w-[1200px] items-center gap-12 px-4 py-16 sm:px-6 sm:py-24 lg:grid-cols-2 lg:px-16">
        <div className="flex flex-col gap-6 text-center lg:text-left">
          <span className="mx-auto inline-flex w-fit items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary lg:mx-0">
            <SparklesIcon className="size-3.5" strokeWidth={2.5} />
            AI가 함께 그리는 커리어 지도
          </span>

          <h1 className="font-heading text-4xl leading-[1.15] font-bold tracking-tight text-balance text-foreground sm:text-5xl">
            AI가 설계하는
            <br />
            <span className="text-primary">따뜻한 취업 준비 로드맵</span>
          </h1>

          <p className="mx-auto max-w-md text-pretty text-lg leading-relaxed text-muted-foreground lg:mx-0">
            전공과 희망 직무를 입력하면, 지금 당신에게 필요한 역량과
            <br className="hidden sm:block" />
            가장 마음 편한 준비 순서를 AI가 차근차근 안내해드려요.
          </p>

          <div className="flex flex-col items-center gap-3 pt-2 sm:flex-row sm:justify-center lg:justify-start">
            <Link
              href="/start"
              className={cn(
                buttonVariants({ size: 'lg' }),
                'h-12 w-fit px-6 text-[15px] font-semibold',
              )}
            >
              무료로 시작하기
              <ArrowRightIcon data-icon="inline-end" />
            </Link>
            <span className="text-xs text-muted-foreground">
              로그인 없이 · 20초면 충분해요
            </span>
          </div>
        </div>

        <div className="mx-auto w-full max-w-sm animate-gentle-float">
          <HeroIllustration />
        </div>
      </div>
    </section>
  )
}
