import { Route, Target, TriangleAlert } from 'lucide-react'

const FEATURES = [
  {
    icon: Target,
    iconClassName: 'bg-primary/10 text-primary',
    title: '직무 역량 분석',
    description:
      '희망 직무별 핵심 합격 역량 5~7개를 AI가 상세히 분석하여 취업에 필요한 필수 역량을 명확히 제시합니다.',
  },
  {
    icon: TriangleAlert,
    iconClassName: 'bg-destructive/10 text-destructive',
    title: '보완 역량 진단',
    description:
      '현재 나의 상태와 직무 요구 사항 사이의 격차를 짚어주어 효과적인 학습 방향을 설정합니다.',
  },
  {
    icon: Route,
    iconClassName: 'bg-success/10 text-success',
    title: '단계별 준비 로드맵',
    description:
      '무엇부터 준비해야 할지 고민하지 마세요. 가장 빠르고 효과적인 우선순위 로드맵을 추천합니다.',
  },
]

export function FeaturesSection() {
  return (
    <section id="features" className="bg-background py-16 sm:py-24">
      <div className="mx-auto w-full max-w-[1200px] px-4 sm:px-6 lg:px-12">
        <div className="mx-auto flex max-w-2xl flex-col items-center gap-3 text-center">
          <h2 className="font-heading text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            왜 Career Map인가요?
          </h2>
          <p className="text-base leading-relaxed text-muted-foreground">
            데이터 기반의 정교한 분석으로 당신의 시간과 노력을 최적화합니다.
          </p>
        </div>

        <div className="mt-12 grid gap-6 sm:grid-cols-3">
          {FEATURES.map((feature) => (
            <div
              key={feature.title}
              className="flex flex-col gap-4 rounded-2xl bg-card p-6 ring-1 ring-foreground/10 transition-transform duration-200 hover:-translate-y-1 hover:shadow-lg sm:p-7"
            >
              <span
                className={`flex size-11 items-center justify-center rounded-xl ${feature.iconClassName}`}
              >
                <feature.icon className="size-5" strokeWidth={2.25} />
              </span>
              <h3 className="font-heading text-lg font-bold text-foreground">
                {feature.title}
              </h3>
              <p className="text-sm leading-relaxed text-muted-foreground">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
