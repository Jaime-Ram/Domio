'use client'

import { TrendingUp, Receipt, CreditCard, Scan } from 'lucide-react'
import { SectionNavDashboard } from '@/components/dashboard/section-nav-dashboard'
import { SectionWidgetMenu, SectionWidgetMenuPlaceholder } from '@/components/dashboard/section-widget-menu'
import { useDashboardUser } from '@/providers/dashboard-user-provider'

const getFinancialNav = (basePath: string) => [
  { label: 'Facturatie', href: `${basePath}/financial`, icon: Receipt },
  { label: 'Betalingen', href: `${basePath}/financial/betalingen`, icon: CreditCard },
  { label: 'Rendement', href: `${basePath}/financial/rendement`, icon: TrendingUp },
  { label: 'Bankimport', href: `${basePath}/financial/bankimport`, icon: Scan },
]

export default function RendementPage() {
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
    </div>
  )
}
