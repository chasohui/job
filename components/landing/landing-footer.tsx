export function LandingFooter() {
  return (
    <footer className="border-t border-border/70 bg-background py-10">
      <div className="mx-auto flex w-full max-w-[1200px] flex-col items-center gap-2 px-4 text-center sm:px-6 lg:px-12">
        <span className="font-heading text-base font-bold text-primary">
          Career Map
        </span>
        <p className="text-xs text-muted-foreground">
          © 2026 Career Map. AI 분석 결과는 참고용이며 실제 채용 결과를 보장하지 않습니다.
        </p>
      </div>
    </footer>
  )
}
