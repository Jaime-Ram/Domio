'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useDashboardUser } from '@/providers/dashboard-user-provider'

export default function RendementRedirect() {
  const router = useRouter()
  const { basePath } = useDashboardUser()
  useEffect(() => {
    router.replace(`${basePath}/financial`)
  }, [router, basePath])
  return null
}
