import Link from 'next/link'
import { Logo } from '@/components/Logo'

const COLUMNS: { title: string; links: { label: string; href: string }[] }[] = [
  {
    title: 'Product',
    links: [
      { label: 'Platform', href: '/oude-landing' },
      { label: 'Onderhoud', href: '/oude-landing' },
      { label: 'Financieel', href: '/oude-landing' },
      { label: 'Flows', href: '/oude-landing' },
      { label: 'Prijzen', href: '/prijzen' },
    ],
  },
  {
    title: 'Bedrijf',
    links: [
      { label: 'Over ons', href: '/contact' },
      { label: 'Blog', href: '/blog' },
      { label: 'Careers', href: '/contact' },
      { label: 'Contact', href: '/contact' },
    ],
  },
  {
    title: 'Bronnen',
    links: [
      { label: 'Documentatie', href: '/contact' },
      { label: 'Status', href: '/contact' },
      { label: 'Beveiliging', href: '/contact' },
    ],
  },
  {
    title: 'Juridisch',
    links: [
      { label: 'Privacy', href: '/privacy' },
      { label: 'Voorwaarden', href: '/voorwaarden' },
      { label: 'Cookies', href: '/privacy' },
    ],
  },
]

export function RampFooter() {
  return (
    <footer className="border-t border-black/[0.08] bg-white">
      <div className="mx-auto max-w-7xl px-6 py-16 md:px-8">
        <div className="grid gap-10 md:grid-cols-[1.4fr_repeat(4,1fr)]">
          <div>
            <Logo width={80} height={22} href="/agentic" />
            <p className="mt-4 max-w-xs text-[14px] leading-relaxed text-[#163300]/50">
              Agentic vastgoedbeheer. Van melding tot factuur, volledig zelfstandig.
            </p>
          </div>
          {COLUMNS.map((col) => (
            <div key={col.title}>
              <p className="text-[13px] font-semibold text-[#163300]">{col.title}</p>
              <ul className="mt-4 space-y-3">
                {col.links.map((l) => (
                  <li key={l.label}>
                    <Link
                      href={l.href}
                      className="text-[14px] text-[#163300]/55 transition-colors hover:text-[#163300]"
                    >
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-16 flex flex-col items-start justify-between gap-4 border-t border-black/[0.08] pt-8 sm:flex-row sm:items-center">
          <p className="text-[13px] text-[#163300]/45">© 2026 Domio. Alle rechten voorbehouden.</p>
          <p className="text-[13px] text-[#163300]/45">Gemaakt in Amsterdam · Nederlandse hosting</p>
        </div>
      </div>
    </footer>
  )
}
