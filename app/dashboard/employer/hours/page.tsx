'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function HoursPage() {
  return (
    <div className="w-full max-w-7xl mx-auto">
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Urenbeheer
        </h1>
        <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
          Beheer en controleer gewerkte uren
        </p>
      </div>

      <Card className="border border-gray-200 dark:border-neutral-700">
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
