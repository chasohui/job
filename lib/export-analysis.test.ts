import { describe, expect, it } from 'vitest'
import { formatAnalysisAsText } from './export-analysis'
import type { AnalysisResult, PrepInput } from './mock-analysis'

const input: PrepInput = { major: '경영학과', role: '서비스 기획자', status: '없음' }

const analysis: AnalysisResult = {
  tags: ['경영학과', '서비스 기획자', '단계'],
  summary: '요약 문장입니다.',
  coreSkills: [{ id: '1', title: '역량1', description: '설명1', readiness: '일부 준비' }],
  gapSkills: [{ id: 'g1', title: '부족 역량', description: '이유' }],
  steps: [
    { order: 1, title: '1단계 제목', why: '이유', how: ['방법1', '방법2'], nextAction: '다음 행동' },
  ],
  finalAction: { message: '메시지', detail: '상세' },
}

describe('formatAnalysisAsText', () => {
  it('전공/직무와 핵심 정보를 모두 포함한다', () => {
    const text = formatAnalysisAsText(input, analysis)
    expect(text).toContain('경영학과')
    expect(text).toContain('서비스 기획자')
    expect(text).toContain('요약 문장입니다.')
    expect(text).toContain('역량1')
    expect(text).toContain('부족 역량')
    expect(text).toContain('1단계 제목')
    expect(text).toContain('방법1')
    expect(text).toContain('다음 행동')
    expect(text).toContain('메시지')
  })

  it('보완이 필요한 역량이 없으면 해당 섹션을 생략한다', () => {
    const text = formatAnalysisAsText(input, { ...analysis, gapSkills: [] })
    expect(text).not.toContain('보완이 필요한 역량')
  })
})
