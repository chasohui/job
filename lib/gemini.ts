import { GoogleGenerativeAI, SchemaType, type ResponseSchema } from '@google/generative-ai'
import type { AnalysisResult, PrepInput } from './mock-analysis'
import { validateAnalysisResult } from './mock-analysis'

/**
 * Gemini 호출 1건이 응답 없이 오래 걸리는 경우(속도 저하/레이트리밋 근처에서의
 * 소프트 스로틀링 등)에 대비한 개별 호출 타임아웃. `app/api/analyze/route.ts`의
 * 18초 전체 레이스만 믿으면, generateContent() 호출 1건이 그 18초를 통째로
 * 잡아먹어 재시도/Mock 폴백을 시도할 기회조차 없이 TIMEOUT으로 끝나버린다.
 * 각 호출을 더 짧게 끊어 실패시켜야 재시도나 Mock 폴백이 실제로 동작한다.
 */
function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return Promise.race([
    promise,
    new Promise<never>((_, reject) => setTimeout(() => reject(new Error('GEMINI_CALL_TIMEOUT')), ms)),
  ])
}

const ANALYSIS_SCHEMA: ResponseSchema = {
  type: SchemaType.OBJECT,
  properties: {
    tags: {
      type: SchemaType.ARRAY,
      items: { type: SchemaType.STRING },
      description: '전공, 희망 직무, 분석 단계 요약 태그 3개',
    },
    summary: {
      type: SchemaType.STRING,
      description: '전공 배경과 준비 상황을 고려한 직무 진단 및 로드맵 한 줄 종합 요약',
    },
    coreSkills: {
      type: SchemaType.ARRAY,
      description: '해당 직무에 필요한 핵심 역량 (반드시 5개에서 7개 사이로 생성)',
      items: {
        type: SchemaType.OBJECT,
        properties: {
          id: { type: SchemaType.STRING },
          title: { type: SchemaType.STRING },
          description: { type: SchemaType.STRING },
          readiness: {
            type: SchemaType.STRING,
            format: 'enum',
            enum: ['준비됨', '일부 준비', '보완 필요'],
          },
        },
        required: ['id', 'title', 'description', 'readiness'],
      },
    },
    gapSkills: {
      type: SchemaType.ARRAY,
      description: '사용자가 현재 보완해야 할 부족한 역량 및 판단 사유 (1~3개)',
      items: {
        type: SchemaType.OBJECT,
        properties: {
          id: { type: SchemaType.STRING },
          title: { type: SchemaType.STRING },
          description: { type: SchemaType.STRING, description: '부족하다고 판단한 구체적인 근거/이유' },
        },
        required: ['id', 'title', 'description'],
      },
    },
    steps: {
      type: SchemaType.ARRAY,
      description: '추천 준비 항목 및 단계별 로드맵 (반드시 3개 이상, 1단계부터 순서대로)',
      items: {
        type: SchemaType.OBJECT,
        properties: {
          order: { type: SchemaType.INTEGER, description: '1, 2, 3 등 순서 단계' },
          title: { type: SchemaType.STRING, description: '준비 항목명' },
          why: { type: SchemaType.STRING, description: '이 항목을 지금 추천하는 이유' },
          how: {
            type: SchemaType.ARRAY,
            items: { type: SchemaType.STRING },
            description: '구체적인 준비 방법 2~3가지',
          },
          nextAction: { type: SchemaType.STRING, description: '사용자가 오늘 바로 실행할 수 있는 다음 행동' },
        },
        required: ['order', 'title', 'why', 'how', 'nextAction'],
      },
    },
    finalAction: {
      type: SchemaType.OBJECT,
      properties: {
        message: { type: SchemaType.STRING },
        detail: { type: SchemaType.STRING },
      },
      required: ['message', 'detail'],
    },
  },
  required: ['tags', 'summary', 'coreSkills', 'gapSkills', 'steps', 'finalAction'],
}

