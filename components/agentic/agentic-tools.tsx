'use client'

import { useState } from 'react'
import Image from 'next/image'

/**
 * "Tientallen taken" sectie: tabs met alles wat Domio Agentic overneemt.
 * Klik een tab om de uitleg + tags + afbeelding te wisselen. (mock-inhoud)
 */
const TABS = [
  {
    tab: 'Meldingen aannemen',
    title: 'Meldingen aannemen en triëren',
    desc: 'Domio vangt elke melding op via één kanaal en bepaalt direct de urgentie en de juiste vervolgstap.',
    tags: ['urgentie bepalen', 'categoriseren', 'huurder bevestigen', 'dubbele meldingen filteren'],
    img: '/images/Achtergrond2.jpg',
  },
  {
    tab: 'Vakman aansturen',
    title: 'De juiste vakman vinden en inplannen',
    desc: 'Op basis van klacht, locatie en beschikbaarheid kiest Domio de beste vakman en stuurt de opdracht uit.',
    tags: ['vakman matchen', 'offerte opvragen', 'inplannen', 'opdracht versturen'],
    img: '/images/Achtergrond7.jpg',
  },
  {
    tab: 'Opvolgen',
    title: 'Bewaken en communiceren',
    desc: 'Domio bewaakt de SLA en houdt huurder en eigenaar automatisch op de hoogte tot de klacht is opgelost.',
    tags: ['SLA bewaken', 'status-updates', 'huurder informeren', 'escaleren'],
    img: '/images/Achtergrond9.jpg',
  },
  {
    tab: 'Factureren',
    title: 'Facturen verwerken en koppelen',
    desc: 'Binnenkomende facturen worden gecontroleerd en automatisch aan het juiste pand en de kostenpost gekoppeld.',
    tags: ['factuur controleren', 'aan pand koppelen', 'kostenpost toewijzen', 'doorbelasten'],
    img: '/images/Achtergrond13.jpg',
  },
  {
    tab: 'Rapporteren',
    title: 'Inzicht en rapportage',
    desc: 'Domio levert vanzelf overzicht: kosten per pand, doorlooptijden en de status van al je onderhoud.',
    tags: ['maandrapport', 'kosten per pand', 'doorlooptijden', 'tevredenheid'],
    img: '/images/AchtergrondY.jpg',
  },
]

export function AgenticTools() {
  const [active, setActive] = useState(0)
  const t = TABS[active]!

  return (
    <section id="taken" className="scroll-mt-20 bg-[#FBFAF7] py-16 sm:py-20">
      <div className="mx-auto max-w-7xl px-5 md:px-8">
        <h2 className="text-center text-3xl font-medium leading-tight tracking-tight text-[#163300] sm:text-4xl md:text-5xl">
          Tientallen taken.
          <br />
          Eén systeem dat ze overneemt.
        </h2>

        {/* Tabs */}
        <div className="mx-auto mt-10 flex max-w-4xl flex-wrap items-center justify-center gap-2">
          {TABS.map((tab, i) => (
            <button
              key={tab.tab}
              type="button"
              onClick={() => setActive(i)}
              className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                i === active ? 'bg-[#163300] text-white' : 'text-[#163300]/50 hover:text-[#163300]'
              }`}
            >
              {tab.tab}
            </button>
          ))}
        </div>

        {/* Inhoud */}
        <div className="mt-12 grid grid-cols-1 items-center gap-10 lg:grid-cols-2 lg:gap-16">
          <div>
            <h3 className="text-2xl font-medium tracking-tight text-[#163300] sm:text-3xl">{t.title}</h3>
            <p className="mt-4 max-w-md text-[15px] leading-7 text-[#163300]/60">{t.desc}</p>
            <div className="mt-6 flex flex-wrap gap-2">
              {t.tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-lg border border-black/10 bg-white px-3 py-1.5 text-sm text-[#163300]/70"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
          <div className="relative aspect-[4/3] w-full overflow-hidden rounded-lg">
            <Image src={t.img} alt={t.title} fill className="object-cover" />
          </div>
        </div>
      </div>
    </section>
  )
}
