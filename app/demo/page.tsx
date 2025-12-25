'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Logo } from '@/components/Logo'
import { Loader2 } from 'lucide-react'

export default function DemoPage() {
  const router = useRouter()
  const [loadingProgress, setLoadingProgress] = useState(0)

  useEffect(() => {
    // Simulate loading progress - longer duration for better UX
    const interval = setInterval(() => {
      setLoadingProgress((prev) => {
        if (prev >= 95) {
          clearInterval(interval)
          return 95
        }
        return prev + Math.random() * 8 + 2 // Random increment for more natural feel
      })
    }, 200)

    // Redirect after 2-2.5 seconds (enough time to see the loading, feels more substantial)
    const timeout = setTimeout(() => {
      setLoadingProgress(100)
      setTimeout(() => {
        router.push('/dashboard/employer')
      }, 300) // Small delay after 100% to show completion
    }, 2200)

    return () => {
      clearInterval(interval)
      clearTimeout(timeout)
    }
  }, [router])

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-[#002A1F] to-[#004d3d] p-4">
      <div className="w-full max-w-md text-center">
        {/* Logo */}
        <div className="mb-12 flex justify-center">
          <Logo width={140} height={40} variant="white" />
        </div>

        {/* Loading Spinner */}
        <div className="mb-8 flex justify-center">
          <Loader2 className="h-12 w-12 text-[#9AFF7C] animate-spin" />
        </div>

        {/* Loading Text */}
        <h2 className="text-2xl font-semibold text-white mb-4">
          Demo wordt geladen...
        </h2>
        <p className="text-white/80 mb-8">
          We bereiden je demo dashboard voor
        </p>

        {/* Progress Bar */}
        <div className="w-full bg-white/10 rounded-full h-2 overflow-hidden">
          <div
            className="h-full bg-[#9AFF7C] rounded-full transition-all duration-300 ease-out"
            style={{ width: `${loadingProgress}%` }}
          />
        </div>

        {/* Loading Steps */}
        <div className="mt-8 space-y-2 text-sm text-white/60">
          <div className="flex items-center justify-center gap-2">
            <div className="h-1.5 w-1.5 rounded-full bg-[#9AFF7C]" />
            <span>Dashboard initialiseren</span>
          </div>
          <div className="flex items-center justify-center gap-2">
            <div className="h-1.5 w-1.5 rounded-full bg-[#9AFF7C]" />
            <span>Demo data laden</span>
          </div>
          <div className="flex items-center justify-center gap-2">
            <div className="h-1.5 w-1.5 rounded-full bg-white/20" />
            <span>Bijna klaar...</span>
          </div>
        </div>
      </div>
    </div>
  )
}

