import type { Metadata } from 'next'
import { LandingHeader } from '@/components/landing/landing-header'
import { HeroSection } from '@/components/landing/hero-section'
import { FeaturesSection } from '@/components/landing/features-section'
import { ProcessSection } from '@/components/landing/process-section'
import { FinalCtaSection } from '@/components/landing/final-cta-section'
import { LandingFooter } from '@/components/landing/landing-footer'

export const metadata: Metadata = {
  title: 'Career Map | AI가 설계하는 전략적 취업 준비 로드맵',
  description:
    '전공, 희망 직무, 현재 준비 상황을 입력하면 AI가 핵심 역량과 준비 순서를 분석해 드립니다. 회원가입 없이 무료로 시작하세요.',
}

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <LandingHeader />
      <main className="flex-1">
        <HeroSection />
        <FeaturesSection />
        <ProcessSection />
        <FinalCtaSection />
      </main>
      <LandingFooter />
    </div>
  )
}
