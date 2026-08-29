import Link from 'next/link'
import { Logo } from '@/components/Logo'

const NAV = [
  { label: 'Platform', href: '/oude-landing' },
  { label: 'Prijzen', href: '/prijzen' },
  { label: 'Blog', href: '/blog' },
  { label: 'Careers', href: '/contact' },
]

/**
 * Ramp-achtige topbar: strak, sticky, bijna-witte balk met dunne onderrand.
 * Logo links, nav-links in het midden, rechts Inloggen + een gevulde CTA.
 */
export function AgenticHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-black/[0.06] bg-white/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6 md:px-8">
        <div className="flex items-center gap-10">
          <Logo width={72} height={20} href="/agentic" />
          <nav className="hidden items-center gap-1 md:flex">
            {NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="rounded-md px-3 py-2 text-[14px] font-medium text-[#1d3014]/70 transition-colors hover:text-[#1d3014]"
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/login"
            className="hidden rounded-md px-3 py-2 text-[14px] font-medium text-[#1d3014]/70 transition-colors hover:text-[#1d3014] sm:block"
          >
            Inloggen
          </Link>
          <Link
            href="/registreren"
            className="rounded-lg bg-[#1d3014] px-4 py-2 text-[14px] font-semibold text-white transition-colors hover:bg-[#1d3014]/90"
          >
            Start direct
          </Link>
        </div>
      </div>
    </header>
  )
}
