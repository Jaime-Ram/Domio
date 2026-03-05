'use client'

import Link from 'next/link'
import { MessageCircle, Phone, Mail, HelpCircle, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { MarketingLayout } from '@/components/marketing/marketing-layout'
import { FooterSection } from '@/components/marketing/footer-section'
import { CONTACT_EMAIL } from '@/lib/site-config'
import { GeometricShapes } from '@/components/decorative/geometric-shapes'

const PHONE = '+31646231696'
const WHATSAPP_LINK = `https://wa.me/31646231696`

export default function HulpPage() {
  return (
    <MarketingLayout>
      <main className="min-h-screen bg-white dark:bg-gray-900">
        <section className="mx-auto max-w-7xl px-6 pt-16 pb-12 sm:pt-24 sm:pb-16 lg:px-8">
          <div className="max-w-3xl">
            <h1 className="text-4xl font-bold tracking-tight text-[#163300] dark:text-white sm:text-5xl md:text-6xl">
              Klantenservice
            </h1>
            <p className="mt-6 text-lg text-gray-600 dark:text-gray-400">
              We staan voor je klaar. Kies hoe je contact wilt opnemen.
            </p>
          </div>
        </section>

        <div className="mx-auto max-w-7xl px-6 pb-16 md:px-8 md:pb-20">
        <div className="max-w-4xl">
        <div className="grid gap-6 md:grid-cols-2">
          {/* Live chat / WhatsApp – primair voor direct contact */}
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

          {/* Bellen */}
          <a
            href={`tel:${PHONE.replace(/\s/g, '')}`}
            className="group flex flex-col rounded-2xl border border-gray-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 p-6 md:p-8 transition-all hover:border-[#163300]/40 hover:shadow-md"
          >
            <div className="flex items-start gap-4">
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gray-100 dark:bg-neutral-800 text-[#163300] dark:text-[#9FE870]">
                <Phone className="h-6 w-6" strokeWidth={2} />
              </span>
              <div>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Bel ons</h2>
                <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                  Voor urgente vragen of een persoonlijk gesprek.
                </p>
                <span className="mt-3 inline-block text-lg font-semibold text-[#163300] dark:text-[#9FE870]">
                  +31 6 46 23 16 96
                </span>
              </div>
            </div>
          </a>

          {/* E-mail */}
          <a
            href={`mailto:${CONTACT_EMAIL}`}
            className="group flex flex-col rounded-2xl border border-gray-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 p-6 md:p-8 transition-all hover:border-[#163300]/40 hover:shadow-md"
          >
            <div className="flex items-start gap-4">
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gray-100 dark:bg-neutral-800 text-[#163300] dark:text-[#9FE870]">
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

          {/* FAQ */}
          <Link
            href="/faq"
            className="group flex flex-col rounded-2xl border border-gray-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 p-6 md:p-8 transition-all hover:border-[#163300]/40 hover:shadow-md"
          >
            <div className="flex items-start gap-4">
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gray-100 dark:bg-neutral-800 text-[#163300] dark:text-[#9FE870]">
                <HelpCircle className="h-6 w-6" strokeWidth={2} />
              </span>
              <div>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Veelgestelde vragen</h2>
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

        <div className="mt-8 text-center">
          <Button asChild className="rounded-full bg-[#9FE870] text-[#163300] hover:bg-[#9FE870]/90 border-0 px-8 py-6 text-base font-semibold shadow-sm">
            <Link href="/contact">Uitgebreid contactformulier →</Link>
          </Button>
        </div>
        </div>
        </div>
      </main>
      <FooterSection />
    </MarketingLayout>
  )
}
