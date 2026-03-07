'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { AlertTriangle, BarChart3, Calculator } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { SectionNavDashboard } from '@/components/dashboard/section-nav-dashboard'
import { SectionWidgetMenu, SectionWidgetMenuPlaceholder } from '@/components/dashboard/section-widget-menu'
import { useDashboardUser } from '@/providers/dashboard-user-provider'

const getComplianceNav = (basePath: string) => [
  { label: 'WWS Overzicht', href: `${basePath}/compliance`, icon: BarChart3 },
  { label: 'Puntentelling', href: `${basePath}/compliance/puntentelling`, icon: Calculator },
  { label: 'Alerts', href: `${basePath}/compliance/alerts`, icon: AlertTriangle },
]

export default function ComplianceAlertsPage() {
  const { basePath } = useDashboardUser()
  const COMPLIANCE_NAV = getComplianceNav(basePath)
  return (
    <div className="space-y-6">
      <SectionNavDashboard
        title="Compliance"
        items={COMPLIANCE_NAV}
        titleVariant="hero"
        widgetMenu={
          <SectionWidgetMenu>
            <SectionWidgetMenuPlaceholder />
          </SectionWidgetMenu>
        }
      />
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
            <Link href={`${basePath}/compliance`}>Naar WWS Overzicht</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
