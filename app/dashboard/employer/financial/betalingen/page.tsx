'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useDashboardUser } from '@/providers/dashboard-user-provider'

export default function BetalingenRedirect() {
  const router = useRouter()
  const { basePath } = useDashboardUser()
  useEffect(() => {
    router.replace(`${basePath}/financial/geldstromen`)
  }, [router, basePath])
  return null
}
