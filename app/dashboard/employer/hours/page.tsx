'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { dashboardCardClass } from '@/app/dashboard/employer/dashboard-ui'
import { useDashboardUser } from '@/providers/dashboard-user-provider'

export default function HoursPage() {
  const { isDemo } = useDashboardUser()
  return (
    <div className="w-full max-w-7xl mx-auto pl-6">
      <div className="mb-6 sm:mb-8">
        <h1 className="text-3xl font-bold text-[#163300] dark:text-[#9FE870] mb-2">
          Urenbeheer
        </h1>
        <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
          Beheer en controleer gewerkte uren
        </p>
      </div>

      <Card className={dashboardCardClass(undefined, isDemo)}>
        <CardHeader>
          <CardTitle>Uren Overzicht</CardTitle>
          <CardDescription>Bekijk en beheer gewerkte uren van medewerkers</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Urenbeheer functionaliteit komt binnenkort beschikbaar.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
