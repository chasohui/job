import type { PrepInput } from '@/lib/mock-analysis'

export interface FieldErrors {
  major?: string
  role?: string
  status?: string
}

const SHORT_MIN = 2
const SHORT_MAX = 50
const STATUS_MIN = 2
const STATUS_MAX = 1000

export function validatePrepInput(input: PrepInput): FieldErrors {
  const errors: FieldErrors = {}

  const major = input.major.trim()
  const role = input.role.trim()
  const status = input.status.trim()

  if (!major) {
    errors.major = '필수 정보를 입력해주세요.'
  } else if (major.length < SHORT_MIN) {
    errors.major = '전공은 2자 이상 입력해주세요.'
  } else if (major.length > SHORT_MAX) {
    errors.major = '전공은 50자 이내로 입력해주세요.'
  }

  if (!role) {
    errors.role = '필수 정보를 입력해주세요.'
  } else if (role.length < SHORT_MIN) {
    errors.role = '희망 직무는 2자 이상 입력해주세요.'
  } else if (role.length > SHORT_MAX) {
    errors.role = '희망 직무는 50자 이내로 입력해주세요.'
  }

  if (!status) {
    errors.status = '필수 정보를 입력해주세요. (준비된 내용이 없다면 "없음"으로 입력해주세요)'
  } else if (status.length < STATUS_MIN) {
    errors.status = '현재 준비 상황은 2자 이상 입력해주세요. (준비한 내용이 없다면 "없음" 입력)'
  } else if (status.length > STATUS_MAX) {
    errors.status = '현재 준비 상황은 1,000자 이내로 입력해주세요.'
  }

  return errors
}

export function isPrepInputValid(input: PrepInput): boolean {
  const errors = validatePrepInput(input)
  return Object.keys(errors).length === 0
}
