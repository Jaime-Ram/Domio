'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { dashboardCardClass } from '@/app/dashboard/employer/dashboard-ui'
import { useDashboardUser } from '@/providers/dashboard-user-provider'

export default function RestaurantPage() {
  const { isDemo } = useDashboardUser()
  return (
    <div className="w-full max-w-7xl mx-auto">
      <div className="mb-6 sm:mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Restaurant Beheer
        </h1>
        <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
          Beheer je restaurant operaties
        </p>
      </div>

      <Card className={dashboardCardClass(undefined, isDemo)}>
        <CardHeader>
          <CardTitle>Restaurant Overzicht</CardTitle>
          <CardDescription>Beheer je restaurant en POS integraties</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Restaurant beheer functionaliteit komt binnenkort beschikbaar.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
