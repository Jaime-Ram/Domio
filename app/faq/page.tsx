'use client'

import Link from 'next/link'
import Image from 'next/image'
import { Logo } from '@/components/Logo'
import { FooterSection } from '@/components/marketing/footer-section'
import { ChevronDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Menu } from 'lucide-react'

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
    <div className="relative flex min-h-screen w-full flex-col overflow-x-hidden bg-white">
      {/* Background Image - Similar to hero section */}
      <div aria-hidden className="pointer-events-none fixed inset-0 overflow-hidden z-0">
        <div className="absolute inset-0">
          <Image
            src="/images/Achtergrond13.jpg"
            alt=""
            fill
            className="object-cover object-center opacity-20"
            priority={false}
            quality={90}
          />
        </div>
        <div className="absolute inset-0 bg-white/80" />
      </div>

      {/* Content */}
      <div className="relative z-10">
        {/* Header - Same as landing page */}
        <header className="sticky top-0 z-50 w-full transition-colors duration-200 relative bg-transparent">
          <div className="container mx-auto flex h-16 w-full max-w-7xl items-center px-4 md:px-8">
            {/* Mobile: Hamburger Menu (Left) */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden text-[#002A1F] hover:bg-gray-100 flex-shrink-0"
              aria-label="Toggle menu"
            >
              <Menu className="h-6 w-6" />
            </Button>

            {/* Mobile: Logo (Center) - Desktop: Logo (Left) */}
            <div className="flex-1 flex justify-center md:justify-start md:flex-none md:flex-shrink-0">
              <Link href="/">
                <Logo width={100} height={28} />
              </Link>
            </div>

            {/* Desktop: Back to home link (Right) */}
            <div className="hidden md:flex items-center ml-auto">
              <Link
                href="/"
                className="text-sm font-medium text-gray-600 transition-colors hover:text-[#002A1F]"
              >
                Terug naar home
              </Link>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1">
          <div className="mx-auto max-w-4xl px-6 sm:px-8 lg:px-12 py-16">
            <div className="text-center mb-12">
              <h1 className="mb-4 text-5xl font-semibold tracking-tight text-balance text-[#002A1F] sm:text-6xl">
                Veelgestelde vragen
              </h1>
              <p className="text-lg font-medium text-pretty text-gray-600 sm:text-xl leading-8">
                Vind snel antwoorden op veelgestelde vragen over Domio.
              </p>
            </div>

            <div className="space-y-4">
              {faqs.map((faq, index) => (
                <details
                  key={index}
                  className="group border border-gray-200 rounded-xl p-6 hover:border-[#002A1F]/50 transition-colors bg-white/90 backdrop-blur-sm"
                >
                  <summary className="flex items-center justify-between cursor-pointer list-none">
                    <h3 className="text-lg font-semibold text-gray-900 pr-4">
                      {faq.question}
                    </h3>
                    <ChevronDown className="shrink-0 size-5 text-gray-500 transition-transform group-open:rotate-180" />
                  </summary>
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <p className="text-gray-700 leading-relaxed">
                      {faq.answer}
                    </p>
                  </div>
                </details>
              ))}
            </div>

            {/* Contact CTA */}
            <div className="mt-12 text-center p-8 bg-white/90 backdrop-blur-sm rounded-xl border border-gray-200">
              <h2 className="text-2xl font-semibold text-gray-900 mb-2">
                Nog vragen?
              </h2>
              <p className="text-gray-600 mb-4">
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
        </main>

        {/* Footer */}
        <FooterSection />
      </div>
    </div>
  )
}
