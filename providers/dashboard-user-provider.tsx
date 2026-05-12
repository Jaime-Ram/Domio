'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { User } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase/client'
import { getUser } from '@/lib/supabase/auth'
import { getProfile, type Profile } from '@/lib/supabase/profile'
import { currentUser } from '@/lib/mock-data/domio-dashboard'

function isDemoMode(): boolean {
  if (typeof document === 'undefined') return false
  return document.cookie.includes('domio_demo=1')
}

function getDemoUser(): User {
  return {
    id: 'demo-user-id',
    email: currentUser.email,
    app_metadata: {},
    user_metadata: {},
    aud: 'authenticated',
    created_at: new Date().toISOString(),
  } as User
}

function getDemoProfile(): Profile {
  return {
    id: 'demo-user-id',
    email: currentUser.email,
    full_name: currentUser.name,
    role: 'verhuurder',
    phone: null,
    company_name: null,
    kvk_number: null,
    btw_number: null,
    company_address: null,
    company_postal_code: null,
    company_city: null,
    company_email: null,
    company_phone: null,
    company_logo_url: null,
    avatar_url: null,
    language: 'nl',
    notification_prefs: { email: true, push: false, in_app: true, new_payment: true, payment_overdue: true, maintenance_request: true, document_expiring: true },
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }
}

interface DashboardUserContextValue {
  user: User | null
  profile: Profile | null
  loading: boolean
  isDemo: boolean
  /** Base path voor links: /demo/app in demo, /dashboard/landlord anders */
  basePath: string
  refetch: () => Promise<void>
}

export const DashboardUserContext = createContext<DashboardUserContextValue>({
  user: null,
  profile: null,
  loading: true,
  isDemo: false,
  basePath: '/dashboard/landlord',
  refetch: async () => {},
})

export function useDashboardUser() {
  const ctx = useContext(DashboardUserContext)
  if (!ctx) {
    throw new Error('useDashboardUser must be used within DashboardUserProvider')
  }
  return ctx
}

export function DashboardUserProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [isDemo, setIsDemo] = useState(false)

  const fetchUserAndProfile = async () => {
    const { user: u } = await getUser()

    if (isDemoMode()) {
      setUser(getDemoUser())
      setProfile(getDemoProfile())
      setIsDemo(true)
      setLoading(false)
      return
    }

    if (u) {
      setUser(u)
      setIsDemo(false)
      const p = await getProfile(u.id)
      setProfile(p)
      setLoading(false)
      return
    }

    setUser(null)
    setProfile(null)
    setLoading(false)
  }

  useEffect(() => {
    fetchUserAndProfile()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
      fetchUserAndProfile()
    })

    return () => subscription.unsubscribe()
  }, [])

  const basePath = isDemo
    ? '/demo/app'
    : profile?.role === 'huurder'
      ? '/dashboard/tenant'
      : '/dashboard/landlord'

  return (
    <DashboardUserContext.Provider
      value={{
        user,
        profile,
        loading,
        isDemo,
        basePath,
        refetch: fetchUserAndProfile,
      }}
    >
      {children}
    </DashboardUserContext.Provider>
  )
}
