import { describe, expect, it } from 'vitest'
import {
  DEFAULT_INPUT,
  EXAMPLE_INPUT,
  generateMockAnalysis,
  getLoadingMessages,
  validateAnalysisResult,
  type AnalysisResult,
  type CoreSkill,
  type PrepStep,
} from './mock-analysis'

function makeCoreSkill(id: string): CoreSkill {
  return { id, title: `역량 ${id}`, description: '설명', readiness: '일부 준비' }
}

function makeStep(order: number): PrepStep {
  return {
    order,
    title: `${order}단계`,
    why: '이유',
    how: ['방법 1'],
    nextAction: '오늘 할 일',
  }
}

function makeValidResult(overrides: Partial<AnalysisResult> = {}): AnalysisResult {
  return {
    tags: ['전공', '직무', '단계'],
    summary: '요약',
    coreSkills: [1, 2, 3, 4, 5].map((n) => makeCoreSkill(String(n))),
    gapSkills: [{ id: 'g1', title: '부족 역량', description: '이유' }],
    steps: [1, 2, 3].map(makeStep),
    finalAction: { message: '메시지', detail: '상세' },
    ...overrides,
  }
}

describe('validateAnalysisResult (PRD 4.4)', () => {
  it('정상 결과는 통과한다', () => {
    expect(validateAnalysisResult(makeValidResult())).toBe(true)
  })

  it('핵심 역량이 5개 미만이면 실패한다', () => {
    const result = makeValidResult({ coreSkills: [1, 2, 3, 4].map((n) => makeCoreSkill(String(n))) })
    expect(validateAnalysisResult(result)).toBe(false)
  })

  it('핵심 역량이 7개 초과면 실패한다', () => {
    const result = makeValidResult({
      coreSkills: [1, 2, 3, 4, 5, 6, 7, 8].map((n) => makeCoreSkill(String(n))),
    })
    expect(validateAnalysisResult(result)).toBe(false)
  })

  it('핵심 역량 6, 7개 경계값은 통과한다', () => {
    expect(
      validateAnalysisResult(
        makeValidResult({ coreSkills: [1, 2, 3, 4, 5, 6].map((n) => makeCoreSkill(String(n))) })
      )
    ).toBe(true)
    expect(
      validateAnalysisResult(
        makeValidResult({ coreSkills: [1, 2, 3, 4, 5, 6, 7].map((n) => makeCoreSkill(String(n))) })
      )
    ).toBe(true)
  })

  it('부족한 역량이 없으면 실패한다', () => {
    expect(validateAnalysisResult(makeValidResult({ gapSkills: [] }))).toBe(false)
  })

  it('추천 준비 항목이 3개 미만이면 실패한다 (PRD 5.7)', () => {
    expect(validateAnalysisResult(makeValidResult({ steps: [makeStep(1), makeStep(2)] }))).toBe(false)
  })

  it('추천 항목에 준비 방법(how)이 없으면 실패한다', () => {
    const steps = [makeStep(1), makeStep(2), { ...makeStep(3), how: [] }]
    expect(validateAnalysisResult(makeValidResult({ steps }))).toBe(false)
  })

  it('추천 항목에 다음 행동(nextAction)이 없으면 실패한다', () => {
    const steps = [makeStep(1), makeStep(2), { ...makeStep(3), nextAction: '' }]
    expect(validateAnalysisResult(makeValidResult({ steps }))).toBe(false)
  })

  it('null/undefined/배열 등 형식이 아예 다른 값은 실패한다 (PRD 5.6)', () => {
    expect(validateAnalysisResult(null)).toBe(false)
    expect(validateAnalysisResult(undefined)).toBe(false)
    expect(validateAnalysisResult('문자열')).toBe(false)
    expect(validateAnalysisResult({})).toBe(false)
  })
})

describe('generateMockAnalysis', () => {
  it('기본 입력에 대해 PRD 조건을 만족하는 결과를 생성한다', () => {
    expect(validateAnalysisResult(generateMockAnalysis(DEFAULT_INPUT))).toBe(true)
  })

  it('예시 입력에 대해 PRD 조건을 만족하는 결과를 생성한다', () => {
    expect(validateAnalysisResult(generateMockAnalysis(EXAMPLE_INPUT))).toBe(true)
  })

  it('프론트엔드 개발자 등 도메인별 분기에서도 PRD 조건을 만족한다', () => {
    const roles = ['프론트엔드 개발자', '백엔드 개발자', '데이터 분석가', '전혀 다른 처음보는 직무']
    for (const role of roles) {
      const result = generateMockAnalysis({ major: '컴퓨터공학과', role, status: '없음' })
      expect(validateAnalysisResult(result)).toBe(true)
    }
  })
})

describe('getLoadingMessages', () => {
  it('최소 1개 이상의 로딩 문구를 반환한다', () => {
    expect(getLoadingMessages().length).toBeGreaterThan(0)
  })
})
