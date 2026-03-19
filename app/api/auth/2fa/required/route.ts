import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getProfile } from '@/lib/supabase/profile'

/**
 * GET /api/auth/2fa/required
 * Returns whether the current session user must complete email 2FA before using the dashboard.
 */
export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ required: false })
  }
  const profile = await getProfile(user.id)
  return NextResponse.json({ required: Boolean(profile?.mfa_email_enabled) })
}
