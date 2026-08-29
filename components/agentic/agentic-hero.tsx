import Link from 'next/link'
import { ArrowRight } from 'lucide-react'

/**
 * Ramp-achtige hero: rustige witte achtergrond, grote strakke bijna-zwarte
 * kop, ingetogen subtekst, twee crispe knoppen. Geen gradient, geen ruis.
 * De product-shot staat er los onder (in page.tsx) op een zacht getint paneel.
 */
export function AgenticHero() {
  return (
    <section className="mx-auto max-w-7xl px-6 pb-14 pt-16 md:px-8 md:pb-20 md:pt-24">
      <div className="max-w-3xl">
        <p className="text-[14px] font-semibold uppercase tracking-[0.14em] text-[#15803D]">
          Agentic vastgoedbeheer
        </p>
        <h1 className="mt-5 text-[2.75rem] font-semibold leading-[1.02] tracking-tight text-[#1d3014] sm:text-6xl md:text-[4.25rem]">
          Onderhoud dat<br />zichzelf regelt
        </h1>
        <p className="mt-6 max-w-xl text-lg leading-relaxed text-[#1d3014]/60 md:text-xl">
          Een team van agents handelt je vastgoedonderhoud af, van melding tot factuur. Volledig
          zelfstandig, terwijl jij de regie houdt.
        </p>
        <div className="mt-9 flex flex-wrap items-center gap-3">
          <Link
            href="/registreren"
            className="inline-flex items-center gap-2 rounded-lg bg-[#1d3014] px-6 py-3 text-[15px] font-semibold text-white transition-colors hover:bg-[#1d3014]/90"
          >
            Start direct
            <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            href="/contact"
            className="inline-flex items-center gap-2 rounded-lg border border-[#1d3014]/15 bg-white px-6 py-3 text-[15px] font-semibold text-[#1d3014] transition-colors hover:border-[#1d3014]/30"
          >
            Boek een demo
          </Link>
        </div>
      </div>
    </section>
  )
}
