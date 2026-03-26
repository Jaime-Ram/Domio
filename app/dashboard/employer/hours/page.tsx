'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { dashboardCardClass } from '@/app/dashboard/employer/dashboard-ui'
import { useDashboardUser } from '@/providers/dashboard-user-provider'
import { SectionHeroHeader } from '@/components/dashboard/section-hero-header'

export default function HoursPage() {
  const { isDemo } = useDashboardUser()
  return (
    <div className="w-full space-y-content-blocks">
      <SectionHeroHeader
        title="Urenbeheer"
        description="Beheer en controleer gewerkte uren"
      />

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
