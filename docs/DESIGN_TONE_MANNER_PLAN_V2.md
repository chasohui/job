# 톤앤매너 정비 계획서 v2 — "Soft Spring" 리디자인 (code.html 기준)

작성일: 2026-08-27
기준 문서: 루트 `code.html` (최신 갱신본)
관련 문서: [DESIGN_TONE_MANNER_PLAN.md](./DESIGN_TONE_MANNER_PLAN.md) (v1, 블루/Material 톤 — 랜딩페이지·Career Map 브랜드명 반영까지 완료됨)

## 1. 배경

v1 계획서는 `design.md`의 블루/Material 톤을 기준으로 작성되어 랜딩페이지(`/`) 신설과 브랜드명 "Career Map" 통일까지 이미 프로덕션에 반영·배포된 상태다. 이번에 루트 `code.html`이 **완전히 다른 방향**으로 갱신되어, 이 파일을 새 기준으로 다시 확인했다.

`design.md`(공식 디자인 시스템 문서)는 이번 갱신에 포함되지 않아 여전히 이전 블루 톤 그대로이며(브랜드명 필드만 "Career Map"으로 갱신되어 있음), `code.html`과 내용이 어긋나 있다. 즉 지금 실제로 참고해야 할 기준은 `code.html`이지만, 문서상 기준(`design.md`)은 아직 이를 반영하지 못한 상태다.

## 2. 핵심 변경 사항 (기존 구현 vs code.html)

| 항목 | 기존 구현 (프로덕션 반영됨) | code.html (새 기준) | 영향도 |
|---|---|---|---|
| 컬러 팔레트 | 쿨톤 블루 (`primary: oklch(0.4 0.15 264)`, 배경 거의 화이트) | 웜톤 (primary `#8d4d3d` 테라코타, 배경 `#FEF9F2` 크림, 포인트: 민트 `#A8DADC` / 피치 `#F4A28E` / 더스티로즈 `#E76F51`) | **전면 재정의 필요** |
| Border Radius | 0.85rem 고정 | DEFAULT 1rem / lg 2rem / xl 3rem, 버튼은 완전 pill(`rounded-full`) | **라운딩 스케일 재정의 필요** |
| 타이포 웨이트 | heading bold(700~800) 위주 | headline 500(medium) 위주로 더 가벼움 | 재검토 필요 |
| 여백 스케일 | margin-desktop 48px, stack-lg 64px | section-gap 80px, margin-desktop 64px — 더 넉넉함 | 스페이싱 확장 필요 |
| 이미지 | 아이콘 기반, 일러스트 없음(이전 계획서에서 범위 외로 제외) | 3D 파스텔 일러스트 3~4곳(계단 오르기, AI 오브, 보물지도 등, 외부 생성 이미지 URL 사용) | **에셋 전략 필요 — 재논의 대상** |
| 카피 톤 | "전략적/데이터 기반"(분석적) | "따뜻한/마음 편한/심리적 부담을 낮추는"(정서적) | **문구 전면 재작성 필요** |
| 3단계 프로세스 구조 | 가로 3열 카드 | 세로 지그재그(좌우 교차) + 연결선 + 스텝별 일러스트 패널 | 구조 재설계 필요 |
| 브랜드명 | "Career Map" (직전에 확정, 전체 반영 완료) | "Zenith Career Logic" 표기 | **충돌 — 확인 필요** |

## 3. 결정 사항 (확정됨)

1. **브랜드명** — Career Map 유지. `code.html`의 "Zenith Career Logic" 표기는 목업 생성 과정에서 남은 잔존 텍스트로 확인, 반영하지 않음.
2. **일러스트 자산** — 별도 제작. 외부 생성 이미지 URL 대신 자체 제작한 SVG 벡터 일러스트로 대체.
3. **적용 범위** — 전체 통일. 랜딩(`/`)과 `/start` 위저드 모두 동일한 디자인 토큰을 사용.
4. **`design.md` 갱신** — Soft Spring 방향으로 전면 재작성 완료.

