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

## 2. Phase A 구현 (2026-08-30)

> 계획 문서: [FEATURE_ENHANCEMENT_PLAN.md](./FEATURE_ENHANCEMENT_PLAN.md) Phase A — 인프라 변경 없이 클라이언트 전용으로 구현 가능한 Quick win 3건.

### 2.1 Mock 폴백 도메인 확장
- **문제:** `lib/mock-analysis.ts`의 `generateMockAnalysis()`가 프론트엔드/백엔드/데이터 분석가 3개 직무군만 전용 템플릿을 갖고 있었고, 그 외 모든 직무(마케팅, 디자인, 영업 등)는 범용 "서비스 기획자" 기본 템플릿으로 뭉뚱그려졌음. `GEMINI_API_KEY` 미설정 환경이나 API 장애 시 폴백 품질이 직무에 따라 크게 갈렸음.
- **조치:** 마케터(`마케팅`/`marketing`/`마케터`), UI/UX 디자이너(`디자인`/`design`/`디자이너`), 영업/세일즈(`영업`/`세일즈`/`sales`) 3개 직무군 분기를 추가. 기존 분기와 동일한 형태(핵심 역량 6개, 부족 역량 2개, 3단계 준비 로드맵, 다음 행동)로 작성해 `validateAnalysisResult` 조건을 그대로 만족.
- **테스트:** `lib/mock-analysis.test.ts`의 도메인별 분기 테스트에 `마케터`, `UI/UX 디자이너`, `영업 담당자` 케이스 추가.

### 2.2 결과 내보내기 (복사 / 인쇄)
- **문제:** 결과 화면의 분석 내용을 갖고 나갈 방법이 없어, 사용자가 준비 로드맵을 실제로 활용하려면 직접 옮겨 적어야 했음.
- **조치:**
  1. `lib/export-analysis.ts`에 `formatAnalysisAsText()` 추가 — `AnalysisResult`를 요약/핵심 역량/보완 필요 역량/단계별 준비 순서/다음 행동 섹션을 가진 일반 텍스트로 변환.
  2. `components/prep/result-step.tsx`에 "결과 복사하기"(`navigator.clipboard.writeText` + `sonner` 토스트) 버튼과 "인쇄하기"(`window.print()`) 버튼 추가.
  3. 인쇄 시 헤더 내비게이션, 시나리오 미리보기 위젯, "준비 시작하기"/"복사·인쇄·다시 분석" 버튼, 단계별 체크박스 등 상호작용 전용 요소를 `print:hidden`(Tailwind 내장 `print` variant)으로 숨겨 실제 분석 내용만 인쇄되도록 처리. `app/globals.css`에 인쇄 시 배경을 흰색으로 리셋하는 `@media print` 규칙 추가.
- **테스트:** `lib/export-analysis.test.ts` 신규 작성 — 텍스트 변환 결과가 전공/직무/핵심 정보를 모두 포함하는지, 보완 필요 역량이 없을 때 해당 섹션이 생략되는지 검증.

### 2.3 단계별 준비 항목 체크리스트 인터랙션
- **문제:** 1~3단계 추천 항목을 확인만 할 뿐, 실제로 어디까지 진행했는지 표시할 방법이 없었음.
- **조치:**
  1. `lib/checklist-storage.ts` 추가 — `localStorage`에 `전공|직무` 키로 단계별 완료 상태를 저장/조회하는 순수 함수(`getChecklistStorageKey`, `loadChecklist`, `setChecklistItem`). PRD 4.6 "DB 저장 없음"과 무관한 브라우저 로컬 상태이며, `localStorage` 접근이 실패하는 환경(프라이빗 모드 등)에서도 조용히 무시하도록 처리.
  2. `components/prep/recommendation-step-card.tsx`에 단계별 "완료로 표시" 토글 버튼 추가 — 완료 시 카드 테두리/배경이 `success` 톤으로 바뀌어 진행 상태를 시각적으로 구분.
  3. `components/prep/result-step.tsx`에서 마운트 시 `전공|직무` 키로 기존 체크 상태를 불러오고, 토글 시 `localStorage`에 즉시 반영.
- **테스트:** `lib/checklist-storage.test.ts` 신규 작성 — 키 조합 규칙, 저장/조회, 서로 다른 키 간 독립성, `localStorage` 사용 불가 환경에서의 안전한 폴백을 검증.

### 2.4 검증
- `pnpm test`: 36건 전체 통과 (기존 29건 + 신규 7건).
- `pnpm test:e2e`: 5건 전체 통과 (기존 골든 패스/예외 시나리오 회귀 없음 확인).
- `next build`: TypeScript 검사 포함 정상 통과.

## 3. Phase C 일부 구현 — AI 품질 고도화 (2026-08-30)

> 계획 문서: [FEATURE_ENHANCEMENT_PLAN.md](./FEATURE_ENHANCEMENT_PLAN.md) Phase C 중 `checkRelevance` 비용 최적화, 프롬프트 few-shot 보강 2건만 착수. 모델 업그레이드 검토(`gemini-3.7-flash` 등)는 이번 범위에 포함하지 않음 — 아래 "남은 후보" 참고.

