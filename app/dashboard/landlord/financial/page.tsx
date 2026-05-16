'use client'

import { useEffect, useState } from 'react'
import { useDashboardUser } from '@/providers/dashboard-user-provider'
import { supabase } from '@/lib/supabase/client'

import { RendementChart } from '@/components/finance/RendementChart'


export default function FinancialPage() {
  const { basePath } = useDashboardUser()
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
