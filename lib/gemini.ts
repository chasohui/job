import { GoogleGenerativeAI, SchemaType, type ResponseSchema } from '@google/generative-ai'
import type { AnalysisResult, PrepInput } from './mock-analysis'
import { validateAnalysisResult } from './mock-analysis'

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
5. 한국어로 친절하면서도 전문성 있고 명확한 어조로 작성하세요.`,
  })

  const prompt = `[사용자 입력 정보]
- 전공: ${input.major.trim()}
- 희망 직무: ${input.role.trim()}
- 현재 준비 상황: ${input.status.trim()}

위 정보를 바탕으로 핵심 역량(5~7개), 부족한 역량 및 판단 이유, 1단계부터 시작하는 추천 준비 순서(3개 이상)를 정해진 JSON 포맷으로 생성해주세요.`

  const result = await model.generateContent(prompt)
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

    const judged = await model.generateContent(prompt)
    const parsed = JSON.parse(judged.response.text())
    return parsed?.relevant !== false
  } catch {
    return true
  }
}
