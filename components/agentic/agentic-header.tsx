'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Menu, X } from 'lucide-react'
import { Logo } from '@/components/Logo'

const NAV = [
  { label: 'Hoe het werkt', href: '#hoe-het-werkt' },
  { label: 'Aanpak', href: '#onder-de-motorkap' },
  { label: 'Taken', href: '#taken' },
  { label: 'Nieuws', href: '#nieuws' },
  { label: 'Aan de slag', href: '#aan-de-slag' },
]

// Veel donkerder groen voor de header op scroll.
const SCROLL_BG = '#08160A'

/**
 * Topbar voor het Domio Agentic subbrand (A/B test).
 * Bovenaan: cream met donkere tekst. Op scroll: donkergroen (#163300) met
 * witte content. Logo links, nav in het midden, Inloggen + Start direct rechts.
 */
export function AgenticHeader() {
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    // body { overflow-x: hidden } maakt de body de scroll-container, dus
    // window.scrollY blijft 0. Daarom ook body/documentElement uitlezen, en
    // de listener in de capture-fase zodat we de body-scroll zeker opvangen.
    const onScroll = () => {
      const y =
        window.scrollY ||
        document.documentElement.scrollTop ||
        document.body.scrollTop ||
        0
      setScrolled(y > 12)
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true, capture: true })
    return () => window.removeEventListener('scroll', onScroll, true)
  }, [])

  const dark = scrolled || open

  return (
    <header
      style={dark ? { backgroundColor: 'rgba(8, 22, 10, 0.82)' } : undefined}
      className={`fixed inset-x-0 top-0 z-50 backdrop-blur-md transition-colors duration-300 ${
        dark ? 'shadow-sm' : 'bg-[#FBFAF7]/90'
      }`}
    >
      <div className="relative mx-auto flex h-16 max-w-[1500px] items-center justify-between px-5 sm:px-6 lg:px-8">
        {/* Logo links */}
        <div className="flex-shrink-0">
          <Logo
            width={68}
            height={19}
            href="/agentic"
            variant={dark ? 'white' : 'default'}
            imgClassName="transition duration-300"
          />
        </div>

        {/* Nav exact in het midden van de viewport */}
        <nav className="absolute left-1/2 top-1/2 hidden -translate-x-1/2 -translate-y-1/2 items-center gap-8 md:flex">
          {NAV.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className={`text-sm font-medium transition-colors ${
                dark ? 'text-white/80 hover:text-white' : 'text-[#163300]/70 hover:text-[#163300]'
              }`}
            >
              {item.label}
            </a>
          ))}
        </nav>

        {/* Acties rechts */}
        <div className="hidden md:flex items-center gap-3 flex-shrink-0">
          <Link
            href="/login"
            className={`text-sm font-medium px-4 py-2 rounded-xl transition-colors ${
              dark ? 'text-white hover:bg-white/10' : 'text-[#163300] hover:bg-black/5'
            }`}
          >
            Inloggen
          </Link>
          <Link
            href="/registreren"
            className={`text-sm font-semibold text-[#163300] px-5 py-2.5 rounded-xl shadow-sm transition-colors ${
              dark ? 'bg-white border border-black/10 hover:bg-white/90' : 'bg-[#9FE870] hover:bg-[#9FE870]/90'
            }`}
          >
            Start direct
          </Link>
        </div>

        {/* Mobiel */}
        <button
          type="button"
          className={`md:hidden p-2 transition-colors ${dark ? 'text-white' : 'text-[#163300]'}`}
          onClick={() => setOpen((o) => !o)}
          aria-label="Menu"
        >
          {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobiel paneel */}
      {open && (
        <div style={{ backgroundColor: SCROLL_BG }} className="md:hidden border-t border-white/10 px-5 py-4 space-y-1">
          {NAV.map((item) => (
            <a
              key={item.href}
              href={item.href}
              onClick={() => setOpen(false)}
              className="block py-3 px-3 rounded-lg text-base font-medium text-white/90 hover:bg-white/10"
            >
              {item.label}
            </a>
          ))}
          <div className="pt-2 flex flex-col gap-2">
            <Link href="/login" onClick={() => setOpen(false)} className="py-3 px-3 rounded-lg text-base font-medium text-white/90 hover:bg-white/10">
              Inloggen
            </Link>
            <Link href="/registreren" onClick={() => setOpen(false)} className="py-3 px-4 rounded-xl text-center text-base font-semibold text-[#163300] bg-white">
              Start direct
            </Link>
          </div>
        </div>
      )}
    </header>
  )
}
