import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import crypto from 'crypto'

function hashOtp(code: string): string {
  return crypto.createHash('sha256').update(code).digest('hex')
}

/**
 * POST /api/auth/2fa/email/verify
 * Body: { code: string }
 * Controleer de 6-cijferige code en verwijder gebruikte OTP.
 */
export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Niet geautoriseerd' }, { status: 401 })
  }

  let body: { code?: string }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Ongeldige body' }, { status: 400 })
  }
  const code = typeof body?.code === 'string' ? body.code.replace(/\s/g, '') : ''
  if (code.length !== 6 || !/^\d{6}$/.test(code)) {
    return NextResponse.json({ error: 'Voer een geldige 6-cijferige code in' }, { status: 400 })
  }

  const codeHash = hashOtp(code)

  const { data, error: fetchError } = await supabase
    .from('email_otp')
    .select('id')
    .eq('user_id', user.id)
    .eq('code_hash', codeHash)
    .gt('expires_at', new Date().toISOString())

  const rows = (data ?? null) as { id: string }[] | null
  if (fetchError || !rows?.length) {
    return NextResponse.json({ error: 'Code ongeldig of verlopen' }, { status: 400 })
  }

  await supabase.from('email_otp').delete().eq('id', rows[0].id)

  return NextResponse.json({ ok: true })
}
