'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { dashboardCardClass } from '@/app/dashboard/employer/dashboard-ui'
import { useDashboardUser } from '@/providers/dashboard-user-provider'
import { SectionHeroHeader } from '@/components/dashboard/section-hero-header'

export default function RestaurantPage() {
  const { isDemo } = useDashboardUser()
  return (
    <div className="w-full space-y-content-blocks">
      <SectionHeroHeader
        title="Restaurant Beheer"
        description="Beheer je restaurant operaties"
      />

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
