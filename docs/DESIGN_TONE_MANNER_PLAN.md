# 톤앤매너 정비 계획서 (design.md 기준)

작성일: 2026-08-27
기준 문서: `design.md` (Zenith AI Career Logic Design System)

## 1. 배경

루트의 `design.md`가 새로 정의/수정되어, 이를 기준으로 사이트 전체의 톤앤매너(색상·타이포그래피·레이아웃·컴포넌트 스타일)를 맞추는 작업을 진행한다. 착수 전 `design.md` 스펙과 실제 구현(`app/globals.css`, `app/layout.tsx`, `components/ui/*`, `components/prep/*`)을 대조해 실제 갭을 확인했다.

## 2. 갭 분석

| 항목 | design.md 스펙 | 현재 구현 | 판단 |
|---|---|---|---|
| 색상 토큰 (Primary/Success/Surface/Card/Text/Accent) | OKLCH 값 명시 | `app/globals.css`의 `:root` 값과 **완전히 일치** | 변경 불필요 |
| Border Radius | 0.85rem | `--radius: 0.85rem` | 변경 불필요 |
| Input focus ring | primary 45% 투명도 링 | `--ring: oklch(0.4 0.15 264 / 45%)` | 변경 불필요 |
| 브랜드명 | Career Map (확정) | 전체 반영 완료 (`app-header.tsx`, `landing-header.tsx`, `landing-footer.tsx`, `features-section.tsx`, `layout.tsx`/`app/page.tsx` metadata) | 완료 |
| 타이포그래피 | Inter | Gothic A1(heading) + Noto Sans KR(body) | **불일치 — Inter는 한글 미지원, 적용 범위 의사결정 필요** |
| Container Max-Width | 1200px | `max-w-3xl`(768px) 단일 컬럼 위저드 레이아웃 | **구조적 차이 — 전면 적용 시 UX 재검토 필요** |
| Stack Spacing (16/32/64px) | 명시 | 컴포넌트마다 `gap-*`, `space-y-*`, `py-*`가 개별 하드코딩, 값 비일관 (12개 prep 컴포넌트 전수 사용) | 정비 필요 |
| Imagery(3D 아이소메트릭 일러스트) | 명시 | 없음 (lucide-react 아이콘만 사용) | 범위 외 별도 논의 필요 (에셋 제작 필요) |

**결론**: 색상 토큰은 이미 design.md와 동일하므로 재작업 대상이 아니다. 실제 작업은 ①타이포그래피 스케일/폰트 적용 범위, ②스페이싱 스케일 통일, ③(선택) 브랜드명·로고 반영, ④(선택) 일러스트 자산, 네 갈래로 좁혀진다.

## 3. 작업 범위 및 단계

### Phase 1 — 디자인 토큰 정비 (컬러는 유지, 타이포/스페이싱 표준화)
- `app/globals.css`의 `@theme inline`에 Display/Headline/Title/Body/Label 타이포 스케일을 CSS 변수로 명문화 (현재는 컴포넌트별 임의 `text-*` 클래스 사용)
- Stack spacing 16/32/64px을 Tailwind 커스텀 유틸 또는 관례로 고정하고, 기존 12개 `components/prep/*.tsx` 파일의 `gap-*`/`space-y-*`/`py-*` 값을 스케일에 맞게 정리
- 대상 파일: `app/globals.css`, `components/prep/*.tsx` 전체(12개), `components/ui/*.tsx`(button, card, badge, input 등 spacing 관련)

### Phase 2 — 타이포그래피 폰트 적용 범위 확정 (의사결정 후 실행)
- 옵션 A: 숫자/영문 라벨(예: 퍼센트, 영문 스킬명)에 한해 Inter를 보조 폰트로 추가, 한글은 기존 Gothic A1/Noto Sans KR 유지
- 옵션 B: design.md의 Inter 표기를 "톤"의 은유로 보고 한글 폰트 유지, 폰트는 변경하지 않음
- 결정 후 `app/layout.tsx`의 폰트 로딩부만 수정하면 되어 영향 범위는 작음

### Phase 3 — 레이아웃 폭 재검토 (선택)
- 현재 위저드 플로우(`max-w-3xl`)는 폼 집중 UX로 의도된 설계로 보임
- design.md의 1200px는 마케팅/랜드 페이지형 레이아웃을 전제로 한 값으로 판단됨 — 결과 화면(`result-step.tsx`, `recommendation-step-card.tsx`)처럼 정보 밀도가 높은 단계에 한해 컨테이너를 넓히는 절충안 제안
- 전체 위저드 폭을 1200px로 바꾸는 것은 비추천(입력 단계 가독성 저하 우려)

### Phase 4 — 브랜드명/로고 반영 (완료)
- 브랜드명 "Career Map"으로 확정, 전체 파일 반영 완료
- 반영 파일: `app/layout.tsx`, `app/page.tsx`(metadata), `components/prep/app-header.tsx`, `components/landing/landing-header.tsx`, `components/landing/landing-footer.tsx`, `components/landing/features-section.tsx`, `design.md`
- 미반영: `public/` 파비콘류(아이콘 이미지 자체는 텍스트 로고와 무관해 그대로 유지), `README.md`(프로젝트 메타 문서, 필요 시 별도 확인)

### Phase 5 — 검증
- `pnpm dev`로 각 단계(input/confirm/loading/result/error) 실제 화면 확인
- 라이트 테마 기준(다크 테마 미정의 상태이므로 다크모드는 범위 외)
- 반응형(모바일 375px~데스크톱) 여백/타이포 스케일 확인

## 4. 리스크 및 확인 필요 사항

1. **브랜드명 변경 여부** — 서비스 정체성에 영향. 사용자 확인 필수.
2. **Inter 폰트 적용 범위** — 한글 미지원 폰트이므로 전면 교체는 불가. 부분 적용 여부 결정 필요.
3. **1200px 컨테이너** — 현재 UX(단일 컬럼 위저드)와 상충. 전면 적용 대신 부분 적용 제안.
4. **3D 아이소메트릭 일러스트** — 신규 에셋 제작/소싱이 필요한 별도 규모의 작업. 이번 톤앤매너 정비에서는 범위 외로 분리 권장.

## 5. 다음 액션

Phase 1(토큰/스페이싱 정비)은 design.md와 상충 없이 바로 진행 가능. Phase 2~4는 각 의사결정 후 착수.
