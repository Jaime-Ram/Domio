'use client'

import { Plug } from 'lucide-react'
import { useState } from 'react'
import { cn } from '@/lib/utils'

interface Integration {
  name: string
  description: string
  status: 'available' | 'coming-soon'
  logo?: string
}

const integrations: Integration[] = [
  {
    name: 'Exact Online',
    description: 'Koppel je boekhouding met Exact Online voor automatische financiële synchronisatie.',
    status: 'available',
    logo: '/images/Logo Lioghtspeed.png',
  },
  {
    name: 'AFAS',
    description: 'Naadloze integratie met AFAS voor complete financiële administratie.',
    status: 'available',
    logo: '/images/Logo Touchbistro.png',
  },
  {
    name: 'Moneybird',
    description: 'Koppel je Moneybird boekhouding voor automatische factuur- en betalingssynchronisatie.',
    status: 'available',
    logo: '/images/Logo Square.png',
  },
  {
    name: 'Bizcuit',
    description: 'Directe bankkoppeling via Bizcuit voor automatische betalingsmatching en MT940 import.',
    status: 'available',
    logo: '/images/Logo Rensegno.png',
  },
  {
    name: 'Ondertekenen.nl',
    description: 'Digitaal ondertekenen van huurovereenkomsten en contracten via Evidos.',
    status: 'available',
    logo: '/images/Logo Zenchef.png',
  },
  {
    name: 'CBS',
    description: 'Automatische huurindexatie met koppeling naar het Centraal Bureau voor de Statistiek.',
    status: 'available',
    logo: '/images/Logo Formitable.png',
  },
]

export function IntegrationsSection() {
  const [imageErrors, setImageErrors] = useState<Record<string, boolean>>({})

  const handleImageError = (name: string) => {
    setImageErrors((prev) => ({ ...prev, [name]: true }))
  }

  return (
    <section id="integratie" className="border-t bg-white/50 py-24 dark:bg-gray-900/50">
      <div className="container mx-auto w-full max-w-7xl px-4">
        <div className="mx-auto max-w-2xl text-center">
          <div className="mb-4 flex justify-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#163300]/10">
              <Plug className="h-6 w-6 text-[#163300]" />
            </div>
          </div>
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Integreert samen met je huidige systeem
          </h2>
          <p className="mt-4 text-lg text-gray-600 dark:text-gray-400">
            Domio werkt naadloos samen met de populairste boekhoudsystemen, banken en vastgoedsoftware in Nederland.
            Synchroniseer automatisch je financiën, contracten en portefeuilledata.
          </p>
        </div>

        <div className="mx-auto mt-16 flex max-w-5xl flex-wrap items-center justify-center gap-8">
          {integrations.map((integration) => (
            <div
              key={integration.name}
              className="flex items-center justify-center"
            >
              {integration.logo && !imageErrors[integration.name] ? (
                <div className="relative h-16 w-32">
                  <img
                    src={integration.logo}
                    alt={`${integration.name} logo`}
                    className="h-16 w-32 object-contain"
                    onError={() => handleImageError(integration.name)}
                  />
                </div>
              ) : (
                <div className="flex h-16 w-32 items-center justify-center rounded bg-gray-100 dark:bg-gray-700">
                  <span className="text-sm font-semibold text-gray-600 dark:text-gray-400">
                    {integration.name}
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="mx-auto mt-12 max-w-2xl text-center">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Gebruik je een ander systeem?{' '}
            <a
              href="mailto:integrations@domio.nl"
              className="font-medium text-[#163300] hover:underline"
            >
              Neem contact op
            </a>
            {' '}om te bespreken hoe we kunnen integreren.
          </p>
        </div>
      </div>
    </section>
  )
}

