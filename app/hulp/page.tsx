'use client'

import Link from 'next/link'
import { MessageCircle, Phone, Mail, HelpCircle, ArrowRight, Clock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Logo } from '@/components/Logo'
import { CONTACT_EMAIL } from '@/lib/site-config'
import { GeometricShapes } from '@/components/decorative/geometric-shapes'

const PHONE = '+31646231696'
const WHATSAPP_LINK = `https://wa.me/31646231696`

export default function HulpPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      {/* Header */}
      <header className="sticky top-0 z-40 w-full bg-white/95 dark:bg-neutral-900/95 backdrop-blur border-b border-gray-200 dark:border-neutral-800">
        <div className="mx-auto max-w-4xl px-6 h-16 flex items-center justify-between">
          <Logo width={100} height={28} href="/" />
          <Link
            href="/"
            className="text-sm font-medium text-gray-600 hover:text-[#163300] dark:text-gray-400 dark:hover:text-[#9FE870] transition-colors"
          >
            ← Terug
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-6 py-12 md:py-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold tracking-tight text-[#163300] dark:text-white sm:text-5xl">
            Klantenservice
          </h1>
          <p className="mt-3 text-lg text-gray-600 dark:text-gray-400">
            We staan voor je klaar. Kies hoe je contact wilt opnemen.
          </p>
        </div>

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

        {/* Openingstijden */}
        <div className="mt-12 rounded-2xl border border-gray-200 dark:border-neutral-700 bg-gray-50/50 dark:bg-neutral-900/50 p-6 flex items-center gap-4">
          <Clock className="h-6 w-6 shrink-0 text-[#163300] dark:text-[#9FE870]" />
          <div>
            <p className="font-medium text-gray-900 dark:text-white">Beschikbaarheid</p>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              WhatsApp: meestal binnen minuten. Telefoon: ma–vr 09:00–17:00.
            </p>
          </div>
        </div>

        <div className="mt-8 text-center">
          <Button asChild variant="outline" className="rounded-full border-[#163300]/30 text-[#163300] hover:bg-[#163300]/5 hover:border-[#163300]">
            <Link href="/contact">Uitgebreid contactformulier →</Link>
          </Button>
        </div>
      </main>
    </div>
  )
}
