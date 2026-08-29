import { NextResponse } from 'next/server'
import { isPrepInputValid, validatePrepInput } from '@/lib/validation'
import { analyzeWithGemini } from '@/lib/gemini'
import { generateMockAnalysis, validateAnalysisResult, type PrepInput } from '@/lib/mock-analysis'
import { getClientKey, isRateLimited } from '@/lib/rate-limit'

export const dynamic = 'force-dynamic'

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
        analysisResult = await Promise.race([analyzeWithGemini(input), timeoutPromise])
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
