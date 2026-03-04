import { NextResponse } from 'next/server'

/**
 * GET /api/auth/check-connection
 * Controleert of Supabase bereikbaar is (voor debug bij inlogproblemen).
 * Roep aan vanuit browser of met curl om te zien waar het misgaat.
 */
export async function GET() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!url || !key) {
    return NextResponse.json(
      {
        ok: false,
        error: 'env_missing',
        message: 'NEXT_PUBLIC_SUPABASE_URL of NEXT_PUBLIC_SUPABASE_ANON_KEY ontbreekt in .env.local',
        hasUrl: !!url,
        hasKey: !!key,
      },
      { status: 500 }
    )
  }

  try {
    const res = await fetch(`${url}/auth/v1/health`, {
      headers: { apikey: key },
    })
    const ok = res.ok
    const status = res.status
    let body: unknown = null
    try {
      body = await res.json()
    } catch {
      body = await res.text()
    }

    return NextResponse.json({
      ok,
      status,
      message: ok
        ? 'Supabase is bereikbaar. Inloggen zou moeten werken.'
        : 'Supabase antwoordt met een fout. Controleer je project (niet gepauzeerd?) en anon key.',
      response: body,
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    return NextResponse.json(
      {
        ok: false,
        error: 'fetch_failed',
        message: 'Geen verbinding met Supabase. Vaak: verkeerde URL, project gepauzeerd, of netwerkprobleem.',
        detail: message,
      },
      { status: 502 }
    )
  }
}
