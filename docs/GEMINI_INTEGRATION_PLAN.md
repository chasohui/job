# 🤖 Gemini AI 실시간 연동 개발 계획서 (Sprint 6 Plan)

> **문서 버전:** 1.0.0  
> **기준 문서:** [PRD.md](file:///c:/job/PRD.md) | [DEVELOPMENT_PLAN.md](file:///c:/job/docs/DEVELOPMENT_PLAN.md)  
> **환경 변수:** `GEMINI_API_KEY` (in `.env`)  
> **목표:** 사용자의 전공, 희망 직무, 현재 준비 상황을 바탕으로 Google Gemini AI 모델이 실시간으로 맞춤형 직무 역량 및 1단계→2단계→3단계 준비 로드맵을 20초 이내에 생성하도록 연동

---

## 1. 아키텍처 및 데이터 흐름

```text
[클라이언트 (React)] 
     │  POST /api/analyze (major, role, status)
     ▼
[Next.js API Route / Server Action]
     │  1. 입력값 2차 유효성 검증 (lib/validation.ts)
     │  2. process.env.GEMINI_API_KEY 주입 (보안 격리)
     │  3. 프롬프트 & JSON Schema 주입 (gemini-2.0-flash / gemini-1.5-flash)
     ▼
[Google Gemini API]
     │  구조화된 JSON 응답 생성 (2~5초 소요)
     ▼
[응답 검증기 (lib/mock-analysis.ts validateAnalysisResult)]
     │  - 핵심 역량 5~7개 충족 검사
     │  - 부족 역량 및 사유 검사
     │  - 3단계 이상 로드맵 및 실행 방안 검사
     ▼
[클라이언트 결과 화면 표출 (ResultStep)]
```

---

## 2. 세부 개발 태스크 목록 (Sprint 6)

### Task 1: Google GenAI 패키지 설치 및 서버 모듈 구축
- `@google/generative-ai` 설치
- `lib/gemini.ts` 생성:
  - Gemini 모델 클라이언트 초기화 (`gemini-2.0-flash` 또는 `gemini-1.5-flash`)
  - 시스템 프롬프트(System Instruction) 및 JSON Schema 정의
  - 15초 AbortSignal 타임아웃 래퍼

### Task 2: API 엔드포인트 구현 (`app/api/analyze/route.ts`)
- `POST` 핸들러 구현
- 요청 파라미터(`major`, `role`, `status`) 검증
- Gemini API 호출 및 반환된 JSON을 `validateAnalysisResult`로 검증 후 반환
- API 키 오류, 할당량 초과, 타임아웃에 대한 PRD 표준 에러 코드 매핑

### Task 3: 클라이언트 연동 (`app/page.tsx`)
- `loading` 단계에서 `/api/analyze`로 실제 비동기 `fetch` 요청 수행
- 정상 응답 시 `result` 화면 렌더링
- 에러 발생 시 PRD 5.4(요청 실패), 5.5(타임아웃), 5.6(형식 오류) 복구 화면 자동 전환

### Task 4: 종합 검증 및 폴백 보장
- 실제 API 키 정상 호출 검증
- 다양한 전공/직무/준비상황(예: 비전공자, '없음' 입력)에 대한 실시간 생성 품질 검증
- 프로덕션 빌드(`npm run build`) 확인
