'use client'

import { TrendingUp, Percent } from 'lucide-react'
import { SectionNavDashboard } from '@/components/dashboard/section-nav-dashboard'
import { SectionWidgetMenu, SectionWidgetMenuPlaceholder } from '@/components/dashboard/section-widget-menu'
import { useDashboardUser } from '@/providers/dashboard-user-provider'
import { Card, CardContent } from '@/components/ui/card'
import { dashboardCardClass } from '@/app/dashboard/employer/dashboard-ui'
import { HuurafrekeningPanel } from '@/components/finance/HuurafrekeningPanel'
import { getFinancialNav } from '../nav'

const PLACEHOLDER_CARDS = [
  {
    title: 'Indexering',
    description: 'Stel automatische huurindexering in op basis van CPI of een vast percentage.',
    icon: TrendingUp,
  },
  {
    title: 'Huurverhoging',
    description: 'Beheer en plan huurverhogingen per contract.',
    icon: Percent,
  },
]

export default function HuurbeleidPage() {
  const { basePath } = useDashboardUser()
  const FINANCIAL_NAV = getFinancialNav(basePath)

  return (
    <div className="space-y-content-blocks">
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

      {/* Placeholder cards for upcoming features */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {PLACEHOLDER_CARDS.map((card) => (
          <Card key={card.title} className={dashboardCardClass('border border-gray-100 dark:border-neutral-800')}>
            <CardContent className="pt-6 pb-6 px-6 flex flex-col items-start gap-4">
              <div className="h-10 w-10 rounded-lg bg-gray-100 dark:bg-neutral-800 flex items-center justify-center">
                <card.icon className="h-5 w-5 text-gray-500 dark:text-gray-400" />
              </div>
              <div className="space-y-1.5">
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white">{card.title}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">{card.description}</p>
              </div>
              <span className="inline-flex items-center rounded-full bg-amber-50 dark:bg-amber-900/20 px-2.5 py-0.5 text-xs font-medium text-amber-700 dark:text-amber-400">
                Binnenkort beschikbaar
              </span>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Huurafrekening — live feature */}
      <HuurafrekeningPanel />
    </div>
  )
}
