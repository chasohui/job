# 프로덕션 하드닝 진행 상황

> **작성 일자:** 2026-08-29
> **배경:** 배포 전 코드베이스 점검에서 발견된 항목 처리 기록 (P0 → P1 → P2 순)

## P0 (추가, 2026-08-30) — 분석 지연/전체 실패 원인 조사 및 개별 호출 타임아웃 추가

- **문제:** 사용자 리포트("분석 시간이 너무 오래걸려서 시도가 다 실패하고 있어") 및 `vercel logs` 확인 결과, `/api/analyze`가 연속으로 `TIMEOUT`(504)만 반환하고 있었음.
- **원인 조사:** 로컬에서 실제 `GEMINI_API_KEY`로 재현한 결과, `analyzeWithGemini()`의 `generateContent()` 호출 자체가 22~25초씩 걸리고 있었음(`console.error` 타이밍 계측으로 확인, 이후 제거). 처음에는 이번 세션에서 추가한 프롬프트 강화(규칙 6·7, few-shot 예시)가 원인이라고 의심했으나, 해당 규칙을 제거하고 재요청했을 때 0.6초 만에 응답이 와서 "프롬프트가 원인"이라는 가설을 세웠다가 — 응답 본문을 실제로 확인해보니 **Gemini 호출이 아니라 Mock 폴백 결과**였음을 발견함(가짜 양성). 서버 로그를 다시 보니 실제 원인은 `429 Too Many Requests — Quota exceeded for metric: generate_content_free_tier_requests, limit: 20`였음: 이 프로젝트의 `GEMINI_API_KEY`가 **무료 티어(모델당 일 20회)**로 설정되어 있고, 해당 할당량이 이미 소진된 상태였음. 할당량 경계 근처에서는 Gemini가 즉시 429를 내지 않고 응답을 22~25초씩 지연시키는(소프트 스로틀링으로 추정) 경우가 있었고, 이 지연이 서버의 18초 전체 타임아웃 예산을 통째로 잡아먹어 재시도나 Mock 폴백을 시도할 기회조차 없이 `TIMEOUT`으로 끝나버렸음.
  - 참고로 현재 아키텍처는 사용자 분석 1회당 최대 4회(`analyzeWithRetry`의 2회 재시도 × [생성 1회 + `checkRelevance` 1회])까지 Gemini를 호출할 수 있어, 하루 20회 할당량이 사용자 몇 명의 재시도만으로도 빠르게 소진될 수 있는 구조임.
- **조치 (코드로 해결 가능한 부분):** `lib/gemini.ts`에 `withTimeout()` 헬퍼를 추가해 `generateContent()` 호출 1건이 무한정 기다려지지 않도록 함 — `analyzeWithGemini()`는 8초, `checkRelevance()`는 4초로 개별 타임아웃을 둠. 이제 호출이 느려지거나 응답이 없어도(할당량 소진에 따른 소프트 스로틀링 포함) 각 호출이 짧게 실패하고, 기존에 이미 있던 재시도·Mock 폴백 로직이 18초 예산 안에서 실제로 동작할 여지가 생김.
- **조치가 필요하지만 코드로 해결할 수 없는 부분 (사용자/운영 확인 필요):** `GEMINI_API_KEY`가 무료 티어(일 20회)로 되어 있어, 이 할당량이 소진되면 실제 사용자는 Gemini가 아닌 **Mock(정형화된 예시) 결과**만 계속 받게 됨 — 앱이 깨지지는 않지만 "AI가 내 상황을 분석했다"는 서비스의 핵심 가치가 사라짐. 다음 중 하나가 필요함:
  1. Google AI Studio/Vertex AI 콘솔에서 해당 API 키의 결제(유료 티어) 활성화
  2. 트래픽이 많지 않다면 일일 할당량 리셋을 기다리기
  3. (코드 변경) `analyzeWithRetry()`의 재시도 횟수를 줄이거나 `checkRelevance()` 호출 빈도를 낮춰 요청 1회당 소비하는 할당량을 줄이는 방안 — 이번 세션에서는 적용하지 않음, 필요 시 별도 논의
