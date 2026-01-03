'use client'

import { useState } from 'react'
import { Check } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Switch } from '@/components/ui/switch'

interface PricingSectionProps {
  onSignupClick?: () => void
}

const tiers = [
  {
    name: 'Individuele vastgoedhouder',
    id: 'tier-individual',
    href: '/signup',
    priceMonthly: '€49',
    priceYearly: '€39',
    description: 'Perfect voor individuele vastgoedhouders met een kleinere portefeuille.',
    features: [
      'Tot 5 panden',
      'Huurders & basisgegevens',
      'Documenten opslaan',
      'Onderhoudsmeldingen registreren',
    ],
    featured: false,
  },
  {
    name: 'Uitgebreide portefeuille',
    id: 'tier-extended',
    href: '/signup',
    priceMonthly: '€195',
    priceYearly: '€156',
    description: 'Voor vastgoedbeheerders met een groeiende portefeuille.',
    features: [
      'Tot 50 panden',
      'Betalingen bijhouden (open/te laat)',
      'Onderhoud workflow (status/notes/kosten)',
      'Compliance checklist (NL)',
      'Export naar CSV/Excel',
      'Prioriteit support',
    ],
    featured: true,
  },
]

export function PricingSection({ onSignupClick }: PricingSectionProps) {
  const [isYearly, setIsYearly] = useState(false)
  return (
    <section id="pricing" className="relative isolate bg-white pt-16 sm:pt-20 pb-16 sm:pb-20 px-6 lg:px-8">
      <div
        aria-hidden="true"
        className="absolute inset-x-0 -top-3 -z-10 transform-gpu overflow-hidden px-36 blur-3xl"
      >
        <div
          style={{
            clipPath:
              'polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)',
          }}
          className="mx-auto aspect-[1155/678] w-[72.1875rem] bg-gradient-to-tr from-[#356258] to-[#002A1F] opacity-30"
        />
      </div>
      <div className="mx-auto max-w-4xl text-center">
        <h2 className="text-base font-semibold leading-7 text-[#002A1F]">Pricing</h2>
        <p className="mt-2 text-5xl font-semibold tracking-tight text-balance text-[#002A1F] sm:text-6xl">
          <span className="hidden sm:inline">Passende, simpele pricing</span>
          <span className="sm:hidden">Passende simpele pricing</span>
        </p>
      </div>
      <p className="mx-auto mt-6 max-w-2xl text-center text-lg font-medium text-pretty text-gray-600 sm:text-xl leading-8">
        Kies een betaalbaar plan met de beste functies voor het beheren van je vastgoedportefeuille en het verhogen van je rendement.
      </p>
      
      {/* Billing Toggle */}
      <div className="mt-8 flex items-center justify-center gap-4">
        <span className={cn("text-sm font-medium", !isYearly ? "text-gray-900" : "text-gray-500")}>
          Maandelijks
        </span>
        <Switch
          checked={isYearly}
          onCheckedChange={setIsYearly}
        />
        <div className="flex items-center gap-2">
          <span className={cn("text-sm font-medium", isYearly ? "text-gray-900" : "text-gray-500")}>
            Jaarlijks
          </span>
          <span className={cn(
            "text-sm font-medium",
            isYearly ? "text-[#356258]" : "text-gray-400"
          )}>
            (Bespaar 20%)
          </span>
        </div>
      </div>
      
      <div className="mx-auto mt-16 grid max-w-lg grid-cols-1 items-center gap-y-6 sm:mt-20 sm:gap-y-0 lg:max-w-4xl lg:grid-cols-2">
        {tiers.map((tier, tierIdx) => (
          <div
            key={tier.id}
            className={cn(
              tier.featured ? 'relative bg-[#002A1F] shadow-2xl' : 'bg-white/60 sm:mx-8 lg:mx-0',
              tier.featured
                ? ''
                : tierIdx === 0
                  ? 'rounded-t-3xl sm:rounded-b-none lg:rounded-tr-none lg:rounded-bl-3xl'
                  : 'sm:rounded-t-none lg:rounded-tr-3xl lg:rounded-bl-none',
              'rounded-3xl p-8 ring-1 ring-gray-900/10 sm:p-10',
            )}
          >
            <h3
              id={tier.id}
              className={cn(
                tier.featured ? 'text-[#9AFF7C]' : 'text-[#002A1F]',
                'text-base font-semibold leading-7',
              )}
            >
              {tier.name}
            </h3>
            <p className="mt-4 flex items-baseline gap-x-2">
              <span
                className={cn(
                  tier.featured ? 'text-white' : 'text-gray-900',
                  'text-5xl font-semibold tracking-tight',
                )}
              >
                {isYearly ? tier.priceYearly : tier.priceMonthly}
              </span>
              <span className={cn(tier.featured ? 'text-gray-400' : 'text-gray-500', 'text-base')}>
                /maand
              </span>
              {isYearly && (
                <span className={cn(tier.featured ? 'text-gray-400' : 'text-gray-500', 'text-sm')}>
                  (jaarlijks)
                </span>
              )}
              {isYearly && (
                <span className={cn(tier.featured ? 'text-gray-400' : 'text-gray-500', 'text-sm ml-2 line-through')}>
                  {tier.priceMonthly}
                </span>
              )}
            </p>
            <p className={cn(tier.featured ? 'text-gray-300' : 'text-gray-600', 'mt-6 text-base leading-7')}>
              {tier.description}
            </p>
            <ul
              role="list"
              className={cn(
                tier.featured ? 'text-gray-300' : 'text-gray-600',
                'mt-8 space-y-3 text-sm leading-6 sm:mt-10',
              )}
            >
              {tier.features.map((feature) => (
                <li key={feature} className="flex gap-x-3">
                  <Check
                    aria-hidden="true"
                    className={cn(
                      tier.featured ? 'text-[#9AFF7C]' : 'text-[#002A1F]',
                      'h-6 w-5 flex-none',
                    )}
                  />
                  {feature}
                </li>
              ))}
            </ul>
            <button
              type="button"
              onClick={onSignupClick}
              aria-describedby={tier.id}
              className={cn(
                tier.featured
                  ? 'bg-[#9AFF7C] text-[#002A1F] shadow-sm hover:bg-[#9AFF7C]/90 focus-visible:outline-[#9AFF7C]'
                  : 'bg-transparent text-[#002A1F] border-2 border-[#002A1F] hover:bg-[#002A1F]/5 focus-visible:outline-[#002A1F]',
                'mt-8 w-full rounded-2xl px-3.5 py-2.5 text-center text-sm font-semibold focus-visible:outline-2 focus-visible:outline-offset-2 sm:mt-10',
              )}
            >
              Start direct
            </button>
          </div>
        ))}
      </div>
    </section>
  )
}
