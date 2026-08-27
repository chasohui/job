const STEPS = [
  {
    number: 1,
    title: '정보 입력',
    description: '전공, 희망 직무, 현재 준비 상황 등 기본 정보를 입력합니다.',
    variant: 'outline' as const,
  },
  {
    number: 2,
    title: 'AI 심층 분석',
    description: '방대한 직무 요구사항을 바탕으로 역량과 격차를 분석합니다.',
    variant: 'filled' as const,
  },
  {
    number: 3,
    title: '맞춤형 준비 가이드',
    description: '우선순위 로드맵과 구체적인 준비 방법을 즉시 확인합니다.',
    variant: 'success' as const,
  },
]

export function ProcessSection() {
  return (
    <section id="methodology" className="relative overflow-hidden bg-secondary/40 py-16 sm:py-24">
      <div
        aria-hidden
        className="pointer-events-none absolute top-0 right-0 size-96 -translate-y-1/3 translate-x-1/3 rounded-full bg-primary/10 blur-3xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute bottom-0 left-0 size-96 -translate-x-1/3 translate-y-1/3 rounded-full bg-success/10 blur-3xl"
      />

      <div className="relative mx-auto w-full max-w-[1200px] px-4 sm:px-6 lg:px-12">
        <div className="mx-auto flex max-w-2xl flex-col items-center gap-3 text-center">
          <h2 className="font-heading text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            단 3단계로 시작하는 취업 준비
          </h2>
          <p className="text-base leading-relaxed text-muted-foreground">
            복잡한 준비 과정은 AI에게 맡기고 실행에만 집중하세요.
          </p>
        </div>

        <div className="relative mt-14 flex flex-col gap-10 sm:flex-row sm:gap-8">
          <div
            aria-hidden
            className="absolute top-10 right-[16.66%] left-[16.66%] hidden h-px bg-border sm:block"
          />
          {STEPS.map((step) => (
            <div
              key={step.number}
              className="relative flex flex-1 flex-col items-center gap-4 text-center"
            >
              <span
                className={
                  step.variant === 'filled'
                    ? 'flex size-20 items-center justify-center rounded-full border-4 border-primary bg-primary font-heading text-2xl font-bold text-primary-foreground shadow-md ring-8 ring-primary/10'
                    : step.variant === 'success'
                      ? 'flex size-20 items-center justify-center rounded-full border-4 border-success bg-card font-heading text-2xl font-bold text-success shadow-md'
                      : 'flex size-20 items-center justify-center rounded-full border-4 border-primary bg-card font-heading text-2xl font-bold text-primary shadow-md'
                }
              >
                {step.number}
              </span>
              <h3 className="font-heading text-lg font-bold text-foreground">
                {step.title}
              </h3>
              <p className="max-w-64 text-sm leading-relaxed text-muted-foreground">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
