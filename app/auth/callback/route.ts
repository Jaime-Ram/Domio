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

    if (!next) {
      const { data: { user } } = await supabase.auth.getUser()
      const role = user?.user_metadata?.role as string | undefined
      const fromRegistration = request.cookies.get('domio_from')?.value === 'registreren'

      const clearCookies = (res: NextResponse) => {
        res.cookies.set('domio_from', '', { path: '/', maxAge: 0 })
        res.cookies.set('domio_demo', '', { path: '/', maxAge: 0 })
        return res
      }

      if (!role && fromRegistration) {
        // Nieuw account via registratiepagina → onboarding voor rolkeuze
        return clearCookies(NextResponse.redirect(new URL('/onboarding', requestUrl.origin)))
      }

      if (!role && !fromRegistration) {
        // Inlogpoging met onbekend account → bevestigingspagina
        return clearCookies(NextResponse.redirect(new URL('/auth/bevestig', requestUrl.origin)))
      }

      if (role && fromRegistration) {
        // Bestaand account probeerde te registreren → uitloggen + melding
        await supabase.auth.signOut()
        return clearCookies(NextResponse.redirect(new URL('/registreren?exists=1', requestUrl.origin)))
      }

      // Bestaand account logt normaal in
      const destination = role === 'huurder' ? '/dashboard/tenant' : '/dashboard/landlord'
      return clearCookies(NextResponse.redirect(new URL(destination, requestUrl.origin)))
    }
  }

  const destination = next ?? '/dashboard/landlord'
  const res = NextResponse.redirect(new URL(destination, request.url))
  res.cookies.set('domio_from', '', { path: '/', maxAge: 0 })
  res.cookies.set('domio_demo', '', { path: '/', maxAge: 0 })
  return res
}