### 3.1 `checkRelevance` 비용 최적화
- **문제:** PRD 5.8 대응으로 매 생성 시도마다 관련성 재판정(`checkRelevance`)이 추가 Gemini 호출을 발생시키고, 재판정에서 무관 판정이 나오면 `analyzeWithRetry()`가 **전체 분석을 처음부터 다시 생성**함 — 관련성 판정 호출 자체보다 이 "전체 재생성"이 훨씬 비싼 병목이었음.
- **조치:**
  1. **`lib/gemini.ts`의 `analyzeWithGemini()` systemInstruction에 관련성 규칙(6, 7번)을 직접 명시** — "일반론만으로는 핵심 역량/준비 항목을 구성하지 말 것", "전공↔직무가 이질적인 조합이어도 막연히 나열하지 말고 구체적으로 연결할 것"을 1차 생성 단계에서부터 강제. `checkRelevance()`가 사후에 걸러내는 방식에서, 애초에 걸러질 만한 결과를 덜 만들게 하는 방식으로 무게중심을 옮김 — 재시도(전체 재생성) 빈도 자체를 줄이는 게 가장 큰 비용 절감 지점이라 판단.
  2. **`checkRelevance()` 호출에 `maxOutputTokens: 64` 추가** — 응답이 항상 `{"relevant": boolean}` 수준의 짧은 JSON이므로 과다 생성 시나리오의 출력 토큰/지연 상한을 둠.
  3. **더 저렴한 모델로 판정을 분리하는 방안도 검토했으나 보류** — `HARDENING_PROGRESS.md`의 모델 검증 사례처럼, 실재가 확인되지 않은 모델 ID(예: `-lite` 계열)를 검증 없이 코드에 넣지 않는 것이 이 저장소의 관례. 실제 트래픽에서 비용이 문제가 되면 Gemini `ListModels`로 후보를 검증한 뒤 재검토.
- **테스트:** `lib/gemini.test.ts`에 `getGenerativeModel` 호출 인자를 캡처하는 스파이를 추가하고, `maxOutputTokens`가 설정되어 있는지 검증하는 케이스 추가.

### 3.2 프롬프트 few-shot 보강
- **문제:** 기존 systemInstruction은 "핵심 역량 5~7개", "부족한 역량 1~3개" 같은 구조적 규칙만 있었고, "무엇이 좋은/나쁜 역량 서술인지"에 대한 구체적 기준이나 예시가 없어 전공↔직무가 이질적인 조합(예: 인문·예체능 전공 × 이공계 직무)에서 품질 편차가 발생할 여지가 있었음.
- **조치:** `analyzeWithGemini()`의 systemInstruction에 나쁜 예/좋은 예 대조 예시 1쌍(6번 규칙 — 어떤 직무에도 붙는 일반론 vs. 직무 고유 맥락이 드러나는 서술)과, 이질적인 전공×직무 조합을 다루는 규칙(7번)을 추가. 실제 서비스 로그/사용자 피드백이 없는 상태(PRD상 DB 저장 없음)라 "실 데이터 기반 편차 점검"은 할 수 없었고, 알려진 실패 패턴(어떤 직무에도 통하는 일반론 역량)을 기준으로 예시를 구성함.
- **테스트:** `lib/gemini.test.ts`에 `analyzeWithGemini()`의 systemInstruction이 "나쁜 예/좋은 예/일반론" 문구를 포함하는지 검증하는 회귀 테스트 추가 — 향후 프롬프트를 수정하다가 이 가드레일이 실수로 삭제되는 것을 방지.
- **주의(트레이드오프):** systemInstruction이 길어진 만큼 매 생성 호출의 입력 토큰이 소폭 증가함. 다만 이번 조치의 목적 자체가 "재시도(전체 재생성)를 줄이는 것"이므로, 재시도 1회를 회피할 때 절감되는 비용이 시스템 프롬프트 증가분보다 훨씬 크다고 판단해 진행함. 실제 개선 효과(1차 통과율)는 프로덕션 트래픽에서 지켜봐야 함 — 이 저장소는 사용자 로그를 저장하지 않으므로 정량 측정은 Vercel Analytics의 `analysis_failed`(reason 속성) 이벤트 추이로 간접 확인 가능.

### 3.3 검증
- `pnpm test`: 38건 전체 통과 (기존 36건 + 신규 2건).
- `next build`: TypeScript 검사 포함 정상 통과.
- Gemini 실호출을 통한 A/B 비교(1차 통과율 변화)는 이번 세션에서 수행하지 않음 — API 비용이 실제로 발생하는 라이브 호출이라 임의로 실행하지 않았고, 필요 시 별도로 진행 여부를 확인 후 수행.

## 남은 후보 (아직 미착수)

- [ ] localStorage 기반 "이전 분석 이어보기" (Phase B)
- [ ] 역량/단계별 후속 질문(추가 설명 재질의) (Phase B)
- [ ] 결과 공유 이미지(canvas 기반, 클라이언트 렌더링) (Phase B)
- [ ] 모델 업그레이드 검토(`gemini-3.7-flash` 등, 품질/속도 비교 필요) (Phase C 잔여)
- [ ] (인프라 결정 필요) 영구 공유 링크, 이메일 발송, 계정 기반 히스토리 (Phase D — PRD 범위 제한과 충돌, 별도 승인 필요)

## 참고

- 관련 최초 분석: 세션 대화 내 "기능 고도화 방향" 리포트
- 계획 문서: [FEATURE_ENHANCEMENT_PLAN.md](./FEATURE_ENHANCEMENT_PLAN.md)
- 원본 기획/완료 기준: [PRD.md](../PRD.md)
