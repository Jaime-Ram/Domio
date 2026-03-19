import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getProfile } from '@/lib/supabase/profile'
import crypto from 'crypto'

const OTP_LENGTH = 6
const OTP_EXPIRY_MINUTES = 10

function generateOtp(): string {
  const digits = '0123456789'
  let code = ''
  for (let i = 0; i < OTP_LENGTH; i++) {
    code += digits[Math.floor(Math.random() * digits.length)]
  }
  return code
}

function hashOtp(code: string): string {
  return crypto.createHash('sha256').update(code).digest('hex')
}

async function sendOtpEmail(to: string, code: string): Promise<{ error?: string }> {
  const apiKey = process.env.RESEND_API_KEY
  const fromEmail = process.env.RESEND_FROM_EMAIL || 'Domio <onboarding@resend.dev>'
  if (!apiKey) {
    console.warn('RESEND_API_KEY not set – 2FA code not sent. Code (dev only):', code)
    return {}
  }
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: fromEmail,
      to: [to],
      subject: 'Je inlogcode voor Domio',
      html: `
        <p>Je verificatiecode voor twee-stapsverificatie is:</p>
        <p style="font-size:24px;font-weight:bold;letter-spacing:4px;">${code}</p>
        <p>Deze code is ${OTP_EXPIRY_MINUTES} minuten geldig.</p>
        <p>Als je dit niet hebt aangevraagd, negeer deze e-mail.</p>
        <p>— Het Domio Team</p>
      `,
    }),
  })
  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    return { error: body.message || 'E-mail verzenden mislukt' }
  }
  return {}
}

/**
 * POST /api/auth/2fa/email/send
 * Verstuur een 6-cijferige OTP naar het e-mailadres van de ingelogde gebruiker.
 */
export async function POST() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user?.email) {
    return NextResponse.json({ error: 'Niet geautoriseerd' }, { status: 401 })
  }

  const profile = await getProfile(user.id)
  if (!profile?.mfa_email_enabled) {
    return NextResponse.json({ error: '2FA per e-mail is niet ingeschakeld voor dit account' }, { status: 400 })
  }

  await supabase.from('email_otp').delete().eq('user_id', user.id)

  const code = generateOtp()
  const codeHash = hashOtp(code)
  const expiresAt = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000).toISOString()

  const { error: insertError } = await supabase
    .from('email_otp')
    // @ts-expect-error Supabase client may not include email_otp in generated types
    .insert({ user_id: user.id, code_hash: codeHash, expires_at: expiresAt })

  if (insertError) {
    return NextResponse.json({ error: insertError.message || 'Code opslaan mislukt' }, { status: 500 })
  }

  const { error: sendError } = await sendOtpEmail(user.email, code)
  if (sendError) {
    return NextResponse.json({ error: sendError }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
