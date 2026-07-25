'use client'

import Link from 'next/link'
import { MessageCircle, Phone, Mail, HelpCircle, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { CONTACT_EMAIL } from '@/lib/site-config'
import { GeometricShapes } from '@/components/decorative/geometric-shapes'
import { dashboardCardClass } from '@/app/dashboard/landlord/dashboard-ui'
import { SectionHeroHeader } from '@/components/dashboard/section-hero-header'

const PHONE = '+31 6 46 23 16 96'
const WHATSAPP_LINK = 'https://wa.me/31646231696'

export default function DashboardHulpPage() {
  return (
    <>
      <SectionHeroHeader
        title="Hulp nodig?"
        description="We staan voor je klaar. Kies hoe je contact wilt opnemen."
      />

      <div className="grid gap-content-blocks md:grid-cols-2">
        <a
          href={WHATSAPP_LINK}
          target="_blank"
          rel="noopener noreferrer"
          className="group relative flex flex-col overflow-hidden rounded-2xl border-2 border-[#161f13] bg-[#161f13] p-6 md:p-8 text-white transition-all hover:border-[#161f13] hover:shadow-lg hover:shadow-[#161f13]/20"
        >
          <GeometricShapes
            variant="trapezoid"
            className="right-0 bottom-0 w-32 h-32"
            color="#94f477"
            opacity={0.2}
            layers={2}
          />
          <div className="relative z-10 flex items-start gap-4">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#94f477] text-[#161f13]">
              <MessageCircle className="h-6 w-6" strokeWidth={2} />
            </span>
            <div>
              <h2 className="text-xl font-semibold">Chat met ons</h2>
              <p className="mt-1 text-sm text-white/90">
                Direct contact via WhatsApp. We reageren meestal binnen een paar minuten.
              </p>
              <span className="mt-3 inline-flex items-center gap-2 text-sm font-medium text-[#94f477] group-hover:gap-3 transition-all">
                Start gesprek
                <ArrowRight className="h-4 w-4" />
              </span>
            </div>
          </div>
          <div className="relative z-10 mt-4 flex items-center gap-2 text-xs text-white/80">
            <span className="flex h-2 w-2 rounded-full bg-[#94f477] animate-pulse" aria-hidden />
            Live beschikbaar
          </div>
        </a>

        <a
          href={`tel:${PHONE.replace(/\s/g, '')}`}
          className={dashboardCardClass('group flex flex-col p-5 md:p-7 transition-all')}
        >
          <div className="flex items-start gap-4">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#f4f4f4] dark:bg-neutral-800 text-[#161f13] dark:text-[#94f477]">
              <Phone className="h-6 w-6" strokeWidth={2} />
            </span>
            <div>
              <h2 className="text-xl font-semibold text-[#161f13] dark:text-[#94f477]">Bel ons</h2>
              <p className="mt-1 text-sm text-[#55554e] dark:text-[#97978f]">
                Voor urgente vragen of een persoonlijk gesprek.
              </p>
              <span className="mt-3 inline-block text-lg font-semibold text-[#161f13] dark:text-[#94f477]">
                {PHONE}
              </span>
            </div>
          </div>
        </a>

        <a
          href={`mailto:${CONTACT_EMAIL}`}
          className={dashboardCardClass('group flex flex-col p-5 md:p-7 transition-all')}
        >
          <div className="flex items-start gap-4">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#f4f4f4] dark:bg-neutral-800 text-[#161f13] dark:text-[#94f477]">
              <Mail className="h-6 w-6" strokeWidth={2} />
            </span>
            <div>
              <h2 className="text-xl font-semibold text-[#1a1c18] dark:text-white">E-mail</h2>
              <p className="mt-1 text-sm text-[#55554e] dark:text-[#97978f]">
                Voor uitgebreide vragen. We reageren binnen 1–2 werkdagen.
              </p>
              <span className="mt-3 inline-block text-sm font-medium text-[#161f13] dark:text-[#94f477] underline-offset-2 group-hover:underline">
                {CONTACT_EMAIL}
              </span>
            </div>
          </div>
        </a>

        <Link
          href="/faq"
          className={dashboardCardClass('group flex flex-col p-5 md:p-7 transition-all')}
        >
          <div className="flex items-start gap-4">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#f4f4f4] dark:bg-neutral-800 text-[#161f13] dark:text-[#94f477]">
              <HelpCircle className="h-6 w-6" strokeWidth={2} />
            </span>
            <div>
              <h2 className="text-xl font-semibold text-[#161f13] dark:text-[#94f477]">Veelgestelde vragen</h2>
              <p className="mt-1 text-sm text-[#55554e] dark:text-[#97978f]">
                Vind snel antwoorden op veelgestelde vragen over Domio.
              </p>
              <span className="mt-3 inline-flex items-center gap-2 text-sm font-medium text-[#161f13] dark:text-[#94f477]">
                Bekijk FAQ
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </span>
            </div>
          </div>
        </Link>
      </div>
      <div className="mt-8">
        <Button asChild className="rounded-full bg-[#94f477] text-[#161f13] hover:bg-[#94f477]/90 border-0 px-8 py-6 text-base font-semibold shadow-sm">
          <Link href="/contact">Uitgebreid contactformulier →</Link>
        </Button>
      </div>
    </>
  )
}
