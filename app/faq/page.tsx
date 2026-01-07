import Link from 'next/link'
import { Logo } from '@/components/Logo'
import { ChevronDown } from 'lucide-react'

export default function FAQPage() {
  const faqs = [
    {
      question: 'Wat is Domio?',
      answer: 'Domio is een alles-in-één platform voor het beheren van vastgoedportefeuilles. Het helpt vastgoedbeheerders, verhuurders en huurders om hun portefeuille efficiënt te beheren met functies voor pandbeheer, huurdersbeheer, contractbeheer, financiën en onderhoud.',
    },
    {
      question: 'Hoeveel kost Domio?',
      answer: 'Domio biedt verschillende abonnementen aan, afhankelijk van je behoeften. Bekijk onze prijspagina voor meer informatie over de verschillende plannen en prijzen.',
    },
    {
      question: 'Kan ik Domio gratis proberen?',
      answer: 'Ja! We bieden een 30-dagen gratis proefperiode aan. Geen creditcard nodig, je kunt op elk moment opzeggen.',
    },
    {
      question: 'Welke functies heeft Domio?',
      answer: 'Domio biedt een breed scala aan functies, waaronder object- en portfoliobeheer, huurdersbeheer, contractbeheer, automatische huurindexatie, facturatie en betalingsverwerking, servicekostenafrekening, ticketsysteem voor onderhoud, inspectiemodule en meer.',
    },
    {
      question: 'Is mijn data veilig?',
      answer: 'Ja, we nemen de beveiliging van je data zeer serieus. We gebruiken moderne encryptie en beveiligingsmaatregelen om je gegevens te beschermen. Bekijk onze privacyverklaring voor meer informatie.',
    },
    {
      question: 'Kan ik Domio op mijn mobiel gebruiken?',
      answer: 'Ja, Domio heeft een mobiele app beschikbaar voor iOS en Android. Je kunt je portefeuille overal en altijd beheren vanaf je telefoon.',
    },
    {
      question: 'Welke integraties heeft Domio?',
      answer: 'Domio integreert met verschillende boekhoudpakketten (zoals Exact, Twinfield, e-Boekhouden), banksystemen (MT940), betalingssystemen (Bizcuit), en digitale handtekening services (Ondertekenen.nl/Evidos).',
    },
    {
      question: 'Hoe kan ik contact opnemen met support?',
      answer: 'Je kunt contact met ons opnemen via email (contact@domiovastgoedbeheer.nl), telefoon (+31 6 46 23 16 96), of via het contactformulier op onze website. We reageren meestal binnen 1-2 werkdagen.',
    },
  ]

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60 dark:bg-gray-950/95 dark:border-gray-800">
        <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between px-6 sm:px-8 lg:px-12">
          <Link href="/">
            <div className="py-2">
              <Logo width={150} height={40} />
            </div>
          </Link>
          <Link
            href="/"
            className="text-sm font-medium text-gray-600 transition-colors hover:text-[#002A1F] dark:text-gray-400 dark:hover:text-[#002A1F]"
          >
            Terug naar home
          </Link>
        </div>
      </header>

      {/* Content */}
      <div className="mx-auto max-w-4xl px-6 sm:px-8 lg:px-12 py-16">
        <div className="text-center mb-12">
          <h1 className="mb-4 text-5xl font-semibold tracking-tight text-balance text-[#002A1F] sm:text-6xl dark:text-white">
            Veelgestelde vragen
          </h1>
          <p className="text-lg font-medium text-pretty text-gray-600 sm:text-xl leading-8 dark:text-gray-400">
            Vind snel antwoorden op veelgestelde vragen over Domio.
          </p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <details
              key={index}
              className="group border border-gray-200 rounded-xl p-6 hover:border-[#002A1F]/50 transition-colors dark:border-neutral-700"
            >
              <summary className="flex items-center justify-between cursor-pointer list-none">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white pr-4">
                  {faq.question}
                </h3>
                <ChevronDown className="shrink-0 size-5 text-gray-500 transition-transform group-open:rotate-180" />
              </summary>
              <div className="mt-4 pt-4 border-t border-gray-200 dark:border-neutral-700">
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                  {faq.answer}
                </p>
              </div>
            </details>
          ))}
        </div>

        {/* Contact CTA */}
        <div className="mt-12 text-center p-8 bg-gray-50 rounded-xl dark:bg-neutral-800">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">
            Nog vragen?
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Neem contact met ons op via email of telefoon.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="mailto:contact@domiovastgoedbeheer.nl"
              className="inline-flex items-center justify-center px-6 py-3 text-sm font-medium rounded-xl border border-[#002A1F] bg-[#002A1F] text-white hover:bg-[#356258] transition-colors"
            >
              Stuur een email
            </Link>
            <Link
              href="tel:+31646231696"
              className="inline-flex items-center justify-center px-6 py-3 text-sm font-medium rounded-xl border border-[#002A1F] text-[#002A1F] hover:bg-[#002A1F]/10 transition-colors"
            >
              Bel ons
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

