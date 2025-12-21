'use client'

import { useState } from 'react'
import { ChevronDown, ChevronUp } from 'lucide-react'
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
    answer: 'Als je de link voor een thema dat je hebt gekocht kwijtraakt, geen paniek! We hebben je gedekt. Je kunt inloggen op je account, tik op je avatar in de rechterbovenhoek en tik op Aankopen. Als je geen login hebt aangemaakt of de informatie niet meer weet, kun je onze handige Herdownload pagina gebruiken, vergeet niet hetzelfde e-mailadres te gebruiken waarmee je oorspronkelijk je aankopen hebt gedaan.',
  },
  {
    id: 'upgrade',
    question: 'Licentietype upgraden',
    answer: 'Er kunnen momenten zijn waarop je je licentie moet upgraden van het oorspronkelijke type dat je hebt gekocht en we hebben een oplossing die ervoor zorgt dat je je oorspronkelijke aankoopprijs kunt toepassen op de nieuwe licentieaankoop.',
  },
]

export function FAQSection() {
  const [openItems, setOpenItems] = useState<string[]>(['cancel'])

  const toggleItem = (id: string) => {
    setOpenItems((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    )
  }

  return (
    <section id="faq" className="max-w-[85rem] px-6 py-10 md:px-8 lg:py-14 mx-auto bg-white">
      <div className="grid md:grid-cols-5 gap-10">
        {/* Left Side - Title */}
        <div className="md:col-span-2">
          <div className="max-w-xs">
            <h2 className="text-2xl font-bold md:text-4xl md:leading-tight text-gray-900">
              Veelgestelde<br />vragen
            </h2>
            <p className="mt-1 hidden md:block text-gray-600">
              Antwoorden op de meest gestelde vragen.
            </p>
          </div>
        </div>

        {/* Right Side - Accordion */}
        <div className="md:col-span-3">
          <div className="divide-y divide-gray-200">
            {faqItems.map((item) => {
              const isOpen = openItems.includes(item.id)
              return (
                <div key={item.id} className="py-3 first:pt-0">
                  <button
                    onClick={() => toggleItem(item.id)}
                    className="group pb-3 inline-flex items-center justify-between gap-x-3 w-full md:text-lg font-semibold text-start text-gray-800 rounded-lg transition hover:text-gray-500 focus:outline-none focus:text-gray-500"
                    aria-expanded={isOpen}
                  >
                    <span>{item.question}</span>
                    {isOpen ? (
                      <ChevronUp className="shrink-0 size-5 text-gray-600 group-hover:text-gray-500" />
                    ) : (
                      <ChevronDown className="shrink-0 size-5 text-gray-600 group-hover:text-gray-500" />
                    )}
                  </button>
                  <div
                    className={cn(
                      'overflow-hidden transition-all duration-300',
                      isOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                    )}
                  >
                    <p className="text-gray-600 pb-3">{item.answer}</p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}
