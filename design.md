# Career Map Design System — "Soft Spring"

## 1. Brand Identity & Vision

- **Brand Name:** Career Map
- **Core Value:** 취업 준비의 막막함과 부담을 낮추고, 지금 할 일을 따뜻하게 짚어주는 AI 커리어 동반자
- **Tone & Manner:** 따뜻한(Warm), 편안한(Comforting), 공감하는(Empathetic), 부담을 낮추는(Reassuring)

## 2. Visual Style

- **Overall Aesthetic:** 크림 톤 배경(`oklch(0.984 0.011 76.6)`)과 테라코타 포인트 컬러로 아늑하고 사람 냄새 나는 분위기를 만들고, 민트·피치 계열 보조 컬러로 부드러운 생동감을 더합니다.
- **Components:** 1rem 이상의 넉넉한 라운딩(버튼은 완전한 pill 형태)과 넓은 여백을 사용해 시각적 압박감을 줄입니다.
- **Imagery:** 파스텔 톤의 손그림풍 일러스트레이션(단색 라인 + 부드러운 도형)을 자체 제작하여 사용합니다. 외부 스톡/생성 이미지는 사용하지 않습니다.

## 3. Design Tokens (OKLCH Based)

### Colors

- **Primary:** `oklch(0.493 0.090 35.0)` — 테라코타. 메인 버튼, 브랜드 로고, 강조 텍스트 (`#8d4d3d` 상당)
- **Primary-Foreground:** `oklch(1 0 0)` — Primary 배경 위 텍스트 (대비 6.44:1, AA 통과)
- **Success:** `oklch(0.477 0.053 199.0)` — 민트 계열 딥 틸. 준비 완료/성공 표시 (`#356668` 상당)
- **Highlight:** `oklch(0.678 0.156 35.2)` — 더스티로즈. 최종 행동 유도 블록 강조 (`#E76F51` 상당)
- **Highlight-Foreground:** `oklch(0.226 0.008 95.4)` — Highlight 배경 위 텍스트 (흰색은 3.09:1로 AA 미달이라 진한 텍스트 사용, 대비 5.51:1)
- **Surface (Background):** `oklch(0.984 0.011 76.6)` — 크림 배경 (`#fef9f2` 상당)
- **Surface-Container (Card):** `oklch(1 0 0)` — 카드/입력 폼 배경 (흰색으로 크림 배경과 구분)
- **On-Surface (Text):** `oklch(0.226 0.008 95.4)` — 메인 텍스트 (`#1d1c18` 상당)
- **On-Surface-Variant:** `oklch(0.398 0.023 34.4)` — 보조 설명 텍스트 (`#53433f` 상당)
- **Accent:** `oklch(0.917 0.043 32.2)` — 옅은 피치 톤 강조 배경 (`#ffdad2` 상당)
- **Border/Outline:** `oklch(0.831 0.026 35.7)` — 옅은 웜톤 보더 (`#d8c2bc` 상당)

> ⚠️ **접근성 주의:** `soft-peach(#F4A28E)` 배경 위 `sage-text(#4A5D54)` 조합은 대비 3.49:1로 일반 텍스트 AA 기준(4.5:1)에 못 미칩니다. 버튼·본문 텍스트에는 사용하지 말고, 큰 제목(24px+ bold)이나 장식적 배경에 한해 제한적으로 사용합니다.

### Typography

- **주 폰트:** Gothic A1(heading) + Noto Sans KR(body) 유지. code.html은 Inter를 지정하지만 Inter는 한글 글리프를 지원하지 않아 국문 서비스에는 그대로 적용할 수 없습니다. 영문/숫자 라벨에 한해 추후 Inter를 보조 폰트로 검토합니다.
- **Display:** 36px~48px, 이전보다 가벼운 굵기(semi-bold) 유지 — 따뜻한 톤에 맞춰 과도하게 두껍지 않게
- **Headline:** 24px~32px, Bold
- **Title:** 18px~20px, Medium
- **Body:** 16px, Regular
- **Label:** 14px, Medium

### Layout & Spacing

- **Container Max-Width:** 1200px (랜딩), 기존 위저드는 768px 유지
- **Margin (Desktop):** 64px
- **Stack Spacing:** 16px (Small), 32px (Medium), 80px (Large, 섹션 간격)
- **Border Radius:** 1rem (기존 0.85rem에서 확장), 버튼은 완전한 pill(`rounded-full`)

## 4. Component Principles

- **Buttons:** Primary 버튼은 `primary`(테라코타) 컬러의 완전한 pill 형태로 채우고 흰 텍스트를 사용합니다. Secondary/Outline 버튼은 옅은 보더의 pill 아웃라인을 사용합니다.
- **Cards:** 흰색 배경에 `border`(옅은 웜 보더)와 부드러운 그림자(soft-shadow)를 적용해 크림 배경과 구분합니다.
- **Inputs:** 포커스 시 `primary` 컬러 보더와 45% 투명도 링 효과를 사용합니다.
- **일러스트:** 각 섹션에 자체 제작한 단색 라인 + 파스텬 도형 일러스트를 배치해 정서적 온기를 더합니다. 사진/3D 렌더 대신 SVG 기반 벡터로 제작해 가볍고 일관된 톤을 유지합니다.
