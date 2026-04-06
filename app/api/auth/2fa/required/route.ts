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
  const method = profile?.mfa_method ?? 'none'
  return NextResponse.json({ required: method !== 'none', method })
}
