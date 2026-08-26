import type { PrepInput } from '@/lib/mock-analysis'

export interface FieldErrors {
  major?: string
  role?: string
  status?: string
}

const SHORT_MIN = 2
const SHORT_MAX = 50
const LONG_MIN = 10
const LONG_MAX = 1000

export function validatePrepInput(input: PrepInput): FieldErrors {
  const errors: FieldErrors = {}

  const major = input.major.trim()
  const role = input.role.trim()
  const status = input.status.trim()

  if (!major) {
    errors.major = '입력 내용을 작성해주세요.'
  } else if (major.length < SHORT_MIN) {
    errors.major = '전공은 2자 이상 입력해주세요.'
  } else if (major.length > SHORT_MAX) {
    errors.major = '전공은 50자 이내로 입력해주세요.'
  }

  if (!role) {
    errors.role = '입력 내용을 작성해주세요.'
  } else if (role.length < SHORT_MIN) {
    errors.role = '희망 직무는 2자 이상 입력해주세요.'
  } else if (role.length > SHORT_MAX) {
    errors.role = '희망 직무는 50자 이내로 입력해주세요.'
  }

  if (!status) {
    errors.status = '입력 내용을 작성해주세요.'
  } else if (status.length < LONG_MIN) {
    errors.status = '준비 현황은 10자 이상 입력해주세요.'
  } else if (status.length > LONG_MAX) {
    errors.status = '준비 현황은 1,000자 이내로 입력해주세요.'
  }

  return errors
}

export function isPrepInputValid(input: PrepInput): boolean {
  const errors = validatePrepInput(input)
  return Object.keys(errors).length === 0
}
