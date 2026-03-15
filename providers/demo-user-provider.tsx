'use client'

import { useState } from 'react'
import { User } from '@supabase/supabase-js'
import type { Profile } from '@/lib/supabase/profile'
import { currentUser } from '@/lib/mock-data/domio-dashboard'

/**
 * Demo User Provider — gebruikt ALLEEN mock data, GEEN Supabase.
 * Gebruikt uitsluitend onder /demo/app/* om productiedata te scheiden.
 */
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

import { DashboardUserContext } from '@/providers/dashboard-user-provider'

export function DemoUserProvider({ children }: { children: React.ReactNode }) {
  const [user] = useState<User | null>(() => getDemoUser())
  const [profile] = useState<Profile | null>(() => getDemoProfile())

  const refetch = async () => {}

  return (
    <DashboardUserContext.Provider
      value={{
        user,
        profile,
        loading: false,
        isDemo: true,
        basePath: '/demo/app',
        refetch,
      }}
    >
      {children}
    </DashboardUserContext.Provider>
  )
}