- **테스트:** `lib/gemini.test.ts`에 회귀 테스트 추가 — `generateContent()`가 응답 없이 멈춰 있는 상황을 가짜 타이머로 재현해, `analyzeWithGemini()`가 8초 안에 실패하고 `checkRelevance()`가 4초 안에 fail-open(`true`)으로 처리되는지 검증.
- **검증:** `pnpm test`(40건), `next build` 정상 통과. 로컬에서 실제 `GEMINI_API_KEY`로 재현 테스트 — 할당량이 소진된 상태에서도 수정 후에는 0.9초 만에 Mock 폴백으로 정상 응답(이전에는 18~25초씩 걸리다 `TIMEOUT` 반환).

## P0 (추가, 2026-08-30) — 재시도 무한 반복 버그 수정

- **문제:** `app/start/page.tsx`가 개발용 시나리오 미리보기 위젯(`ScenarioPreview`)의 선택값과 "지금 화면에 표시 중인 실제 에러"를 같은 상태(`scenario`)로 관리하고 있었음. 실제 분석 요청이 실패하면 `setScenario(errorCode)`로 이 상태를 덮어썼는데, 이후 사용자가 "다시 시도"/"다시 분석하기"를 눌러도 이 값을 `'success'`로 되돌리는 코드가 어디에도 없었음. 그 결과 `loading` 단계로 재진입해도 `scenario !== 'success'` 조건 때문에 **실제 API를 다시 호출하지 않고**, 시나리오 미리보기용 가짜 지연(약 2.6초) 후 곧바로 같은 에러 화면을 반복해서 보여주는 상태에 빠졌음 — 새로고침 전까지는 어떤 재시도도 실제로 재분석을 시도하지 않는 심각한 버그. (사용자 리포트: "한번 분석이 안되면 다시 분석하기를 해도 계속 같은 이유로 분석이 안돼")
- **조치:** "지금 표시 중인 실제 에러"를 별도 상태 `errorScenario`(기본값 `null`)로 분리. 실제 API 실패 시에는 `errorScenario`만 설정하고, `handleErrorAction()`(재시도/입력 수정 버튼)에서 재진입 전에 `errorScenario`를 `null`로 초기화하도록 수정. `scenario`는 이제 오직 개발용 위젯이 시뮬레이션 브랜치를 고를 때만 쓰이고, 실 사용자 흐름에서는 항상 `'success'`로 유지되어 재시도 시 진짜 `/api/analyze` 호출이 다시 실행됨. 개발용 위젯으로 특정 에러를 반복 미리보기하는 기존 동작(같은 시나리오를 재시도해도 다시 그 에러를 보여주는 것)은 그대로 유지됨.
- **테스트:** `e2e/golden-path.spec.ts`에 회귀 방지 테스트 추가 — 1차 요청은 실패(`AI_FAIL`)하도록 모킹하고 2차 요청은 성공하도록 모킹한 뒤, "다시 시도" 클릭 시 실제로 API가 다시 호출되어(`callCount === 2`) 결과 화면까지 도달하는지 검증.
- **검증:** `pnpm test`(38건), `pnpm test:e2e`(6건, 신규 1건 포함), `next build` 모두 정상 통과.

## P0 — 완료된 항목

### 1. 개발용 시나리오 스위처 프로덕션 노출 차단
- **문제:** `app/start/page.tsx`에서 `<ScenarioPreview>`가 조건 없이 렌더링되어, 실사용자가 화면 우하단 버튼으로 AI 실패/타임아웃/네트워크 오류 등 에러 상태를 임의로 트리거할 수 있었음.
- **조치:** `process.env.NODE_ENV !== 'production'` 조건으로 감싸 개발 환경에서만 노출되도록 수정 (`app/start/page.tsx`).
- **검증:** `next build` 프로덕션 빌드 기준으로 `NODE_ENV=production`이 인라인되므로 배포본에서는 렌더링되지 않음. (`app/layout.tsx`의 `<Analytics />`와 동일한 패턴)

