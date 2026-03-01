'use client'

import { useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { AuthLoadingScreen } from '@/components/auth/auth-loading-screen'

export default function DemoPage() {
  const router = useRouter()
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    router.prefetch('/dashboard/employer')
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
    }
  }, [router])

  const handleAnimationComplete = () => {
    if (typeof document !== 'undefined') {
      document.cookie = 'domio_demo=1; path=/; max-age=3600'
    }
    timeoutRef.current = setTimeout(() => {
      router.push('/dashboard/employer')
    }, 80)
  }

  return (
    <AuthLoadingScreen onAnimationComplete={handleAnimationComplete} />
  )
}
