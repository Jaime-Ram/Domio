import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { translateAuthError } from '@/lib/auth-errors'

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const next = requestUrl.searchParams.get('next')

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)

    if (error) {
      const msg = translateAuthError(error.message)
      return NextResponse.redirect(new URL(`/login?error=${encodeURIComponent(msg)}`, requestUrl.origin))
    }

    // Bepaal redirect op basis van rol in user metadata
    if (!next) {
      const { data: { user } } = await supabase.auth.getUser()
      const role = user?.user_metadata?.role as string | undefined
      const destination = role === 'huurder' ? '/portal' : '/dashboard/employer'
      const res = NextResponse.redirect(new URL(destination, requestUrl.origin))
      res.cookies.set('domio_demo', '', { path: '/', maxAge: 0 })
      return res
    }
  }

  const destination = next ?? '/dashboard/employer'
  const redirectUrl = new URL(destination, request.url)
  const res = NextResponse.redirect(redirectUrl)
  res.cookies.set('domio_demo', '', { path: '/', maxAge: 0 })
  return res
}
