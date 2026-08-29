/**
 * In-memory sliding-window rate limiter.
 *
 * Limitation: state lives per function instance, so limits are not shared
 * across concurrent Vercel instances/regions. This is a first line of
 * defense against casual abuse, not a hard cap — for a strict global limit,
 * back this with a shared store (e.g. Upstash Redis via Vercel Marketplace).
 */

const WINDOW_MS = 60_000
const MAX_REQUESTS = 10

const hits = new Map<string, number[]>()

// Periodically drop stale keys so the map doesn't grow unbounded.
let lastSweep = Date.now()
function sweep(now: number) {
  if (now - lastSweep < WINDOW_MS) return
  lastSweep = now
  for (const [key, timestamps] of hits) {
    const fresh = timestamps.filter((t) => now - t < WINDOW_MS)
    if (fresh.length === 0) hits.delete(key)
    else hits.set(key, fresh)
  }
}

export function isRateLimited(key: string): boolean {
  const now = Date.now()
  sweep(now)

  const timestamps = (hits.get(key) ?? []).filter((t) => now - t < WINDOW_MS)
  if (timestamps.length >= MAX_REQUESTS) {
    hits.set(key, timestamps)
    return true
  }

  timestamps.push(now)
  hits.set(key, timestamps)
  return false
}

export function getClientKey(request: Request): string {
  const forwardedFor = request.headers.get('x-forwarded-for')
  if (forwardedFor) return forwardedFor.split(',')[0].trim()
  return request.headers.get('x-real-ip') ?? 'unknown'
}
