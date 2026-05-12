import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { createServerClient } from '@supabase/ssr'

export async function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl

  // Legacy path redirects: keep old links working.
  if (pathname === '/dashboard/employer' || pathname.startsWith('/dashboard/employer/')) {
    const target = '/dashboard/landlord' + pathname.slice('/dashboard/employer'.length) + search
    return NextResponse.redirect(new URL(target, request.url), 308)
  }
  if (pathname === '/portal' || pathname.startsWith('/portal/')) {
    const target = '/dashboard/tenant' + pathname.slice('/portal'.length) + search
    return NextResponse.redirect(new URL(target, request.url), 308)
  }

  let response = NextResponse.next({
    request: { headers: request.headers },
  })

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    return response
  }

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll()
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) =>
          response.cookies.set(name, value)
        )
      },
    },
  })

  const { data: { user } } = await supabase.auth.getUser()

  const isDashboard = pathname.startsWith('/dashboard')
  const isDemo = request.cookies.get('domio_demo')?.value === '1'

  // Demo volledig gescheiden: bij domio_demo cookie mag men niet naar /dashboard (eigen account)
  if (isDashboard && isDemo) {
    return NextResponse.redirect(new URL('/demo/app', request.url))
  }

  if (isDashboard && !user && !isDemo) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // Role-based routing for authenticated dashboard users.
  if (isDashboard && user && !isDemo) {
    const { data: aal } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel()
    if (aal?.nextLevel === 'aal2' && aal.nextLevel !== aal.currentLevel) {
      return NextResponse.redirect(new URL('/login', request.url))
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single<{ role: 'verhuurder' | 'huurder' | 'admin' | null }>()

    const role = profile?.role ?? null
    const tenantHome = '/dashboard/tenant'
    const landlordHome = '/dashboard/landlord'

    if (pathname === '/dashboard' || pathname === '/dashboard/') {
      if (!role) return NextResponse.redirect(new URL('/onboarding', request.url))
      return NextResponse.redirect(new URL(role === 'huurder' ? tenantHome : landlordHome, request.url))
    }

    if (role === 'huurder' && pathname.startsWith('/dashboard/landlord')) {
      return NextResponse.redirect(new URL(tenantHome, request.url))
    }
    if (role && role !== 'huurder' && pathname.startsWith('/dashboard/tenant')) {
      return NextResponse.redirect(new URL(landlordHome, request.url))
    }
  }

  return response
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/portal/:path*',
    '/login',
    '/registreren',
    '/auth/callback',
  ],
}
