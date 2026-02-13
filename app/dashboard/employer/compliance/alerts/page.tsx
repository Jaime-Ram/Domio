'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { AlertTriangle } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function ComplianceAlertsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Compliance alerts</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">Waarschuwingen en actiepunten.</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            Alerts overzicht
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            Bekijk alle compliance-alerts in het WWS-overzicht.
          </p>
          <Button asChild variant="default">
            <Link href="/dashboard/employer/compliance">Naar WWS Overzicht</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
