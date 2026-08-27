import Link from 'next/link'
import { ArrowRightIcon } from 'lucide-react'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export function FinalCtaSection() {
  return (
    <section className="bg-background py-16 sm:py-24">
      <div className="mx-auto w-full max-w-[1200px] px-4 sm:px-6 lg:px-12">
        <div className="flex flex-col items-center gap-4 rounded-2xl bg-highlight p-8 text-center sm:p-14">
          <h2 className="font-heading text-2xl leading-snug font-bold text-balance text-highlight-foreground sm:text-3xl">
            이제 더 이상 막막해하지 마세요.
          </h2>
          <p className="max-w-xl text-base leading-relaxed text-highlight-foreground/80">
            Career Map과 함께 당신의 페이스대로, 마음 편하게 준비를 시작하세요.
          </p>
          <Link
            href="/start"
            className={cn(
              buttonVariants({ size: 'lg' }),
              'mt-2 h-12 w-fit bg-highlight-foreground px-6 text-[15px] font-semibold text-highlight hover:bg-highlight-foreground/85',
            )}
          >
            나만의 로드맵 만들기
            <ArrowRightIcon data-icon="inline-end" />
          </Link>
        </div>
      </div>
    </section>
  )
}
