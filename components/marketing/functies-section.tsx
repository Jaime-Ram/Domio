'use client'

import React from 'react'
import {
  FileText,
  ArrowUpRight,
  Wrench,
  Euro,
  ChevronRight,
  UserPlus,
} from 'lucide-react'
import { cn } from '@/lib/utils'

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
  { type: 'tenant', label: 'Nieuwe huurder toegevoegd', sub: 'Jan Jansen - Appartement 4B', time: '2 uur geleden' },
  { type: 'maintenance', label: 'Onderhoudsmelding ontvangen', sub: 'Lekkage badkamer - Kerkstraat 12', time: '5 uur geleden' },
  { type: 'contract', label: 'Huurcontract verlengd', sub: 'Maria de Vries - Appartement 2A', time: '1 dag geleden' },
]

function ActivityIcon({ type }: { type: string }) {
  const iconClass = 'h-4 w-4 text-white'
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

const CARD_CLASS = 'rounded-[1.75rem] bg-white dark:bg-neutral-900 shadow-lg border border-gray-200/80 dark:border-neutral-700'
const INNER_BLOCK_CLASS = 'rounded-2xl bg-gray-100 dark:bg-neutral-800'
const ICON_CIRCLE_CLASS = 'h-10 w-10 rounded-full bg-[#002A1F] dark:bg-[#002A1F] flex items-center justify-center shrink-0'

export function FunctiesSection() {
  return (
    <section
      id="features"
      className="py-24 sm:py-32 pb-16 sm:pb-20 rounded-[3rem] overflow-hidden mx-4 sm:mx-6 lg:mx-8 bg-[#FAF7F2] dark:bg-neutral-900/80"
    >
      <div className="mx-auto max-w-2xl px-6 lg:max-w-7xl lg:px-8">
        <div className="mb-12 text-center md:mb-16">
          <h2 className="text-base font-semibold leading-7 text-[#002A1F]">
            Functies
          </h2>
          <h2 className="mt-2 text-[2.5rem] font-semibold tracking-tight text-balance sm:text-5xl md:text-6xl leading-tight text-[#002A1F]">
            Alles wat je nodig hebt op één plek.
          </h2>
          <p className="mt-4 text-lg sm:text-xl text-[#002A1F] text-balance max-w-2xl mx-auto">
            Domio helpt jouw portefeuille zo efficiënt mogelijk te beheren.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
          {/* 1. Maandelijkse inkomsten */}
          <div className="w-full">
            <div className={cn(CARD_CLASS, '!bg-[#002A1F] !border-[#002A1F]/20 p-6')}>
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
                        backgroundColor: i === 3 ? '#9AFF7C' : 'rgba(255,255,255,0.2)',
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
                  className="flex-1 rounded-full py-2.5 px-4 bg-[#9AFF7C] text-[#002A1F] hover:bg-[#9AFF7C]/90 text-sm font-semibold transition-colors"
                >
                  Rapport
                </button>
              </div>
            </div>
          </div>

          {/* 2. Recente activiteit */}
          <div className="w-full">
            <div className={cn(CARD_CLASS, 'p-5')}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-semibold text-gray-900 dark:text-white">
                  Recente activiteit
                </h3>
                <button
                  type="button"
                  className="text-sm text-[#002A1F] dark:text-[#9AFF7C] font-medium flex items-center gap-1 hover:underline"
                >
                  Alles
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
              <ul className="space-y-2">
                {ACTIVITIES.map((item, i) => (
                  <li
                    key={i}
                    className={cn(
                      'flex items-center gap-3 py-3 px-4',
                      INNER_BLOCK_CLASS
                    )}
                  >
                    <div className={ICON_CIRCLE_CLASS}>
                      <ActivityIcon type={item.type} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                        {item.label}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                        {item.sub}
                      </p>
                      <p className="text-[11px] text-gray-400 dark:text-gray-500 mt-0.5">
                        {item.time}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* 3. Maandoverzicht */}
          <div className="w-full">
            <div className={cn(CARD_CLASS, 'p-5')}>
              <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-4">
                Maandoverzicht
              </h3>
              <div className="grid grid-cols-2 gap-3">
                <div className={cn('rounded-2xl p-4 flex flex-col', INNER_BLOCK_CLASS)}>
                  <div className="flex items-center gap-2 mb-2">
                    <div className="h-8 w-8 rounded-full bg-[#002A1F] flex items-center justify-center">
                      <Euro className="h-3.5 w-3.5 text-white" />
                    </div>
                    <span className="text-xs text-gray-500 dark:text-gray-400">Inkomsten</span>
                  </div>
                  <p className="text-xl font-bold text-gray-900 dark:text-white">€24.500</p>
                </div>
                <div className={cn('rounded-2xl p-4 flex flex-col', INNER_BLOCK_CLASS)}>
                  <div className="flex items-center gap-2 mb-2">
                    <div className="h-8 w-8 rounded-full bg-[#002A1F] flex items-center justify-center">
                      <ArrowUpRight className="h-3.5 w-3.5 text-white" />
                    </div>
                    <span className="text-xs text-gray-500 dark:text-gray-400">Uitgaven</span>
                  </div>
                  <p className="text-xl font-bold text-gray-900 dark:text-white">€3.200</p>
                </div>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-3">
                +5.2% vs vorige maand
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
