'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { motion, AnimatePresence } from 'motion/react'
import { MarketingLayout } from '@/components/marketing/marketing-layout'
import { FooterSection } from '@/components/marketing/footer-section'
import { FunctieFeatureBlock, InkomstenWidget, PortefeuilleWidget, ComplianceWidget, FeatureImagePlaceholder } from '@/components/marketing/functie-feature-block'
import { TransactionListWidget } from '@/components/ui/transaction-list-widget'
import { FileText, Wrench, Euro, UserPlus, ArrowUpRight, Plus, Minus } from 'lucide-react'

const MINDER_BELANGRIJKE_FUNCTIES = [
  { title: 'Rapportages', description: 'Genereer overzichten en exporteer data voor je boekhouding of belastingaangifte.', demoHref: '/demo' },
  { title: 'Communicatie', description: 'Berichten en notities met huurders, alles gekoppeld aan objecten en tickets.', demoHref: '/demo' },
  { title: 'Accountinstellingen', description: 'Configureer je account, notificaties en koppelingen met externe systemen.', demoHref: '/demo' },
  { title: 'Bankimport', description: 'Importeer bankafschriften voor automatische verwerking van betalingen.', demoHref: '/demo' },
  { title: 'Boekhoudintegratie', description: 'Koppel Domio aan Exact, Moneybird of andere boekhoudsoftware.', demoHref: '/demo' },
  { title: 'Inspectieplanning', description: 'Plan en log periodieke inspecties per object met foto\'s en rapporten.', demoHref: '/demo' },
]

const ACTIVITIES = [
  { type: 'tenant', label: 'Nieuwe huurder toegevoegd', sub: 'Jan Jansen - Appartement 4B', time: '2 uur geleden', amount: '€1.450' },
  { type: 'maintenance', label: 'Onderhoudsmelding ontvangen', sub: 'Lekkage badkamer - Kerkstraat 12', time: '5 uur geleden' },
  { type: 'contract', label: 'Huurcontract verlengd', sub: 'Maria de Vries - Appartement 2A', time: '1 dag geleden', amount: '€1.180' },
]

function activityIcon(type: string) {
  const iconClass = 'h-4 w-4'
  switch (type) {
    case 'tenant':
      return <UserPlus className={iconClass} />
    case 'maintenance':
      return <Wrench className={iconClass} />
    case 'contract':
      return <FileText className={iconClass} />
    default:
      return <Euro className={iconClass} />
  }
}

