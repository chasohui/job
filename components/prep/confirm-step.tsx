'use client'

import { ArrowLeftIcon, ArrowRightIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import type { PrepInput } from '@/lib/mock-analysis'

interface ConfirmStepProps {
  value: PrepInput
  onEdit: () => void
  onConfirm: () => void
}

const ROWS: { key: keyof PrepInput; label: string }[] = [
  { key: 'major', label: '전공' },
  { key: 'role', label: '희망 직무' },
  { key: 'status', label: '현재 준비 상황' },
]

export function ConfirmStep({ value, onEdit, onConfirm }: ConfirmStepProps) {
  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-8 px-4 pt-10 pb-20 sm:px-6 sm:pt-16">
      <div className="animate-in fade-in slide-in-from-bottom-3 flex flex-col gap-2 duration-500">
        <h1 className="font-heading text-2xl font-bold tracking-tight text-foreground sm:text-[28px]">
          입력한 내용을 확인해주세요
        </h1>
        <p className="text-sm leading-relaxed text-muted-foreground">
          내용이 맞다면 분석을 시작할게요. 수정이 필요하면 언제든 돌아갈 수 있어요.
        </p>
      </div>

      <div className="animate-in fade-in slide-in-from-bottom-3 flex flex-col rounded-2xl bg-card p-6 ring-1 ring-foreground/10 duration-700 sm:p-8">
        {ROWS.map((row, index) => (
          <div key={row.key}>
            {index > 0 && <Separator className="my-5" />}
            <div className="flex flex-col gap-1.5">
              <span className="text-xs font-semibold text-muted-foreground">
                {row.label}
              </span>
              <p className="text-[15px] leading-relaxed whitespace-pre-wrap text-foreground">
                {value[row.key]}
              </p>
            </div>
          </div>
        ))}
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <Button
          variant="outline"
          size="lg"
          onClick={onEdit}
          className="h-12 text-[15px] font-semibold sm:order-1 sm:flex-1"
        >
          <ArrowLeftIcon data-icon="inline-start" />
          수정하기
        </Button>
        <Button
          size="lg"
          onClick={onConfirm}
          className="h-12 text-[15px] font-semibold sm:order-2 sm:flex-[2]"
        >
          분석 시작하기
          <ArrowRightIcon data-icon="inline-end" />
        </Button>
      </div>
    </div>
  )
}
