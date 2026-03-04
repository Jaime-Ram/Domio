import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

const emailLower = (e: string) => e?.trim().toLowerCase() ?? ''

/**
 * POST /api/auth/check-email
 * Controleert of een e-mailadres al geregistreerd is (auth.users of profiles).
 * Body: { email: string }
 * Response: { exists: boolean }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const email = typeof body?.email === 'string' ? body.email.trim().toLowerCase() : ''
    if (!email || !email.includes('@')) {
      return NextResponse.json({ exists: false }, { status: 200 })
    }

    const supabase = createAdminClient()
    if (!supabase) {
      // SUPABASE_SERVICE_ROLE_KEY ontbreekt in .env.local – voeg toe voor e-mailcheck
      return NextResponse.json({ exists: false }, { status: 200 })
    }

    // 1. RPC auth.users (case-insensitive) – meest betrouwbaar
    try {
      const { data: rpcExists } = await (supabase as unknown as { rpc: (n: string, p: object) => Promise<{ data: boolean | null }> }).rpc('check_email_exists', { p_email: email })
      if (rpcExists === true) return NextResponse.json({ exists: true }, { status: 200 })
    } catch {
      /* RPC niet beschikbaar, ga door naar fallback */
    }

    // 2. Auth Admin API – direct op auth.users
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_SUPABASE_URL}/auth/v1/admin/users?per_page=1000`,
        {
          headers: {
            Authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
            apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '',
          },
        }
      )
      if (res.ok) {
        const data = (await res.json()) as { users?: Array<{ email?: string }> }
        const found = data.users?.some((u) => emailLower(u.email ?? '') === email)
        if (found) return NextResponse.json({ exists: true }, { status: 200 })
      }
    } catch {
      /* Auth API faalt, ga door */
    }

    // 3. Fallback: profiles-tabel
    const { count } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true })
      .ilike('email', email)

    return NextResponse.json({ exists: (count ?? 0) > 0 }, { status: 200 })
  } catch {
    return NextResponse.json({ exists: false }, { status: 200 })
  }
}
