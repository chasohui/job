export function HeroIllustration() {
  return (
    <svg
      viewBox="0 0 400 360"
      className="w-full max-w-sm"
      role="img"
      aria-label="목표까지 이어지는 부드러운 곡선 경로 위에 표시된 세 개의 체크포인트 일러스트"
    >
      <circle cx="90" cy="270" r="70" fill="var(--success)" opacity="0.16" />
      <circle cx="320" cy="90" r="60" fill="var(--highlight)" opacity="0.14" />

      <path
        d="M 50 300 C 120 300, 90 190, 170 190 S 220 90, 320 60"
        fill="none"
        stroke="var(--border)"
        strokeWidth="4"
        strokeLinecap="round"
        strokeDasharray="2 14"
      />

      <g>
        <circle cx="50" cy="300" r="14" fill="var(--card)" stroke="var(--success)" strokeWidth="4" />
        <circle cx="50" cy="300" r="5" fill="var(--success)" />
      </g>

      <g>
        <circle cx="170" cy="190" r="18" fill="var(--primary)" />
        <path
          d="M162 190l6 6 12-12"
          fill="none"
          stroke="var(--primary-foreground)"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </g>

      <g>
        <circle cx="320" cy="60" r="16" fill="var(--card)" stroke="var(--highlight)" strokeWidth="4" />
        <path
          d="M314 60h12M320 54v12"
          stroke="var(--highlight)"
          strokeWidth="3"
          strokeLinecap="round"
        />
      </g>

      <rect x="230" y="150" width="86" height="34" rx="17" fill="var(--card)" opacity="0.92" />
      <text
        x="273"
        y="171"
        textAnchor="middle"
        fontSize="13"
        fontWeight="600"
        fill="var(--foreground)"
        fontFamily="var(--font-heading)"
      >
        지금 여기
      </text>
    </svg>
  )
}
