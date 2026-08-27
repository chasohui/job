import { Route, SearchCheck, Target } from 'lucide-react'

const FEATURES = [
  {
    icon: Target,
    iconClassName: 'bg-primary/10 text-primary',
    title: '직무 역량 분석',
    description:
      '현재 당신의 전공과 경험을 바탕으로 목표 직무에 필요한 핵심 역량을 정확하게 분석합니다.',
  },
  {
    icon: SearchCheck,
    iconClassName: 'bg-success/10 text-success',
    title: '스킬 갭 진단',
    description:
      '부족한 부분이 무엇인지 부드럽게 짚어드려요. 불필요한 스펙 대신 꼭 필요한 것만 추천합니다.',
  },
  {
    icon: Route,
    iconClassName: 'bg-highlight/15 text-highlight',
    title: '단계별 로드맵',
    description:
      '가장 먼저 해야 할 일부터 차근차근, 심리적 부담을 낮추는 구체적인 실행 계획을 제공합니다.',
  },
]

export function FeaturesSection() {
  return (
    <section id="features" className="bg-background py-16 sm:py-24">
      <div className="mx-auto w-full max-w-[1200px] px-4 sm:px-6 lg:px-16">
        <div className="mx-auto flex max-w-2xl flex-col items-center gap-3 text-center">
          <h2 className="font-heading text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            당신만을 위한 맞춤 분석
          </h2>
          <p className="text-base leading-relaxed text-muted-foreground">
            어려운 취업 준비, 단계별로 차근차근 함께 도와드려요.
          </p>
        </div>

        <div className="mt-12 grid gap-6 sm:grid-cols-3">
          {FEATURES.map((feature) => (
            <div
              key={feature.title}
              className="flex flex-col gap-4 rounded-3xl border border-border/70 bg-card p-7 shadow-sm transition-transform duration-300 hover:-translate-y-2"
            >
              <span
                className={`flex size-14 items-center justify-center rounded-full ${feature.iconClassName}`}
              >
                <feature.icon className="size-6" strokeWidth={2} />
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
