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
    '교내 프로젝트 1회 경험이 있고 SQL을 공부하고 있습니다. 서비스 기획 실무 및 포트폴리오 경험은 부족합니다.',
}

const LOADING_MESSAGES = [
  '현재 준비 상황을 분석하고 있어요.',
  '직무에 필요한 역량과 준비 순서를 정리하고 있어요.',
  '맞춤형 단계별 로드맵을 구성하고 있어요.',
]

export function getLoadingMessages() {
  return LOADING_MESSAGES
}

/**
 * PRD 4.4 결과 검증기
 * AI 응답 데이터가 PRD 필수 조건을 충족하는지 검증합니다.
 */
export function validateAnalysisResult(result: unknown): result is AnalysisResult {
  if (!result || typeof result !== 'object') return false

  const r = result as Partial<AnalysisResult>

  // 1. 핵심 역량 존재 및 5~7개 내외 검증 (PRD 1.2, 4.4)
  if (!Array.isArray(r.coreSkills) || r.coreSkills.length < 5 || r.coreSkills.length > 7) {
    return false
  }

  // 2. 부족한 역량 존재 검증
  if (!Array.isArray(r.gapSkills) || r.gapSkills.length === 0) {
    return false
  }

  // 3. 추천 준비 항목 최소 3개 이상 검증
  if (!Array.isArray(r.steps) || r.steps.length < 3) {
    return false
  }

  // 4. 각 단계별 필수 필드(순서, 추천이유, 준비방법, 다음행동) 검증
  for (const step of r.steps) {
    if (
      typeof step.order !== 'number' ||
      !step.title ||
      !step.why ||
      !Array.isArray(step.how) ||
      step.how.length === 0 ||
      !step.nextAction
    ) {
      return false
    }
  }

  return true
}

/**
 * 직무 도메인별 맞춤 분석 템플릿 생성기
 */
