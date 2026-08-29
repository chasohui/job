import { describe, expect, it } from 'vitest'
import { isPrepInputValid, validatePrepInput } from './validation'
import type { PrepInput } from './mock-analysis'

function makeInput(overrides: Partial<PrepInput> = {}): PrepInput {
  return {
    major: '경영학과',
    role: '서비스 기획자',
    status: '없음',
    ...overrides,
  }
}

describe('validatePrepInput', () => {
  it('유효한 입력에는 에러가 없다', () => {
    expect(validatePrepInput(makeInput())).toEqual({})
    expect(isPrepInputValid(makeInput())).toBe(true)
  })

  it('빈 값은 필수 입력 오류를 반환한다 (PRD 5.1)', () => {
    const errors = validatePrepInput(makeInput({ major: '' }))
    expect(errors.major).toBe('필수 정보를 입력해주세요.')
  })

  it('공백만 있는 값도 빈 값으로 취급한다', () => {
    const errors = validatePrepInput(makeInput({ role: '   ' }))
    expect(errors.role).toBe('필수 정보를 입력해주세요.')
  })

  it('2자 미만은 최소 글자 수 오류를 반환한다 (PRD 5.2)', () => {
    expect(validatePrepInput(makeInput({ major: 'A' })).major).toMatch(/2자 이상/)
    expect(validatePrepInput(makeInput({ role: 'A' })).role).toMatch(/2자 이상/)
    expect(validatePrepInput(makeInput({ status: 'A' })).status).toMatch(/2자 이상/)
  })

  it('50자 초과 전공/직무는 최대 글자 수 오류를 반환한다 (PRD 5.3)', () => {
    const errors = validatePrepInput(makeInput({ major: 'A'.repeat(51) }))
    expect(errors.major).toMatch(/50자 이내/)
  })

  it('1000자 초과 준비 상황은 최대 글자 수 오류를 반환한다 (PRD 5.3)', () => {
    const errors = validatePrepInput(makeInput({ status: 'A'.repeat(1001) }))
    expect(errors.status).toMatch(/1,000자 이내/)
  })

  it('경계값 2자, 50자, 1000자는 통과한다', () => {
    const errors = validatePrepInput(
      makeInput({
        major: 'AB',
        role: 'A'.repeat(50),
        status: 'A'.repeat(1000),
      })
    )
    expect(errors).toEqual({})
  })

  it('"없음" 입력은 준비 상황 필드에서 정상 통과한다', () => {
    expect(isPrepInputValid(makeInput({ status: '없음' }))).toBe(true)
  })
})
