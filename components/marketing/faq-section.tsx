'use client'

import { useState } from 'react'
import { Plus, Minus, ChevronDown, MessageCircle } from 'lucide-react'
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
  {
    id: 'trial',
    question: 'Kan ik Domio gratis proberen?',
    answer: 'Ja! We bieden een 30-dagen gratis proefperiode aan. Geen creditcard nodig, je kunt op elk moment opzeggen.',
  },
  {
    id: 'integrations',
    question: 'Welke integraties heeft Domio?',
    answer: 'Domio integreert met boekhoudpakketten (Exact, Twinfield, e-Boekhouden), banksystemen (MT940), betalingssystemen (Bizcuit) en digitale handtekening (Ondertekenen.nl, Evidos).',
  },
  {
    id: 'mobile',
    question: 'Kan ik Domio op mijn mobiel gebruiken?',
    answer: 'Ja, Domio is beschikbaar als webapp die je op je telefoon kunt gebruiken. Je beheert je portefeuille overal en altijd.',
  },
  {
    id: 'support',
    question: 'Hoe kan ik contact opnemen met support?',
    answer: 'Neem contact op via email, telefoon of het contactformulier op onze website. We reageren meestal binnen 1-2 werkdagen.',
  },
]

const INITIAL_VISIBLE = 6

export function FAQSection() {
  const [openItems, setOpenItems] = useState<string[]>([])
  const [isExpanded, setIsExpanded] = useState(false)

  const initialItems = faqItems.slice(0, INITIAL_VISIBLE)
  const extraItems = faqItems.slice(INITIAL_VISIBLE)
  const hasMore = extraItems.length > 0

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
        {initialItems.map((item) => {
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

        <AnimatePresence initial={false}>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.4, ease: [0.32, 0.72, 0, 1] }}
              className="overflow-hidden pt-6"
            >
              <div className="divide-y divide-gray-200">
                {extraItems.map((item) => {
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
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {hasMore && (
        <div className="mt-8 flex flex-col items-center gap-3">
          <div className="relative min-h-[2.5rem] flex flex-col items-center justify-center">
            <AnimatePresence mode="wait">
              {!isExpanded ? (
                <motion.p
                  key="more"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.15 }}
                  className="text-base font-medium text-gray-700"
                >
                  Meer vragen
                </motion.p>
              ) : (
                <motion.div
                  key="contact"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.15 }}
                  className="flex flex-col items-center gap-3"
                >
                  <p className="text-sm text-gray-500">
                    Staat je vraag er niet tussen?
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          <button
            type="button"
            onClick={() => setIsExpanded((prev) => !prev)}
            className="flex items-center justify-center w-14 h-14 rounded-full bg-[#9FE870] text-[#163300] hover:bg-[#9FE870]/90 transition-colors"
            aria-expanded={isExpanded}
            aria-label={isExpanded ? 'Minder vragen tonen' : 'Meer vragen tonen'}
          >
            {isExpanded ? (
              <MessageCircle className="h-6 w-6" strokeWidth={2} />
            ) : (
              <ChevronDown className="h-6 w-6" strokeWidth={2.5} />
            )}
          </button>
        </div>
      )}
    </section>
  )
}
