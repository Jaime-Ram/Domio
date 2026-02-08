'use client'

import { useState, useEffect } from 'react'
import { Building2, Users, Wrench, Calendar, MessageCircle, FileText, CheckCircle2, Circle } from 'lucide-react'
import { PaymentMethodIcon } from '@/components/payment-method-icon'
import { FunctieBlock } from '@/components/ui/functie-block'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { cn } from '@/lib/utils'

const BETALINGEN_PREVIEW = [
  { name: 'Sarah T.', description: 'Huur december', amount: '€1.250', incoming: true, method: 'ideal' as const },
  { name: 'Mark de V.', description: 'Servicekosten Q1', amount: '€340', incoming: true, method: 'visa' as const },
  { name: 'Lisa K.', description: 'Huur januari', amount: '€980', incoming: true, method: 'mastercard' as const },
  { name: 'Thomas B.', description: 'Restant verhuizing', amount: '€520', incoming: true, method: 'paypal' as const },
  { name: 'Emma S.', description: 'Huur februari', amount: '€1.100', incoming: true, method: 'ideal' as const },
]

const HUURDERS_AVATARS = [
  { src: 'https://i.pravatar.cc/128?img=1', initials: 'JD' },
  { src: 'https://i.pravatar.cc/128?img=5', initials: 'MK' },
  { src: 'https://i.pravatar.cc/128?img=9', initials: 'PT' },
  { src: 'https://i.pravatar.cc/128?img=15', initials: 'LS' },
  { src: 'https://i.pravatar.cc/128?img=20', initials: 'AB' },
  { src: 'https://i.pravatar.cc/128?img=22', initials: 'CD' },
]

function PaymentCard({ item, animate }: { item: (typeof BETALINGEN_PREVIEW)[number]; animate?: boolean }) {
  return (
    <div
      className={cn(
        'rounded-xl border border-gray-200 dark:border-neutral-600 bg-white dark:bg-neutral-800 p-3 shadow-sm flex items-center gap-3 w-full',
        animate && 'animate-in slide-in-from-bottom-4 fade-in duration-700'
      )}
    >
      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gray-100 dark:bg-neutral-700 shrink-0">
        <PaymentMethodIcon method={item.method} className="[&_svg]:w-6 [&_svg]:h-5" />
      </div>
      <div className="flex-1 min-w-0 overflow-hidden">
        <p className="text-xs font-medium text-gray-900 dark:text-white truncate">{item.name}</p>
        <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{item.description}</p>
      </div>
      <span
        className={cn(
          'text-sm font-semibold shrink-0',
          item.incoming ? 'text-green-600 dark:text-green-400' : 'text-gray-900 dark:text-white'
        )}
      >
        {item.incoming ? '+' : ''}{item.amount}
      </span>
    </div>
  )
}

