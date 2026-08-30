import { afterEach, describe, expect, it, vi } from 'vitest'
import { getChecklistStorageKey, loadChecklist, setChecklistItem } from './checklist-storage'

function createMemoryStorage(): Storage {
  const store = new Map<string, string>()
  return {
    getItem: (key: string) => store.get(key) ?? null,
    setItem: (key: string, value: string) => {
      store.set(key, value)
    },
    removeItem: (key: string) => {
      store.delete(key)
    },
    clear: () => store.clear(),
    key: (index: number) => Array.from(store.keys())[index] ?? null,
    get length() {
      return store.size
    },
  } as Storage
}

describe('getChecklistStorageKey', () => {
  it('전공과 직무를 트림해 조합한 키를 생성한다', () => {
    expect(
      getChecklistStorageKey({ major: ' 경영학과 ', role: ' 서비스 기획자 ', status: '' })
    ).toBe('경영학과|서비스 기획자')
  })
})

describe('loadChecklist / setChecklistItem', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('저장한 값이 없으면 빈 객체를 반환한다', () => {
    vi.stubGlobal('localStorage', createMemoryStorage())
    expect(loadChecklist('major|role')).toEqual({})
  })

  it('체크 상태를 저장하고 다시 불러올 수 있다', () => {
    vi.stubGlobal('localStorage', createMemoryStorage())
    setChecklistItem('major|role', 1, true)
    expect(loadChecklist('major|role')).toEqual({ 1: true })

    setChecklistItem('major|role', 2, true)
    expect(loadChecklist('major|role')).toEqual({ 1: true, 2: true })

    setChecklistItem('major|role', 1, false)
    expect(loadChecklist('major|role')).toEqual({ 1: false, 2: true })
  })

  it('다른 키(전공/직무 조합)는 서로 영향을 주지 않는다', () => {
    vi.stubGlobal('localStorage', createMemoryStorage())
    setChecklistItem('a|b', 1, true)
    setChecklistItem('c|d', 1, false)
    expect(loadChecklist('a|b')).toEqual({ 1: true })
    expect(loadChecklist('c|d')).toEqual({ 1: false })
  })

  it('localStorage를 사용할 수 없는 환경에서도 에러 없이 빈 값을 반환한다', () => {
    vi.stubGlobal('localStorage', undefined)
    expect(loadChecklist('major|role')).toEqual({})
    expect(() => setChecklistItem('major|role', 1, true)).not.toThrow()
  })
})
