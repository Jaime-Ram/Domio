import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'

/**
 * Lichtgewicht rate limiter (sliding window, in-memory).
 *
 * LET OP: op Vercel serverless/Edge geldt deze store PER warme instance, niet
 * globaal. Dat is bewust een stopgap. Zet later UPSTASH_REDIS_REST_URL +
 * UPSTASH_REDIS_REST_TOKEN en vervang `rateLimit()` door een Upstash sliding
 * window (1 plek aanpassen) voor een echte distributed limiter.
 *
 * Edge-compatibel: gebruikt alleen Map + Date.now(), geen Node-API's.
 */

type Bucket = { count: number; resetAt: number }

const store = new Map<string, Bucket>()

// Periodieke opschoning zodat de Map niet oneindig groeit.
let lastSweep = 0
function sweep(now: number) {
  if (now - lastSweep < 60_000) return
  lastSweep = now
  for (const [k, b] of store) {
    if (b.resetAt <= now) store.delete(k)
  }
}

export interface RateLimitResult {
  ok: boolean
  limit: number
  remaining: number
  retryAfter: number // seconden tot reset
}

export function rateLimit(key: string, limit: number, windowMs: number): RateLimitResult {
  const now = Date.now()
  sweep(now)

  const existing = store.get(key)
  if (!existing || existing.resetAt <= now) {
    store.set(key, { count: 1, resetAt: now + windowMs })
    return { ok: true, limit, remaining: limit - 1, retryAfter: 0 }
  }

  existing.count++
  if (existing.count > limit) {
    return { ok: false, limit, remaining: 0, retryAfter: Math.ceil((existing.resetAt - now) / 1000) }
  }
  return { ok: true, limit, remaining: limit - existing.count, retryAfter: 0 }
}

/** Client-IP uit standaard proxy-headers (Vercel zet x-forwarded-for). */
export function clientIp(req: NextRequest): string {
  const fwd = req.headers.get('x-forwarded-for')
  if (fwd) return fwd.split(',')[0]!.trim()
  return req.headers.get('x-real-ip') ?? 'unknown'
}

export interface RateLimitOptions {
  /** Unieke naam/scope zodat verschillende routes los tellen. */
  name: string
  limit: number
  windowMs: number
}

/**
 * Roep aan bovenin een route handler (of in middleware).
 * Geeft een 429-NextResponse terug als de limiet overschreden is, anders null.
 */
export function checkRateLimit(req: NextRequest, opts: RateLimitOptions): NextResponse | null {
  const key = `${opts.name}:${clientIp(req)}`
  const r = rateLimit(key, opts.limit, opts.windowMs)
  if (r.ok) return null

  return NextResponse.json(
    { error: 'Te veel verzoeken. Probeer het later opnieuw.' },
    {
      status: 429,
      headers: {
        'Retry-After': String(r.retryAfter),
        'X-RateLimit-Limit': String(r.limit),
        'X-RateLimit-Remaining': '0',
      },
    },
  )
}

// Presets
/** Authenticatie-acties: 5 pogingen per 15 minuten. */
export const RL_AUTH = { limit: 5, windowMs: 15 * 60_000 }
/** Publieke/ongeauthenticeerde proxy-routes: 30 per minuut. */
export const RL_PUBLIC = { limit: 30, windowMs: 60_000 }
/** Algemene API-routes: 60 per minuut. */
export const RL_DEFAULT = { limit: 60, windowMs: 60_000 }
