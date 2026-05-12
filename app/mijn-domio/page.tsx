'use client'

import { useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { AuthLoadingScreen } from '@/components/auth/auth-loading-screen'

/** Route die demo-cookie wist en doorverwijst naar dashboard (eigen data, geen Thomas van Dijk) */
export default function MijnDomioPage() {
  const router = useRouter()
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    // Direct cookie wissen zodat prefetch/dashboard-load nooit demo-data ziet
    if (typeof document !== 'undefined') {
      document.cookie = 'domio_demo=; path=/; max-age=0'
    }
    router.prefetch('/dashboard/landlord')
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
    }
  }, [router])

  const handleAnimationComplete = () => {
    timeoutRef.current = setTimeout(() => {
      router.replace('/dashboard/landlord')
    }, 80)
  }

  return (
    <AuthLoadingScreen onAnimationComplete={handleAnimationComplete} />
  )
}
