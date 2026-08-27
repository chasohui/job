import { Compass, MapPinned, UserRoundPlus } from 'lucide-react'
import { StepIllustration } from '@/components/landing/step-illustration'

const STEPS = [
  {
    label: 'Step 01',
    title: '프로필 입력',
    description: '전공, 관심사, 그리고 지금까지의 작은 경험들까지 편안하게 들려주세요.',
    icon: UserRoundPlus,
    labelClassName: 'bg-success/15 text-success',
    illustrationClassName: 'bg-success/10 text-success',
    markerClassName: 'border-success bg-card text-success',
  },
  {
    label: 'Step 02',
    title: 'AI 분석 및 진단',
    description: '입력된 정보를 바탕으로 AI가 당신만의 강점을 찾고 보완할 점을 따뜻하게 짚어드려요.',
    icon: Compass,
    labelClassName: 'bg-primary/15 text-primary',
    illustrationClassName: 'bg-primary/10 text-primary',
    markerClassName: 'border-primary bg-primary text-primary-foreground',
  },
  {
    label: 'Step 03',
    title: '나만의 로드맵 완성',
    description: '오늘 당장 시작할 수 있는 작은 목표부터, 차근차근 나아갈 수 있는 길을 제시합니다.',
    icon: MapPinned,
    labelClassName: 'bg-highlight/20 text-highlight',
    illustrationClassName: 'bg-highlight/10 text-highlight',
    markerClassName: 'border-highlight bg-card text-highlight',
  },
]

export function ProcessSection() {
  return (
    <section id="methodology" className="bg-secondary/40 py-16 sm:py-24">
      <div className="mx-auto w-full max-w-[1000px] px-4 sm:px-6 lg:px-16">
        <div className="mx-auto flex max-w-2xl flex-col items-center gap-3 text-center">
          <h2 className="font-heading text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            세 걸음이면 시작할 수 있어요
          </h2>
          <p className="text-base leading-relaxed text-muted-foreground">
            복잡한 준비 과정은 AI에게 맡기고, 당신은 한 걸음씩만 나아가면 돼요.
          </p>
        </div>

        <div className="relative mt-16 flex flex-col gap-16">
          <div
            aria-hidden
            className="absolute top-0 bottom-0 left-1/2 hidden w-px -translate-x-1/2 bg-border sm:block"
          />

          {STEPS.map((step, index) => (
            <div
              key={step.label}
              className={`relative flex flex-col items-center gap-6 sm:flex-row sm:gap-12 ${
                index % 2 === 1 ? 'sm:flex-row-reverse' : ''
              }`}
            >
              <div
                className={`flex-1 text-center ${index % 2 === 1 ? 'sm:text-left' : 'sm:text-right'}`}
              >
                <span
                  className={`inline-block rounded-full px-4 py-1 text-xs font-semibold ${step.labelClassName}`}
                >
                  {step.label}
                </span>
                <h3 className="mt-4 font-heading text-xl font-bold text-foreground">
                  {step.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {step.description}
                </p>
              </div>

              <span
                className={`z-10 flex size-16 shrink-0 items-center justify-center rounded-full border-4 shadow-md ${step.markerClassName}`}
              >
                <step.icon className="size-6" strokeWidth={2} />
              </span>

              <div className="hidden flex-1 sm:block">
                <StepIllustration icon={step.icon} tintClassName={step.illustrationClassName} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