### 2. `/api/analyze` 요청 제한(rate limit) 추가
- **문제:** Gemini 호출은 건당 과금인데 공개 API 라우트에 아무 제한이 없어 스크립트/봇 남용 시 비용이 그대로 새어나갈 수 있었음.
- **조치:** `lib/rate-limit.ts`에 IP 기준 슬라이딩 윈도우 인메모리 리미터 추가 (1분당 10회). `app/api/analyze/route.ts`에서 요청 처리 최상단에 적용, 초과 시 `429 RATE_LIMITED` 응답.
- **한계 (다음 단계 참고):** 인메모리 방식이라 함수 인스턴스별로 카운트가 분리됨 — 여러 인스턴스에 걸친 엄격한 전역 제한은 아님. 캐주얼한 남용은 막지만, 강한 보장이 필요하면 Upstash Redis(Vercel Marketplace) 등 공유 스토어로 교체 필요.

### 3. Gemini 모델명 검증
- **문제:** `lib/gemini.ts`의 `gemini-3.6-flash`가 실재하는 모델 ID인지 미확인 상태였음.
- **조치:** Gemini API의 `ListModels` 엔드포인트로 실제 사용 가능한 모델 목록을 조회해 확인.
- **결과:** `gemini-3.6-flash`는 **실재하는 유효한 모델**로 확인됨 (그대로 사용 가능). 참고로 `gemini-3.7-flash`라는 더 최신 버전도 존재 — 향후 품질/속도 비교 후 업그레이드 여부 검토 가능 (지금 당장 교체 불필요).

### 4. TypeScript 빌드 에러 은폐 해제
- **문제:** `next.config.mjs`의 `typescript.ignoreBuildErrors: true`로 인해 타입 에러가 있어도 빌드가 통과되는 상태였음.
- **조치:** `ignoreBuildErrors: false`로 변경. 이 과정에서 드러난 실제 타입 에러 1건(`lib/gemini.ts`의 `readiness` enum 스키마에 `format: 'enum'` 누락) 수정.
- **검증:** `next build` 재실행 결과 TypeScript 검사 포함 정상 통과 확인.

### 5. 저장소 정리
- **락파일 중복 해소:** `pnpm-workspace.yaml`이 존재해 pnpm이 정식 패키지 매니저임에도 `package-lock.json`(npm)이 함께 커밋되어 있던 문제를 `package-lock.json` 제거로 해결. `pnpm-lock.yaml` 단일화.
- **미사용 프로토타입 아카이브:** 루트에 방치되어 있던 v0 초기 프로토타입 `code.html`(현재 앱과 무관한 "Zenith Career Logic" 타이틀)을 삭제 대신 `docs/archive/code.html`로 이동 — 디자인 문서에서 과거 참조용으로 언급되고 있어 추적성을 위해 보존.
- **README 복구:** UTF-16 인코딩 깨짐 + 내용 없는 플레이스홀더였던 `README.md`를 스택/실행 방법/문서 링크가 포함된 정상 문서로 교체.

## P1 — 완료된 항목

### 6. 핵심 검증 로직 유닛 테스트 추가
- **문제:** `lib/validation.ts`(PRD 4.2/5.1~5.3 입력 검증)와 `lib/mock-analysis.ts`의 `validateAnalysisResult`(PRD 4.4/5.6/5.7 결과 검증)가 테스트 없이 자유 수정 가능한 상태였음 — 예외 처리 10개 요구사항이 걸려 있어 회귀 위험이 큼.
- **조치:** `vitest`를 devDependency로 추가하고 `vitest.config.mts`(경로 별칭 `@/*` 포함) 구성. 테스트 3개 파일, 총 24개 케이스 작성:
  - `lib/validation.test.ts` — 빈 값/공백/최소·최대 글자 수/경계값(2자, 50자, 1,000자)/'없음' 입력 케이스
  - `lib/mock-analysis.test.ts` — 핵심 역량 5~7개 경계값, 부족 역량 존재, 준비 항목 3개 미만 실패(PRD 5.7), `how`/`nextAction` 누락 실패, 형식이 아예 다른 값(null/문자열 등) 실패(PRD 5.6), `generateMockAnalysis`가 여러 직무 분기에서도 항상 검증을 통과하는지
  - `lib/rate-limit.test.ts` — 제한 횟수 이내 통과, 초과 시 차단, 키(IP)별 독립 카운트
