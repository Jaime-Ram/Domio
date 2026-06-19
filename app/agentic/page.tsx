import Image from 'next/image'
import Link from 'next/link'
import type { Metadata } from 'next'
import { ArrowUpRight } from 'lucide-react'
import { AgenticHeader } from '@/components/agentic/agentic-header'
import { AgenticHero } from '@/components/agentic/agentic-hero'
import { AgenticTools } from '@/components/agentic/agentic-tools'
import { AgenticFooter } from '@/components/agentic/agentic-footer'

export const metadata: Metadata = {
  title: 'Domio Agentic · Onderhoud dat zichzelf regelt',
  description:
    'Domio Agentic neemt je vastgoedonderhoud over: van melding tot opgeloste klacht. Agents triëren, sturen vakmensen aan en houden iedereen op de hoogte.',
}

const CREAM = '#FBFAF7'

/* ───────────────────── PARTNERS (logo ipsum set) ───────────────────── */
const PARTNER_LOGOS = [1, 2, 3, 4, 5]

function Partners() {
  return (
    <section className="bg-[#FBFAF7] py-14">
      <div className="mx-auto max-w-7xl px-5 md:px-8">
        <p className="text-center text-sm text-[#163300]/50">
          We werken samen met toonaangevende partijen in vastgoed:
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-x-12 gap-y-6">
          {PARTNER_LOGOS.map((n) => (
            <Image
              key={n}
              src={`/logos/partners-${n}.svg`}
              alt={`Partner ${n}`}
              width={130}
              height={22}
              className="object-contain opacity-40 brightness-0"
            />
          ))}
        </div>
      </div>
    </section>
  )
}

/* ───────────────────── WAT AGENTIC DOET (Runway-stijl kaarten) ───────────────────── */
const CAPABILITIES = [
  {
    img: '/images/Achtergrond3.jpg',
    title: 'Meldingen opvangen en triëren',
    desc: 'Elke melding komt via één kanaal binnen en wordt direct beoordeeld op urgentie en de juiste vervolgstap.',
  },
  {
    img: '/images/Achtergrond7.jpg',
    title: 'De juiste vakman aansturen',
    desc: 'De juiste vakman wordt gekozen op klacht, locatie en beschikbaarheid, ingepland en op pad gestuurd.',
  },
  {
    img: '/images/Achtergrond11.jpg',
    title: 'SLA bewaken en opvolgen',
    desc: 'Deadlines worden bewaakt en huurder en eigenaar krijgen vanzelf updates tot de klacht is opgelost.',
  },
  {
    img: '/images/Achtergrond5.jpg',
    title: 'Facturen verwerken en koppelen',
    desc: 'Facturen van vakmensen worden gecontroleerd en automatisch aan het juiste pand en de kostenpost gekoppeld.',
  },
]

