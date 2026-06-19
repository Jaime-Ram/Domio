import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'
import { z, type ZodType } from 'zod'

/**
 * Veilige JSON-body parsing voor route handlers.
 *
 * Doet in volgorde:
 *  1. Content-Length cap        -> 413 als header te groot is
 *  2. Harde byte-cap op de body -> 413 (Content-Length kan liegen)
 *  3. JSON.parse                 -> 400 bij malformed JSON
 *  4. zod schema-validatie       -> 400 met issues bij ongeldige invoer
 *
 * Gebruik:
 *   const parsed = await readJson(req, schema)
 *   if (!parsed.ok) return parsed.response
 *   const { email } = parsed.data
 */

const DEFAULT_MAX_BYTES = 100_000 // 100 KB; ruim voor JSON, blokkeert misbruik

export type ParseResult<T> =
  | { ok: true; data: T }
  | { ok: false; response: NextResponse }

function reject(message: string, status: number): { ok: false; response: NextResponse } {
  return { ok: false, response: NextResponse.json({ error: message }, { status }) }
}

export async function readJson<T>(
  req: NextRequest,
  schema: ZodType<T>,
  opts: { maxBytes?: number } = {},
): Promise<ParseResult<T>> {
  const maxBytes = opts.maxBytes ?? DEFAULT_MAX_BYTES

  // 1. Snelle reject op basis van Content-Length (voordat we de body lezen).
  const declared = Number(req.headers.get('content-length') ?? '0')
  if (Number.isFinite(declared) && declared > maxBytes) {
    return reject('Payload te groot', 413)
  }

  // 2. Body als tekst lezen, met harde cap (Content-Length is niet te vertrouwen).
  let raw: string
  try {
    raw = await req.text()
  } catch {
    return reject('Body kon niet gelezen worden', 400)
  }
  // byte-lengte, niet char-lengte
  if (new TextEncoder().encode(raw).length > maxBytes) {
    return reject('Payload te groot', 413)
  }

  // 3. JSON parsen.
  let json: unknown
  try {
    json = raw.trim() ? JSON.parse(raw) : {}
  } catch {
    return reject('Ongeldige JSON', 400)
  }

  // 4. Schema-validatie.
  const result = schema.safeParse(json)
  if (!result.success) {
    return {
      ok: false,
      response: NextResponse.json(
        {
          error: 'Ongeldige invoer',
          issues: result.error.issues.map((i) => ({
            path: i.path.join('.'),
            message: i.message,
          })),
        },
        { status: 400 },
      ),
    }
  }

  return { ok: true, data: result.data }
}

/** Valideer en parse query-parameters tegen een zod schema. */
export function readQuery<T>(req: NextRequest, schema: ZodType<T>): ParseResult<T> {
  const obj = Object.fromEntries(req.nextUrl.searchParams.entries())
  const result = schema.safeParse(obj)
  if (!result.success) {
    return {
      ok: false,
      response: NextResponse.json(
        {
          error: 'Ongeldige parameters',
          issues: result.error.issues.map((i) => ({ path: i.path.join('.'), message: i.message })),
        },
        { status: 400 },
      ),
    }
  }
  return { ok: true, data: result.data }
}

// ---- Herbruikbare schema-bouwstenen ----

/** Genormaliseerd e-mailadres (getrimd, lowercase, max 254). */
export const zEmail = z.string().trim().toLowerCase().min(3).max(254).email()
/** UUID v4 zoals Supabase die gebruikt. */
export const zUuid = z.string().uuid()
/** Niet-lege, getrimde string met maximumlengte. */
export const zText = (max = 500) => z.string().trim().min(1).max(max)
/** Optionele getrimde string met maximumlengte. */
export const zTextOptional = (max = 500) => z.string().trim().max(max).optional()
/** Numerieke string (bv. BAG pandId) — alleen cijfers. */
export const zDigits = (max = 32) => z.string().regex(/^\d+$/, 'Alleen cijfers toegestaan').max(max)