- **실행:** `pnpm test` (package.json에 스크립트 추가). 전체 통과 확인.

### 7. GitHub Actions CI 구성
- **문제:** `.github/workflows`가 없어 PR/푸시 시 빌드·테스트가 자동 검증되지 않았음.
- **조치:** `.github/workflows/ci.yml` 추가 — `main` 브랜치 push/PR마다 `pnpm install --frozen-lockfile` → `pnpm test` → `pnpm build` 순으로 게이트.
- **부수 조치:** 작업 중 로컬 pnpm 버전(11.x)과 커밋된 `pnpm-lock.yaml`(lockfileVersion 9.0, pnpm v10 계열)이 달라 `ERR_PNPM_UNEXPECTED_STORE`가 발생한 것을 확인 — 재발 방지를 위해 `package.json`에 `"packageManager": "pnpm@10.34.5"` 고정. CI도 `pnpm/action-setup`으로 동일 버전 계열을 사용.

### 8. 클라이언트 fetch 타임아웃 추가
- **문제:** 서버(`app/api/analyze/route.ts`)는 18초 내부 타임아웃이 있지만, 클라이언트 `fetch`(`app/start/page.tsx`)는 자체 타임아웃이 없어 서버가 응답을 전혀 못 주는 극단 상황(네트워크 계층 장애 등)에서 무한 로딩으로 이어질 수 있었음.
- **조치:** `AbortController` + 20초 타이머를 `fetch`에 연결(PRD 4.5 "20초 이내" 기준과 일치). 타임아웃으로 중단된 경우(`AbortError`)는 기존 `network_error`가 아닌 `timeout` 에러 화면(PRD 5.5 문구)으로 정확히 분기하도록 catch 블록 수정.
- **검증:** `next build` 정상 통과, 기존 24개 유닛 테스트 영향 없음.

## P1 — 검토 후 보류 (구현하지 않음)

### 9. Rate limit을 공유 스토어(Redis 등)로 전환
- **현재 상태:** `lib/rate-limit.ts`는 함수 인스턴스별 인메모리 카운터라서, 여러 인스턴스에 걸친 전역 제한은 아님 (P0 항목 2 참고).
- **보류 이유:** 이를 강한 보장으로 바꾸려면 Upstash Redis 등 새 외부 스토리지 프로비저닝(Vercel Marketplace 연동)이 필요한 인프라 결정 사항 — 임의로 새 유료/외부 서비스를 추가하지 않고, 필요 여부를 먼저 확인하는 것이 맞다고 판단해 보류함.
- **다음 단계:** 실제 트래픽에서 인메모리 방식의 한계가 문제가 되면(예: 여러 리전/인스턴스로 분산되어 우회당하는 사례 발생) 그때 Marketplace 연동 여부를 논의.

## P2 — 완료된 항목

### 10. Gemini 검증 실패 시 재시도 로직 추가
- **문제:** PRD 4.4는 "조건을 충족하지 못하면 정상 결과로 표시하지 않고 **재시도**한다"고 명시하는데, 실제 구현(`app/api/analyze/route.ts`)은 Gemini 호출/검증 실패 시 재시도 없이 곧바로 mock 데이터로 조용히 대체하고 있었음 — 사용자가 실제 AI 분석을 기대했는데 정형화된 mock 결과를 AI 결과처럼 받을 수 있는 스펙 괴리였음.
- **조치:** `analyzeWithRetry()` 헬퍼를 추가해 Gemini 호출을 최대 2회까지 재시도하도록 변경 (`app/api/analyze/route.ts`). 기존 18초 타임아웃 레이스 안에서 동작하므로 PRD 4.5의 20초 제한은 그대로 유지됨. 재시도가 모두 실패한 경우에만 기존처럼 mock으로 폴백.

### 11. 미사용 v0 스캐폴딩 자산 정리
- **문제:** `public/placeholder.jpg`, `placeholder.svg`, `placeholder-logo.png/svg`, `placeholder-user.jpg` 5개 파일이 코드 어디서도 참조되지 않은 채 남아 있었음.
- **조치:** 전체 코드베이스에서 참조 여부를 확인 후 5개 파일 모두 삭제.

