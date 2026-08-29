# 프로덕션 하드닝 진행 상황 (P0)

> **작성 일자:** 2026-08-29
> **배경:** 배포 전 코드베이스 점검에서 발견된 P0(즉시 조치) 항목 처리 기록

## 완료된 항목

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

## 아직 남은 항목 (P1 — 다음 단계)

- [ ] 핵심 검증 로직(`lib/validation.ts`, `lib/mock-analysis.ts`)에 대한 유닛 테스트 추가
- [ ] GitHub Actions로 `next build` 게이트 구성 (현재 CI 없음)
- [ ] 클라이언트 `fetch`에 `AbortController` 기반 타임아웃 추가 (`app/start/page.tsx`) — 서버 무응답 극단 상황 대비
- [ ] Rate limit을 공유 스토어(Upstash Redis 등)로 전환 검토 — 멀티 인스턴스 환경에서 엄격한 제한이 필요할 경우

## 참고

- 관련 최초 분석: 세션 대화 내 "프로젝트 고도화 방향" 리포트
- 원본 기획/완료 기준: [PRD.md](../PRD.md), [COMPLETION_REPORT.md](./COMPLETION_REPORT.md)
