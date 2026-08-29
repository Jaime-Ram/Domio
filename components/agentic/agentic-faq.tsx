'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { ChevronDown } from 'lucide-react'

const FAQ = [
  {
    q: 'Hoe maakt Domio agents van mijn panden en meldingen?',
    a: 'Je koppelt je portefeuille en Domio leidt elke binnenkomende melding automatisch door de juiste agents, op basis van je panden, huurders en contracten.',
  },
  {
    q: 'Werkt het met mijn bestaande systemen en kanalen?',
    a: 'Ja. Meldingen kunnen binnenkomen via e-mail, het huurdersportaal of een formulier; Domio brengt ze samen in één stroom.',
  },
  {
    q: 'Houden de agents urgentie en SLA-afspraken in de gaten?',
    a: 'Elke melding wordt beoordeeld op urgentie en de afgesproken reactietijden worden bewaakt, met automatische escalatie als iets dreigt uit te lopen.',
  },
  {
    q: 'Hoe zit het met controle bij dure of risicovolle reparaties?',
    a: 'Je stelt zelf grenzen in: boven een bedrag of bij bepaalde ingrepen vraagt Domio eerst jouw goedkeuring voordat er een opdracht uitgaat.',
  },
]

export function AgenticFaq() {
  const [open, setOpen] = useState<number | null>(0)

  return (
    <section className="bg-[#FBFAF7] py-16 sm:py-20">
      <div className="mx-auto max-w-7xl px-5 md:px-8">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-12 lg:gap-16">
          <h2 className="text-3xl font-medium leading-tight tracking-tight text-[#1d3014] sm:text-4xl lg:col-span-4">
            Veelgestelde
            <br />
            vragen
          </h2>

          <div className="lg:col-span-8">
            {FAQ.map((item, i) => {
              const isOpen = open === i
              return (
                <div
                  key={item.q}
                  className="border-t border-dotted border-[#1d3014]/20 first:border-t-0"
                >
                  <button
                    type="button"
                    onClick={() => setOpen(isOpen ? null : i)}
                    className="flex w-full items-center justify-between gap-6 py-5 text-left"
                  >
                    <span className="text-lg text-[#1d3014]">{item.q}</span>
                    <ChevronDown
                      className={`h-5 w-5 shrink-0 text-[#1d3014]/50 transition-transform duration-300 ${
                        isOpen ? 'rotate-180' : ''
                      }`}
                    />
                  </button>
                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="overflow-hidden"
                      >
                        <p className="max-w-2xl pb-6 text-[15px] leading-7 text-[#1d3014]/60">
                          {item.a}
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}
