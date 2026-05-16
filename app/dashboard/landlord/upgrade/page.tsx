'use client'

import { useState } from 'react'
import { Check, Zap, Building2 } from 'lucide-react'

const PLANS = [
  {
    id: 'starter' as const,
    name: 'Starter',
    price: '49',
    description: 'Tot 50 panden',
    icon: Building2,
    features: [
      'Tot 50 verhuurde panden',
      'WWS puntentelling',
      'Huurdersbeheer',
      'Betalingen & achterstanden',
      'Documenten opslag',
      'Onderhoud & tickets',
      'E-mail support',
    ],
    highlight: false,
  },
  {
    id: 'pro' as const,
    name: 'Pro',
    price: '250',
    description: 'Vanaf 50 panden',
    icon: Zap,
    features: [
      'Onbeperkt panden',
      'Alles uit Starter',
      'Prioriteit support',
      'Domio Assist (AI)',
      'Geavanceerde rapportages',
      'API toegang',
      'Dedicated onboarding',
    ],
    highlight: true,
  },
]

export default function UpgradePage() {
  const [loadingPlan, setLoadingPlan] = useState<'starter' | 'pro' | null>(null)

  async function startCheckout(plan: 'starter' | 'pro') {
    setLoadingPlan(plan)
    try {
      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan }),
      })
      const data = await res.json()
      if (data.url) {
        window.location.href = data.url
      } else {
        console.error('Checkout fout:', data.error)
        setLoadingPlan(null)
      }
    } catch {
      setLoadingPlan(null)
    }
  }

  return (
    <div className="flex flex-col items-center pt-8 pb-16">
      <p className="text-gray-500 dark:text-gray-400 text-sm mb-10 text-center max-w-md">
        Je proefperiode is verlopen. Kies een plan om door te gaan met Domio.
      </p>

        <div className="flex flex-col sm:flex-row gap-5 w-full max-w-2xl">
          {PLANS.map((plan) => {
            const Icon = plan.icon
            const isLoading = loadingPlan === plan.id
            return (
              <div
                key={plan.id}
                className={`flex-1 rounded-2xl border p-7 flex flex-col transition-shadow ${
                  plan.highlight
                    ? 'border-[#163300] dark:border-[#9FE870] shadow-[0_0_0_1px_#163300] dark:shadow-[0_0_0_1px_#9FE870] bg-[#163300] dark:bg-[#163300]'
                    : 'border-gray-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 shadow-sm'
                }`}
              >
                <div className="flex items-center gap-2.5 mb-5">
                  <div className={`p-1.5 rounded-lg ${plan.highlight ? 'bg-[#9FE870]/20' : 'bg-gray-100 dark:bg-neutral-800'}`}>
                    <Icon className={`h-4 w-4 ${plan.highlight ? 'text-[#9FE870]' : 'text-[#163300] dark:text-[#9FE870]'}`} />
                  </div>
                  <span className={`font-semibold text-base ${plan.highlight ? 'text-white' : 'text-[#163300] dark:text-white'}`}>
                    {plan.name}
                  </span>
                </div>

                <div className="mb-1">
                  <span className={`text-4xl font-bold ${plan.highlight ? 'text-white' : 'text-[#163300] dark:text-white'}`}>
                    €{plan.price}
                  </span>
                  <span className={`text-sm ml-1.5 ${plan.highlight ? 'text-white/60' : 'text-gray-400'}`}>/maand</span>
                </div>
                <p className={`text-sm mb-6 ${plan.highlight ? 'text-white/70' : 'text-gray-400'}`}>
                  {plan.description}
                </p>

                <ul className="flex flex-col gap-2.5 mb-8 flex-1">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-2">
                      <Check className={`h-4 w-4 mt-0.5 shrink-0 ${plan.highlight ? 'text-[#9FE870]' : 'text-[#163300] dark:text-[#9FE870]'}`} strokeWidth={2.5} />
                      <span className={`text-sm ${plan.highlight ? 'text-white/85' : 'text-gray-600 dark:text-gray-300'}`}>{f}</span>
                    </li>
                  ))}
                </ul>

                <button
                  type="button"
                  disabled={!!loadingPlan}
                  onClick={() => startCheckout(plan.id)}
                  className={`w-full py-2.5 rounded-xl text-sm font-semibold transition-all ${
                    plan.highlight
                      ? 'bg-[#9FE870] text-[#163300] hover:bg-[#8fd960] disabled:opacity-50'
                      : 'bg-[#163300] text-white hover:bg-[#1e4500] disabled:opacity-50 dark:bg-[#9FE870] dark:text-[#163300] dark:hover:bg-[#8fd960]'
                  } ${loadingPlan ? 'cursor-not-allowed' : 'cursor-pointer'}`}
                >
                  {isLoading ? 'Laden…' : `Start ${plan.name}`}
                </button>
              </div>
            )
          })}
        </div>

      <p className="text-xs text-gray-300 dark:text-neutral-600 mt-8 text-center">
        Betalingen via Stripe · Veilig · Direct opzegbaar
      </p>
    </div>
  )
}
