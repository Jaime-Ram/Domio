import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { createServerClient } from '@supabase/ssr'

export async function middleware(request: NextRequest) {
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

  const { data: { session } } = await supabase.auth.getSession()

  const isDashboard = request.nextUrl.pathname.startsWith('/dashboard')
  const isDemo = request.cookies.get('domio_demo')?.value === '1'

  if (isDashboard && !session && !isDemo) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  return response
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/login',
    '/registreren',
    '/auth/callback',
  ],
}
