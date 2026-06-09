'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowLeft } from 'lucide-react'
import { Logo } from '@/components/Logo'

interface AuthPageShellProps {
  children: React.ReactNode
}

/**
 * Split-layout voor auth pagina's.
 * Mobiel/tablet: alleen het formulier (witte achtergrond) met logo linksboven.
 * Desktop (lg+): formulier links, vastgoedfoto rechts.
 */
export function AuthPageShell({ children }: AuthPageShellProps) {
  useEffect(() => {
    const isMobile = () => window.innerWidth < 768
    if (!isMobile()) return

    const meta = document.querySelector('meta[name="viewport"]')
    const prev = meta?.getAttribute('content') ?? ''
    const next = 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no'
    if (meta) meta.setAttribute('content', next)
    return () => {
      if (meta) meta.setAttribute('content', prev)
    }
  }, [])

  return (
    <div className="min-h-screen flex bg-white dark:bg-gray-900">
      {/* Links: formulier */}
      <div className="flex flex-col w-full lg:w-1/2 xl:w-[45%] min-h-screen">
        {/* Terug-knop linksboven */}
        <div className="px-6 sm:px-10 lg:px-14 pt-6 sm:pt-8 shrink-0">
          <Link
            href="/"
            aria-label="Terug naar home"
            className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 dark:bg-neutral-800 text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100 hover:bg-gray-200 dark:hover:bg-neutral-700 transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </div>

        {/* Formulier */}
        <main className="flex-1 flex items-start lg:items-center justify-center px-6 sm:px-10 lg:px-14 pt-12 lg:pt-0 pb-16">
          <div className="w-full max-w-[400px]">
            {children}
          </div>
        </main>
      </div>

      {/* Rechts: vastgoedfoto — alleen op desktop */}
      <div className="hidden lg:block relative lg:w-1/2 xl:w-[55%]">
        <Image
          src="/images/AchtergrondX.jpg"
          alt="Vastgoed"
          fill
          priority
          sizes="(min-width: 1280px) 55vw, 50vw"
          className="object-cover"
        />
        {/* Domio-logo klein in wit, rechtsonder */}
        <div className="absolute bottom-6 right-7 z-10 drop-shadow">
          <Logo variant="white" height={22} />
        </div>
      </div>
    </div>
  )
}
