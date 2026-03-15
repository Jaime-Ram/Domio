'use client'

import Link from 'next/link'
import { MessageCircle, Phone, Mail, HelpCircle, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { CONTACT_EMAIL } from '@/lib/site-config'
import { GeometricShapes } from '@/components/decorative/geometric-shapes'
import { dashboardCardClass } from '@/app/dashboard/employer/dashboard-ui'
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
          className="group relative flex flex-col overflow-hidden rounded-2xl border-2 border-[#163300] bg-[#163300] p-6 md:p-8 text-white transition-all hover:border-[#163300] hover:shadow-lg hover:shadow-[#163300]/20"
        >
          <GeometricShapes
            variant="trapezoid"
            className="right-0 bottom-0 w-32 h-32"
            color="#9FE870"
            opacity={0.2}
            layers={2}
          />
          <div className="relative z-10 flex items-start gap-4">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#9FE870] text-[#163300]">
              <MessageCircle className="h-6 w-6" strokeWidth={2} />
            </span>
            <div>
              <h2 className="text-xl font-semibold">Chat met ons</h2>
              <p className="mt-1 text-sm text-white/90">
                Direct contact via WhatsApp. We reageren meestal binnen een paar minuten.
              </p>
              <span className="mt-3 inline-flex items-center gap-2 text-sm font-medium text-[#9FE870] group-hover:gap-3 transition-all">
                Start gesprek
                <ArrowRight className="h-4 w-4" />
              </span>
            </div>
          </div>
          <div className="relative z-10 mt-4 flex items-center gap-2 text-xs text-white/80">
            <span className="flex h-2 w-2 rounded-full bg-[#9FE870] animate-pulse" aria-hidden />
            Live beschikbaar
          </div>
        </a>

        <a
          href={`tel:${PHONE.replace(/\s/g, '')}`}
          className={dashboardCardClass('group flex flex-col p-6 md:p-8 transition-all')}
        >
          <div className="flex items-start gap-4">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#f4f4f4] dark:bg-neutral-800 text-[#163300] dark:text-[#9FE870]">
              <Phone className="h-6 w-6" strokeWidth={2} />
            </span>
            <div>
              <h2 className="text-xl font-semibold text-[#163300] dark:text-[#9FE870]">Bel ons</h2>
              <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                Voor urgente vragen of een persoonlijk gesprek.
              </p>
              <span className="mt-3 inline-block text-lg font-semibold text-[#163300] dark:text-[#9FE870]">
                {PHONE}
              </span>
            </div>
          </div>
        </a>

        <a
          href={`mailto:${CONTACT_EMAIL}`}
          className={dashboardCardClass('group flex flex-col p-6 md:p-8 transition-all')}
        >
          <div className="flex items-start gap-4">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#f4f4f4] dark:bg-neutral-800 text-[#163300] dark:text-[#9FE870]">
              <Mail className="h-6 w-6" strokeWidth={2} />
            </span>
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">E-mail</h2>
              <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                Voor uitgebreide vragen. We reageren binnen 1–2 werkdagen.
              </p>
              <span className="mt-3 inline-block text-sm font-medium text-[#163300] dark:text-[#9FE870] underline-offset-2 group-hover:underline">
                {CONTACT_EMAIL}
              </span>
            </div>
          </div>
        </a>

        <Link
          href="/faq"
          className={dashboardCardClass('group flex flex-col p-6 md:p-8 transition-all')}
        >
          <div className="flex items-start gap-4">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#f4f4f4] dark:bg-neutral-800 text-[#163300] dark:text-[#9FE870]">
              <HelpCircle className="h-6 w-6" strokeWidth={2} />
            </span>
            <div>
              <h2 className="text-xl font-semibold text-[#163300] dark:text-[#9FE870]">Veelgestelde vragen</h2>
              <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                Vind snel antwoorden op veelgestelde vragen over Domio.
              </p>
              <span className="mt-3 inline-flex items-center gap-2 text-sm font-medium text-[#163300] dark:text-[#9FE870]">
                Bekijk FAQ
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </span>
            </div>
          </div>
        </Link>
      </div>
      <div className="mt-8">
        <Button asChild className="rounded-full bg-[#9FE870] text-[#163300] hover:bg-[#9FE870]/90 border-0 px-8 py-6 text-base font-semibold shadow-sm">
          <Link href="/contact">Uitgebreid contactformulier →</Link>
        </Button>
      </div>
    </>
  )
}
