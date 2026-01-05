'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Logo } from '@/components/Logo'

export default function DemoPage() {
  const router = useRouter()

  useEffect(() => {
    // Redirect after 2 seconds
    const timeout = setTimeout(() => {
      router.push('/dashboard/employer')
    }, 2000)

    return () => {
      clearTimeout(timeout)
    }
  }, [router])

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-[#002A1F] to-[#004d3d] p-4">
      <div className="flex flex-col items-center gap-6">
        {/* Logo */}
        <Logo width={140} height={40} variant="white" />

        {/* Three animated dots */}
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-[#9AFF7C] rounded-full animate-bounce" style={{ animationDelay: '0s', animationDuration: '1.4s' }}></div>
          <div className="w-2 h-2 bg-[#9AFF7C] rounded-full animate-bounce" style={{ animationDelay: '0.2s', animationDuration: '1.4s' }}></div>
          <div className="w-2 h-2 bg-[#9AFF7C] rounded-full animate-bounce" style={{ animationDelay: '0.4s', animationDuration: '1.4s' }}></div>
        </div>
      </div>
    </div>
  )
}

