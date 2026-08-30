'use client'

import { FlaskConicalIcon } from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
  PopoverHeader,
  PopoverTitle,
  PopoverDescription,
} from '@/components/ui/popover'
import { SCENARIOS, type ScenarioKey } from '@/lib/mock-analysis'

interface ScenarioPreviewProps {
  value: ScenarioKey
  onChange: (value: ScenarioKey) => void
}

export function ScenarioPreview({ value, onChange }: ScenarioPreviewProps) {
  return (
    <div className="print:hidden fixed bottom-4 right-4 z-50 sm:bottom-6 sm:right-6">
      <Popover>
        <PopoverTrigger className="flex size-11 items-center justify-center rounded-full bg-foreground text-background shadow-lg transition-transform hover:scale-105">
          <FlaskConicalIcon className="size-[18px]" strokeWidth={2} />
          <span className="sr-only">디자인 시나리오 미리보기</span>
        </PopoverTrigger>
        <PopoverContent align="end" side="top" className="w-64">
          <PopoverHeader>
            <PopoverTitle>시나리오 미리보기</PopoverTitle>
            <PopoverDescription>
              분석 완료 시 어떤 결과 상태로 이어질지 미리 선택해보세요.
            </PopoverDescription>
          </PopoverHeader>
          <div className="flex flex-col gap-1">
            {SCENARIOS.map((scenario) => (
              <button
                key={scenario.key}
                type="button"
                onClick={() => onChange(scenario.key)}
                className={cn(
                  'rounded-md px-2.5 py-1.5 text-left text-sm transition-colors',
                  value === scenario.key
                    ? 'bg-primary/10 font-medium text-primary'
                    : 'text-foreground hover:bg-muted',
                )}
              >
                {scenario.label}
              </button>
            ))}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  )
}
