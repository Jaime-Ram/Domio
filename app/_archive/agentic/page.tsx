import Link from 'next/link'
import type { Metadata } from 'next'
import {
  ArrowRight,
  Building2,
  Users,
  ShieldCheck,
  Workflow,
  CalendarRange,
  BookUser,
} from 'lucide-react'
import { AgenticHeader } from '@/components/agentic/agentic-header'
import { AgenticHero } from '@/components/agentic/agentic-hero'
import { RampFaq } from '@/components/agentic/ramp-faq'
import { RampFooter } from '@/components/agentic/ramp-footer'
import {
  ScreenMaintenance,
  ScreenFinance,
  ScreenDashboard,
} from '@/components/agentic/app-mockups'

export const metadata: Metadata = {
  title: 'Domio Agentic · Onderhoud dat zichzelf regelt',
  description:
    'Domio Agentic neemt je vastgoedbeheer over: van onderhoudsmelding tot factuur, van betaling tot portefeuille-overzicht. Agents doen het werk, jij houdt de regie.',
}

/* ─────────────────────────── TRUST-BAND (ingetogen regel) ─────────────────────────── */
const TRUST = ['13.000+ units beheerd', '99,9% uptime', 'AVG-proof', 'Nederlandse hosting']

function TrustStrip() {
  return (
    <div className="mx-auto max-w-6xl px-6 md:px-8">
      <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-3 border-t border-black/[0.08] pt-10 text-[14px] font-medium text-[#1d3014]/45">
        {TRUST.map((t, i) => (
          <span key={t} className="flex items-center gap-8">
            {i > 0 && <span className="hidden h-1 w-1 rounded-full bg-[#1d3014]/20 sm:block" />}
            {t}
          </span>
        ))}
      </div>
    </div>
  )
}

/* ─────────────────────────── PRODUCT-SECTIE (alternerend) ─────────────────────────── */
function ProductSection({
  eyebrow,
  title,
  body,
  bullets,
  media,
  reverse = false,
  tinted = false,
}: {
  eyebrow: string
  title: string
  body: string
  bullets: string[]
  media: React.ReactNode
  reverse?: boolean
  tinted?: boolean
}) {
  return (
    <section className={tinted ? 'bg-[#FBFAF7]' : 'bg-white'}>
      <div className="mx-auto max-w-7xl px-6 py-20 md:px-8 md:py-28">
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-20">
          <div className={reverse ? 'lg:order-2' : ''}>
            <p className="text-[13px] font-semibold uppercase tracking-[0.14em] text-[#15803D]">
              {eyebrow}
            </p>
            <h2 className="mt-4 text-3xl font-semibold tracking-tight text-[#1d3014] sm:text-4xl md:text-[2.75rem] md:leading-[1.05]">
              {title}
            </h2>
            <p className="mt-5 max-w-md text-lg leading-relaxed text-[#1d3014]/60">{body}</p>
            <ul className="mt-8 space-y-4 border-t border-black/[0.08] pt-6">
              {bullets.map((b) => (
                <li key={b} className="flex items-start gap-3 text-[15px] text-[#1d3014]/80">
                  <ArrowRight className="mt-1 h-4 w-4 shrink-0 text-[#15803D]" />
                  {b}
                </li>
              ))}
            </ul>
          </div>
          <div className={reverse ? 'lg:order-1' : ''}>{media}</div>
        </div>
      </div>
    </section>
  )
}

/* ─────────────────────────── STAT-BAND (donkergroen) ─────────────────────────── */
const STATS = [
  { value: '12 uur', label: 'bespaard per week per beheerder' },
  { value: '2 min', label: 'gemiddelde reactietijd op een melding' },
  { value: '100%', label: 'van de meldingen automatisch opgevolgd' },
]

function StatBand() {
  return (
    <section className="bg-[#1d3014]">
      <div className="mx-auto max-w-7xl px-6 py-20 md:px-8 md:py-24">
        <p className="text-[13px] font-semibold uppercase tracking-[0.14em] text-[#c8e957]">
          Meetbaar resultaat
        </p>
        <div className="mt-10 grid gap-12 md:grid-cols-3 md:gap-8">
          {STATS.map((s) => (
            <div key={s.label}>
              <div className="text-5xl font-semibold tracking-tight text-white md:text-6xl">
                {s.value}
              </div>
              <div className="mt-3 max-w-[16rem] text-[15px] leading-relaxed text-white/55">
                {s.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ─────────────────────────── FEATURE-LIJST ─────────────────────────── */
const FEATURES = [
  { icon: Building2, title: 'Portefeuille', desc: 'Al je panden en units in één helder, altijd actueel overzicht.' },
  { icon: Users, title: 'Huurders', desc: 'Contracten, contactmomenten en communicatie op één plek.' },
  { icon: Workflow, title: 'Flows', desc: 'Automatiseer terugkerend werk zonder ook maar één regel code.' },
  { icon: ShieldCheck, title: 'Compliance', desc: 'Keuringen, certificaten en verplichtingen bewaakt en op tijd.' },
  { icon: CalendarRange, title: 'MJOP', desc: 'Meerjarenonderhoud gepland en begroot, jaren vooruit.' },
  { icon: BookUser, title: 'Contactboek', desc: 'Vakmensen en leveranciers binnen handbereik voor elke klus.' },
]

function FeatureGrid() {
  return (
    <section className="bg-white">
      <div className="mx-auto max-w-7xl px-6 py-20 md:px-8 md:py-28">
        <div className="max-w-2xl">
          <p className="text-[13px] font-semibold uppercase tracking-[0.14em] text-[#15803D]">
            Eén platform
          </p>
          <h2 className="mt-4 text-3xl font-semibold tracking-tight text-[#1d3014] sm:text-4xl md:text-[2.75rem] md:leading-[1.05]">
            Alles voor je vastgoedbeheer op één plek
          </h2>
          <p className="mt-5 text-lg leading-relaxed text-[#1d3014]/60">
            Onderhoud is het begin. Domio brengt je hele beheer samen en de agents pakken overal het
            werk op.
          </p>
        </div>
        <div className="mt-16 grid gap-x-10 gap-y-12 border-t border-black/[0.08] pt-12 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f) => (
            <div key={f.title}>
              <f.icon className="h-6 w-6 text-[#15803D]" strokeWidth={1.75} />
              <h3 className="mt-4 text-lg font-semibold tracking-tight text-[#1d3014]">{f.title}</h3>
              <p className="mt-2 text-[15px] leading-relaxed text-[#1d3014]/55">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ─────────────────────────── TESTIMONIAL ─────────────────────────── */
function Testimonial() {
  return (
    <section className="border-y border-black/[0.06] bg-[#FBFAF7]">
      <div className="mx-auto max-w-4xl px-6 py-24 text-center md:px-8 md:py-32">
        <blockquote className="text-[1.75rem] font-medium leading-[1.35] tracking-tight text-[#1d3014] sm:text-3xl md:text-[2.25rem]">
          &ldquo;Sinds Domio Agentic onze meldingen afhandelt blijft er niets meer liggen. Laatst werd
          &apos;s nachts een lekkage gemeld, automatisch getrieerd en de volgende ochtend al opgelost,
          zonder dat ik er iets voor hoefde te doen.&rdquo;
        </blockquote>
        <div className="mt-10 flex items-center justify-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#1d3014] text-[13px] font-semibold text-white">
            SW
          </span>
          <div className="text-left">
            <p className="text-[15px] font-medium text-[#1d3014]">Sanne de Wit</p>
            <p className="text-[13px] text-[#1d3014]/50">Vastgoedbeheerder, Lindehof Vastgoedbeheer</p>
          </div>
        </div>
      </div>
    </section>
  )
}

/* ─────────────────────────── SLOT-CTA (Ramp: groot statement) ─────────────────────────── */
function FinalCta() {
  return (
    <section className="bg-white">
      <div className="mx-auto max-w-7xl px-6 py-28 text-center md:px-8 md:py-40">
        <h2 className="mx-auto max-w-3xl text-4xl font-semibold tracking-tight text-[#1d3014] sm:text-5xl md:text-[4rem] md:leading-[1.02]">
          Tijd is geld.<br />Bespaar allebei.
        </h2>
        <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/registreren"
            className="inline-flex items-center gap-2 rounded-lg bg-[#1d3014] px-7 py-3.5 text-[15px] font-semibold text-white transition-colors hover:bg-[#1d3014]/90"
          >
            Start direct
            <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            href="/contact"
            className="inline-flex items-center gap-2 rounded-lg border border-[#1d3014]/15 bg-white px-7 py-3.5 text-[15px] font-semibold text-[#1d3014] transition-colors hover:border-[#1d3014]/30"
          >
            Praat met sales
          </Link>
        </div>
      </div>
    </section>
  )
}

/* ─────────────────────────── PAGE ─────────────────────────── */
export default function AgenticLanding() {
  return (
    <div className="min-h-screen bg-white">
      <AgenticHeader />

      <main>
        <AgenticHero />

        {/* Hero product-shot op een zacht getint paneel + trust-band */}
        <section className="px-6 pb-20 md:px-8 md:pb-28">
          <div className="mx-auto max-w-6xl rounded-3xl bg-gradient-to-b from-[#EAF3DC] to-[#F7FAF2] p-4 sm:p-8 md:p-12">
            <ScreenMaintenance />
          </div>
          <div className="mt-14">
            <TrustStrip />
          </div>
        </section>

        <ProductSection
          eyebrow="Financieel"
          title="Financiën die vanzelf kloppen"
          body="Elke binnenkomende betaling wordt automatisch gekoppeld aan de juiste huurder en het juiste pand. Achterstanden zie je meteen, zonder handmatig uitzoekwerk."
          bullets={[
            'Automatische matching van betalingen aan huurders',
            'Achterstanden direct in beeld, met opvolging',
            'Koppeling met je boekhouding, zoals Accountview',
          ]}
          media={<ScreenFinance />}
          tinted
        />

        <StatBand />

        <ProductSection
          eyebrow="Overzicht"
          title="Je hele portefeuille in één blik"
          body="Huur, bezetting, open tickets en achterstanden, altijd actueel op één dashboard. Zie precies wat er speelt zonder tien tabbladen open te hebben."
          bullets={[
            'Live cijfers over huur, bezetting en achterstand',
            'Alle panden en units overzichtelijk bij elkaar',
            'Meldingen en activiteit op één tijdlijn',
          ]}
          media={<ScreenDashboard />}
          reverse
        />

        <FeatureGrid />
        <Testimonial />
        <RampFaq />
        <FinalCta />
      </main>

      <RampFooter />
    </div>
  )
}