function Capabilities() {
  return (
    <section id="hoe-het-werkt" className="scroll-mt-20 bg-[#FBFAF7] py-16 sm:py-20">
      <div className="mx-auto max-w-7xl px-5 md:px-8">
        <h2 className="max-w-5xl text-3xl font-medium leading-snug tracking-tight text-[#163300] sm:text-4xl md:text-[2.5rem] md:leading-[1.2]">
          Agentic AI verandert hoe vastgoedonderhoud werkt:<br className="hidden md:block" /> van
          melding tot factuur loopt alles vanzelf, volledig op de automaat.
        </h2>

        <div className="mt-14 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {CAPABILITIES.map((c) => (
            <div key={c.title} className="flex flex-col">
              <div className="relative aspect-[4/5] w-full overflow-hidden rounded-lg">
                <Image src={c.img} alt={c.title} fill className="object-cover" />
              </div>
              <h3 className="mt-5 text-xl font-medium text-[#163300]">{c.title}</h3>
              <p className="mt-2 min-h-[4.5rem] text-sm leading-6 text-[#163300]/60">{c.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ─────────────────────── DERDE SECTIE (research-blok, mock) ─────────────────────── */
const RESEARCH_ITEMS = [
  {
    title: 'Agent-orchestratie',
    desc: 'Meerdere agents werken samen om elke melding van begin tot eind af te handelen. (mock-tekst)',
  },
  {
    title: 'Slimme triage',
    desc: 'Elke melding wordt automatisch beoordeeld op urgentie, type en de juiste vervolgstap. (mock-tekst)',
  },
  {
    title: 'Vakmannen-netwerk',
    desc: 'Het systeem kiest en stuurt automatisch de best passende vakman aan. (mock-tekst)',
  },
]

function ResearchBlock() {
  return (
    <section id="onder-de-motorkap" className="scroll-mt-20 px-2.5 py-6 sm:px-3 lg:px-4">
      <div className="relative mx-auto flex min-h-[86vh] w-full max-w-[1500px] items-center overflow-hidden rounded-lg bg-gray-900">
        <Image src="/images/Achtergrond8.jpg" alt="" fill className="scale-110 object-cover blur-md" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/60 to-black/45" />

        <div className="relative z-10 grid w-full gap-12 p-10 sm:p-12 lg:grid-cols-2 lg:gap-20 lg:p-16">
          {/* Links: label + paragraaf + knop */}
          <div className="flex flex-col">
            <p className="text-sm font-medium text-white/60">Onder de motorkap</p>
            <p className="mt-6 text-xl font-medium leading-snug text-white sm:text-2xl md:text-[1.75rem] md:leading-[1.35]">
              Mock-tekst: we bouwen agentic systemen die vastgoedonderhoud volledig zelfstandig
              afhandelen, van de eerste melding tot de afgehandelde factuur, zonder dat er een mens
              aan te pas hoeft te komen.
            </p>
            <div className="mt-8">
              <Link
                href="/registreren"
                className="inline-flex items-center justify-center rounded-xl border border-white/60 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-white/10"
              >
                Meer weten
              </Link>
            </div>
          </div>

          {/* Rechts: lijst met lijntjes */}
          <div className="flex flex-col lg:pt-1 lg:pl-12 lg:pr-6">
            {RESEARCH_ITEMS.map((it) => (
              <a
                key={it.title}
                href="#"
                className="group border-t border-white/20 py-6 last:border-b"
              >
                <div className="flex items-start justify-between gap-4">
                  <h3 className="text-xl font-normal text-white">{it.title}</h3>
                  <ArrowUpRight className="h-5 w-5 shrink-0 text-white/60 transition-colors group-hover:text-white" />
                </div>
                <p className="mt-2 text-sm leading-6 text-white/55">{it.desc}</p>
              </a>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

/* ─────────────────────── LAATSTE NIEUWS (mock) ─────────────────────── */
const NEWS = [
  {
    img: '/images/Achtergrond1.jpg',
    title: 'Agentic AI in vastgoedbeheer: de eerste resultaten',
    p1: 'Mock-tekst: hoe zelfstandige agents het onderhoudsproces van melding tot factuur overnemen en wat dat oplevert voor verhuurders.',
    p2: 'Mock-tekst: een eerste blik op de impact op doorlooptijden, kosten en huurderstevredenheid.',
  },
  {
    img: '/images/Achtergrond4.jpg',
    title: 'Van melding tot opgeloste klacht, zonder tussenkomst',
    p1: 'Mock-tekst: een doorlopend voorbeeld van een melding die volledig automatisch wordt getrieerd, uitgezet en afgehandeld.',
    p2: 'Mock-tekst: wat er onder de motorkap gebeurt en waarom dat betrouwbaar is.',
  },
  {
    img: '/images/Achtergrond14.jpg',
    title: 'Waarom vakmannen-aansturing slimmer wordt met AI',
    p1: 'Mock-tekst: hoe het systeem de juiste vakman kiest op klacht, locatie en beschikbaarheid.',
    p2: 'Mock-tekst: en hoe dat reistijd verlaagt en de planning strakker maakt.',
  },
]

function LatestNews() {
  return (
    <section className="bg-[#FBFAF7] py-16 sm:py-20">
      <div className="mx-auto max-w-7xl px-5 md:px-8">
        <h2 className="text-3xl font-medium tracking-tight text-[#163300] sm:text-4xl">
          Het laatste nieuws omtrent AI binnen vastgoedbeheer
        </h2>

        <div className="mt-12 flex flex-col gap-12">
          {NEWS.map((n) => (
            <div key={n.title} className="grid grid-cols-1 items-center gap-8 lg:grid-cols-2 lg:gap-16">
              <div className="relative aspect-[3/2] w-full overflow-hidden rounded-lg">
                <Image src={n.img} alt={n.title} fill className="object-cover" />
              </div>
              <div className="flex flex-col">
                <h3 className="text-2xl font-medium leading-snug tracking-tight text-[#163300] sm:text-3xl">
                  {n.title}
                </h3>
                <div className="mt-4 space-y-3 text-sm leading-6 text-[#163300]/60">
                  <p>{n.p1}</p>
                  <p>{n.p2}</p>
                </div>
                <div className="mt-6">
                  <Link
                    href="#"
                    className="inline-flex items-center justify-center rounded-xl bg-[#9FE870] px-5 py-2.5 text-sm font-semibold text-[#163300] shadow-sm transition-colors hover:bg-[#9FE870]/90"
                  >
                    Meer lezen
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ─────────────────────── SLOT-HOOK (banner) ─────────────────────── */
function FinalCta() {
  return (
    <section id="aan-de-slag" className="scroll-mt-20 px-2.5 py-10 sm:px-3 lg:px-4">
      <div className="relative mx-auto flex min-h-[460px] w-full max-w-[1500px] items-center justify-center overflow-hidden rounded-lg bg-gray-900">
        <Image src="/images/Achtergrond13.jpg" alt="" fill className="object-cover" />
        <div className="absolute inset-0 bg-black/55" />
        <div className="relative z-10 mx-auto max-w-3xl px-6 text-center">
          <h2 className="text-3xl font-medium leading-tight tracking-tight text-white sm:text-4xl md:text-5xl">
            Laat je onderhoud vanaf vandaag zichzelf regelen.
          </h2>
          <p className="mx-auto mt-5 max-w-xl text-base text-white/75 sm:text-lg">
            Klaar in 60 seconden. 7 dagen gratis, direct opzegbaar.
          </p>
          <div className="mt-8">
            <Link
              href="/registreren"
              className="inline-flex items-center justify-center rounded-xl border border-white/60 px-7 py-3 text-sm font-semibold text-white transition-colors hover:bg-white/10"
            >
              Start direct
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}

/* ─────────────────────── LAATSTE NIEUWS (grid, mock) ─────────────────────── */
const NIEUWS = [
  { img: '/images/Achtergrond10.jpg', title: 'Hoe agentic AI vastgoedonderhoud verandert' },
  { img: '/images/Achtergrond12.jpg', title: 'Sneller van melding naar opgeloste klacht' },
  { img: '/images/AchtergrondX.jpg', title: 'Slimmere vakmannen-aansturing met AI' },
]

function NieuwsGrid() {
  return (
    <section id="nieuws" className="scroll-mt-20 bg-[#FBFAF7] py-16 sm:py-20">
      <div className="mx-auto max-w-7xl px-5 md:px-8">
        <h2 className="text-3xl font-medium tracking-tight text-[#163300] sm:text-4xl">Laatste nieuws</h2>

        <div className="mt-12 grid grid-cols-1 gap-8 md:grid-cols-3">
          {NIEUWS.map((n) => (
            <a key={n.title} href="#" className="group flex flex-col">
              <div className="relative aspect-[16/10] w-full overflow-hidden rounded-lg">
                <Image
                  src={n.img}
                  alt={n.title}
                  fill
                  className="object-cover transition-transform duration-300 group-hover:scale-105"
                />
              </div>
              <h3 className="mt-4 text-xl font-medium leading-snug text-[#163300]">{n.title}</h3>
            </a>
          ))}
        </div>

        <div className="mt-12 flex justify-center">
          <Link
            href="#"
            className="inline-flex items-center justify-center rounded-xl border border-[#163300]/25 bg-transparent px-6 py-3 text-sm font-semibold text-[#163300] transition-colors hover:bg-[#163300]/5"
          >
            Bekijk al het nieuws
          </Link>
        </div>
      </div>
    </section>
  )
}

/* ─────────────────────────── PAGE ─────────────────────────── */
export default function AgenticLanding() {
  return (
    <div className="min-h-screen" style={{ backgroundColor: CREAM }}>
      <AgenticHeader />
      <main>
        <AgenticHero />
        <Partners />
        <Capabilities />
        <ResearchBlock />
        <AgenticTools />
        <LatestNews />
        <FinalCta />
        <NieuwsGrid />
      </main>
      <AgenticFooter />
    </div>
  )
}
