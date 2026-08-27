'use client'

import { ArrowRightIcon, SparklesIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from '@/components/ui/field'
import type { FieldErrors } from '@/lib/validation'
import { EXAMPLE_INPUT, type PrepInput } from '@/lib/mock-analysis'

interface InputStepProps {
  value: PrepInput
  errors: FieldErrors
  onChange: (field: keyof PrepInput, next: string) => void
  onSubmit: () => void
  onFillExample: () => void
}

export function InputStep({
  value,
  errors,
  onChange,
  onSubmit,
  onFillExample,
}: InputStepProps) {
  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-10 px-4 pt-10 pb-20 sm:px-6 sm:pt-16">
      <div className="animate-in fade-in slide-in-from-bottom-3 flex flex-col gap-4 duration-500">
        <span className="inline-flex w-fit items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
          <SparklesIcon className="size-3.5" strokeWidth={2.5} />
          취업 준비 방향 진단
        </span>
        <h1 className="font-heading text-3xl leading-[1.2] font-bold tracking-tight text-balance text-foreground sm:text-4xl">
          내 직무 준비,
          <br />
          지금 무엇부터 해야 할까요?
        </h1>
        <p className="text-pretty text-base leading-relaxed text-muted-foreground">
          전공과 희망 직무, 현재 준비 상황을 입력하면
          <br className="hidden sm:block" />
          지금 필요한 역량과 준비 순서를 정리해드려요.
        </p>
      </div>

      <div className="animate-in fade-in slide-in-from-bottom-3 rounded-2xl bg-card p-5 ring-1 ring-foreground/10 duration-700 sm:p-8">
        <FieldGroup>
          <Field data-invalid={!!errors.major}>
            <FieldLabel htmlFor="major">전공</FieldLabel>
            <Input
              id="major"
              placeholder="전공을 입력하세요 (예: 경영학과)"
              value={value.major}
              maxLength={80}
              aria-invalid={!!errors.major}
              onChange={(event) => onChange('major', event.target.value)}
            />
            {errors.major && <FieldError>{errors.major}</FieldError>}
          </Field>

          <Field data-invalid={!!errors.role}>
            <FieldLabel htmlFor="role">희망 직무</FieldLabel>
            <Input
              id="role"
              placeholder="희망 직무를 입력하세요 (예: 서비스 기획자)"
              value={value.role}
              maxLength={80}
              aria-invalid={!!errors.role}
              onChange={(event) => onChange('role', event.target.value)}
            />
            {errors.role && <FieldError>{errors.role}</FieldError>}
          </Field>

          <Field data-invalid={!!errors.status}>
            <FieldLabel htmlFor="status">현재 준비 상황</FieldLabel>
            <Textarea
              id="status"
              placeholder="현재까지 준비한 내용을 입력하세요 (예: 관련 프로젝트 1회 경험, 자격증 취득 등 / 준비한 내용이 없다면 '없음' 입력)"
              value={value.status}
              maxLength={1000}
              className="min-h-32 resize-none"
              aria-invalid={!!errors.status}
              onChange={(event) => onChange('status', event.target.value)}
            />
            <div className="flex items-center justify-between gap-3">
              {errors.status ? (
                <FieldError>{errors.status}</FieldError>
              ) : (
                <FieldDescription>
                  경험, 학습 내용, 자격증 등을 2자 이상 적어주세요. 아직 준비한 내용이 없다면 <strong>'없음'</strong>이라고 적어주셔도 좋아요.
                </FieldDescription>
              )}
              <span className="shrink-0 text-xs tabular-nums text-muted-foreground">
                {value.status.trim().length}/1,000자
              </span>
            </div>
          </Field>
        </FieldGroup>

        <Button
          size="lg"
          onClick={onSubmit}
          className="mt-7 h-12 w-full text-[15px] font-semibold"
        >
          다음 (내 준비 순서 확인하기)
          <ArrowRightIcon data-icon="inline-end" />
        </Button>

        <button
          type="button"
          onClick={onFillExample}
          className="mx-auto mt-4 block text-xs font-medium text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
        >
          예시로 빠르게 체험해보기 ({EXAMPLE_INPUT.role})
        </button>
      </div>
    </div>
  )
}
