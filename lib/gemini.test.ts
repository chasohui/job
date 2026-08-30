import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const { generateContentMock, getGenerativeModelMock } = vi.hoisted(() => ({
  generateContentMock: vi.fn(),
  getGenerativeModelMock: vi.fn(),
}))

vi.mock('@google/generative-ai', () => ({
  // 클래스로 정의해야 `new GoogleGenerativeAI(...)` 호출이 실제로 인스턴스를 생성한다.
  GoogleGenerativeAI: class {
    getGenerativeModel(config: unknown) {
      getGenerativeModelMock(config)
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

import { analyzeWithGemini, checkRelevance } from './gemini'
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
  getGenerativeModelMock.mockReset()
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

  it('비용 최적화: 출력 토큰 상한(maxOutputTokens)을 두어 과다 생성을 방지한다', async () => {
    generateContentMock.mockResolvedValue({ response: { text: () => JSON.stringify({ relevant: true }) } })
    await checkRelevance(input, result)

    expect(getGenerativeModelMock).toHaveBeenCalledTimes(1)
    const config = getGenerativeModelMock.mock.calls[0][0] as { generationConfig: { maxOutputTokens?: number } }
    expect(config.generationConfig.maxOutputTokens).toBeGreaterThan(0)
    expect(config.generationConfig.maxOutputTokens).toBeLessThanOrEqual(100)
  })
})

describe('analyzeWithGemini 프롬프트 강화 (PRD 5.8 사전 예방 / few-shot 보강)', () => {
  const validAnalysis: AnalysisResult = {
    tags: ['컴퓨터공학과', '프론트엔드 개발자', '1단계'],
    summary: '요약',
    coreSkills: Array.from({ length: 5 }, (_, i) => ({
      id: String(i),
      title: `역량${i}`,
      description: '설명',
      readiness: '일부 준비' as const,
    })),
    gapSkills: [{ id: 'g1', title: '부족 역량', description: '이유' }],
    steps: [1, 2, 3].map((order) => ({
      order,
      title: `${order}단계`,
      why: '이유',
      how: ['방법'],
      nextAction: '다음 행동',
    })),
    finalAction: { message: '메시지', detail: '상세' },
  }

  it('일반론 금지 규칙과 좋은 예/나쁜 예 대조(few-shot)를 systemInstruction에 포함한다', async () => {
    generateContentMock.mockResolvedValue({ response: { text: () => JSON.stringify(validAnalysis) } })
    await analyzeWithGemini(input)

    expect(getGenerativeModelMock).toHaveBeenCalledTimes(1)
    const config = getGenerativeModelMock.mock.calls[0][0] as { systemInstruction: string }
    expect(config.systemInstruction).toContain('나쁜 예')
    expect(config.systemInstruction).toContain('좋은 예')
    expect(config.systemInstruction).toContain('일반론')
  })
})

describe('개별 Gemini 호출 타임아웃 (실서비스 장애 회귀 방지)', () => {
  // 실서비스에서 Gemini generateContent() 호출 1건이 응답 없이 20초 이상 걸려
  // /api/analyze의 18초 전체 예산을 통째로 잡아먹고, 재시도·Mock 폴백을 시도할
  // 기회조차 없이 매번 TIMEOUT으로만 끝나던 장애가 있었다 (레이트리밋 근처의
  // 소프트 스로틀링 등으로 발생). 호출 1건을 짧게 끊어 실패시켜야 재시도/Mock
  // 폴백이 실제로 동작한다 — 이 타임아웃 동작 자체를 잠그는 회귀 테스트.
  afterEach(() => {
    vi.useRealTimers()
  })

  it('analyzeWithGemini는 응답 없는 호출을 무한정 기다리지 않고 실패한다', async () => {
    vi.useFakeTimers()
    generateContentMock.mockImplementation(() => new Promise(() => {}))

    const pending = analyzeWithGemini(input)
    const assertion = expect(pending).rejects.toThrow('GEMINI_CALL_TIMEOUT')

    await vi.advanceTimersByTimeAsync(8000)
    await assertion
  })

  it('checkRelevance는 응답 없는 호출도 제한 시간 내에 fail-open으로 처리한다', async () => {
    vi.useFakeTimers()
    generateContentMock.mockImplementation(() => new Promise(() => {}))

    const pending = checkRelevance(input, result)

    await vi.advanceTimersByTimeAsync(4000)
    expect(await pending).toBe(true)
  })
})
