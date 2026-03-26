'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useDashboardUser } from '@/providers/dashboard-user-provider'

/** Rendement tijdelijk uit navigatie; oude links doorsturen naar financieel dashboard. */
export default function RendementRedirectPage() {
  const router = useRouter()
  const { basePath } = useDashboardUser()

  useEffect(() => {
    router.replace(`${basePath}/financial`)
  }, [router, basePath])

  return (
    <div className="flex min-h-[120px] items-center justify-center">
      <p className="text-sm text-gray-500">Bezig met doorsturen…</p>
    </div>
  )
}
