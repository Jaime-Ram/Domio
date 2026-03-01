'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { CreditCard, Receipt, TrendingUp, Scan } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { SectionNavDashboard } from '@/components/dashboard/section-nav-dashboard'

const FINANCIAL_NAV = [
  { label: 'Facturatie', href: '/dashboard/employer/financial', icon: Receipt },
  { label: 'Betalingen', href: '/dashboard/employer/financial/betalingen', icon: CreditCard },
  { label: 'Rendement', href: '/dashboard/employer/financial/rendement', icon: TrendingUp },
  { label: 'Bankimport', href: '/dashboard/employer/financial/bankimport', icon: Scan },
]

export default function BetalingenPage() {
  return (
    <div className="space-y-6">
      <SectionNavDashboard title="Financieel" items={FINANCIAL_NAV} />
      <div>
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Betalingen</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">Betalingen en transacties.</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Betalingen overzicht
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            Betalingen worden getoond in het financiële dashboard.
          </p>
          <Button asChild variant="default">
            <Link href="/dashboard/employer/financial">Naar Financieel</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
