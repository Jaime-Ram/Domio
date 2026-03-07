'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Scan, Receipt, CreditCard, TrendingUp } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { SectionNavDashboard } from '@/components/dashboard/section-nav-dashboard'
import { SectionWidgetMenu, SectionWidgetMenuPlaceholder } from '@/components/dashboard/section-widget-menu'
import { useDashboardUser } from '@/providers/dashboard-user-provider'
import { dashboardCardClass } from '@/app/dashboard/employer/dashboard-ui'

const getFinancialNav = (basePath: string) => [
  { label: 'Facturatie', href: `${basePath}/financial`, icon: Receipt },
  { label: 'Betalingen', href: `${basePath}/financial/betalingen`, icon: CreditCard },
  { label: 'Rendement', href: `${basePath}/financial/rendement`, icon: TrendingUp },
  { label: 'Bankimport', href: `${basePath}/financial/bankimport`, icon: Scan },
]

export default function BankimportPage() {
  const { basePath, isDemo } = useDashboardUser()
  const FINANCIAL_NAV = getFinancialNav(basePath)
  return (
    <div className="space-y-6">
      <SectionNavDashboard
        title="Financieel"
        items={FINANCIAL_NAV}
        titleVariant="hero"
        widgetMenu={
          <SectionWidgetMenu>
            <SectionWidgetMenuPlaceholder />
          </SectionWidgetMenu>
        }
      />
      <div>
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Bankimport</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">Banktransacties importeren en matchen.</p>
      </div>
      <Card className={dashboardCardClass(undefined, isDemo)}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Scan className="h-5 w-5" />
            Bankimport
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            Bankimport en matching vind je in het financiële dashboard.
          </p>
          <Button asChild variant="default">
            <Link href={`${basePath}/financial`}>Naar Financieel</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
