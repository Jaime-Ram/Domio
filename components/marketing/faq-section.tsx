'use client'

import { useState } from 'react'
import { Plus, Minus } from 'lucide-react'
import { motion, AnimatePresence } from 'motion/react'
import { cn } from '@/lib/utils'

interface FAQItem {
  id: string
  question: string
  answer: string
}

const faqItems: FAQItem[] = [
  {
    id: 'cancel',
    question: 'Kan ik op elk moment opzeggen?',
    answer: 'Ja, je kunt op elk moment opzeggen zonder vragen. We zouden het echter zeer waarderen als je ons feedback zou geven.',
  },
  {
    id: 'credits',
    question: 'Hoe gebruik ik credits met mijn team?',
    answer: 'Zodra je team zich aanmeldt voor een abonnementsplan, kunnen jullie credits gebruiken. Dit is waar we samenkomen, een kopje koffie pakken en de details bespreken.',
  },
  {
    id: 'pricing',
    question: 'Hoe werkt de pricing van Domio?',
    answer: 'Onze abonnementen zijn opgedeeld in verschillende tiers. Het begrijpen van de taak en het gladstrijken van de details is belangrijk.',
  },
  {
    id: 'security',
    question: 'Hoe veilig is Domio?',
    answer: 'Het beschermen van de data die je aan Domio toevertrouwt is onze eerste prioriteit. Dit deel is cruciaal om het project op schema te houden.',
  },
  {
    id: 'access',
    question: 'Hoe krijg ik toegang tot een thema dat ik heb gekocht?',
    answer: 'Als je de link voor een thema dat je hebt gekocht kwijtraakt, geen paniek! We hebben je gedekt. Je kunt inloggen op je account, tik op je avatar in de rechterbovenhoek en tik op Aankopen.',
  },
  {
    id: 'upgrade',
    question: 'Licentietype upgraden',
    answer: 'Er kunnen momenten zijn waarop je je licentie moet upgraden van het oorspronkelijke type dat je hebt gekocht en we hebben een oplossing die ervoor zorgt dat je je oorspronkelijke aankoopprijs kunt toepassen op de nieuwe licentieaankoop.',
  },
]

export function FAQSection() {
  const [openItems, setOpenItems] = useState<string[]>([])

  const toggleItem = (id: string) => {
    setOpenItems((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    )
  }

  return (
    <section id="faq" className="mx-auto max-w-4xl px-6 py-16 md:px-8 lg:py-20">
      <h2 className="mb-8 text-4xl font-bold tracking-tight text-[#163300] sm:text-5xl md:text-6xl">
        Veelgestelde vragen
      </h2>

      <div className="divide-y divide-gray-200">
        {faqItems.map((item) => {
            const isOpen = openItems.includes(item.id)
            return (
              <div key={item.id} className="py-5 first:pt-0">
                <button
                  onClick={() => toggleItem(item.id)}
                  className="group flex w-full items-center justify-between gap-4 text-left focus:outline-none"
                  aria-expanded={isOpen}
                >
                  <span className="text-base font-normal text-gray-900">
                    {item.question}
                  </span>
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gray-100 text-gray-900 transition-colors group-hover:bg-gray-200">
                    {isOpen ? (
                      <Minus className="h-4 w-4" strokeWidth={2} />
                    ) : (
                      <Plus className="h-4 w-4" strokeWidth={2} />
                    )}
                  </span>
                </button>
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: 'easeInOut' }}
                      className="overflow-hidden"
                    >
                      <p className="pt-3 text-base text-gray-600">{item.answer}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
          )
        })}
      </div>
    </section>
  )
}
