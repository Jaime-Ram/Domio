'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { X } from 'lucide-react'
import { Logo } from '@/components/Logo'

interface AuthPageShellProps {
  children: React.ReactNode
}

/**
 * Layout voor auth pagina's.
 * Mobiel: alleen kruisje rechtsboven, content iets lager, viewport-zoom uit.
 * Desktop: originele header met logo + kruisje, gecentreerde inhoud.
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
    <div className="min-h-screen flex flex-col bg-white dark:bg-gray-900">
      {/* Mobiel: alleen kruisje rechtsboven */}
      <Link
        href="/"
        className="fixed top-4 right-4 z-50 p-2.5 rounded-full text-gray-500 hover:text-gray-900 hover:bg-gray-100 dark:hover:text-gray-100 dark:hover:bg-neutral-800 transition-colors md:hidden"
        aria-label="Sluiten"
      >
        <X className="h-5 w-5" />
      </Link>

      {/* Desktop: originele header met logo en kruisje */}
      <header className="hidden md:flex flex-shrink-0 w-full bg-white dark:bg-gray-900 shadow-sm">
        <div className="container mx-auto flex h-16 w-full max-w-7xl items-center px-4 md:px-8">
          <div className="w-10 flex-shrink-0 md:w-0 md:min-w-0 md:overflow-hidden" aria-hidden />
          <div className="flex-1 flex justify-center md:justify-start md:flex-none md:flex-shrink-0">
            <Logo width={100} height={28} />
          </div>
          <div className="hidden md:block flex-1" aria-hidden />
          <Link
            href="/"
            className="p-2 rounded-full text-gray-500 hover:text-gray-900 hover:bg-gray-100 dark:hover:text-gray-100 dark:hover:bg-neutral-800 transition-colors flex-shrink-0"
            aria-label="Sluiten"
          >
            <X className="h-5 w-5" />
          </Link>
        </div>
      </header>

      {/* Inhoud: mobiel pt-24, desktop gecentreerd met originele padding */}
      <main className="flex-1 flex items-start md:items-center justify-center pt-24 md:pt-8 md:py-12 pb-12 px-4">
        <div className="w-full max-w-[400px]">
          {children}
        </div>
      </main>
    </div>
  )
}
