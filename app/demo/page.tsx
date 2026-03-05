'use client'

import { useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { AuthLoadingScreen } from '@/components/auth/auth-loading-screen'

export default function DemoPage() {
  const router = useRouter()
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.cookie = 'domio_demo=1; path=/; max-age=86400' // 24 uur
    }
    router.prefetch('/demo/app')
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
    }
  }, [router])

  const handleAnimationComplete = () => {
    timeoutRef.current = setTimeout(() => {
      router.replace('/demo/app')
    }, 80)
  }

  return (
    <AuthLoadingScreen onAnimationComplete={handleAnimationComplete} />
  )
}
