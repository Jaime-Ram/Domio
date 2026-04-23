'use client'

import { useEffect, useState } from 'react'
import { useDashboardUser } from '@/providers/dashboard-user-provider'
import { supabase } from '@/lib/supabase/client'
import { SectionNavDashboard } from '@/components/dashboard/section-nav-dashboard'
import { RendementChart } from '@/components/finance/RendementChart'
import { getFinancialNav } from './nav'

export default function FinancialPage() {
  const { basePath } = useDashboardUser()
  const FINANCIAL_NAV = getFinancialNav(basePath)
  const [properties, setProperties] = useState<{ id: string; name: string }[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase
      .from('properties')
      .select('id, name')
      .then(({ data }) => {
        setProperties(data ?? [])
        setLoading(false)
      })
  }, [])

  return (
    <>
    </>
  )
}
