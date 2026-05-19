'use client'

import { useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useDashboardUser } from '@/providers/dashboard-user-provider'

export default function TenantDetailRedirect() {
  const router = useRouter()
  const { basePath } = useDashboardUser()
  const { id } = useParams<{ id: string }>()

  useEffect(() => {
    router.replace(`${basePath}/tenants?tenant=${id}`)
  }, [router, basePath, id])

  return null
}