export async function analyzeWithGemini(input: PrepInput): Promise<AnalysisResult> {
  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY_MISSING')
  }

  const genAI = new GoogleGenerativeAI(apiKey)
  const model = genAI.getGenerativeModel({
    model: 'gemini-3.6-flash',
    generationConfig: {
      responseMimeType: 'application/json',
      responseSchema: ANALYSIS_SCHEMA,
      temperature: 0.7,
    },
    systemInstruction: `당신은 대한민국 최고 수준의 취업 진로 및 직무 역량 컨설팅 전문가 AI입니다.
사용자가 입력한 [전공], [희망 직무], [현재 준비 상황]을 바탕으로 객관적이고 실질적인 분석을 제공해야 합니다.

[작성 규칙]
1. 핵심 역량(coreSkills): 반드시 5개~7개 사이로 구성하세요. 사용자의 현재 준비 상황에 맞게 준비도(readiness: '준비됨' | '일부 준비' | '보완 필요')를 공정하게 판정하세요.
2. 부족한 역량(gapSkills): 1개~3개로 구성하고, 사용자의 입력된 준비 상황과 직무 요구사항을 비교하여 왜 부족하다고 판단했는지 구체적인 사유를 작성하세요.
3. 추천 준비 항목(steps): 반드시 최소 3개 이상의 단계(1단계 → 2단계 → 3단계...)로 구성하고, 단순 조언이 아닌 구체적인 실행 방법(how)과 오늘 당장 실행할 수 있는 다음 행동(nextAction)을 제시하세요.
4. 사용자가 준비 상황에 '없음'이라고 입력했거나 경험이 거의 없는 경우, 비전공/초보자 관점에서 1단계부터 차근차근 기초를 쌓을 수 있는 로드맵을 작성하세요.
5. 한국어로 친절하면서도 전문성 있고 명확한 어조로 작성하세요.
6. 모든 핵심 역량(coreSkills)과 준비 항목(steps)에는 [희망 직무]에서 실제로 쓰이는 도구/기법/전문 용어를 최소 1개 이상 포함해, 다른 직무와 뚜렷이 구분되도록 작성하세요. "커뮤니케이션 능력을 기르세요", "책임감을 가지세요", "꾸준히 노력하세요"처럼 어떤 직무에도 붙일 수 있는 일반론은 단독 핵심 역량이나 준비 항목으로 절대 제시하지 마세요.
   - 나쁜 예 (모델·인플루언서 직무): "커뮤니케이션 능력 - 사람들과 원활히 소통해야 합니다" → 다른 어떤 직무에도 그대로 붙일 수 있어 탈락.
   - 좋은 예 (같은 직무): "체형 변화 대응력 - 브랜드별 표준 치수 변동에 맞춰 촬영 직전 컨디션과 자세를 즉시 조정하는 능력" → 해당 직무 고유의 실무 맥락이 드러남.
7. [전공]과 [희망 직무]가 서로 이질적인 조합(예: 인문/예체능 전공 × 이공계 직무, 혹은 그 반대)이더라도, 전공의 강점을 막연히 나열하지 말고 그 강점이 [희망 직무] 실무에서 구체적으로 어떻게 쓰이는지 연결해 설명하세요.`,
  })

  const prompt = `[사용자 입력 정보]
- 전공: ${input.major.trim()}
- 희망 직무: ${input.role.trim()}
- 현재 준비 상황: ${input.status.trim()}

위 정보를 바탕으로 핵심 역량(5~7개), 부족한 역량 및 판단 이유, 1단계부터 시작하는 추천 준비 순서(3개 이상)를 정해진 JSON 포맷으로 생성해주세요.`

  // analyzeWithRetry()가 최대 2회 재시도하므로, 호출 1건당 8초로 끊어야
  // 재시도 + Mock 폴백까지 18초 예산 안에서 시도해볼 여지가 남는다.
  const result = await withTimeout(model.generateContent(prompt), 8000)
  const responseText = result.response.text()

  let parsed: unknown
  try {
    parsed = JSON.parse(responseText)
  } catch (err) {
    throw new Error('FORMAT_ERROR')
  }

  if (!validateAnalysisResult(parsed)) {
    throw new Error('VALIDATION_FAILED')
  }

  return parsed
}

