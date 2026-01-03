'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils'

type BeheerderType = 'vve' | 'particulier' | 'institutioneel' | 'vastgoedbeheerder'

export function FunctiesSection() {
  const [selectedType, setSelectedType] = useState<BeheerderType | null>(null)

  const beheerderTypes: { id: BeheerderType; label: string }[] = [
    { id: 'vve', label: 'VvE' },
    { id: 'particulier', label: 'Particulier vastgoedhouder' },
    { id: 'institutioneel', label: 'Institutioneel' },
    { id: 'vastgoedbeheerder', label: 'Vastgoedbeheerder' },
  ]

  return (
    <section id="features" className="bg-white py-24 sm:py-32 pb-16 sm:pb-20">
      <div className="mx-auto max-w-2xl px-6 lg:max-w-7xl lg:px-8">
        {/* Title Section */}
        <div className="mb-12 text-center md:mb-16">
          <h2 className="text-base font-semibold leading-7 text-[#002A1F]">Functies</h2>
          <h2 className="mt-2 text-[2.5rem] font-semibold tracking-tight text-balance text-gray-900 sm:text-5xl md:text-6xl leading-tight">
            <span className="text-[#002A1F]">Alles </span>
            <span className="text-[#356258]">wat je nodig hebt </span>
            <span className="text-[#002A1F]">op één plek.</span>
            <br />
            <span className="text-[#356258]">Domio helpt jouw </span>
            <span className="text-[#356258]">portefeuille </span>
            <span className="text-[#356258]">zo </span>
            <span className="text-[#356258]">efficiënt </span>
            <span className="text-[#356258]">mogelijk te beheren.</span>
          </h2>
        </div>

        {/* Beheerder Type Selector */}
        <div className="mb-12 md:mb-16">
          <div className="flex flex-wrap items-center justify-center gap-3">
            {beheerderTypes.map((type) => (
              <button
                key={type.id}
                onClick={() => setSelectedType(selectedType === type.id ? null : type.id)}
                className={cn(
                  'px-4 py-2 rounded-2xl text-sm font-medium transition-colors duration-200',
                  selectedType === type.id
                    ? 'bg-[#9AFF7C] text-[#002A1F]'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                )}
              >
                {type.label}
              </button>
            ))}
          </div>
        </div>

        <div className="grid gap-4 lg:grid-cols-3 lg:grid-rows-2">
          {/* Mobile Friendly - Large Left Card */}
          <div className="relative lg:row-span-2">
            <div className="absolute inset-px rounded-lg bg-white lg:rounded-l-4xl" />
            <div className="relative flex h-full flex-col overflow-hidden rounded-[calc(var(--radius-lg)+1px)] lg:rounded-l-[calc(2rem+1px)]">
              <div className="px-8 pt-8 pb-3 sm:px-10 sm:pt-10 sm:pb-0">
                <p className="mt-2 text-lg font-medium tracking-tight text-gray-950 max-lg:text-center">
                  Panden beheren
                </p>
                <p className="mt-2 max-w-lg text-sm leading-6 text-gray-600 max-lg:text-center">
                  Overzicht per pand met status, huurprijs, huurder en documenten. Alles op één plek.
                </p>
              </div>
              <div className="@container relative min-h-[200px] w-full grow max-lg:mx-auto max-lg:max-w-sm">
                <div className="absolute inset-x-10 top-10 bottom-0 overflow-hidden rounded-t-[12cqw] border-x-[3cqw] border-t-[3cqw] border-gray-700 bg-gray-900 shadow-2xl">
                  <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-[#002A1F] to-[#356258]">
                  </div>
                </div>
              </div>
            </div>
            <div className="pointer-events-none absolute inset-px rounded-lg shadow-sm outline outline-black/5 lg:rounded-l-4xl" />
          </div>

          {/* Performance - Top Right */}
          <div className="relative max-lg:row-start-1">
            <div className="absolute inset-px rounded-lg bg-white max-lg:rounded-t-4xl" />
            <div className="relative flex h-full flex-col overflow-hidden rounded-[calc(var(--radius-lg)+1px)] max-lg:rounded-t-[calc(2rem+1px)]">
              <div className="px-8 pt-8 sm:px-10 sm:pt-10">
                <p className="mt-2 text-lg font-medium tracking-tight text-gray-950 max-lg:text-center">
                  Financiën
                </p>
                <p className="mt-2 max-w-lg text-sm leading-6 text-gray-600 max-lg:text-center">
                  Inkomsten en uitgaven bijhouden, openstaande betalingen en export naar CSV.
                </p>
              </div>
              <div className="flex flex-1 items-center justify-center px-8 max-lg:pt-10 max-lg:pb-12 sm:px-10 lg:pb-2 min-h-[150px]">
              </div>
            </div>
            <div className="pointer-events-none absolute inset-px rounded-lg shadow-sm outline outline-black/5 max-lg:rounded-t-4xl" />
          </div>

          {/* Security - Bottom Right */}
          <div className="relative max-lg:row-start-3 lg:col-start-2 lg:row-start-2">
            <div className="absolute inset-px rounded-lg bg-white" />
            <div className="relative flex h-full flex-col overflow-hidden rounded-[calc(var(--radius-lg)+1px)]">
              <div className="px-8 pt-8 sm:px-10 sm:pt-10">
                <p className="mt-2 text-lg font-medium tracking-tight text-gray-950 max-lg:text-center">
                  Huurderportaal
                </p>
                <p className="mt-2 max-w-lg text-sm leading-6 text-gray-600 max-lg:text-center">
                  Gegevens, notities en betalingsstatus per huurder. Altijd up-to-date.
                </p>
              </div>
              <div className="flex flex-1 items-center justify-center max-lg:py-6 lg:pb-2 min-h-[150px]">
              </div>
            </div>
            <div className="pointer-events-none absolute inset-px rounded-lg shadow-sm outline outline-black/5" />
          </div>

          {/* Powerful APIs - Large Right Card */}
          <div className="relative lg:row-span-2">
            <div className="absolute inset-px rounded-lg bg-white max-lg:rounded-b-4xl lg:rounded-r-4xl" />
            <div className="relative flex h-full flex-col overflow-hidden rounded-[calc(var(--radius-lg)+1px)] max-lg:rounded-b-[calc(2rem+1px)] lg:rounded-r-[calc(2rem+1px)]">
              <div className="px-8 pt-8 pb-3 sm:px-10 sm:pt-10 sm:pb-0">
                <p className="mt-2 text-lg font-medium tracking-tight text-gray-950 max-lg:text-center">
                  Onderhoud
                </p>
                <p className="mt-2 max-w-lg text-sm leading-6 text-gray-600 max-lg:text-center">
                  Meldingen registreren, status bijhouden en kosten noteren. Alles overzichtelijk.
                </p>
              </div>
              <div className="relative min-h-[200px] w-full grow">
                <div className="absolute top-10 right-0 bottom-0 left-10 overflow-hidden rounded-tl-xl bg-gray-900 shadow-2xl outline outline-white/10">
                  <div className="flex bg-gray-900 outline outline-white/5">
                    <div className="-mb-px flex text-sm leading-6 font-medium text-gray-400">
                      <div className="border-r border-b border-r-white/10 border-b-white/20 bg-white/5 px-4 py-2 text-white">
                        Dashboard.tsx
                      </div>
                      <div className="border-r border-gray-600/10 px-4 py-2">Integrations.tsx</div>
                    </div>
                  </div>
                  <div className="px-6 pt-6 pb-14">
                    <div className="space-y-2 text-sm text-gray-300">
                      <div className="flex items-center gap-2">
                        <span className="text-[#9AFF7C]">●</span>
                        <span>Stripe Connect</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[#9AFF7C]">●</span>
                        <span>Email Notifications</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[#9AFF7C]">●</span>
                        <span>CSV Export</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="pointer-events-none absolute inset-px rounded-lg shadow-sm outline outline-black/5 max-lg:rounded-b-4xl lg:rounded-r-4xl" />
          </div>
        </div>
      </div>
    </section>
  )
}


