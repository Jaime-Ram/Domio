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
    const { data } = await supabase
      .from('profiles')
      .select('id')
      .eq('email', email)
      .limit(1)
      .maybeSingle()

    return NextResponse.json({ exists: !!data?.id }, { status: 200 })
  } catch {
    return NextResponse.json({ exists: false }, { status: 200 })
  }
}