### 12. 분석 퍼널 커스텀 이벤트 추가
- **문제:** `@vercel/analytics`가 페이지뷰만 수집해 입력 완료율, 분석 성공/실패율 등 실제 서비스 지표를 알 수 없었음.
- **조치:** `app/start/page.tsx`에 `track()` 이벤트 3종 추가 — `analysis_started`(분석 요청 시작), `analysis_completed`(정상 결과 수신), `analysis_failed`(실패 사유를 `reason` 속성으로 포함: `AI_FAIL`/`FORMAT_ERROR`/`RATE_LIMITED`/`TIMEOUT`/`NETWORK_ERROR` 등). 사용자가 입력한 전공/직무/준비 상황 등 개인 식별 가능한 자유 텍스트는 이벤트 속성에 포함하지 않음.

### 13. SEO 기본 파일 추가
- **문제:** `app/robots.ts`, `app/sitemap.ts`가 없어 검색엔진이 크롤링 정책과 사이트맵을 알 수 없었음.
- **조치:** Next.js App Router의 메타데이터 파일 컨벤션으로 `app/robots.ts`(`/api/` 경로 차단), `app/sitemap.ts`(`/`, `/start` 등록) 추가. 도메인은 `VERCEL_PROJECT_PRODUCTION_URL` 환경변수를 사용해 배포 환경에 자동으로 맞춰짐.
- **검증:** `next build` 결과 `/robots.txt`, `/sitemap.xml` 라우트가 정상 생성됨을 확인.

### 14. Playwright E2E 테스트 추가
- **문제:** 유닛 테스트 24건은 순수 로직만 검증하고, 입력→확인→로딩→결과로 이어지는 전체 사용자 플로우가 브라우저에서 실제로 동작하는지 검증하는 테스트는 없었음.
- **조치:** `@playwright/test` 도입, `playwright.config.ts`(프로덕션 빌드로 서버 구동 후 테스트) 구성, `e2e/golden-path.spec.ts`에 4개 시나리오 작성:
  - 정상 플로우: 입력 → 확인 → 분석 → 결과 화면 렌더링 (API는 route 인터셉트로 모킹해 실제 Gemini 호출 없이 결정적으로 테스트)
  - 필수 입력 누락 시 오류 메시지 표시 및 입력값 유지 (PRD 5.1)
  - AI 분석 실패 시 에러 화면과 `다시 시도` 버튼 노출 (PRD 5.4)
  - **P0 항목 1(시나리오 위젯 프로덕션 노출 차단)의 회귀 방지 테스트** — 프로덕션 빌드에서 위젯이 렌더링되지 않음을 자동 검증
- **실행:** `pnpm test:e2e` (로컬), CI에도 `playwright install --with-deps chromium` → `pnpm test:e2e` 단계로 통합.

## P2 — 검토 후 별도 조치 불필요로 확인

### 15. 접근성 대비 재검증
- **확인 내용:** `design.md`에 명시된 "soft-peach(#F4A28E) 배경 + sage-text(#4A5D54) 조합, AA 미달" 경고는 **이전 디자인 반복(설계 초안) 시점의 것**으로, 실제 코드(`app/globals.css`, `components/`)를 전수 검색한 결과 해당 색상 조합은 어디에도 사용되고 있지 않음을 확인함 (해당 값은 `docs/DESIGN_TONE_MANNER_PLAN_V2.md`와 `docs/archive/code.html`에만 존재 — 둘 다 과거 참조 문서).
- **결론:** 현재 `globals.css`의 실제 토큰(primary, highlight, highlight-foreground 등)은 design.md "Soft Spring" 섹션에 문서화된, 이미 대비비 검증(6.44:1, 5.51:1 등 AA 통과)이 완료된 값과 정확히 일치함. **코드 변경 불필요**, 검증만으로 종결.

## 참고

- 관련 최초 분석: 세션 대화 내 "프로젝트 고도화 방향" 리포트
- 원본 기획/완료 기준: [PRD.md](../PRD.md), [COMPLETION_REPORT.md](./COMPLETION_REPORT.md)
