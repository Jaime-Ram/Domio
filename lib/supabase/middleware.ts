import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  // Check if Supabase environment variables are set
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  // If env vars are missing, skip auth check and allow access
  if (!supabaseUrl || !supabaseAnonKey || 
      supabaseUrl === 'your_supabase_project_url_here' || 
      supabaseAnonKey === 'your_supabase_anon_key_here') {
    console.warn('⚠️ Supabase not configured. Auth middleware disabled.')
    return supabaseResponse
  }

  try {
    const supabase = createServerClient(
      supabaseUrl,
      supabaseAnonKey,
      {
        cookies: {
          get(name: string) {
            return request.cookies.get(name)?.value
          },
          set(name: string, value: string, options: any) {
            request.cookies.set(name, value)
            supabaseResponse = NextResponse.next({
              request,
            })
            supabaseResponse.cookies.set(name, value, options)
          },
          remove(name: string, options: any) {
            request.cookies.delete(name)
            supabaseResponse = NextResponse.next({
              request,
            })
            supabaseResponse.cookies.delete(name)
          },
        },
      }
    )

    // Get user - wrap in try-catch to prevent crashes
    let user = null
    try {
      const { data: { user: authUser }, error: authError } = await supabase.auth.getUser()
      if (!authError && authUser) {
        user = authUser
      }
    } catch (err) {
      // Silently fail - allow request to continue
      console.warn('Auth check failed in middleware:', err)
    }

    // Public paths that don't require authentication
    const publicPaths = [
      '/',
      '/login',
      '/register',
      '/signup',
      '/forgot-password',
      '/reset-password',
      '/auth',
      '/connect/success',
      '/connect/reauth',
      '/success',
      '/cancel',
      '/env-setup',
    ]

    const currentPath = request.nextUrl.pathname
    const isPublicPath = publicPaths.some(path => currentPath.startsWith(path))
    
    // Only redirect if user is not authenticated and trying to access protected path
    if (!user && !isPublicPath) {
      if (!currentPath.startsWith('/login') && !currentPath.startsWith('/register')) {
        const url = request.nextUrl.clone()
        url.pathname = '/login'
        return NextResponse.redirect(url)
      }
    }

    return supabaseResponse
  } catch (error: any) {
    // If there's any error, log it but don't crash
    console.error('Middleware error:', error?.message || error)
    // Return the response anyway to allow the app to continue
    return supabaseResponse
  }
}
