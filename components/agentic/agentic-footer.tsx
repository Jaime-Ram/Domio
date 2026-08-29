import Link from 'next/link'
import { Linkedin, Instagram, ShieldCheck } from 'lucide-react'
import { Logo } from '@/components/Logo'

/**
 * Footer voor Domio Agentic. Klein, simpel, GDPR-badge, dezelfde legal-pagina's
 * als het hoofd-Domio (privacy, voorwaarden, verwerkersovereenkomst).
 */
export function AgenticFooter() {
  const year = new Date().getFullYear()

  return (
    <footer className="bg-[#FBFAF7] border-t border-black/5">
      <div className="mx-auto max-w-7xl px-5 md:px-8 py-14">
        <div className="flex flex-col gap-10 md:flex-row md:justify-between">
          {/* Links: logo + socials + compliance */}
          <div className="flex flex-col gap-5">
            <Logo width={88} height={25} href="/agentic" />
            <div className="flex items-center gap-2">
              <a href="https://linkedin.com" aria-label="LinkedIn" className="h-8 w-8 rounded-lg bg-black/5 flex items-center justify-center text-[#1d3014] hover:bg-black/10 transition-colors">
                <Linkedin className="h-4 w-4" />
              </a>
              <a href="https://instagram.com" aria-label="Instagram" className="h-8 w-8 rounded-lg bg-black/5 flex items-center justify-center text-[#1d3014] hover:bg-black/10 transition-colors">
                <Instagram className="h-4 w-4" />
              </a>
            </div>
            <div className="inline-flex items-center gap-2 text-[#1d3014]">
              <ShieldCheck className="h-5 w-5" />
              <div className="leading-tight">
                <p className="text-xs font-semibold">AVG / GDPR</p>
                <p className="text-[10px] text-[#1d3014]/60">Compliant · data in de EU</p>
              </div>
            </div>
          </div>

          {/* Rechts: kolommen */}
          <div className="grid grid-cols-2 gap-12 sm:gap-20">
            <div className="flex flex-col gap-3">
              <p className="text-sm font-semibold text-[#1d3014]">Bedrijf</p>
              <Link href="/agentic#hoe-het-werkt" className="text-sm text-[#1d3014]/70 hover:text-[#1d3014] transition-colors">Hoe het werkt</Link>
              <Link href="/contact" className="text-sm text-[#1d3014]/70 hover:text-[#1d3014] transition-colors">Contact</Link>
            </div>
            <div className="flex flex-col gap-3">
              <p className="text-sm font-semibold text-[#1d3014]">Juridisch</p>
              <Link href="/privacy" className="text-sm text-[#1d3014]/70 hover:text-[#1d3014] transition-colors">Privacybeleid</Link>
              <Link href="/privacy-en-beveiliging" className="text-sm text-[#1d3014]/70 hover:text-[#1d3014] transition-colors">Privacy &amp; beveiliging</Link>
              <Link href="/terms" className="text-sm text-[#1d3014]/70 hover:text-[#1d3014] transition-colors">Algemene voorwaarden</Link>
              <Link href="/verwerkersovereenkomst" className="text-sm text-[#1d3014]/70 hover:text-[#1d3014] transition-colors">Verwerkersovereenkomst</Link>
            </div>
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between border-t border-black/5 pt-6">
          <p className="text-xs text-[#1d3014]/50">Domio. Alle rechten voorbehouden. © {year}</p>
          <p className="text-xs text-[#1d3014]/50">Domio Agentic · onderdeel van Domio Vastgoedbeheer</p>
        </div>
      </div>
    </footer>
  )
}
