'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'

// Donkergroen (#163300) filter voor logo op lichte achtergrond
const LOGO_DARK_FILTER =
  'brightness(0) saturate(100%) invert(12%) sepia(45%) saturate(2000%) hue-rotate(128deg)'

export default function DemoPage() {
  const router = useRouter()

  useEffect(() => {
    const timeout = setTimeout(() => {
      router.push('/dashboard/employer')
    }, 2000)

    return () => clearTimeout(timeout)
  }, [router])

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#9FE870] p-4">
      <Image
        src="/images/DomioLogo.png"
        alt="Domio"
        width={160}
        height={48}
        priority
        className="h-auto w-auto object-contain"
        style={{ filter: LOGO_DARK_FILTER }}
      />
    </div>
  )
}

