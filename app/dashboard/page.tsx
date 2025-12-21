'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import type { NavItemType } from "@/components/application/app-navigation/config"
import { SidebarNavigationSimple } from "@/components/application/app-navigation/sidebar-navigation/sidebar-simple"
import { BadgeWithDot } from "@/components/base/badges/badges"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ConfigurationModal } from '@/components/onboarding/configuration-modal'
import { 
  DollarSign, 
  Users, 
  TrendingUp, 
  CreditCard,
  LogOut,
  BarChart3,
  Settings,
  Layout
} from 'lucide-react'

const navItemsSimple: NavItemType[] = [
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: BarChart3,
  },
]

export default function DashboardPage() {
  const router = useRouter()
  const supabase = createClient()
  const [user, setUser] = useState<any>(null)
  const [userProfile, setUserProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [showOnboarding, setShowOnboarding] = useState(false)

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
        return
      }

      setUser(user)

      // Fetch user profile - gracefully handle if table doesn't exist
      try {
        const { data: profile, error } = await supabase
          .from('user_profiles')
          .select('*')
          .eq('id', user.id)
          .single()

        if (error) {
          // PGRST116 = no rows returned, which is OK for new users
          if (error.code === 'PGRST116') {
            // User doesn't have a profile yet - try to create one automatically
            console.log('No user profile found - creating default profile')
            try {
              const { data: newProfile, error: createError } = await supabase
                .from('user_profiles')
                .insert({
                  id: user.id,
                  email: user.email || '',
                  full_name: user.user_metadata?.full_name || user.user_metadata?.name || user.email?.split('@')[0] || 'User',
                  role: user.user_metadata?.role || 'employee',
                  created_at: new Date().toISOString(),
                  updated_at: new Date().toISOString(),
                })
                .select()
                .single()

              if (newProfile && !createError) {
                setUserProfile(newProfile)
                // Redirect based on role
                if (newProfile.role === 'employer') {
                  router.push('/dashboard/employer')
                  return
                } else if (newProfile.role === 'employee') {
                  router.push('/dashboard/employee')
                  return
                }
                setShowOnboarding(true)
              } else if (createError) {
                console.warn('Could not create profile automatically:', createError.message)
                // Continue anyway - user can still use the dashboard
              }
            } catch (createErr) {
              console.warn('Error creating profile:', createErr)
              // Continue anyway
            }
          } else {
            // Other errors - only log if there's actual error information
            // Skip logging empty error objects or expected errors
            const hasErrorInfo = error.code || error.message || error.details || error.hint
            
            if (hasErrorInfo) {
              // Only log if it's not a permissions/RLS error (which might be expected)
              const isRLSError = error.message?.includes('row-level security') || 
                                error.message?.includes('permission denied') ||
                                error.code === '42501' ||
                                error.code === 'PGRST301'
              
              if (!isRLSError) {
                console.error('Error fetching user profile:', {
                  code: error.code,
                  message: error.message,
                  details: error.details,
                  hint: error.hint,
                })
              } else {
                // RLS error - provide helpful message
                console.warn('User profile access denied. Please check Supabase RLS policies. See SUPABASE_USER_PROFILES_SETUP.md for setup instructions.')
              }
            }
            // If error object is empty, silently continue - likely a non-critical issue
          }
        } else if (profile) {
          setUserProfile(profile)
          
          // Redirect based on role
          if (profile.role === 'employer') {
            router.push('/dashboard/employer')
            return
          } else if (profile.role === 'employee') {
            router.push('/dashboard/employee')
            return
          }
          
          // Show onboarding if not completed (only for admin or no specific role)
          if (!profile.onboarding_completed) {
            setShowOnboarding(true)
          }
        }
      } catch (err: any) {
        // Catch any unexpected errors
        console.error('Error in fetchUser:', {
          message: err?.message || 'Unknown error',
          stack: err?.stack,
          error: err,
        })
        // Continue anyway - user can still use the dashboard
      }

      setLoading(false)
    }

    fetchUser()
  }, [router, supabase])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

  const handleOnboardingComplete = async () => {
    // Refresh user profile
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    if (profile) {
      setUserProfile(profile)
    }
    setShowOnboarding(false)
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#002A1F] mx-auto"></div>
            <p className="mt-4 text-gray-600 dark:text-gray-400">Laden...</p>
          </div>
      </div>
    )
  }

  return (
    <>
      {showOnboarding && user && userProfile && (
        <ConfigurationModal
          user={user}
          userProfile={userProfile}
          onComplete={handleOnboardingComplete}
        />
      )}
      <div className="flex min-h-screen w-full bg-gray-50 dark:bg-gray-900">
      {/* Sidebar - Simplified for admin/generic dashboard */}
      <SidebarNavigationSimple
        items={navItemsSimple}
        footerItems={[
          {
            label: "Instellingen",
            href: "/settings",
            icon: Settings,
          },
          {
            label: "Uitloggen",
            href: "#",
            icon: Layout,
            onClick: handleLogout,
          },
        ]}
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col lg:ml-56">
        {/* Header */}
        <header className="sticky top-0 z-50 w-full border-b bg-white dark:bg-gray-950">
          <div className="flex h-16 items-center justify-between px-4 sm:px-6">
            <div className="min-w-0 flex-1">
              <h1 className="text-lg sm:text-xl font-semibold truncate">Dashboard</h1>
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 truncate">
                Welkom terug, {user?.user_metadata?.full_name || user?.email}
              </p>
            </div>
            <Button variant="ghost" onClick={handleLogout} className="hidden sm:flex">
              <LogOut className="mr-2 h-4 w-4" />
              <span className="hidden md:inline">Uitloggen</span>
            </Button>
            <Button variant="ghost" size="icon" onClick={handleLogout} className="sm:hidden">
              <LogOut className="h-4 w-4" />
              <span className="sr-only">Uitloggen</span>
            </Button>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 p-4 sm:p-6">
          {/* Stats Grid */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-6 sm:mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 px-4 sm:px-6 pt-4 sm:pt-6">
                <CardTitle className="text-xs sm:text-sm font-medium">Totale Omzet</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent className="px-4 sm:px-6 pb-4 sm:pb-6">
                <div className="text-xl sm:text-2xl font-bold">€45.231,89</div>
                <p className="text-xs text-muted-foreground mt-1">
                  +20,1% ten opzichte van vorige maand
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 px-4 sm:px-6 pt-4 sm:pt-6">
                <CardTitle className="text-xs sm:text-sm font-medium">Actieve Gebruikers</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent className="px-4 sm:px-6 pb-4 sm:pb-6">
                <div className="text-xl sm:text-2xl font-bold">2.350</div>
                <p className="text-xs text-muted-foreground mt-1">
                  +180,1% ten opzichte van vorige maand
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 px-4 sm:px-6 pt-4 sm:pt-6">
                <CardTitle className="text-xs sm:text-sm font-medium">Transacties</CardTitle>
                <CreditCard className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent className="px-4 sm:px-6 pb-4 sm:pb-6">
                <div className="text-xl sm:text-2xl font-bold">12.234</div>
                <p className="text-xs text-muted-foreground mt-1">
                  +19% ten opzichte van vorige maand
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 px-4 sm:px-6 pt-4 sm:pt-6">
                <CardTitle className="text-xs sm:text-sm font-medium">Groei</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent className="px-4 sm:px-6 pb-4 sm:pb-6">
                <div className="text-xl sm:text-2xl font-bold">+573</div>
                <p className="text-xs text-muted-foreground mt-1">
                  +201 sinds vorig uur
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader className="px-4 sm:px-6 pt-4 sm:pt-6">
                <CardTitle className="text-base sm:text-lg">Betalingsbeheer</CardTitle>
                <CardDescription className="text-xs sm:text-sm">
                  Beheer je betalingen en transacties
                </CardDescription>
              </CardHeader>
              <CardContent className="px-4 sm:px-6 pb-4 sm:pb-6">
                <Button className="w-full text-sm">Bekijk betalingen</Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="px-4 sm:px-6 pt-4 sm:pt-6">
                <CardTitle className="text-base sm:text-lg">Teambeheer</CardTitle>
                <CardDescription className="text-xs sm:text-sm">
                  Beheer je teamleden en rollen
                </CardDescription>
              </CardHeader>
              <CardContent className="px-4 sm:px-6 pb-4 sm:pb-6">
                <Button className="w-full text-sm" variant="outline">Bekijk team</Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="px-4 sm:px-6 pt-4 sm:pt-6">
                <CardTitle className="text-base sm:text-lg">Instellingen</CardTitle>
                <CardDescription className="text-xs sm:text-sm">
                  Configureer je accountinstellingen
                </CardDescription>
              </CardHeader>
              <CardContent className="px-4 sm:px-6 pb-4 sm:pb-6">
                <Button className="w-full text-sm" variant="outline">Instellingen</Button>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
    </>
  )
}