export function FunctiesSection() {
  const [paymentIndex, setPaymentIndex] = useState(0)
  const [avatarIndex, setAvatarIndex] = useState(0)
  const current = BETALINGEN_PREVIEW[paymentIndex]
  const previousIndex = (paymentIndex - 1 + BETALINGEN_PREVIEW.length) % BETALINGEN_PREVIEW.length
  const previous = BETALINGEN_PREVIEW[previousIndex]

  useEffect(() => {
    const t = setInterval(() => {
      setPaymentIndex((i) => (i + 1) % BETALINGEN_PREVIEW.length)
    }, 2800)
    return () => clearInterval(t)
  }, [])

  useEffect(() => {
    const t = setInterval(() => {
      setAvatarIndex((i) => (i + 1) % HUURDERS_AVATARS.length)
    }, 3200)
    return () => clearInterval(t)
  }, [])
  return (
    <section id="features" className="bg-gray-100 py-24 sm:py-32 pb-16 sm:pb-20 rounded-[3rem] overflow-hidden mx-4 sm:mx-6 lg:mx-8">
      <div className="mx-auto max-w-2xl px-6 lg:max-w-7xl lg:px-8">
        {/* Title Section */}
        <div className="mb-12 text-center md:mb-16">
          <h2 className="text-base font-semibold leading-7 text-[#002A1F]">Functies</h2>
          <h2 className="mt-2 text-[2.5rem] font-semibold tracking-tight text-balance sm:text-5xl md:text-6xl leading-tight text-[#002A1F]">
            Alles wat je nodig hebt op één plek.
          </h2>
          <p className="mt-4 text-lg sm:text-xl text-[#002A1F] text-balance max-w-2xl mx-auto">
            Domio helpt jouw portefeuille zo efficiënt mogelijk te beheren.
          </p>
        </div>

        {/* 3-koloms layout zoals referentie: links kleine blokken + Planning, midden Automatische betalingen + Inbox, rechts Facturatie + Huurders */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6">
          {/* Kolom 1 – Planning met datumgebonden to-do preview */}
          <div className="flex flex-col gap-3">
            <FunctieBlock
              preview={
                <ul className="rounded-xl border border-gray-200 dark:border-neutral-600 bg-gray-50 dark:bg-neutral-800/50 p-3 shadow-sm space-y-2.5">
                  {[
                    { label: 'Brandveiligheidscontrole verloopt', date: '12 mrt' },
                    { label: 'Huurverhoging doorvoeren (automatisch)', date: '1 apr' },
                    { label: 'Onderhoudsbeurt gepland', date: '15 mrt' },
                    { label: 'Contract vernieuwen vóór', date: '20 mrt' },
                  ].map((item, i) => (
                    <li key={i} className="flex items-center gap-2 text-xs">
                      <Circle className="h-3.5 w-3.5 shrink-0 text-gray-400 dark:text-neutral-500" strokeWidth={2} />
                      <span className="flex-1 min-w-0 text-gray-700 dark:text-gray-300 truncate">{item.label}</span>
                      <span className="shrink-0 text-gray-500 dark:text-gray-400 tabular-nums">{item.date}</span>
                    </li>
                  ))}
                </ul>
              }
              title="Planning"
              description="Planning eenvoudig gemaakt: afspraken, bezichtigingen en onderhoud volgen en inplannen."
            />
          </div>

          {/* Kolom 2 – Automatische betalingen (met badge) + Berichten (met preview) */}
          <div className="flex flex-col gap-4">
            <FunctieBlock
              badge={
                <span className="inline-flex items-center gap-1.5 rounded-full bg-[#9AFF7C]/20 text-[#002A1F] dark:text-[#9AFF7C] px-3 py-1 text-xs font-medium">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  Actief
                </span>
              }
              title="Automatische betalingen"
              description="Maak je nooit meer zorgen over het missen van betalingen. Domio automatiseert incasso, herinneringen en export naar je boekhouding."
            />
            <FunctieBlock
              preview={
                <div className="rounded-xl border border-gray-200 dark:border-neutral-600 bg-gray-50 dark:bg-neutral-800/50 p-3 shadow-sm">
                  <div className="flex items-center gap-2">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="bg-[#002A1F] text-white text-xs">MC</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-gray-900 dark:text-white truncate">Maya C.</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 truncate">Jij: Welkom in je nieuwe woning!</p>
                    </div>
                    <span className="h-2 w-2 rounded-full bg-red-500 flex-shrink-0" aria-hidden />
                  </div>
                </div>
              }
              title="Berichten"
              description="Neem rechtstreeks contact op met huurders en houd communicatie overzichtelijk in de app."
            />
          </div>

          {/* Kolom 3 – Facturatie (met transactie-preview) + Huurders (met avatars) */}
          <div className="flex flex-col gap-4">
            <FunctieBlock
              preview={
                <div>
                  <div className="relative min-h-[64px] overflow-hidden">
                    {/* Oude kaart blijft zichtbaar onderop */}
                    <div className="absolute inset-0 z-0">
                      <PaymentCard item={previous} />
                    </div>
                    {/* Nieuwe kaart schuift eroverheen */}
                    <div key={paymentIndex} className="absolute inset-0 z-10">
                      <PaymentCard item={current} animate />
                    </div>
                  </div>
                  {/* Minimale ruimte tussen kaart en titel */}
                  <div className="h-2 shrink-0" aria-hidden />
                </div>
              }
              title="Facturatie"
              description="Moeiteloze facturatie en betalingen. Ideal, SEPA en automatische herinneringen voor openstaande bedragen."
            />
            <FunctieBlock
              preview={
                <div className="flex -space-x-2">
                  {[0, 1, 2, 3].map((offset) => {
                    const item = HUURDERS_AVATARS[(avatarIndex + offset) % HUURDERS_AVATARS.length]
                    return (
                      <Avatar
                        key={offset}
                        className={cn(
                          'h-9 w-9 border-2 border-white dark:border-gray-900 ring-1 ring-gray-200 dark:ring-neutral-700 transition-opacity duration-300'
                        )}
                      >
                        <AvatarImage src={item.src} alt="" className="object-cover" />
                        <AvatarFallback className="bg-[#002A1F] text-white text-xs font-medium">
                          {item.initials}
                        </AvatarFallback>
                      </Avatar>
                    )
                  })}
                </div>
              }
              title="Huurdersportaal"
              description="Beheer huurders en volg contracten, allemaal op één plek met een overzichtelijke interface."
            />
          </div>
        </div>
      </div>
    </section>
  )
}
