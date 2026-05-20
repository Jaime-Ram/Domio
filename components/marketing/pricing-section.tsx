'use client'

import { useState } from 'react'
import { Check } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Switch } from '@/components/ui/switch'

const FEATURES = [
  'Onbeperkt huurders & contracten',
  'Ticketsysteem & onderhoudsbeheer',
  'Huurder portal met live chat',
  'Documenten & contracten beheren',
  'Betalingen & financieel overzicht',
  'Compliance checklist (NL)',
  'Flows & automatiseringen',
  'Puntentelling (WWS)',
  'E-mailnotificaties',
]

interface PricingSectionProps {
  onSignupClick?: () => void
}

export function PricingSection({ onSignupClick }: PricingSectionProps) {
  const [isYearly, setIsYearly] = useState(false)

  const priceSmall = isYearly ? '€39' : '€49'
  const priceLarge = isYearly ? '€79' : '€99'

  return (
    <section id="pricing" className="relative isolate bg-white pt-16 sm:pt-20 pb-16 sm:pb-20 px-5 lg:px-6">
      <div className="mx-auto max-w-2xl text-center">
        <h2 className="text-base font-semibold leading-7 text-[#163300]">Pricing</h2>
        <p className="mt-2 text-5xl font-semibold tracking-tight text-balance text-[#163300] sm:text-6xl">
          Één product. Simpele prijs.
        </p>
        <p className="mx-auto mt-6 max-w-xl text-center text-lg font-medium text-gray-600 leading-8">
          Domio is voor iedereen hetzelfde. Je betaalt gewoon meer bij een grotere portefeuille.
        </p>
      </div>

      {/* Billing Toggle */}
      <div className="mt-10 flex items-center justify-center gap-4">
        <span className={cn('text-sm font-medium', !isYearly ? 'text-gray-900' : 'text-gray-400')}>
          Maandelijks
        </span>
        <Switch checked={isYearly} onCheckedChange={setIsYearly} />
        <div className="flex items-center gap-2">
          <span className={cn('text-sm font-medium', isYearly ? 'text-gray-900' : 'text-gray-400')}>
            Jaarlijks
          </span>
          <span className={cn('text-sm font-medium', isYearly ? 'text-[#163300]' : 'text-gray-300')}>
            (2 maanden gratis)
          </span>
        </div>
      </div>

      {/* Two price cards — same product, different scale */}
      <div className="mx-auto mt-14 max-w-3xl grid grid-cols-1 gap-6 sm:grid-cols-2">

        {/* ≤ 50 panden */}
        <div className="rounded-3xl border border-gray-200 bg-white p-8 flex flex-col">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-[#163300]">Tot 50 panden</span>
            <span className="text-xs font-medium bg-gray-100 text-gray-500 rounded-full px-2.5 py-1">Standaard</span>
          </div>
          <div className="mt-6 flex items-baseline gap-1">
            <span className="text-5xl font-semibold tracking-tight text-gray-900">{priceSmall}</span>
            <span className="text-base text-gray-500">/maand</span>
          </div>
          {isYearly && (
            <p className="mt-1 text-sm text-gray-400 line-through">€49/maand</p>
          )}
          <p className="mt-4 text-sm text-gray-500">
            Alles wat je nodig hebt om je portefeuille professioneel te beheren.
          </p>
          <button
            type="button"
            onClick={onSignupClick}
            className="mt-8 w-full rounded-2xl border-2 border-[#163300] px-4 py-2.5 text-sm font-semibold text-[#163300] hover:bg-[#163300]/5 transition-colors"
          >
            Gratis starten
          </button>
        </div>

        {/* > 50 panden */}
        <div className="rounded-3xl bg-[#163300] p-8 flex flex-col shadow-xl">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-[#9FE870]">Meer dan 50 panden</span>
            <span className="text-xs font-medium bg-[#9FE870]/20 text-[#9FE870] rounded-full px-2.5 py-1">Grootschalig</span>
          </div>
          <div className="mt-6 flex items-baseline gap-1">
            <span className="text-5xl font-semibold tracking-tight text-white">{priceLarge}</span>
            <span className="text-base text-gray-400">/maand</span>
          </div>
          {isYearly && (
            <p className="mt-1 text-sm text-gray-500 line-through">€99/maand</p>
          )}
          <p className="mt-4 text-sm text-gray-300">
            Dezelfde volledige Domio-ervaring, voor grotere portefeuilles.
          </p>
          <button
            type="button"
            onClick={onSignupClick}
            className="mt-8 w-full rounded-2xl bg-[#9FE870] px-4 py-2.5 text-sm font-semibold text-[#163300] hover:bg-[#8AD45F] transition-colors"
          >
            Gratis starten
          </button>
        </div>
      </div>

      {/* Features — one list, applies to both */}
      <div className="mx-auto mt-12 max-w-3xl">
        <p className="text-center text-sm font-semibold text-gray-500 uppercase tracking-wide mb-6">Alles inbegrepen bij beide plannen</p>
        <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-3">
          {FEATURES.map(f => (
            <li key={f} className="flex items-center gap-2.5 text-sm text-gray-700">
              <Check className="h-4 w-4 shrink-0 text-[#163300]" />
              {f}
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