## 4. 작업 범위 및 단계 — 진행 상태

### Phase 0 — 기준 문서 정리 (완료)
- `design.md`를 Soft Spring 팔레트/라운딩/스페이싱/톤앤보이스로 재작성

### Phase 1 — 디자인 토큰 전면 교체 (완료)
- `app/globals.css`의 `:root` 컬러 변수를 웜톤 팔레트(OKLCH 변환값)로 교체
- `--radius`를 1rem으로 확장(기존 스케일 배수는 유지되어 sm/md/lg/xl 전체가 비례 확장됨)
- `components/ui/button.tsx` 기본 라운딩을 `rounded-lg` → `rounded-full`(pill)로 변경 — default/lg/icon/icon-lg 사이즈에 적용, xs/sm/icon-xs/icon-sm은 기존 소형 라운딩 유지(버튼 그룹 호환 목적)
- `components/ui/card.tsx`, `badge.tsx` 등은 `rounded-xl` 등 테마 라운딩 토큰을 그대로 참조하고 있어 `--radius` 값만으로 자동 확장됨(별도 수정 불필요)
- 영향 파일: `app/globals.css`, `components/ui/button.tsx`

### Phase 2 — 랜딩페이지 리라이트 (완료)
- 히어로: 데이터 미리보기 카드 → 자체 제작 SVG 경로/체크포인트 일러스트(`hero-illustration.tsx`)로 교체, 은은한 float 애니메이션 추가
- 기능 3종: 카피를 정서적 톤으로 재작성, 아이콘 톤을 destructive(경고 빨강) 대신 success/highlight로 교체해 "부담을 낮추는" 톤 유지
- 3단계 프로세스: 가로 3열 → 세로 지그재그(좌우 교차) + 연결선 + 스텝별 SVG 일러스트 패널(`step-illustration.tsx`)로 재구성
- 최종 CTA: 카피를 "나만의 로드맵 만들기"로 조정
- 영향 파일: `components/landing/*`(hero-illustration.tsx, step-illustration.tsx 신규 추가 포함 8개), `app/page.tsx`

### Phase 3 — 위저드(`/start`) 톤 통일 (완료 — 토큰 자동 반영)
- `components/prep/*` 전 컴포넌트가 하드코딩된 색상 없이 전부 시맨틱 토큰(`bg-primary`, `bg-card`, `rounded-xl` 등)만 사용하고 있음을 확인 — Phase 1의 토큰 교체만으로 위저드 전체가 자동으로 Soft Spring 톤을 상속받음. 별도 파일 수정 불필요.
- PRD가 명시한 안내 문구·버튼 라벨(전공/희망 직무 placeholder 등)은 스펙 고정값이라 변경하지 않음

### Phase 4 — 검증 (완료)
- dev 서버에서 `/`, `/start` 모두 정상 렌더링(200) 및 컴파일 에러 없음 확인
- **대비(contrast) 실측**: `sage-text on soft-peach` 3.49:1로 AA 미달 확인 → 해당 조합은 버튼/본문에 사용하지 않도록 design.md에 경고 명시. 실제 적용한 조합(흰 텍스트 on 테라코타 6.44:1, 진한 텍스트 on 더스티로즈 5.51:1 등)은 모두 AA 통과 확인

## 5. 리스크

- 이미 프로덕션에 배포된 브랜드 경험(블루 + Career Map)을 전면 교체하는 결정이라 되돌리기 번거로움 — 착수 전 확정 필요
- 외부 생성 이미지 URL을 프로덕션에 직접 링크하면 안 됨(만료·변경 위험, 소유권 불명)
- 팔레트 저채도화로 인한 접근성 대비 저하 가능성

## 6. 다음 액션

3절의 4가지 결정(브랜드명, 일러스트 전략, 적용 범위, design.md 갱신 여부)에 대한 답을 받으면 Phase 0부터 순서대로 착수한다.
