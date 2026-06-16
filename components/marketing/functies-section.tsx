'use client'

import React from 'react'
import Link from 'next/link'
import {
  FileText,
  ArrowUpRight,
  Wrench,
  Euro,
  UserPlus,
  Check,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { TransactionListWidget } from '@/components/ui/transaction-list-widget'

const CHART_BARS = [
  { label: 'Ma', value: 65 },
  { label: 'Di', value: 80 },
  { label: 'Wo', value: 45 },
  { label: 'Do', value: 90 },
  { label: 'Vr', value: 70 },
  { label: 'Za', value: 55 },
  { label: 'Zo', value: 85 },
]

const ACTIVITIES = [
  { type: 'tenant', label: 'Nieuwe huurder toegevoegd', sub: 'Jan Jansen - Appartement 4B', time: '2 uur geleden', amount: '€1.450' },
  { type: 'maintenance', label: 'Onderhoudsmelding ontvangen', sub: 'Lekkage badkamer - Kerkstraat 12', time: '5 uur geleden' },
  { type: 'contract', label: 'Huurcontract verlengd', sub: 'Maria de Vries - Appartement 2A', time: '1 dag geleden', amount: '€1.180' },
]

const ONDERHOUD = [
  { title: 'Lekkage badkamer', prop: 'Kerkstraat 12', prio: 'Urgent', dot: 'bg-red-500' },
  { title: 'CV-ketel storing', prop: 'Keizersgracht 100', prio: 'Hoog', dot: 'bg-orange-400' },
  { title: 'Schilderwerk kozijn', prop: 'Jordaan 8', prio: 'Normaal', dot: 'bg-gray-300 dark:bg-neutral-600' },
]

const HUURDERS = [
  { name: 'Jan Jansen', unit: 'Kerkstraat 12, app 4B', initials: 'JJ' },
  { name: 'Maria de Vries', unit: 'Keizersgracht 100, 2A', initials: 'MV' },
  { name: 'Ahmed El Idrissi', unit: 'Jordaan 8', initials: 'AE' },
]

const COMPLIANCE_CATS = [
  { label: 'Goed verhuurderschap', pct: 100 },
  { label: 'Huurprijs & punten', pct: 75 },
  { label: 'Veiligheid & onderhoud', pct: 60 },
  { label: 'Financieel & admin', pct: 80 },
]

const TAKEN = [
  { title: 'CV-ketel inspectie inplannen', date: '12 jun', done: false },
  { title: 'Huurindexatie doorvoeren', date: '15 jun', done: false },
  { title: 'Servicekosten afrekenen', date: '8 jun', done: true },
]

function activityIcon(type: string) {
  const iconClass = 'h-4 w-4'
  switch (type) {
    case 'rent':
    case 'payment':
      return <Euro className={iconClass} />
    case 'maintenance':
      return <Wrench className={iconClass} />
    case 'contract':
      return <FileText className={iconClass} />
    case 'tenant':
      return <UserPlus className={iconClass} />
    default:
      return <ArrowUpRight className={iconClass} />
  }
}

/* Schaduw boven én onder voor zwevend effect op groene achtergrond; overflow-visible zodat schaduw niet wordt geknipt */
const CARD_CLASS = 'rounded-[1.75rem] bg-white dark:bg-neutral-900 shadow-card-elevated border border-gray-200/60 dark:border-neutral-700 overflow-visible'
const INNER_BLOCK_CLASS = 'rounded-2xl bg-gray-100 dark:bg-neutral-800'

export function FunctiesSection() {
  return (
    <section
      id="features"
      className="w-full py-24 sm:py-32 pb-16 sm:pb-20 bg-white dark:bg-neutral-950"
    >
      <div className="mx-auto max-w-2xl px-5 lg:max-w-7xl lg:px-8">
        <div className="mb-12 text-center md:mb-16">
          <h2 className="text-base font-semibold leading-7 text-[#163300]">
            Functies
          </h2>
          <h2 className="mt-2 text-[2.5rem] font-semibold tracking-tight text-balance sm:text-5xl md:text-6xl leading-tight text-[#163300]">
            Alles wat je nodig hebt op één plek.
          </h2>
          <p className="mt-4 text-lg sm:text-xl text-[#163300] text-balance max-w-2xl mx-auto">
            Domio helpt jouw portefeuille zo efficiënt mogelijk te beheren.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
          {/* 1. Maandelijkse inkomsten */}
          <div className="w-full">
            <div className={cn(CARD_CLASS, '!bg-[#163300] !border-[#163300]/20 p-6')}>
              <p className="text-white/80 text-sm font-medium mb-1">
                Maandelijkse inkomsten
              </p>
              <p className="text-3xl font-bold text-white mb-5">
                €12.840
              </p>
              <div className="flex items-end gap-1.5 h-14 mb-4">
                {CHART_BARS.map((bar, i) => (
                  <div key={bar.label} className="flex-1 min-w-0 h-full flex flex-col justify-end">
                    <div
                      className="w-full rounded-t-xl transition-all duration-300"
                      style={{
                        height: `${bar.value}%`,
                        backgroundColor: i === 3 ? '#9FE870' : 'rgba(255,255,255,0.2)',
                      }}
                    />
                  </div>
                ))}
              </div>
              <div className="flex justify-between text-xs text-white/60 mb-5">
                {CHART_BARS.map((bar) => (
                  <span key={bar.label} className="flex-1 text-center min-w-0">
                    {bar.label}
                  </span>
                ))}
              </div>
              <div className="flex gap-3">
                <button
                  type="button"
                  className="flex-1 rounded-full py-2.5 px-4 bg-white/10 hover:bg-white/20 text-white text-sm font-medium transition-colors"
                >
                  Bekijk portefeuille
                </button>
                <button
                  type="button"
                  className="flex-1 rounded-full py-2.5 px-4 bg-[#9FE870] text-[#163300] hover:bg-[#9FE870]/90 text-sm font-semibold transition-colors"
                >
                  Rapport
                </button>
              </div>
            </div>
          </div>

          {/* 2. Recente activiteit – SaaS transactie-widget */}
          <div className="w-full">
            <TransactionListWidget
              title="Recente activiteit"
              seeAllHref="/dashboard/landlord"
              seeAllLabel="Alles"
              className="!rounded-2xl !shadow-soft-lg !border-gray-200/60"
              items={ACTIVITIES.map((item, i) => ({
                icon: activityIcon(item.type),
                iconAccent: i === 0,
                name: item.label,
                description: `${item.sub} • ${item.time}`,
                amount: item.amount,
              }))}
            />
          </div>

          {/* 3. Onderhoud & tickets */}
          <div className="w-full">
            <div className="rounded-2xl bg-white dark:bg-neutral-900 shadow-soft-lg border border-gray-200/60 dark:border-neutral-700 p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-semibold text-gray-900 dark:text-white">
                  Onderhoud
                </h3>
                <span className="inline-flex items-center gap-1.5 text-xs font-medium text-orange-500">
                  <span className="h-1.5 w-1.5 rounded-full bg-orange-400" />
                  3 open
                </span>
              </div>
              <div className="space-y-2.5">
                {ONDERHOUD.map((t) => (
                  <div key={t.title} className={cn('rounded-2xl px-3.5 py-3 flex items-center gap-3', INNER_BLOCK_CLASS)}>
                    <span className={cn('h-2.5 w-2.5 rounded-full shrink-0', t.dot)} />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{t.title}</p>
                      <p className="text-xs text-gray-400 dark:text-gray-500 truncate">{t.prop}</p>
                    </div>
                    <span className="text-[11px] font-medium text-gray-400 dark:text-gray-500 shrink-0">{t.prio}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* 4. Huurders & bezetting */}
          <div className="w-full">
            <div className="rounded-2xl bg-white dark:bg-neutral-900 shadow-soft-lg border border-gray-200/60 dark:border-neutral-700 p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-semibold text-gray-900 dark:text-white">Huurders</h3>
                <span className="text-xs font-medium text-[#15803D]">92% bezet</span>
              </div>
              <div className="space-y-2.5">
                {HUURDERS.map((h) => (
                  <div key={h.name} className={cn('rounded-2xl px-3.5 py-2.5 flex items-center gap-3', INNER_BLOCK_CLASS)}>
                    <div className="h-8 w-8 rounded-full bg-[#163300] flex items-center justify-center text-white text-xs font-semibold shrink-0">{h.initials}</div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{h.name}</p>
                      <p className="text-xs text-gray-400 dark:text-gray-500 truncate">{h.unit}</p>
                    </div>
                    <span className="h-2 w-2 rounded-full bg-[#2F5711] shrink-0" />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* 5. Compliance */}
          <div className="w-full">
            <div className="rounded-2xl bg-white dark:bg-neutral-900 shadow-soft-lg border border-gray-200/60 dark:border-neutral-700 p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-semibold text-gray-900 dark:text-white">Compliance</h3>
                <span className="text-sm font-bold text-[#15803D]">78%</span>
              </div>
              <div className="space-y-3">
                {COMPLIANCE_CATS.map((c) => (
                  <div key={c.label}>
                    <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 mb-1.5">
                      <span className="truncate">{c.label}</span>
                      <span className="font-medium shrink-0 ml-2">{c.pct}%</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-gray-100 dark:bg-neutral-800 overflow-hidden">
                      <div className="h-full rounded-full bg-[#15803D]" style={{ width: `${c.pct}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* 6. Taken */}
          <div className="w-full">
            <div className="rounded-2xl bg-white dark:bg-neutral-900 shadow-soft-lg border border-gray-200/60 dark:border-neutral-700 p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-semibold text-gray-900 dark:text-white">Taken</h3>
                <span className="text-xs font-medium text-gray-400 dark:text-gray-500">deze week</span>
              </div>
              <div className="space-y-3">
                {TAKEN.map((t) => (
                  <div key={t.title} className="flex items-center gap-3">
                    <span className={cn('h-4 w-4 rounded-full border-2 flex items-center justify-center shrink-0', t.done ? 'bg-[#15803D] border-[#15803D]' : 'border-gray-300 dark:border-neutral-600')}>
                      {t.done && <Check className="h-2.5 w-2.5 text-white" />}
                    </span>
                    <p className={cn('text-sm flex-1 min-w-0 truncate', t.done ? 'line-through text-gray-400 dark:text-gray-500' : 'text-gray-900 dark:text-white')}>{t.title}</p>
                    <span className="text-xs text-gray-400 dark:text-gray-500 shrink-0">{t.date}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

        </div>

        <div className="mt-14 sm:mt-16 flex justify-center">
          <Link
            href="/functies"
            className="inline-flex items-center justify-center px-10 py-3.5 rounded-full bg-[#163300] text-white font-semibold text-base shadow-lg shadow-[#163300]/20 hover:bg-[#163300]/90 transition-colors"
          >
            Ontdek alle functies
          </Link>
        </div>
      </div>
    </section>
  )
}