const RELEVANCE_SCHEMA: ResponseSchema = {
  type: SchemaType.OBJECT,
  properties: {
    relevant: {
      type: SchemaType.BOOLEAN,
      description: '핵심 역량/준비 항목이 해당 직무에 실질적으로 특화되어 있으면 true',
    },
  },
  required: ['relevant'],
}

/**
 * PRD 5.8 — 생성된 분석이 사용자가 입력한 희망 직무와 실제로 관련 있는지 2차 판정한다.
 * 구조 검증(validateAnalysisResult)은 형식만 보고 내용의 관련성은 보지 않기 때문에,
 * 일반적인 취업 조언만 나열된 "형식은 맞지만 알맹이가 무관한" 응답을 걸러내기 위한 안전장치.
 *
 * 판정 호출 자체가 실패(네트워크/파싱 오류 등)하면 결과를 막지 않고 통과시킨다(fail-open) —
 * 이 검증은 명백히 무관한 결과를 걸러내기 위한 보조 장치일 뿐, 정상적인 결과를 판정 실패로
 * 막아버리는 병목이 되어서는 안 된다.
 *
 * 비용 최적화 (FEATURE_ENHANCEMENT_PLAN.md Phase C):
 * - 이 판정 호출 자체보다 "판정 실패 → analyzeWithGemini() 전체 재호출"이 훨씬 비싸므로,
 *   가장 큰 절감 효과는 analyzeWithGemini()의 systemInstruction에 관련성 기준(규칙 6, 7)을
 *   직접 명시해 1차 생성의 통과율을 높이는 데서 온다 — 재시도 자체를 줄이는 접근.
 * - 이 함수의 응답은 항상 `{"relevant": boolean}` 수준의 매우 짧은 JSON이므로
 *   `maxOutputTokens`를 낮게 고정해 혹시 모를 과다 생성을 방지하고 지연/비용 상한을 둔다.
 * - 더 저렴한 모델(예: -lite 계열)로 분리하는 방안도 검토했으나, 실재 여부가 확인된 모델 ID가
 *   없어 (HARDENING_PROGRESS.md의 모델 검증 사례처럼) 확인 없이 임의로 넣지 않았다. 실제
 *   트래픽에서 비용이 문제가 되면 Gemini `ListModels`로 저비용 모델을 검증한 뒤 교체 검토.
 */
export async function checkRelevance(input: PrepInput, result: AnalysisResult): Promise<boolean> {
  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) return true

  try {
    const genAI = new GoogleGenerativeAI(apiKey)
    const model = genAI.getGenerativeModel({
      model: 'gemini-3.6-flash',
      generationConfig: {
        responseMimeType: 'application/json',
        responseSchema: RELEVANCE_SCHEMA,
        temperature: 0,
        maxOutputTokens: 64,
      },
      systemInstruction: `당신은 커리어 분석 결과가 실제로 특정 직무에 맞춤화되었는지 엄격하게 판정하는 검수자입니다.
"커뮤니케이션 능력을 기르세요", "꾸준히 노력하세요" 같은 어느 직무에나 붙일 수 있는 일반론만 나열되어 있고
해당 직무 고유의 도구/실무 맥락/전문 용어가 보이지 않으면 relevant를 false로 판정하세요.`,
    })

    const prompt = `[희망 직무] ${input.role.trim()}

[생성된 핵심 역량]
${result.coreSkills.map((s) => `- ${s.title}: ${s.description}`).join('\n')}

[생성된 준비 항목]
${result.steps.map((s) => `- ${s.title}: ${s.why}`).join('\n')}

위 내용이 "${input.role.trim()}" 직무에 실질적으로 특화된 내용인지 판정해주세요.`

    const judged = await withTimeout(model.generateContent(prompt), 4000)
    const parsed = JSON.parse(judged.response.text())
    return parsed?.relevant !== false
  } catch {
    return true
  }
}
