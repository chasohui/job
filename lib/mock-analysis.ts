export interface PrepInput {
  major: string
  role: string
  status: string
}

export type ReadinessLevel = '준비됨' | '일부 준비' | '보완 필요'

export interface CoreSkill {
  id: string
  title: string
  description: string
  readiness: ReadinessLevel
}

export interface GapSkill {
  id: string
  title: string
  description: string
}

export interface PrepStep {
  order: number
  title: string
  why: string
  how: string[]
  nextAction: string
}

export interface AnalysisResult {
  tags: string[]
  summary: string
  coreSkills: CoreSkill[]
  gapSkills: GapSkill[]
  steps: PrepStep[]
  finalAction: {
    message: string
    detail: string
  }
}

export const DEFAULT_INPUT: PrepInput = {
  major: '',
  role: '',
  status: '',
}

export const EXAMPLE_INPUT: PrepInput = {
  major: '경영학과',
  role: '서비스 기획자',
  status:
    '교내 프로젝트 1회 경험이 있고 SQL을 공부하고 있습니다. 서비스 기획 관련 경험은 많지 않습니다.',
}

const LOADING_MESSAGES = [
  '현재 준비 상황을 분석하고 있어요',
  '희망 직무에 필요한 역량을 확인하고 있어요',
  '현재 부족한 역량을 찾고 있어요',
  '가장 효율적인 준비 순서를 정리하고 있어요',
]

export function getLoadingMessages() {
  return LOADING_MESSAGES
}

/**
 * Generates a mock analysis result personalized with the user's raw input.
 * This never calls a real AI/API — it's static demo content for the frontend.
 */
export function generateMockAnalysis(input: PrepInput): AnalysisResult {
  const role = input.role.trim() || EXAMPLE_INPUT.role
  const major = input.major.trim() || EXAMPLE_INPUT.major

  return {
    tags: [major, role, '취업 준비 초기'],
    summary: `현재는 직무 이해와 실전 프로젝트 경험을 우선적으로 보완하는 것을 추천해요.`,
    coreSkills: [
      {
        id: 'problem-definition',
        title: '문제 정의',
        description:
          '사용자와 비즈니스의 문제를 발견하고 해결해야 할 문제를 명확하게 정의하는 능력',
        readiness: '일부 준비',
      },
      {
        id: 'user-understanding',
        title: '사용자 이해',
        description:
          '사용자의 행동과 니즈를 관찰하고 서비스 개선 방향을 이끌어내는 능력',
        readiness: '일부 준비',
      },
      {
        id: 'data-thinking',
        title: '데이터 기반 사고',
        description:
          '데이터를 활용해 문제를 분석하고 의사결정에 필요한 인사이트를 도출하는 능력',
        readiness: '보완 필요',
      },
      {
        id: 'service-design',
        title: '서비스 구조 설계',
        description:
          '전체 서비스 흐름을 이해하고 기능과 화면을 논리적으로 설계하는 능력',
        readiness: '보완 필요',
      },
      {
        id: 'communication',
        title: '커뮤니케이션',
        description:
          '기획 의도와 결과를 다양한 이해관계자에게 명확하게 전달하는 능력',
        readiness: '준비됨',
      },
      {
        id: 'project-management',
        title: '프로젝트 관리',
        description:
          '일정과 우선순위를 관리하며 여러 협업자와 함께 결과물을 완성하는 능력',
        readiness: '일부 준비',
      },
    ],
    gapSkills: [
      {
        id: 'real-project',
        title: '실전 서비스 기획 경험',
        description: '아이디어를 실제 기획 문서와 결과물로 완성해 본 경험이 부족해요.',
      },
      {
        id: 'data-analysis',
        title: '데이터 분석',
        description: '데이터를 근거로 의사결정을 뒷받침하는 연습이 더 필요해요.',
      },
      {
        id: 'portfolio',
        title: '포트폴리오 구성',
        description: '준비한 경험을 지원 과정에서 보여줄 형태로 정리하지 못했어요.',
      },
    ],
    steps: [
      {
        order: 1,
        title: '직무 기본기 정리',
        why: '직무의 역할과 필요한 역량을 먼저 이해해야 이후 프로젝트와 포트폴리오를 효과적으로 준비할 수 있어요.',
        how: [
          `${role} 기본 프로세스 정리`,
          '좋은 서비스 사례 3개 분석',
          '사용자 문제 정의 연습',
        ],
        nextAction: '서비스 사례 3개를 선정해 문제와 해결 방법을 정리해보세요.',
      },
      {
        order: 2,
        title: '실전 프로젝트 경험 만들기',
        why: '기본적인 직무 이해를 실제 결과물로 연결하기 위해 필요해요.',
        how: ['관심 서비스 하나 선정', '문제 정의', '개선안 작성', '기획 문서 작성'],
        nextAction: '평소 사용하는 서비스 하나를 골라 개선 아이디어를 작성해보세요.',
      },
      {
        order: 3,
        title: '데이터 분석 기초 익히기',
        why: '기획한 내용을 데이터로 검증하고 설득력 있게 전달하기 위해 필요해요.',
        how: ['SQL 기초 문법 복습', '간단한 지표 정의 연습', '데이터로 가설 검증하기'],
        nextAction: '관심 있는 서비스의 핵심 지표를 한 가지 정의해보세요.',
      },
      {
        order: 4,
        title: '포트폴리오 정리',
        why: '준비한 경험을 실제 지원 과정에서 보여줄 수 있도록 정리해야 해요.',
        how: [
          '프로젝트 목표 정리',
          '문제와 해결 과정 정리',
          '본인의 역할 정리',
          '결과와 배운 점 정리',
        ],
        nextAction: '가장 자신 있는 프로젝트 하나를 골라 본인의 역할부터 정리해보세요.',
      },
    ],
    finalAction: {
      message: '오늘은 여기부터 시작해보세요.',
      detail: '서비스 사례 3개를 골라 문제와 해결 방법을 정리해보세요.',
    },
  }
}

export type ScenarioKey =
  | 'success'
  | 'ai_fail'
  | 'timeout'
  | 'format_error'
  | 'insufficient'
  | 'meaningless'
  | 'network_error'

export const SCENARIOS: { key: ScenarioKey; label: string }[] = [
  { key: 'success', label: '정상 결과' },
  { key: 'ai_fail', label: '분석 실패' },
  { key: 'timeout', label: '응답 지연' },
  { key: 'format_error', label: '응답 형식 오류' },
  { key: 'insufficient', label: '추천 항목 부족' },
  { key: 'meaningless', label: '의미 없는 결과' },
  { key: 'network_error', label: '네트워크 오류' },
]
