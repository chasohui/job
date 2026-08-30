import type { PrepInput } from '@/lib/mock-analysis'

const STORAGE_KEY = 'career-map:checklist:v1'

type ChecklistStore = Record<string, Record<number, boolean>>

export function getChecklistStorageKey(input: PrepInput): string {
  return `${input.major.trim()}|${input.role.trim()}`
}

function readStore(): ChecklistStore {
  try {
    if (typeof localStorage === 'undefined') return {}
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return {}
    const parsed = JSON.parse(raw)
    return parsed && typeof parsed === 'object' ? parsed : {}
  } catch {
    return {}
  }
}

function writeStore(store: ChecklistStore) {
  try {
    if (typeof localStorage === 'undefined') return
    localStorage.setItem(STORAGE_KEY, JSON.stringify(store))
  } catch {
    // localStorage 사용 불가 환경(프라이빗 모드, 용량 초과 등)에서는 조용히 무시한다.
  }
}

export function loadChecklist(key: string): Record<number, boolean> {
  return readStore()[key] ?? {}
}

export function setChecklistItem(key: string, stepOrder: number, checked: boolean): void {
  const store = readStore()
  store[key] = { ...(store[key] ?? {}), [stepOrder]: checked }
  writeStore(store)
}
