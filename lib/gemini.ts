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
