import { beforeEach, describe, expect, it, vi } from 'vitest'

const { generateContentMock } = vi.hoisted(() => ({ generateContentMock: vi.fn() }))

vi.mock('@google/generative-ai', () => ({
  // 클래스로 정의해야 `new GoogleGenerativeAI(...)` 호출이 실제로 인스턴스를 생성한다.
  GoogleGenerativeAI: class {
    getGenerativeModel() {
      return { generateContent: generateContentMock }
    }
  },
  SchemaType: {
    OBJECT: 'OBJECT',
    ARRAY: 'ARRAY',
    STRING: 'STRING',
    BOOLEAN: 'BOOLEAN',
    INTEGER: 'INTEGER',
  },
}))

import { checkRelevance } from './gemini'
import type { AnalysisResult, PrepInput } from './mock-analysis'

const input: PrepInput = { major: '컴퓨터공학과', role: '프론트엔드 개발자', status: '없음' }

const result: AnalysisResult = {
  tags: ['컴퓨터공학과', '프론트엔드 개발자', '1단계'],
  summary: '요약',
  coreSkills: [{ id: '1', title: 'React', description: '설명', readiness: '일부 준비' }],
  gapSkills: [{ id: 'g1', title: '부족 역량', description: '이유' }],
  steps: [{ order: 1, title: '단계', why: '이유', how: ['방법'], nextAction: '다음 행동' }],
  finalAction: { message: '메시지', detail: '상세' },
}

beforeEach(() => {
  generateContentMock.mockReset()
  process.env.GEMINI_API_KEY = 'test-key'
})

describe('checkRelevance (PRD 5.8)', () => {
  it('relevant:true 판정이면 true를 반환한다', async () => {
    generateContentMock.mockResolvedValue({ response: { text: () => JSON.stringify({ relevant: true }) } })
    expect(await checkRelevance(input, result)).toBe(true)
  })

  it('relevant:false 판정이면 false를 반환한다', async () => {
    generateContentMock.mockResolvedValue({ response: { text: () => JSON.stringify({ relevant: false }) } })
    expect(await checkRelevance(input, result)).toBe(false)
  })

  it('판정 호출이 실패해도 결과를 막지 않는다 (fail-open)', async () => {
    generateContentMock.mockRejectedValue(new Error('network error'))
    expect(await checkRelevance(input, result)).toBe(true)
  })

  it('판정 응답이 JSON으로 파싱되지 않아도 결과를 막지 않는다 (fail-open)', async () => {
    generateContentMock.mockResolvedValue({ response: { text: () => 'not-json' } })
    expect(await checkRelevance(input, result)).toBe(true)
  })

  it('GEMINI_API_KEY가 없으면 판정을 건너뛰고 true를 반환한다', async () => {
    delete process.env.GEMINI_API_KEY
    expect(await checkRelevance(input, result)).toBe(true)
    expect(generateContentMock).not.toHaveBeenCalled()
  })
})
