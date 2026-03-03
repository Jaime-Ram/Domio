import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

/**
 * POST /api/auth/check-email
 * Controleert of een e-mailadres al geregistreerd is via de profiles-tabel
 * (elke auth user heeft een profiel via handle_new_user trigger).
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
      return NextResponse.json({ exists: false }, { status: 200 })
    }

    // 1. Probeer auth.users via RPC (case-insensitive, meest betrouwbaar)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: rpcExists, error: rpcError } = await (supabase as any).rpc('check_email_exists', { p_email: email })
    if (!rpcError && rpcExists === true) {
      return NextResponse.json({ exists: true }, { status: 200 })
    }

    // 2. Fallback: profiles-tabel (als RPC nog niet in DB staat)
    const { count } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true })
      .ilike('email', email)

    return NextResponse.json({ exists: (count ?? 0) > 0 }, { status: 200 })
  } catch {
    return NextResponse.json({ exists: false }, { status: 200 })
  }
}
