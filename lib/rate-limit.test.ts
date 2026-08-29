import { describe, expect, it } from 'vitest'
import { isRateLimited } from './rate-limit'

function uniqueKey() {
  return `test-${Math.random().toString(36).slice(2)}`
}

describe('isRateLimited', () => {
  it('제한 횟수(10회) 이내 요청은 통과시킨다', () => {
    const key = uniqueKey()
    for (let i = 0; i < 10; i++) {
      expect(isRateLimited(key)).toBe(false)
    }
  })

  it('제한 횟수를 초과하면 차단한다', () => {
    const key = uniqueKey()
    for (let i = 0; i < 10; i++) isRateLimited(key)
    expect(isRateLimited(key)).toBe(true)
  })

  it('서로 다른 키(IP)는 독립적으로 카운트된다', () => {
    const keyA = uniqueKey()
    const keyB = uniqueKey()
    for (let i = 0; i < 10; i++) isRateLimited(keyA)
    expect(isRateLimited(keyA)).toBe(true)
    expect(isRateLimited(keyB)).toBe(false)
  })
})
