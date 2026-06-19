import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { checkRateLimit, RL_AUTH, RL_DEFAULT } from '@/lib/rate-limit'

const LANDLORD_BASE = '/dashboard/landlord'
const SUBSCRIPTION_EXEMPT = [
  `${LANDLORD_BASE}/upgrade`,
  `${LANDLORD_BASE}/settings`,
]

// Auth-acties die brute-force/spam-gevoelig zijn: 5 pogingen per 15 min.
// Read-only status-routes (check-connection, 2fa/required) vallen hier bewust
// NIET onder, anders breken normale page-loads.
const STRICT_AUTH_PREFIXES = [
  '/api/auth/check-email',
  '/api/auth/2fa/email/send',
  '/api/auth/2fa/email/verify',
  '/api/auth/delete-account',
  '/api/invitations/accept',
  '/api/invitations/send',
]

function isSubscriptionExempt(pathname: string): boolean {
  return SUBSCRIPTION_EXEMPT.some(p => pathname === p || pathname.startsWith(p + '/'))
}

/**
 * Rate limiting voor alle /api-routes. Webhooks, crons en externe OAuth-
 * callbacks worden overgeslagen: die zijn al beveiligd via signature/secret en
 * worden extern automatisch herhaald (rate-limiten zou ze breken).
 */
function rateLimitApi(request: NextRequest, pathname: string): NextResponse | null {
  if (pathname.endsWith('/webhook') || pathname.endsWith('/callback') || pathname.startsWith('/api/cron')) {
    return null
  }
  const isStrictAuth = STRICT_AUTH_PREFIXES.some((p) => pathname.startsWith(p))
  const preset = isStrictAuth ? RL_AUTH : RL_DEFAULT
  return checkRateLimit(request, { name: `api:${pathname}`, ...preset })
}

export async function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl

  // API-routes: alleen rate limiting, daarna doorlaten (auth doen ze zelf).
  if (pathname.startsWith('/api')) {
    return rateLimitApi(request, pathname) ?? NextResponse.next()
  }

  // Legacy path redirects: keep old links working.
  if (pathname === '/dashboard/employer' || pathname.startsWith('/dashboard/employer/')) {
    const target = '/dashboard/landlord' + pathname.slice('/dashboard/employer'.length) + search
    return NextResponse.redirect(new URL(target, request.url), 308)
  }
  // LET OP: NIET de hele /portal/* afvangen — /portal/<token> en
  // /portal/<token>/accept zijn de PUBLIEKE uitnodigings-acceptatieflow en
  // moeten gewoon geserveerd worden (zonder login). Alleen de oude
  // tenant-portal secties verhuizen we naar het nieuwe dashboard.
  const LEGACY_PORTAL_SECTIONS = [
    '/portal',
    '/portal/financial',
    '/portal/tickets',
    '/portal/documents',
    '/portal/settings',
  ]
  if (LEGACY_PORTAL_SECTIONS.includes(pathname)) {
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

  if (isDashboard && !user) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // Role-based routing for authenticated dashboard users.
  if (isDashboard && user) {
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

    // Subscription gate: only for landlord dashboard
    if (pathname.startsWith(LANDLORD_BASE) && role !== 'huurder' && !isSubscriptionExempt(pathname)) {
      const { data: sub } = await supabase
        .from('subscriptions')
        .select('status, trial_ends_at')
        .eq('user_id', user.id)
        .maybeSingle()

      if (!sub) {
        return NextResponse.redirect(new URL(`${LANDLORD_BASE}/upgrade`, request.url))
      }

      const isActive =
        sub.status === 'active' ||
        (sub.status === 'trialing' && new Date(sub.trial_ends_at) > new Date())

      if (!isActive) {
        return NextResponse.redirect(new URL(`${LANDLORD_BASE}/upgrade`, request.url))
      }
    }
  }

  return response
}

export const config = {
  matcher: [
    '/api/:path*',
    '/dashboard/:path*',
    '/portal/:path*',
    '/login',
    '/registreren',
    '/auth/callback',
  ],
}
