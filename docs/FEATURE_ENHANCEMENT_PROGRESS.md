# 기능 고도화 진행 상황

> **작성 일자:** 2026-08-29
> **배경:** 인프라/안정성 하드닝(P0~P2, [HARDENING_PROGRESS.md](./HARDENING_PROGRESS.md))과는 별개로, 서비스가 실제로 제공하는 가치 자체를 키우기 위한 기능 고도화 작업 기록.

## 완료된 항목

### 1. PRD 5.8 "직무와 관계없는 결과" 예외처리 실제 구현

- **문제:** `lib/mock-analysis.ts`에 `meaningless` 시나리오가 정의되어 있었지만, 이건 **개발용 ScenarioPreview 위젯에서만 존재하는 가짜 상태**였음. 실제 Gemini 응답이 사용자의 희망 직무와 정말 관련 있는 내용인지 판단하는 로직은 어디에도 없었음. `validateAnalysisResult`는 배열 개수·필드 존재 같은 **구조**만 검사할 뿐, 내용의 관련성은 전혀 보지 않아서, Gemini가 "커뮤니케이션 능력을 기르세요" 같은 어느 직무에나 붙는 일반론만 내놔도 구조만 맞으면 정상 결과로 그대로 노출될 수 있었음.

- **조치:**
  1. **`lib/gemini.ts`에 `checkRelevance()` 추가** — 생성된 `coreSkills`/`steps`의 제목·설명을 요약해 Gemini에 "이 내용이 [희망 직무]에 실질적으로 특화되어 있는가"를 별도로 짧게 재질의하는 2차 판정 함수. 구조화 스키마(`{relevant: boolean}`)로 응답받아 오탐 없이 파싱. 판정 호출 자체가 실패(네트워크/파싱 오류 등)하면 **fail-open**으로 `true`를 반환해, 이 안전장치가 정상 결과를 막는 새로운 병목이 되지 않도록 함.
  2. **`app/api/analyze/route.ts`의 `analyzeWithRetry()`를 확장** — Gemini 생성 결과를 받은 직후 `checkRelevance()`로 관련성을 판정하고, 무관하다고 판정되면 재시도(최대 2회, 기존 18초 타임아웃 예산 안에서). 재시도를 모두 소진했는데도 무관하면 `IRRELEVANT_RESULT`(422)를 반환 — **다른 실패(네트워크/형식 오류)와 달리 mock으로 조용히 대체하지 않음**. PRD 5.8의 의도가 "사용자에게 입력을 구체화하라고 안내"하는 것이지 "그럴듯한 대체 결과를 주는 것"이 아니기 때문.
  3. **`app/start/page.tsx`에 서버 에러 코드 → 화면 시나리오 매핑 테이블(`ERROR_CODE_TO_SCENARIO`) 추가** — 기존에는 서버가 어떤 에러 코드를 반환하든 클라이언트가 전부 `ai_fail`(범용 실패 메시지)로 뭉뚱그렸음. 이번에 `TIMEOUT`→`timeout`, `FORMAT_ERROR`→`format_error`, `IRRELEVANT_RESULT`→`meaningless` 등으로 정확히 분기하도록 수정해, PRD가 정의한 시나리오별 정확한 안내 문구(`meaningless`의 경우 "입력 수정하기" CTA, `retryTarget: 'input'`)가 실제로 표시되게 함.

- **테스트:**
  - `lib/gemini.test.ts` 신규 작성 — `@google/generative-ai` SDK를 목업해 `checkRelevance()`의 4가지 경로(relevant:true/false, 판정 실패 시 fail-open, JSON 파싱 실패 시 fail-open, API 키 없을 때 스킵) 검증. 유닛 테스트 총 29건으로 증가.
  - `e2e/golden-path.spec.ts`에 "직무와 무관한 결과 판정 시 입력 수정 화면으로 안내한다 (PRD 5.8)" 시나리오 추가 — `/api/analyze`를 `IRRELEVANT_RESULT`로 모킹해 에러 화면 문구·CTA·입력값 유지까지 종단 검증. E2E 총 5건.

- **검증:** `pnpm test`(29건), `pnpm test:e2e`(5건), `next build` 모두 정상 통과.

- **주의(비용/지연 트레이드오프):** 관련성 판정은 Gemini를 추가로 1회 더 호출하므로, 정상 케이스에서도 분석당 API 호출이 최대 2회(생성 1회 + 판정 1회)에서 최악의 경우 4회(재시도 포함)까지 늘어날 수 있음. 기존 18초 타임아웃 예산 안에서 레이스하므로 PRD 4.5(20초 이내) 기준은 유지되지만, Gemini 호출 비용은 케이스당 늘어남 — 트래픽이 늘면 비용 추이를 지켜볼 필요가 있음.

## 남은 후보 (다음 단계, 아직 미착수)

- [ ] Mock 폴백 도메인 확장 (프론트엔드/백엔드/데이터 3개 → 기획/마케팅/디자인/영업 등 추가)
- [ ] localStorage 기반 "이전 분석 이어보기"
- [ ] 단계별 준비 항목 체크리스트 인터랙션 (localStorage 저장)
- [ ] 결과 내보내기(클립보드 복사/인쇄용 스타일)
- [ ] 역량/단계별 후속 질문(추가 설명 재질의)
- [ ] (인프라 결정 필요) 영구 공유 링크, 이메일 발송, 계정 기반 히스토리

## 참고

- 관련 최초 분석: 세션 대화 내 "기능 고도화 방향" 리포트
- 원본 기획/완료 기준: [PRD.md](../PRD.md)
