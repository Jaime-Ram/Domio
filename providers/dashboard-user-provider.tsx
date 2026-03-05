'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { User } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase/client'
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
    avatar_url: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }
}

interface DashboardUserContextValue {
  user: User | null
  profile: Profile | null
  loading: boolean
  isDemo: boolean
  /** Base path voor links: /demo/app in demo, /dashboard/employer anders */
  basePath: string
  refetch: () => Promise<void>
}

export const DashboardUserContext = createContext<DashboardUserContextValue>({
  user: null,
  profile: null,
  loading: true,
  isDemo: false,
  basePath: '/dashboard/employer',
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
    const { data: { user: u }, error } = await supabase.auth.getUser()

    if (isDemoMode()) {
      setUser(getDemoUser())
      setProfile(getDemoProfile())
      setIsDemo(true)
      setLoading(false)
      return
    }

    if (error) {
      setUser(null)
      setProfile(null)
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

  return (
    <DashboardUserContext.Provider
      value={{
        user,
        profile,
        loading,
        isDemo,
        basePath: isDemo ? '/demo/app' : '/dashboard/employer',
        refetch: fetchUserAndProfile,
      }}
    >
      {children}
    </DashboardUserContext.Provider>
  )
}
