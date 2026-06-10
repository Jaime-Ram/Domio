'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { User } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase/client'
import { getUser } from '@/lib/supabase/auth'
import { getProfile, type Profile } from '@/lib/supabase/profile'

interface DashboardUserContextValue {
  user: User | null
  profile: Profile | null
  loading: boolean
  /** Demo-mode bestaat niet meer — altijd false. Behouden voor compat. */
  isDemo: boolean
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

  const fetchUserAndProfile = async () => {
    const { user: u } = await getUser()

    if (u) {
      setUser(u)
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

  const basePath = profile?.role === 'huurder'
    ? '/dashboard/tenant'
    : '/dashboard/landlord'

  return (
    <DashboardUserContext.Provider
      value={{
        user,
        profile,
        loading,
        isDemo: false,
        basePath,
        refetch: fetchUserAndProfile,
      }}
    >
      {children}
    </DashboardUserContext.Provider>
  )
}
