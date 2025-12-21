import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { type NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const next = requestUrl.searchParams.get('next') ?? '/dashboard'

  if (code) {
    const supabase = await createClient()
    const { data, error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (error) {
      console.error('OAuth callback error:', error)
      return NextResponse.redirect(new URL(`/login?error=${encodeURIComponent(error.message)}`, request.url))
    }

    // Create profile for OAuth users if it doesn't exist
    if (data.user) {
      try {
        const { data: existingProfile } = await supabase
          .from('user_profiles')
          .select('id')
          .eq('id', data.user.id)
          .single()

        if (!existingProfile) {
          // Create profile for OAuth user
          const { error: profileError } = await supabase
            .from('user_profiles')
            .upsert({
              id: data.user.id,
              email: data.user.email || '',
              full_name: data.user.user_metadata?.full_name || data.user.user_metadata?.name || data.user.email?.split('@')[0] || 'User',
              role: data.user.user_metadata?.role || 'employee',
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            }, {
              onConflict: 'id'
            })

          if (profileError) {
            console.error('Error creating OAuth profile:', profileError)
            // Continue anyway - user can update profile later
          }
        }

        // Fetch user profile to determine role and redirect to correct dashboard
        try {
          const { data: profile } = await supabase
            .from('user_profiles')
            .select('role')
            .eq('id', data.user.id)
            .single()
          
          if (profile?.role === 'employer') {
            return NextResponse.redirect(new URL('/dashboard/employer', request.url))
          } else if (profile?.role === 'employee') {
            return NextResponse.redirect(new URL('/dashboard/employee', request.url))
          }
        } catch (err) {
          console.error('Error fetching profile in OAuth callback:', err)
        }
        
        // Fallback to generic dashboard
        return NextResponse.redirect(new URL('/dashboard', request.url))
      } catch (err) {
        console.error('Error in OAuth callback:', err)
        // Still redirect to dashboard even if profile creation fails
        return NextResponse.redirect(new URL('/dashboard', request.url))
      }
    }
  }

  // Redirect to home page or the specified next URL
  return NextResponse.redirect(new URL(next, request.url))
}