export function generateMockAnalysis(input: PrepInput): AnalysisResult {
  const role = input.role.trim() || '서비스 기획자'
  const major = input.major.trim() || '비전공'
  const lowerRole = role.toLowerCase()

  // 1. 프론트엔드 개발자
  if (lowerRole.includes('프론트') || lowerRole.includes('frontend') || lowerRole.includes('웹개발')) {
    return {
      tags: [major, role, '실무 프로젝트 단계'],
      summary: `${major} 배경을 살려 직관적이고 반응성이 뛰어난 웹 인터페이스를 구현하는 능력을 체계적으로 증명할 수 있습니다.`,
      coreSkills: [
        {
          id: 'fe-js-ts',
          title: 'JavaScript / TypeScript 심화',
          description: '비동기 처리, 이벤트 루프, 엄격한 정적 타입 시스템을 이해하고 활용하는 능력',
          readiness: '일부 준비',
        },
        {
          id: 'fe-react',
          title: 'React / Next.js 생태계',
          description: '컴포넌트 생명주기, 커스텀 훅, SSR/SSG 렌더링 최적화를 다루는 능력',
          readiness: '일부 준비',
        },
        {
          id: 'fe-state',
          title: '클라이언트 상태 관리',
          description: '전역 상태와 서버 캐시 상태를 적절히 분리하여 데이터 흐름을 설계하는 능력',
          readiness: '보완 필요',
        },
        {
          id: 'fe-perf',
          title: '웹 성능 및 접근성 최적화',
          description: 'Core Web Vitals 개선, 번들 크기 최소화 및 웹 표준을 준수하는 능력',
          readiness: '보완 필요',
        },
        {
          id: 'fe-git',
          title: 'Git 협업 및 코드 리뷰',
          description: '브랜치 전략 수립 및 PR 기반의 협업을 원활하게 수행하는 능력',
          readiness: '준비됨',
        },
        {
          id: 'fe-uiux',
          title: 'UI/UX 구현 및 디자인 시스템',
          description: '디자인 가이드를 정확한 반응형 CSS 컴포넌트로 구현하는 능력',
          readiness: '준비됨',
        },
      ],
      gapSkills: [
        {
          id: 'fe-gap-perf',
          title: '실전 웹 성능 최적화 경험',
          description: '단순 구현을 넘어 렌더링 최적화 및 번들링 분석을 직접 적용해본 경험이 부족해요.',
        },
        {
          id: 'fe-gap-deploy',
          title: '배포 파이프라인 및 CI/CD',
          description: '실제 사용자에게 서비스를 배포하고 자동화 파이프라인을 구축해본 경험 보완이 필요해요.',
        },
        {
          id: 'fe-gap-test',
          title: '프론트엔드 테스트 코드 작성',
          description: '단위 테스트 및 통합 테스트 코드를 작성하여 코드 안정성을 검증하는 역량이 필요해요.',
        },
      ],
      steps: [
        {
          order: 1,
          title: 'TypeScript & 현대적 프레임워크 기초 정립',
          why: '실무에서는 정적 타입과 최신 리액트 아키텍처에 대한 확고한 이해가 필수적입니다.',
          how: [
            'TypeScript 핵심 문법 및 유틸리티 타입 마스터',
            'React Server Components & Next.js App Router 구조 파악',
            'Tailwind CSS 기반 일관된 디자인 컴포넌트 구축 연습',
          ],
          nextAction: '자주 쓰는 React 커스텀 훅 3개를 TypeScript로 직접 작성해보세요.',
        },
        {
          order: 2,
          title: '실전 반응형 웹 애플리케이션 제작',
          why: '이론을 넘어 실제 동작하는 완성도 높은 서비스를 만드는 경험이 필요합니다.',
          how: [
            '실제 API와 연동되는 데이터 기반 대시보드 또는 서비스 1개 제작',
            '에러 바운더리 및 네트워크 예외 처리 꼼꼼하게 적용',
            'Lighthouse 기준 성능 점수 90점 이상으로 최적화',
          ],
          nextAction: 'API를 연동하여 검색 및 필터링이 가능한 미니 프로젝트를 시작해보세요.',
        },
        {
          order: 3,
          title: '성능 최적화 및 배포 파이프라인 구축',
          why: '배포 및 운영 관점의 경험이 지원자의 실무 준비도를 크게 차별화합니다.',
          how: [
            'Vercel 또는 GitHub Actions를 활용한 자동 배포 환경 구성',
            '이미지 최적화 및 동적 임포트로 초기 로딩 속도 40% 단축',
            'Jest / React Testing Library로 핵심 UI 단위 테스트 작성',
          ],
          nextAction: '만든 프로젝트에 GitHub Actions 자동 빌드/테스트 워크플로우를 붙여보세요.',
        },
        {
          order: 4,
          title: '기술 블로그 정리 및 문제 해결 중심 포트폴리오',
          why: '개발 과정에서 부딪힌 문제와 의사결정 과정을 문서화해야 면접에서 설득력을 갖습니다.',
          how: [
            '트러블슈팅 일지 3건 이상 기술 블로그에 기록',
            'GitHub README에 아키텍처 다이어그램 및 기능 데모 GIF 추가',
            '이력서에 프로젝트별 기여도 및 수치적 개선 성과 명시',
          ],
          nextAction: '프로젝트에서 가장 어려웠던 버그 해결 과정을 1페이지로 정리해보세요.',
        },
      ],
      finalAction: {
        message: '오늘부터 바로 시작해보세요!',
        detail: 'TypeScript 기본 문법을 정리하고 React 프로젝트에 타입을 적용해보세요.',
      },
    }
  }

  // 2. 백엔드 개발자
  if (lowerRole.includes('백엔드') || lowerRole.includes('backend') || lowerRole.includes('서버')) {
    return {
      tags: [major, role, '백엔드 아키텍처 단계'],
      summary: `${major} 역량을 바탕으로 안정적인 데이터 처리와 신뢰할 수 있는 API 서버 구축 역량을 집중 개발해야 합니다.`,
      coreSkills: [
        {
          id: 'be-api',
          title: 'RESTful API 및 서버 개발',
          description: '명확한 규격의 API를 설계하고 견고한 비즈니스 로직을 구현하는 능력',
          readiness: '일부 준비',
        },
        {
          id: 'be-db',
          title: 'RDB 설계 및 쿼리 최적화',
          description: '정규화, 인덱싱 및 트랜잭션 격리 수준을 고려하여 DB를 설계하는 능력',
          readiness: '보완 필요',
        },
        {
          id: 'be-infra',
          title: '클라우드 인프라 & 도커(Docker)',
          description: '컨테이너 기반 환경에서 서버를 빌드하고 배포/운영하는 능력',
          readiness: '보완 필요',
        },
        {
          id: 'be-security',
          title: '인증/인가 및 웹 보안',
          description: 'JWT, OAuth2, Session 관리 및 주요 웹 보안 취약점을 방어하는 능력',
          readiness: '준비됨',
        },
        {
          id: 'be-async',
          title: '비동기 메시징 및 캐싱',
          description: 'Redis 캐싱 및 메시지 큐를 활용해 서버 부하를 분산하는 능력',
          readiness: '보완 필요',
        },
        {
          id: 'be-testing',
          title: '서버 단위/통합 테스트',
          description: '테스트 코드를 통해 안정적인 리팩토링과 CI를 보장하는 능력',
          readiness: '준비됨',
        },
      ],
      gapSkills: [
        {
          id: 'be-gap-db',
          title: '대용량 트래픽 및 쿼리 최적화 경험',
          description: '복잡한 조인 쿼리 최적화와 인덱스 설계 경험을 더 보완해야 해요.',
        },
        {
          id: 'be-gap-cloud',
          title: '클라우드 배포 및 모니터링',
          description: 'AWS 환경에서의 실제 배포 및 로그 모니터링 파이프라인 경험이 필요해요.',
        },
      ],
      steps: [
        {
          order: 1,
          title: 'RDB 모델링 및 트랜잭션 기본기 완성',
          why: '백엔드 엔지니어링의 핵심은 데이터의 무결성과 효율적인 조회입니다.',
          how: [
            '정규화 1~3단계 적용 및 ERD 다이어그램 작성 연습',
            '인덱스 동작 원리 및 Explain 분석 실습',
            '트랜잭션 ACID 특성과 동시성 제어(Lock) 이해',
          ],
          nextAction: '자주 쓰이는 이커머스 도메인의 ERD를 직접 설계해보세요.',
        },
        {
          order: 2,
          title: '보안과 인증이 포함된 실전 API 서버 구축',
          why: '실제 동작하는 완전한 RESTful API를 만들어보며 CRUD 전 과정을 숙달해야 합니다.',
          how: [
            'JWT 기반 액세스/리프레시 토큰 인증 파이프라인 구현',
            '예외 처리 핸들러 및 표준 API 응답 포맷 구성',
            'Swagger / OpenAPI를 이용한 명세 자동화',
          ],
          nextAction: '인증/인가 기능이 포함된 게시판/주문 API 서버를 작성해보세요.',
        },
        {
          order: 3,
          title: 'Docker 컨테이너화 및 클라우드 배포',
          why: '로컬 환경을 넘어 클라우드 서버에서 안정적으로 서비스가 구동되는 경험이 중요합니다.',
          how: [
            'Dockerfile 멀티스테이지 빌드로 경량 이미지 생성',
            'AWS EC2 / RDS 연동 및 Nginx 리버스 프록시 설정',
            'GitHub Actions를 통한 자동 배포 파이프라인 연결',
          ],
          nextAction: '도커 컴포즈로 서버와 DB를 한 번에 실행하는 환경을 구성해보세요.',
        },
      ],
      finalAction: {
        message: '오늘의 첫 걸음',
        detail: '관심 있는 도메인의 ERD를 설계하고 테이블 정의서를 작성해보세요.',
      },
    }
  }

  // 3. 데이터 분석가
  if (lowerRole.includes('데이터') || lowerRole.includes('data') || lowerRole.includes('분석')) {
    return {
      tags: [major, role, '데이터 역량 고도화'],
      summary: `${major}의 지식을 살려 비즈니스 문제를 데이터로 정의하고 실질적인 해결책을 제안하는 데이터 분석 역량을 강화합니다.`,
      coreSkills: [
        {
          id: 'da-sql',
          title: 'SQL 고급 데이터 추출 및 가공',
          description: '윈도우 함수, 서브쿼리, 복합 조인을 활용해 대량의 정형 데이터를 자유자재로 추출하는 능력',
          readiness: '준비됨',
        },
        {
          id: 'da-python',
          title: 'Python 데이터 분석 & 통계 검정',
          description: 'Pandas, NumPy 및 통계 가설 검정(t-test, ANOVA 등)을 수행하는 능력',
          readiness: '일부 준비',
        },
        {
          id: 'da-bi',
          title: 'BI 대시보드 시각화 (Tableau/Redash)',
          description: '이해관계자가 직관적으로 이해할 수 있는 실시간 지표 대시보드를 구축하는 능력',
          readiness: '보완 필요',
        },
        {
          id: 'da-biz',
          title: '비즈니스 지표(KPI/Funnel) 설계',
          description: '전환율, 리텐션, LTV 등 비즈니스 핵심 지표를 정의하고 병목을 진단하는 능력',
          readiness: '보완 필요',
        },
        {
          id: 'da-ab',
          title: 'A/B 테스트 설계 및 성과 분석',
          description: '실험군/대조군을 설계하고 통계적 유의성을 검증하여 의사결정을 지원하는 능력',
          readiness: '보완 필요',
        },
        {
          id: 'da-story',
          title: '데이터 스토리텔링 & 리포팅',
          description: '분석 결과를 비전문가도 쉽게 이해할 수 있는 인사이트 보고서로 전환하는 능력',
          readiness: '준비됨',
        },
      ],
      gapSkills: [
        {
          id: 'da-gap-biz',
          title: '실제 비즈니스 퍼널 분석 경험',
          description: '가공되지 않은 원시 로그 데이터를 바탕으로 이탈 지점을 발견해본 경험이 부족해요.',
        },
        {
          id: 'da-gap-ab',
          title: '실험 설계(A/B 테스트) 경험',
          description: '통계적 유의도 검증과 가설 설정을 실제 프로젝트에 적용해보는 훈련이 필요해요.',
        },
      ],
      steps: [
        {
          order: 1,
          title: '고급 SQL 및 지표 추출 집중 훈련',
          why: '현업 데이터 분석가의 업무 중 70%는 정확하고 신속한 SQL 쿼리 작성에서 출발합니다.',
          how: [
            'LeetCode / 프로그래머스 SQL 고난도 50제 풀이',
            '코호트 리텐션(Retention) 분석 쿼리 직접 작성',
            '퍼널(Funnel) 전환율 계산 쿼리 템플릿 제작',
          ],
          nextAction: '프로그래머스 SQL 고득점 Kit 문제를 매일 3문제씩 풀어보세요.',
        },
        {
          order: 2,
          title: '오픈 데이터셋을 활용한 비즈니스 문제 해결 프로젝트',
          why: '단순 EDA를 넘어 비즈니스 액션 아이템을 도출하는 포트폴리오가 필요합니다.',
          how: [
            'Kaggle 이커머스 로그 데이터셋 선정',
            '유저 세그먼트별 구매 패턴 분류(RFM 분석)',
            '매출 증대를 위한 구체적 프로모션 제안서 작성',
          ],
          nextAction: 'Kaggle에서 관심 있는 이커머스 데이터셋 하나를 다운로드하여 탐색해보세요.',
        },
        {
          order: 3,
          title: 'Tableau 대시보드 구축 및 인사이트 리포트 완성',
          why: '시각화된 대시보드를 통해 비즈니스 임팩트를 면접관에게 한눈에 전달할 수 있습니다.',
          how: [
            '인터랙티브 Tableau Public 대시보드 발행',
            '가설-분석-결론-액션으로 이어지는 1장짜리 Executive Summary 작성',
            '분석 과정과 SQL 쿼리를 GitHub에 아카이빙',
          ],
          nextAction: '분석한 결과를 Tableau Public에 업로드하고 링크를 정리해보세요.',
        },
      ],
      finalAction: {
        message: '오늘부터 실천할 액션',
        detail: 'SQL 윈도우 함수 문법을 복습하고 리텐션 분석 쿼리를 연습해보세요.',
      },
    }
  }

  // 4. 마케터
  if (lowerRole.includes('마케팅') || lowerRole.includes('marketing') || lowerRole.includes('마케터')) {
    return {
      tags: [major, role, '퍼포먼스 마케팅 단계'],
      summary: `${major} 배경을 살려 데이터 기반으로 캠페인을 기획하고 성과를 검증하는 마케팅 실무 역량을 체계적으로 쌓을 수 있습니다.`,
      coreSkills: [
        {
          id: 'mk-strategy',
          title: '마케팅 전략 및 타겟 설정',
          description: '시장/경쟁사 분석을 바탕으로 타겟 고객과 포지셔닝을 정의하는 능력',
          readiness: '일부 준비',
        },
        {
          id: 'mk-performance',
          title: '퍼포먼스 마케팅 및 매체 운영',
          description: '메타/구글 등 광고 매체를 직접 운영하며 ROAS를 관리하는 능력',
          readiness: '보완 필요',
        },
        {
          id: 'mk-content',
          title: '콘텐츠 기획 및 카피라이팅',
          description: '채널별 톤앤매너에 맞는 콘텐츠와 설득력 있는 카피를 제작하는 능력',
          readiness: '일부 준비',
        },
        {
          id: 'mk-data',
          title: '마케팅 데이터 분석',
          description: 'GA4 등 분석 툴로 퍼널 전환율을 추적하고 개선 포인트를 도출하는 능력',
          readiness: '보완 필요',
        },
        {
          id: 'mk-brand',
          title: '브랜드 커뮤니케이션',
          description: '일관된 브랜드 메시지를 다양한 채널에 맞게 확산하는 능력',
          readiness: '준비됨',
        },
        {
          id: 'mk-collab',
          title: '유관 부서 협업 및 캠페인 관리',
          description: '디자인/영업/제품팀과 협업해 캠페인을 기획부터 실행까지 관리하는 능력',
          readiness: '준비됨',
        },
      ],
      gapSkills: [
        {
          id: 'mk-gap-performance',
          title: '실제 광고 예산 집행 경험',
          description: '소액이라도 직접 광고비를 집행하고 성과를 개선해본 경험이 부족해요.',
        },
        {
          id: 'mk-gap-data',
          title: '퍼널 데이터 분석 툴 활용 경험',
          description: 'GA4/픽셀 등으로 실제 캠페인 성과를 추적해본 경험이 필요해요.',
        },
      ],
      steps: [
        {
          order: 1,
          title: '마케팅 기초 이론 및 채널별 특성 학습',
          why: '채널마다 다른 알고리즘과 사용자 행동 패턴을 이해해야 효율적인 캠페인을 설계할 수 있습니다.',
          how: [
            '퍼포먼스 마케팅 핵심 지표(CPA, ROAS, CTR) 정의 학습',
            '메타/구글 광고 관리자 UI 및 캠페인 구조 익히기',
            '경쟁사 3곳의 광고 소재와 랜딩페이지 벤치마킹',
          ],
          nextAction: '관심 브랜드의 인스타그램 광고 3개를 캡처해 소구 포인트를 분석해보세요.',
        },
        {
          order: 2,
          title: '소액 예산으로 직접 캠페인 운영해보기',
          why: '이론을 넘어 실제 예산을 집행하며 데이터를 해석하는 감각을 길러야 합니다.',
          how: [
            '개인 프로젝트/SNS 계정으로 소액 광고 캠페인 1건 집행',
            'A/B 테스트로 소재 2종 성과 비교',
            'GA4로 유입부터 전환까지 퍼널 추적 설정',
          ],
          nextAction: '5만원 이하 예산으로 SNS 광고 캠페인을 1주일간 운영해보세요.',
        },
        {
          order: 3,
          title: '캠페인 성과 리포트 및 개선 제안서 작성',
          why: '성과를 수치로 증명하고 다음 액션을 제안하는 능력이 실무 역량의 핵심입니다.',
          how: [
            '캠페인 전후 지표 비교 리포트 작성',
            '개선 가설과 다음 캠페인 실행 계획 수립',
            'Notion/PPT로 결과 요약 포트폴리오 제작',
          ],
          nextAction: '운영한 캠페인의 결과를 1페이지 리포트로 정리해보세요.',
        },
      ],
      finalAction: {
        message: '오늘부터 시작해보세요!',
        detail: '관심 브랜드의 광고 소재 3개를 분석하고 개선 아이디어를 메모해보세요.',
      },
    }
  }

  // 5. UI/UX 디자이너
  if (lowerRole.includes('디자인') || lowerRole.includes('design') || lowerRole.includes('디자이너')) {
    return {
      tags: [major, role, 'UI/UX 포트폴리오 단계'],
      summary: `${major} 배경을 살려 사용자 중심의 문제 해결 과정을 보여주는 UI/UX 디자인 역량과 포트폴리오를 완성할 수 있습니다.`,
      coreSkills: [
        {
          id: 'ux-research',
          title: '사용자 리서치 및 문제 정의',
          description: '인터뷰/설문 등으로 사용자 니즈를 발견하고 디자인 문제로 정의하는 능력',
          readiness: '일부 준비',
        },
        {
          id: 'ux-ia',
          title: '정보 구조(IA) 및 플로우 설계',
          description: '복잡한 기능을 사용자가 헤매지 않는 흐름으로 구조화하는 능력',
          readiness: '일부 준비',
        },
        {
          id: 'ux-wireframe',
          title: '와이어프레임 및 프로토타이핑',
          description: 'Figma로 저충실도부터 고충실도 프로토타입까지 제작하는 능력',
          readiness: '준비됨',
        },
        {
          id: 'ux-visual',
          title: '비주얼 디자인 및 디자인 시스템',
          description: '일관된 컴포넌트와 그리드 기반의 비주얼 디자인 시스템을 구축하는 능력',
          readiness: '보완 필요',
        },
        {
          id: 'ux-test',
          title: '사용성 테스트 및 반복 개선',
          description: '프로토타입을 실제 사용자에게 테스트하고 피드백을 반영해 개선하는 능력',
          readiness: '보완 필요',
        },
        {
          id: 'ux-handoff',
          title: '개발 협업 및 디자인 핸드오프',
          description: '개발자가 오해 없이 구현할 수 있도록 스펙과 의도를 전달하는 능력',
          readiness: '준비됨',
        },
      ],
      gapSkills: [
        {
          id: 'ux-gap-test',
          title: '실제 사용자 대상 사용성 테스트 경험',
          description: '가설을 세우고 실제 사용자 반응으로 검증해본 경험이 부족해요.',
        },
        {
          id: 'ux-gap-system',
          title: '디자인 시스템 구축 경험',
          description: '컴포넌트를 재사용 가능한 체계로 만들어본 경험이 필요해요.',
        },
      ],
      steps: [
        {
          order: 1,
          title: 'UX 리서치 방법론 및 Figma 툴 숙련',
          why: '문제를 제대로 정의하지 못하면 아무리 예쁜 디자인도 사용자 문제를 해결하지 못합니다.',
          how: [
            '사용자 인터뷰 질문지 설계 및 진행 방법 학습',
            'Figma Auto Layout, 컴포넌트, 변수 기능 숙달',
            '경쟁 서비스 3개의 온보딩 플로우 비교 분석',
          ],
          nextAction: '주변 지인 3명을 대상으로 15분 사용자 인터뷰를 진행해보세요.',
        },
        {
          order: 2,
          title: '엔드투엔드 프로덕트 디자인 프로젝트 진행',
          why: '리서치부터 하이파이 프로토타입까지 전체 과정을 직접 완주해봐야 합니다.',
          how: [
            '실제 문제 1가지를 선정해 리서치 → 와이어프레임 → 하이파이 순서로 진행',
            '디자인 시스템(컬러/타이포/컴포넌트) 정의',
            '5명 이상 대상 사용성 테스트 진행 및 개선',
          ],
          nextAction: '해결하고 싶은 불편함 1가지를 골라 로우파이 와이어프레임을 그려보세요.',
        },
        {
          order: 3,
          title: '포트폴리오 스토리텔링 및 핸드오프 문서 작성',
          why: '결과물뿐 아니라 의사결정 과정을 설명할 수 있어야 채용 담당자를 설득할 수 있습니다.',
          how: [
            '문제 정의 → 가설 → 디자인 → 검증 → 회고 구조로 케이스 스터디 작성',
            '개발 핸드오프용 스펙 문서(간격, 상태값) 정리',
            'Figma 커뮤니티에 프로토타입 공유 및 피드백 수집',
          ],
          nextAction: '진행한 프로젝트 1건을 케이스 스터디 형식으로 정리해보세요.',
        },
      ],
      finalAction: {
        message: '오늘부터 시작해보세요!',
        detail: '평소 불편했던 앱 화면 1개를 골라 개선 아이디어를 스케치해보세요.',
      },
    }
  }

  // 6. 영업/세일즈
  if (lowerRole.includes('영업') || lowerRole.includes('세일즈') || lowerRole.includes('sales')) {
    return {
      tags: [major, role, '세일즈 역량 강화 단계'],
      summary: `${major} 배경의 논리력과 커뮤니케이션 역량을 살려 고객의 문제를 발견하고 설득하는 영업 역량을 키울 수 있습니다.`,
      coreSkills: [
        {
          id: 'sl-prospect',
          title: '리드 발굴 및 고객 세그멘테이션',
          description: '잠재 고객을 발굴하고 우선순위를 매겨 영업 파이프라인을 관리하는 능력',
          readiness: '일부 준비',
        },
        {
          id: 'sl-needs',
          title: '고객 니즈 파악 및 질문 설계',
          description: '고객의 숨은 문제를 발견하는 질문(SPIN 등)을 설계하는 능력',
          readiness: '일부 준비',
        },
        {
          id: 'sl-pitch',
          title: '제안 및 프레젠테이션',
          description: '고객 상황에 맞춘 설득력 있는 제안서와 발표를 구성하는 능력',
          readiness: '보완 필요',
        },
        {
          id: 'sl-negotiation',
          title: '협상 및 클로징',
          description: '이해관계를 조율하며 계약을 성사시키는 협상 능력',
          readiness: '보완 필요',
        },
        {
          id: 'sl-crm',
          title: 'CRM 및 파이프라인 관리',
          description: 'CRM 툴로 영업 단계를 기록하고 데이터 기반으로 관리하는 능력',
          readiness: '준비됨',
        },
        {
          id: 'sl-relationship',
          title: '고객 관계 유지 및 사후관리',
          description: '계약 이후에도 신뢰를 유지하며 추가 기회를 만드는 능력',
          readiness: '준비됨',
        },
      ],
      gapSkills: [
        {
          id: 'sl-gap-pitch',
          title: '실전 제안/피칭 경험',
          description: '실제 상대를 설득해본 경험이 부족해 논리 구성 훈련이 필요해요.',
        },
        {
          id: 'sl-gap-nego',
          title: '협상 시뮬레이션 경험',
          description: '이견을 조율하고 조건을 협의해본 경험이 부족해요.',
        },
      ],
      steps: [
        {
          order: 1,
          title: '영업 프로세스 및 고객 질문법 학습',
          why: '무작정 제품을 설명하기보다 고객의 문제를 먼저 파악하는 구조를 익혀야 합니다.',
          how: [
            'SPIN/BANT 등 대표 세일즈 질문 프레임워크 학습',
            '희망 산업의 대표 제품/서비스 3개 비교 분석',
            'CRM 툴(예: 스프레드시트 기반) 파이프라인 구조 설계',
          ],
          nextAction: '관심 있는 제품 하나를 골라 고객에게 던질 질문 10개를 작성해보세요.',
        },
        {
          order: 2,
          title: '모의 영업 피칭 및 제안서 작성 연습',
          why: '실전과 유사한 환경에서 설득 논리를 검증하고 다듬어야 합니다.',
          how: [
            '가상의 고객 페르소나 설정 후 제안서(PT) 1건 작성',
            '지인/스터디원 대상 모의 피칭 진행 및 피드백 수집',
            '반박(objection)에 대응하는 답변 스크립트 준비',
          ],
          nextAction: '스터디원 1명에게 5분짜리 모의 제품 피칭을 해보세요.',
        },
        {
          order: 3,
          title: '협상 시뮬레이션 및 성과 스토리 정리',
          why: '조건 조율 경험과 성과를 수치로 설명하는 능력이 신입 영업 평가의 핵심입니다.',
          how: [
            '가격/조건 이견이 있는 협상 롤플레이 2회 이상 진행',
            '아르바이트/대외활동에서의 설득 성공 사례를 수치로 정리',
            '자기소개서용 성과 스토리 3개 구조화(상황-행동-결과)',
          ],
          nextAction: '과거 누군가를 설득해 성과를 낸 경험 1가지를 상황-행동-결과로 정리해보세요.',
        },
      ],
      finalAction: {
        message: '오늘부터 시작해보세요!',
        detail: '관심 있는 제품을 하나 골라 고객에게 던질 질문 리스트를 만들어보세요.',
      },
    }
  }

  // 7. 기본/서비스 기획자 (Default)
  return {
    tags: [major, role, '취업 준비 초기'],
    summary: `${major} 전공의 강점을 살려 ${role} 직무에 필요한 문제 해결력과 실행 로드맵을 구축할 수 있습니다.`,
    coreSkills: [
      {
        id: 'problem-definition',
        title: '문제 정의 및 가설 수립',
        description: '사용자와 비즈니스의 페인포인트를 발견하고 검증 가능한 가설로 구체화하는 능력',
        readiness: '일부 준비',
      },
      {
        id: 'user-understanding',
        title: '사용자 조사 및 리서치',
        description: '정성/정량 데이터를 바탕으로 사용자 여정 지도(Customer Journey Map)를 도출하는 능력',
        readiness: '일부 준비',
      },
      {
        id: 'data-thinking',
        title: '데이터 기반 의사결정',
        description: '정량적 지표(Funnel, Retention)를 분석해 서비스 개선 우선순위를 결정하는 능력',
        readiness: '보완 필요',
      },
      {
        id: 'service-design',
        title: '서비스 플로우 및 화면 설계',
        description: 'IA(정보구조도), 와이어프레임 및 기능 상세 명세서를 작성하는 능력',
        readiness: '보완 필요',
      },
      {
        id: 'communication',
        title: '다직군 커뮤니케이션',
        description: '개발자, 디자이너, 마케터 등 이해관계자와 원활히 소통하고 조율하는 능력',
        readiness: '준비됨',
      },
      {
        id: 'project-management',
        title: '일정 및 프로젝트 관리',
        description: '애자일/스크럼 환경에서 스프린트 일정을 조율하고 릴리즈를 완수하는 능력',
        readiness: '일부 준비',
      },
    ],
    gapSkills: [
      {
        id: 'real-project',
        title: '실전 서비스 기획서(PRD) 작성 경험',
        description: '아이디어를 실제 개발 가능한 수준의 기능 명세서와 화면 설계서로 완성해 본 경험이 부족해요.',
      },
      {
        id: 'data-analysis',
        title: '데이터 기반 개선 지표 설정',
        description: '기획한 기능이 성공했는지 측정할 핵심 지표(Success Metric)를 정의하는 연습이 필요해요.',
      },
      {
        id: 'portfolio',
        title: '기획 포트폴리오 구조화',
        description: '단순 아이디어 나열이 아닌 문제 해결 과정과 논리적 근거를 보여주는 포트폴리오 구성이 필요해요.',
      },
    ],
    steps: [
      {
        order: 1,
        title: '직무 기본기 및 시장 우수 서비스 역기획',
        why: '직무의 표준 프로세스와 성공적인 서비스의 구조를 분석하며 안목을 넓혀야 합니다.',
        how: [
          `${role} 핵심 업무 프로세스 및 산출물(PRD, IA) 양식 학습`,
          '평소 자주 사용하는 우수 서비스 3개 선정 후 역기획서 작성',
          '사용자 문제 정의 및 AS-IS / TO-BE 비교 분석',
        ],
        nextAction: '자주 쓰는 앱 1개를 골라 핵심 사용자 흐름(Flow)을 1장의 다이어그램으로 그려보세요.',
      },
      {
        order: 2,
        title: '실전 프로젝트 기획 및 PRD 작성',
        why: '개발자 및 디자이너와 협업 가능한 수준의 구체적인 명세서를 직접 만들어봐야 합니다.',
        how: [
          '실제 해결하고 싶은 일상 속 문제 1가지 선정',
          '사용자 인터뷰 3명 진행 및 페인포인트 도출',
          'Figma 또는 와이어프레임 툴을 활용한 화면 설계 및 기능 명세서 작성',
        ],
        nextAction: '선정한 문제에 대해 가설과 최소 기능 요구사항(MVP) 리스트를 작성해보세요.',
      },
      {
        order: 3,
        title: '데이터 지표 정의 및 가설 검증 계획 수립',
        why: '기획의 타당성을 설득하고 성과를 증명하기 위해 정량적 지표가 필수적입니다.',
        how: [
          '기획한 기능의 핵심 성공 지표(KPI) 및 가드레일 지표 정의',
          '퍼널별 이탈률 추적을 위한 이벤트 로깅 설계서 작성',
          'SQL 기초 문법을 활용한 가상 로그 데이터 추출 연습',
        ],
        nextAction: '기획 중인 기능이 성공했음을 판단할 2가지 핵심 지표를 정의해보세요.',
      },
      {
        order: 4,
        title: '문제 해결 중심의 기획 포트폴리오 완성',
        why: '신입 채용에서 가장 중요한 것은 ‘왜 그렇게 기획했는가’에 대한 논리적 사고력입니다.',
        how: [
          '프로젝트 배경 → 문제 정의 → 해결 가설 → 상세 기획 → 회고 구조로 문서화',
          '디자인/개발 직군과의 협업 및 커뮤니케이션 노력 강조',
          'Notion 또는 PDF 형태로 10장 내외의 깔끔한 포트폴리오 구성',
        ],
        nextAction: '가장 자신 있는 기획 프로젝트 1건을 선별하여 포트폴리오 초안 목차를 잡아보세요.',
      },
    ],
    finalAction: {
      message: '오늘은 여기부터 시작해보세요!',
      detail: '자주 사용하는 앱 1개를 골라 개선할 만한 불편함 1가지를 정리해보세요.',
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
