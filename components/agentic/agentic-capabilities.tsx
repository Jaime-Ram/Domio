'use client'

import { useState } from 'react'
import Image from 'next/image'

/**
 * "Agentic AI verandert..." sectie als expanding panels: 3 blokken waarvan er
 * één dubbelbreed is. Standaard het eerste; klik op een blok om het uit te
 * klappen. Bij hover verbreedt een inactief blok subtiel als hint.
 */
const CAPS = [
  {
    img: '/images/Achtergrond3.jpg',
    title: 'Meldingen opvangen en triëren',
    desc: 'Elke melding komt via één kanaal binnen en wordt direct beoordeeld op urgentie en de juiste vervolgstap.',
  },
  {
    img: '/images/Achtergrond7.jpg',
    title: 'De juiste vakman aansturen',
    desc: 'De juiste vakman wordt gekozen op klacht, locatie en beschikbaarheid, ingepland en op pad gestuurd.',
  },
  {
    img: '/images/Achtergrond11.jpg',
    title: 'Bewaken, opvolgen en factureren',
    desc: 'Deadlines worden bewaakt, iedereen blijft op de hoogte en de factuur wordt automatisch aan het juiste pand gekoppeld.',
  },
]

export function AgenticCapabilities() {
  const [active, setActive] = useState(0)

  return (
    <section id="hoe-het-werkt" className="scroll-mt-20 bg-[#FBFAF7] py-16 sm:py-20">
      <div className="mx-auto max-w-7xl px-5 md:px-8">
        <h2 className="max-w-5xl text-3xl font-medium leading-snug tracking-tight text-[#1d3014] sm:text-4xl md:text-[2.5rem] md:leading-[1.2]">
          Agentic AI verandert hoe vastgoedonderhoud werkt:<br className="hidden md:block" /> van
          melding tot factuur loopt alles vanzelf, volledig op de automaat.
        </h2>

        <div className="mt-12 flex flex-col gap-4 md:h-[460px] md:flex-row">
          {CAPS.map((c, i) => (
            <div
              key={c.title}
              onClick={() => setActive(i)}
              className={`relative h-64 cursor-pointer overflow-hidden rounded-lg transition-all duration-500 ease-out md:h-auto ${
                i === active ? 'md:flex-[2]' : 'md:flex-1 md:hover:flex-[1.25]'
              }`}
            >
              <Image src={c.img} alt={c.title} fill className="object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/25 to-transparent" />
              {/* Vaste breedte zodat de tekst niet mee-rewrapt bij het animeren
                  (geen reflow/verspringen), maar onthuld wordt door de blokbreedte. */}
              <div className="absolute bottom-0 left-0 w-72 p-6">
                <p
                  className={`mb-3 text-sm leading-6 text-white/80 transition-opacity duration-300 ${
                    i === active ? 'opacity-100' : 'opacity-100 md:opacity-0'
                  }`}
                >
                  {c.desc}
                </p>
                <h3 className="text-xl font-semibold text-white">{c.title}</h3>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