export default function FunctiesPage() {
  const [openExtra, setOpenExtra] = useState<string[]>([])
  return (
    <MarketingLayout>
      <div className="min-h-screen bg-white dark:bg-gray-900">
        {/* Hero —zelfde stijl als kennisbank */}
        <section className="relative border-b border-gray-100 overflow-hidden py-12 md:py-16">
          <div className="absolute inset-0">
            <Image
              src="/images/Achtergrond5.jpg"
              alt=""
              fill
              className="object-cover object-center"
              quality={85}
              sizes="100vw"
              priority
            />
            <div
              className="absolute inset-x-0 bottom-0 h-40 pointer-events-none"
              style={{ background: 'linear-gradient(to bottom, transparent 0%, rgba(255,255,255,0.18) 100%)' }}
            />
          </div>
          <div className="container relative z-10 mx-auto max-w-7xl px-4 md:px-8">
            <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl md:text-5xl">
              Functies
            </h1>
            <p className="mt-3 max-w-2xl text-lg text-white/90">
              Beheer je vastgoedportefeuille efficiënt. Ontdek alle functies en bekijk ze direct in de demo.
            </p>
          </div>
        </section>

        {/* Functies — scrollbare sectie */}
        <section className="border-t border-gray-200 dark:border-neutral-800">
          <div className="mx-auto max-w-7xl px-6 py-16 sm:py-20 lg:px-8 space-y-24 sm:space-y-32">
            {/* 1. Maandelijkse inkomsten */}
            <FunctieFeatureBlock
              title="Maandelijkse inkomsten inzichtelijk"
              description="Volg je huurinkomsten in realtime. Bekijk trends per week en maand, en exporteer rapporten voor je boekhouding."
              demoHref="/demo"
              visual={<InkomstenWidget />}
              visualLeft={true}
            />

            {/* 2. Portefeuille */}
            <FunctieFeatureBlock
              title="Portefeuille en objecten beheren"
              description="Overzicht van al je panden en unitss. Beheer huurders, contracten en documenten per object. Altijd up-to-date."
              demoHref="/demo"
              visual={<PortefeuilleWidget />}
              visualLeft={false}
            />

            {/* 3. Recente activiteit */}
            <FunctieFeatureBlock
              title="Recente activiteit op één plek"
              description="Zie direct wat er speelt: nieuwe huurders, onderhoudsmeldingen, betalingen en contractwijzigingen. Nooit meer iets missen."
              demoHref="/demo"
              visual={
                <TransactionListWidget
                  title="Recente activiteit"
                  seeAllHref="/demo"
                  seeAllLabel="Alles"
                  items={ACTIVITIES.map((item, i) => ({
                    icon: activityIcon(item.type),
                    iconAccent: i === 0,
                    name: item.label,
                    description: `${item.sub} • ${item.time}`,
                    amount: item.amount,
                  }))}
                />
              }
              visualLeft={true}
            />

            {/* 4. Compliance / WWS */}
            <FunctieFeatureBlock
              title="Compliance en WWS-scoring"
              description="Houd je energieprestatie bij met automatische WWS-berekening en puntentelling. Blijf compliant met actuele regelgeving."
              demoHref="/demo"
              visual={<ComplianceWidget />}
              visualLeft={false}
            />

            {/* 5. Financieel */}
            <FunctieFeatureBlock
              title="Facturatie en betalingen"
              description="Stuur facturen, volg betalingen en koppel je bank voor automatische import. Volledig overzicht van je financiën."
              demoHref="/demo"
              visual={<FeatureImagePlaceholder label="Financieel overzicht" />}
              visualLeft={true}
            />

            {/* 6. Onderhoud */}
            <FunctieFeatureBlock
              title="Onderhoud en inspecties"
              description="Beheer meldingen, plan inspecties en wijs onderhoud toe aan leveranciers. Alles geregeld vanuit één dashboard."
              demoHref="/demo"
              visual={<FeatureImagePlaceholder label="Onderhoud & tickets" />}
              visualLeft={false}
            />

            {/* 7. Documenten */}
            <FunctieFeatureBlock
              title="Drive en documenten"
              description="Centrale opslag voor contracten, rapporten en overige documenten. Zoekbaar en gekoppeld aan objecten en huurders."
              demoHref="/demo"
              visual={<FeatureImagePlaceholder label="Documenten & Drive" />}
              visualLeft={true}
            />
          </div>
        </section>

        {/* En nog veel meer! —zelfde design als FAQ op main page */}
        <section className="mx-auto max-w-4xl px-6 py-16 md:px-8 lg:py-20">
          <h2 className="mb-8 text-4xl font-bold tracking-tight text-[#163300] sm:text-5xl md:text-6xl">
            En nog veel meer!
          </h2>
          <p className="mb-8 text-lg text-gray-600 dark:text-gray-400">
            Extra tools die je portefeuillebeheer compleet maken.
          </p>

          <div className="divide-y divide-gray-200 dark:divide-neutral-700">
            {MINDER_BELANGRIJKE_FUNCTIES.map((item, index) => {
              const itemId = `extra-${index}`
              const isOpen = openExtra.includes(itemId)
              return (
                <div key={item.title} className="py-5 first:pt-0">
                  <button
                    type="button"
                    onClick={() => setOpenExtra((prev) => prev.includes(itemId) ? prev.filter((id) => id !== itemId) : [...prev, itemId])}
                    className="group flex w-full items-center justify-between gap-4 text-left focus:outline-none"
                    aria-expanded={isOpen}
                  >
                    <span className="text-base font-normal text-gray-900 dark:text-white">
                      {item.title}
                    </span>
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gray-100 dark:bg-neutral-700 text-gray-900 dark:text-white transition-colors group-hover:bg-gray-200 dark:group-hover:bg-neutral-600">
                      {isOpen ? (
                        <Minus className="h-4 w-4" strokeWidth={2} />
                      ) : (
                        <Plus className="h-4 w-4" strokeWidth={2} />
                      )}
                    </span>
                  </button>
                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: 'easeInOut' }}
                        className="overflow-hidden"
                      >
                        <p className="pt-3 text-base text-gray-600 dark:text-gray-400">{item.description}</p>
                        <Link
                          href={item.demoHref}
                          className="mt-3 inline-flex items-center gap-1.5 text-sm font-medium text-[#163300] hover:underline underline-offset-2"
                        >
                          Bekijk in demo
                          <ArrowUpRight className="h-3.5 w-3.5" />
                        </Link>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )
            })}
          </div>
        </section>
      </div>
      <FooterSection />
    </MarketingLayout>
  )
}
