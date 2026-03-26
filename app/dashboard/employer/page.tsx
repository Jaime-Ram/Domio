'use client'

import { useEffect, useState } from 'react'
import { Building2, Plus } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { useDashboardUser } from '@/providers/dashboard-user-provider'
import { supabase } from '@/lib/supabase/client'
import { cn } from '@/lib/utils'
const CARD_CLASS = 'rounded-card border-[0.5px] border-gray-200 dark:border-neutral-700 shadow-none bg-white dark:bg-neutral-900'

export default function EmployerDashboardPage() {
  const { profile, user, isDemo, loading, basePath } = useDashboardUser()
  const [propertyCount, setPropertyCount] = useState<number | null>(null)

  const firstName = profile?.full_name?.split(' ')[0] || user?.email?.split('@')[0] || 'daar'
  const greeting = (() => {
    const h = new Date().getHours()
    if (h < 12) return 'Goedemorgen'
    if (h < 18) return 'Goedemiddag'
    return 'Goedenavond'
  })()

  useEffect(() => {
    if (isDemo) {
      setPropertyCount(24) // mock data: altijd vol dashboard
      return
    }
    if (!user?.id) return
    supabase
      .from('properties')
      .select('id', { count: 'exact', head: true })
      .eq('owner_id', user.id)
      .then(({ count }) => setPropertyCount(count ?? 0))
  }, [user?.id, isDemo])

  const isBlank = !isDemo && propertyCount !== null && propertyCount === 0

  // Tijdens laden: geen mockdata of placeholder tonen, voorkomt flash van verkeerde content
  if (loading) {
    return (
      <div className="space-y-8">
        <div>
          <div className="h-8 w-48 rounded-block bg-gray-200 dark:bg-neutral-700 animate-pulse mb-2" />
          <div className="h-4 w-64 rounded-block bg-gray-100 dark:bg-neutral-800 animate-pulse" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-content-blocks">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className={cn(CARD_CLASS, 'p-6')}>
              <div className="h-12 w-12 rounded-block bg-gray-200 dark:bg-neutral-700 animate-pulse mb-3" />
              <div className="h-6 w-24 rounded-block bg-gray-200 dark:bg-neutral-700 animate-pulse mb-2" />
              <div className="h-4 w-16 rounded-block bg-gray-100 dark:bg-neutral-800 animate-pulse" />
            </div>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-content-blocks">
          <div className={cn(CARD_CLASS, 'p-6 h-64')}>
            <div className="h-5 w-32 rounded-block bg-gray-200 dark:bg-neutral-700 animate-pulse mb-4" />
            <div className="space-y-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="h-12 rounded-block bg-gray-100 dark:bg-neutral-800 animate-pulse" />
              ))}
            </div>
          </div>
          <div className={cn(CARD_CLASS, 'p-6 h-64')}>
            <div className="h-5 w-40 rounded-block bg-gray-200 dark:bg-neutral-700 animate-pulse mb-4" />
            <div className="h-24 w-24 rounded-full bg-gray-100 dark:bg-neutral-800 animate-pulse mx-auto" />
          </div>
        </div>
      </div>
    )
  }

  if (isBlank) {
    return (
      <>
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[#163300] dark:text-[#9FE870] mb-2">
            {greeting}, {firstName}
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Welkom bij Domio. Begin met het toevoegen van je panden.
          </p>
        </div>
        <div className={cn(CARD_CLASS, 'p-8 sm:p-12')}>
          <div className="max-w-md mx-auto text-center">
            <div className="h-16 w-16 rounded-2xl bg-[#163300]/10 dark:bg-[#9FE870]/10 flex items-center justify-center mx-auto mb-6">
              <Building2 className="h-8 w-8 text-[#163300] dark:text-[#9FE870]" />
            </div>
            <h2 className="text-xl font-semibold text-[#163300] dark:text-[#9FE870] mb-2">
              Nog geen panden toegevoegd
            </h2>
            <p className="text-gray-600 dark:text-gray-400 text-sm mb-6">
              Voeg je eerste verhuurobject toe om te beginnen met beheer, huurders en facturatie.
            </p>
            <Button asChild className="bg-[#163300] hover:bg-[#356258] text-white rounded-full px-6">
              <Link href={`${basePath}/portfolio/properties/new`}>
                <Plus className="h-4 w-4 mr-2" />
                Je panden toevoegen
              </Link>
            </Button>
          </div>
        </div>
      </>
    )
  }

  return (
    <>
      {/* Welkomstbanner */}
      <div className="mb-8">
        <div className="flex flex-wrap items-center gap-3 mb-2">
          <h1 className="text-3xl font-bold text-[#163300] dark:text-[#9FE870]">
            {greeting}, {firstName}
          </h1>
        </div>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          {propertyCount !== null ? (
            <>Overzicht van je portefeuille</>
          ) : (
            <>Laden...</>
          )}
        </p>
      </div>
    </>
  )
}
