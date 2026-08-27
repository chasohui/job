# Zenith AI Career Logic Design System

## 1. Brand Identity & Vision

- **Brand Name:** Career Map
- **Core Value:** 전략적 취업 준비를 위한 데이터 기반 AI 분석 및 로드맵 설계
- **Tone & Manner:** 신뢰감 있는(Trustworthy), 분석적인(Analytical), 실행 중심적인(Action-oriented), 현대적인(Modern)

## 2. Visual Style

- **Overall Aesthetic:** 깨끗하고 전문적인 화이트 배경(@oklch(0.984 0.0035 260)) 기반에 깊은 블루 톤으로 신뢰감을 주고, 성장을 상징하는 포인트 컬러로 활력을 부여합니다.
- **Components:** 0.85rem(약 13px)의 부드러운 라운딩, 미세한 그림자(Elevation), 충분한 여백(Whitespace)을 사용하여 가독성과 현대적인 느낌을 강조합니다.
- **Imagery:** 3D 아이소메트릭 일러스트레이션을 활용하여 서비스의 AI 기술력과 커리어 성장 과정을 시각화합니다.

## 3. Design Tokens (OKLCH Based)

### Colors

- **Primary:** `oklch(0.4 0.15 264)` - 신뢰, 전문성, 메인 버튼 및 브랜드 로고
- **Secondary / Success:** `oklch(0.58 0.11 165)` - 성장, 성공, 포인트 아이콘 및 강조 사항
- **Surface (Background):** `oklch(0.984 0.0035 260)` - 메인 배경색
- **Surface-Container (Card):** `oklch(1 0 0)` - 카드 및 입력 폼 배경
- **On-Surface (Text):** `oklch(0.24 0.028 262)` - 메인 텍스트 (높은 가독성)
- **On-Surface-Variant:** `oklch(0.5 0.02 262)` - 보조 설명 및 가이드 텍스트
- **Accent:** `oklch(0.93 0.014 260)` - 강조 요소 배경

### Typography (Inter)

- **Display:** Semi-bold, 36px~48px - 히어로 섹션 헤드라인
- **Headline:** Bold, 24px~32px - 섹션 타이틀
- **Title:** Medium, 18px~20px - 카드 제목, 강조 텍스트
- **Body:** Regular, 16px - 일반 본문 및 설명
- **Label:** Medium, 14px - 버튼 텍스트, 캡션, 폼 레이블

### Layout & Spacing

- **Container Max-Width:** 1200px
- **Margin (Desktop):** 48px
- **Stack Spacing:** 16px (Small), 32px (Medium), 64px (Large)
- **Border Radius:** 0.85rem (Standard)

## 4. Component Principles

- **Buttons:** Primary 버튼은 `primary` 컬러로 채워 가시성을 높이고, Secondary 버튼은 `secondary` 컬러의 아웃라인이나 고스트 스타일을 사용합니다.
- **Cards:** `oklch(0.9 0.008 260)` 농도의 미세한 보더와 부드러운 그림자를 적용하여 섹션을 구분합니다.
- **Inputs:** 포커스 시 `primary` 컬러 보더와 45% 투명도의 링 효과(`oklch(0.4 0.15 264 / 45%)`)를 사용하여 사용자의 입력을 명확히 가이드합니다.