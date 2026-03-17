import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { translateAuthError } from '@/lib/auth-errors'

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const next = requestUrl.searchParams.get('next') ?? '/dashboard/employer'

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)

    if (error) {
      const msg = translateAuthError(error.message)
      return NextResponse.redirect(new URL(`/login?error=${encodeURIComponent(msg)}`, requestUrl.origin))
    }
  }

  const redirectUrl = new URL(next, request.url)
  const res = NextResponse.redirect(redirectUrl)
  // Na inloggen: demo-cookie wissen zodat gebruiker eigen dashboard ziet (incl. documenten uploaden)
  res.cookies.set('domio_demo', '', { path: '/', maxAge: 0 })
  return res
}
