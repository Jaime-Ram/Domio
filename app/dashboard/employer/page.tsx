'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Building2,
  Users, 
  CreditCard, 
  AlertCircle,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  Plus,
  FileText,
  Calendar,
  Euro,
  Home,
  CheckCircle2,
  Clock,
  Zap,
  Wrench,
  Upload,
} from 'lucide-react'
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis, Bar, BarChart } from "recharts"
import { LoadingIndicator } from "@/components/application/loading-indicator/loading-indicator"
import { 
  mockKPIs, 
  mockRevenueData, 
  mockOccupancyData, 
  mockRecentActivities,
  mockProperties,
  mockTenants,
  mockMaintenanceRequests,
  mockPayments,
} from '@/lib/mock-data/vastgoed'
import { format } from 'date-fns'
import { nl } from 'date-fns/locale'

export default function EmployerDashboard() {
  const router = useRouter()
  const pathname = usePathname()
  const supabase = createClient()
  const [user, setUser] = useState<any>(null)
  const [userProfile, setUserProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [sidebarOpen, setSidebarOpen] = useState(false)

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const { data: { user: authUser } } = await supabase.auth.getUser()
        if (authUser) {
          setUser(authUser)
          const { data: profile } = await supabase
        .from('user_profiles')
        .select('*')
            .eq('id', authUser.id)
        .single()
        setUserProfile(profile)
      }
    } catch (error) {
        console.error('Error fetching user:', error)
    } finally {
        setLoading(false)
      }
    }
    fetchUser()
  }, [supabase])

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <LoadingIndicator type="line-spinner" size="md" label="Laden..." />
      </div>
    )
  }

  // Calculate stats from mock data
  const totalRevenue = mockKPIs.totalMonthlyRevenue
  const occupancyRate = mockKPIs.occupancyRate
  const outstandingPayments = mockKPIs.outstandingPayments
  const openTickets = mockMaintenanceRequests.filter(t => t.status === 'open' || t.status === 'in_behandeling').length

  return (
    <div className="w-full max-w-7xl mx-auto">
            {/* Page Header */}
            <div className="mb-6 sm:mb-8">
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-2">
                Welkom, {userProfile?.full_name || user?.email?.split('@')[0] || 'Gebruiker'}
                  </h1>
              <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
                Overzicht van je vastgoedportefeuille
                  </p>
                </div>
                
            {/* MVP Widgets - Max 4 */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
              {/* 1. Financieel Overzicht */}
              <Card className="border border-gray-200 dark:border-neutral-700">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 px-4 sm:px-6 pt-4 sm:pt-6">
                  <CardTitle className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400">
                    Financieel Overzicht
                  </CardTitle>
                  <Euro className="h-4 w-4 text-[#002A1F] dark:text-[#9AFF7C]" />
            </CardHeader>
            <CardContent className="px-4 sm:px-6 pb-4 sm:pb-6">
                  <div className="space-y-2">
            <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Huurinkomsten deze maand</p>
                      <p className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
                        €{mockKPIs.totalMonthlyRevenue.toLocaleString('nl-NL')}
                      </p>
            </div>
                                      <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Openstaande betalingen</p>
                      <p className={`text-base sm:text-lg font-semibold ${mockKPIs.outstandingPayments > 0 && mockPayments.find(p => p.status === 'openstaand' && new Date(p.dueDate) < new Date(Date.now() - 14 * 24 * 60 * 60 * 1000)) ? 'text-red-600' : 'text-gray-900 dark:text-white'}`}>
                        €{mockKPIs.outstandingPayments.toLocaleString('nl-NL')}
                                        </p>
                    </div>
                    <div className="pt-2 border-t border-gray-100 dark:border-gray-800">
                                        <p className="text-xs text-gray-500 dark:text-gray-400">
                        {mockKPIs.totalProperties} panden • {mockKPIs.occupiedProperties} verhuurd
                      </p>
                                </div>
                              </div>
            </CardContent>
          </Card>

              {/* 2. Urgente Acties */}
              <Card className="border border-gray-200 dark:border-neutral-700">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 px-4 sm:px-6 pt-4 sm:pt-6">
                  <CardTitle className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400">
                    Urgente Acties
                  </CardTitle>
                  <div className="relative">
                    <AlertCircle className="h-4 w-4 text-red-600" />
                    {(mockPayments.filter(p => p.status === 'openstaand').length + mockMaintenanceRequests.filter(m => m.status === 'open').length) > 0 && (
                      <span className="absolute -top-1 -right-1 h-4 w-4 bg-red-600 rounded-full text-[10px] font-bold text-white flex items-center justify-center">
                        {mockPayments.filter(p => p.status === 'openstaand').length + mockMaintenanceRequests.filter(m => m.status === 'open').length}
                                </span>
                    )}
              </div>
                    </CardHeader>
                    <CardContent className="px-4 sm:px-6 pb-4 sm:pb-6">
                  <div className="space-y-2 sm:space-y-3">
                      <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Huurachterstanden &gt; 30 dagen</span>
                      <span className="text-sm font-semibold text-gray-900 dark:text-white">
                        {mockPayments.filter(p => p.status === 'openstaand' && new Date(p.dueDate) < new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)).length}
                      </span>
                      </div>
                      <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Onderhoudsverzoeken open</span>
                      <span className="text-sm font-semibold text-gray-900 dark:text-white">
                        {mockMaintenanceRequests.filter(m => m.status === 'open').length}
                      </span>
                      </div>
                      <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Verlopende documenten</span>
                      <span className="text-sm font-semibold text-gray-900 dark:text-white">0</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

              {/* 3. Snelle Toegang */}
              <Card className="border border-gray-200 dark:border-neutral-700 sm:col-span-2 lg:col-span-2">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 px-4 sm:px-6 pt-4 sm:pt-6">
                  <CardTitle className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400">
                    Snelle Toegang
                      </CardTitle>
                  <Zap className="h-4 w-4 text-[#002A1F] dark:text-[#9AFF7C]" />
                    </CardHeader>
                <CardContent className="px-4 sm:px-6 pb-4 sm:pb-6">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <Button
                      className="h-auto sm:h-20 flex-row sm:flex-col gap-2 py-3 sm:py-0" 
                      variant="outline"
                      onClick={() => router.push('/dashboard/employer/maintenance/new')}
                    >
                      <Wrench className="h-5 w-5" />
                      <span className="text-xs sm:text-xs">Nieuw Onderhoud</span>
                    </Button>
                    <Button
                      className="h-auto sm:h-20 flex-row sm:flex-col gap-2 py-3 sm:py-0" 
                          variant="outline"
                      onClick={() => router.push('/dashboard/employer/financial/payment')}
                        >
                      <Euro className="h-5 w-5" />
                      <span className="text-xs sm:text-xs">Betaling Registreren</span>
                        </Button>
                        <Button
                      className="h-auto sm:h-20 flex-row sm:flex-col gap-2 py-3 sm:py-0" 
                          variant="outline"
                      onClick={() => router.push('/dashboard/employer/documents')}
                        >
                      <Upload className="h-5 w-5" />
                      <span className="text-xs sm:text-xs">Document Uploaden</span>
                        </Button>
                              </div>
                    </CardContent>
                  </Card>
                      </div>

            {/* 4. Laatste Activiteit */}
            <Card className="border border-gray-200 dark:border-neutral-700 mb-6 sm:mb-8">
              <CardHeader className="px-4 sm:px-6 pt-4 sm:pt-6">
                <CardTitle className="text-base sm:text-lg font-semibold">Laatste Activiteit</CardTitle>
                <CardDescription className="text-xs sm:text-sm">Recente updates (5 items)</CardDescription>
                      </CardHeader>
              <CardContent className="px-4 sm:px-6 pb-4 sm:pb-6">
                <div className="space-y-1">
                  {mockRecentActivities.slice(0, 5).map((activity) => (
                    <div key={activity.id} className="py-2 sm:py-3 border-b border-gray-100 dark:border-gray-800 last:border-0">
                      <p className="text-xs sm:text-sm text-gray-900 dark:text-white">
                        {activity.message}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        {format(new Date(activity.timestamp), 'd MMM yyyy, HH:mm', { locale: nl })}
                      </p>
                            </div>
                          ))}
                              </div>
                      </CardContent>
                    </Card>
    </div>
  )
}
