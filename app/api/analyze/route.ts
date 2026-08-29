import { NextResponse } from 'next/server'
import { isPrepInputValid, validatePrepInput } from '@/lib/validation'
import { analyzeWithGemini, checkRelevance } from '@/lib/gemini'
import { generateMockAnalysis, validateAnalysisResult, type PrepInput } from '@/lib/mock-analysis'
import { getClientKey, isRateLimited } from '@/lib/rate-limit'

export const dynamic = 'force-dynamic'

/**
 * PRD 4.4/5.8: 구조 검증 실패 또는 직무 무관 판정 시 정상 결과로 표시하지 않고 재시도한다.
 * 외부 타임아웃 레이스(18초) 안에서 최대 2회까지 Gemini를 다시 호출한다.
 * 재시도를 모두 소진했는데도 직무와 무관하면(IRRELEVANT_RESULT) mock으로 대체하지 않고
 * 그대로 사용자에게 입력을 구체화해달라는 신호를 준다 — PRD 5.8은 "정상 결과처럼 보이는
 * 무관한 답변"을 막는 게 목적이라, 다른 실패(네트워크/형식 오류)와 달리 mock 폴백 대상이 아니다.
 */
async function analyzeWithRetry(input: PrepInput, attempts = 2) {
  let lastError: unknown
  for (let i = 0; i < attempts; i++) {
    try {
      const result = await analyzeWithGemini(input)
      if (await checkRelevance(input, result)) {
        return result
      }
      lastError = new Error('IRRELEVANT_RESULT')
    } catch (err) {
      lastError = err
    }
  }
  throw lastError
}

export async function POST(request: Request) {
  try {
    if (isRateLimited(getClientKey(request))) {
      return NextResponse.json(
        { success: false, error: 'RATE_LIMITED' },
        { status: 429 }
      )
    }

    const body = await request.json()
    const input: PrepInput = {
      major: String(body?.major || ''),
      role: String(body?.role || ''),
      status: String(body?.status || ''),
    }

    // 1. 입력값 검증 (PRD 4.2)
    const errors = validatePrepInput(input)
    if (Object.keys(errors).length > 0) {
      return NextResponse.json(
        { success: false, error: 'INVALID_INPUT', errors },
        { status: 400 }
      )
    }

    // 2. 18초 타임아웃 방어 (PRD 4.5 20초 이내 보장)
    const timeoutPromise = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error('TIMEOUT')), 18000)
    )

    let analysisResult
    try {
      if (process.env.GEMINI_API_KEY) {
        analysisResult = await Promise.race([analyzeWithRetry(input), timeoutPromise])
      } else {
        // API 키 미설정 시 Mock 폴백
        analysisResult = generateMockAnalysis(input)
      }
    } catch (apiError: any) {
      console.error('[Gemini API Error / Fallback]', apiError?.message || apiError)
      if (apiError?.message === 'TIMEOUT') {
        return NextResponse.json(
          { success: false, error: 'TIMEOUT' },
          { status: 504 }
        )
      }

      if (apiError?.message === 'IRRELEVANT_RESULT') {
        return NextResponse.json(
          { success: false, error: 'IRRELEVANT_RESULT' },
          { status: 422 }
        )
      }

      // API 장애 시 Mock 엔진으로 안전하게 서비스 연속성 보장
      const fallback = generateMockAnalysis(input)
      if (validateAnalysisResult(fallback)) {
        analysisResult = fallback
      } else {
        return NextResponse.json(
          { success: false, error: 'AI_FAIL' },
          { status: 500 }
        )
      }
    }

    // 3. 응답 검증 (PRD 4.4)
    if (!validateAnalysisResult(analysisResult)) {
      return NextResponse.json(
        { success: false, error: 'FORMAT_ERROR' },
        { status: 502 }
      )
    }

    return NextResponse.json({
      success: true,
      data: analysisResult,
    })
  } catch (error: any) {
    console.error('[API Route Handler Error]', error)
    return NextResponse.json(
      { success: false, error: 'INTERNAL_ERROR', message: error?.message },
      { status: 500 }
    )
  }
}
