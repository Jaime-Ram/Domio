'use client'

import { useEffect, useState } from 'react'
import { useDashboardUser } from '@/providers/dashboard-user-provider'
import { supabase } from '@/lib/supabase/client'
import { SectionNavDashboard } from '@/components/dashboard/section-nav-dashboard'
import { SectionWidgetMenu, SectionWidgetMenuPlaceholder } from '@/components/dashboard/section-widget-menu'
import { RendementChart } from '@/components/finance/RendementChart'
import { getFinancialNav } from './nav'

export default function FinancialPage() {
  const { basePath } = useDashboardUser()
  const FINANCIAL_NAV = getFinancialNav(basePath)

  const [properties, setProperties] = useState<{ id: string; name: string }[]>([])

  useEffect(() => {
    supabase
      .from('properties')
      .select('id, name')
      .then(({ data }) => setProperties(data ?? []))
  }, [])

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

      {properties.length > 0 && <RendementChart properties={properties} />}
    </div>
  )
}
