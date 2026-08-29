'use client'

import { useState } from 'react'
import { Plus, Minus } from 'lucide-react'

const FAQ = [
  {
    q: 'Wat doet Domio Agentic precies?',
    a: 'Een team van AI-agents handelt je vastgoedonderhoud van begin tot eind af. Een melding wordt automatisch beoordeeld op urgentie, de juiste vakman wordt gekozen en aangestuurd, de afspraak wordt ingepland en de factuur verwerkt. Jij houdt de regie en grijpt alleen in waar je dat wilt.',
  },
  {
    q: 'Hoe snel ben ik live?',
    a: 'Binnen een dag. Je koppelt je panden en huurders, zet de agents aan en Domio pakt vanaf de eerste melding het werk op. Geen langdurig implementatietraject.',
  },
  {
    q: 'Werkt het met mijn bestaande boekhouding?',
    a: 'Ja. Domio koppelt met je boekhouding, zoals Accountview, zodat betalingen automatisch worden gematcht aan de juiste huurder en het juiste pand. Achterstanden zie je meteen.',
  },
  {
    q: 'Houd ik zelf de controle?',
    a: 'Altijd. De agents werken transparant: je ziet elke stap, kunt grenzen instellen en op elk moment ingrijpen. Niets gebeurt buiten je zicht om.',
  },
  {
    q: 'Is mijn data veilig en AVG-proof?',
    a: 'Ja. Je gegevens staan op Nederlandse servers, versleuteld, en de verwerking voldoet aan de AVG. Beveiliging en privacy zijn ingebouwd, niet achteraf toegevoegd.',
  },
  {
    q: 'Voor wie is Domio bedoeld?',
    a: 'Voor verhuurders en vastgoedbeheerders die hun onderhoud en beheer willen professionaliseren zonder hun team te laten groeien, van enkele panden tot een volledige portefeuille.',
  },
]

export function RampFaq() {
  const [open, setOpen] = useState<number | null>(0)

  return (
    <section className="bg-white">
      <div className="mx-auto max-w-4xl px-6 py-20 md:px-8 md:py-28">
        <h2 className="text-3xl font-semibold tracking-tight text-[#1d3014] sm:text-4xl md:text-[2.75rem] md:leading-[1.05]">
          Veelgestelde vragen
        </h2>
        <div className="mt-12 border-t border-black/[0.08]">
          {FAQ.map((item, i) => {
            const isOpen = open === i
            return (
              <div key={item.q} className="border-b border-black/[0.08]">
                <button
                  type="button"
                  onClick={() => setOpen(isOpen ? null : i)}
                  className="flex w-full items-center justify-between gap-6 py-6 text-left"
                >
                  <span className="text-lg font-medium tracking-tight text-[#1d3014]">{item.q}</span>
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-black/10 text-[#1d3014]">
                    {isOpen ? <Minus className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                  </span>
                </button>
                <div
                  className="grid transition-[grid-template-rows] duration-300 ease-out"
                  style={{ gridTemplateRows: isOpen ? '1fr' : '0fr' }}
                >
                  <div className="overflow-hidden">
                    <p className="max-w-2xl pb-6 text-[15px] leading-relaxed text-[#1d3014]/60">
                      {item.a}
                    </p>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
