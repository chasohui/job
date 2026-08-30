import type { AnalysisResult, PrepInput } from '@/lib/mock-analysis'

/**
 * 결과 화면을 복사/인쇄용 일반 텍스트로 변환한다.
 */
export function formatAnalysisAsText(input: PrepInput, analysis: AnalysisResult): string {
  const lines: string[] = []

  lines.push('[Career Map 분석 결과]')
  lines.push(`전공: ${input.major.trim() || '-'} / 희망 직무: ${input.role.trim() || '-'}`)
  lines.push('')

  lines.push('■ 요약')
  lines.push(analysis.summary)
  lines.push('')

  lines.push('■ 핵심 역량')
  analysis.coreSkills.forEach((skill, index) => {
    lines.push(`${index + 1}. ${skill.title} (${skill.readiness}) - ${skill.description}`)
  })
  lines.push('')

  if (analysis.gapSkills.length > 0) {
    lines.push('■ 보완이 필요한 역량')
    for (const gap of analysis.gapSkills) {
      lines.push(`- ${gap.title}: ${gap.description}`)
    }
    lines.push('')
  }

  lines.push('■ 준비 순서')
  for (const step of analysis.steps) {
    lines.push(`${step.order}단계. ${step.title}`)
    lines.push(`  - 왜: ${step.why}`)
    lines.push('  - 어떻게:')
    for (const item of step.how) {
      lines.push(`    · ${item}`)
    }
    lines.push(`  - 다음 행동: ${step.nextAction}`)
    lines.push('')
  }

  lines.push('■ 지금 바로')
  lines.push(analysis.finalAction.message)
  lines.push(analysis.finalAction.detail)

  return lines.join('\n')
}
