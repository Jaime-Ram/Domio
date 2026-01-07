'use client'

import Link from 'next/link'
import Image from 'next/image'
import { Logo } from '@/components/Logo'
import { FooterSection } from '@/components/marketing/footer-section'
import { Button } from '@/components/ui/button'
import { Menu } from 'lucide-react'

export default function TermsPage() {
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
              <Logo width={100} height={28} />
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
                Algemene Voorwaarden
              </h1>
              <p className="text-lg font-medium text-pretty text-gray-600 sm:text-xl leading-8">
                Laatst bijgewerkt: {new Date().toLocaleDateString('nl-NL', { year: 'numeric', month: 'long', day: 'numeric' })}
              </p>
            </div>

            <div className="space-y-8 bg-white/90 backdrop-blur-sm rounded-xl border border-gray-200 p-8">
              {/* Verantwoordelijkheid van Gebruikers */}
              <section>
                <h2 className="mb-4 text-2xl font-semibold text-gray-900">
                  Verantwoordelijkheid van Gebruikers
                </h2>
                <div className="space-y-4 text-gray-700 leading-relaxed">
                  <p>
                    Door gebruik te maken van Domio, stemt u in met deze algemene voorwaarden. U bent verantwoordelijk voor het correct gebruik van het platform en voor alle activiteiten die plaatsvinden onder uw account. U moet ervoor zorgen dat alle informatie die u verstrekt accuraat en up-to-date is.
                  </p>
                  <p>
                    U mag het platform niet gebruiken voor illegale doeleinden of op een manier die de rechten van anderen schendt. U bent verantwoordelijk voor het beveiligen van uw account en voor alle activiteiten die plaatsvinden onder uw account.
                  </p>
                </div>
              </section>

              {/* Gebruik van de Dienst */}
              <section>
                <h2 className="mb-4 text-2xl font-semibold text-gray-900">
                  Gebruik van de Dienst
                </h2>
                <div className="space-y-4 text-gray-700 leading-relaxed">
                  <p>
                    Domio biedt een alles-in-één platform voor het beheren van vastgoedportefeuilles, huurovereenkomsten, huurders, financiën en onderhoud. U krijgt een licentie om de dienst te gebruiken in overeenstemming met deze voorwaarden. Deze licentie is niet-exclusief, niet-overdraagbaar en kan door ons worden ingetrokken als u deze voorwaarden schendt.
                  </p>
                </div>
              </section>

              {/* Betalingen en Abonnementen */}
              <section>
                <h2 className="mb-4 text-2xl font-semibold text-gray-900">
                  Betalingen en Abonnementen
                </h2>
                <div className="space-y-4 text-gray-700 leading-relaxed">
                  <p>
                    Voor betaalde abonnementen gelden de prijzen zoals vermeld op onze website. Betalingen worden maandelijks of jaarlijks geïncasseerd, afhankelijk van uw gekozen abonnement. U kunt uw abonnement op elk moment opzeggen, maar er worden geen restituties verleend voor reeds betaalde periodes.
                  </p>
                  <p>
                    Wij behouden ons het recht voor om prijzen te wijzigen met 30 dagen voorafgaande kennisgeving. Als u niet akkoord gaat met de nieuwe prijzen, kunt u uw abonnement opzeggen voordat de nieuwe prijzen van kracht worden.
                  </p>
                </div>
              </section>

              {/* Intellectueel Eigendom */}
              <section>
                <h2 className="mb-4 text-2xl font-semibold text-gray-900">
                  Intellectueel Eigendom
                </h2>
                <div className="space-y-4 text-gray-700 leading-relaxed">
                  <p>
                    Alle rechten op de Domio software, website en alle bijbehorende materialen blijven eigendom van Domio Vastgoedbeheer. U krijgt geen eigendomsrechten op de software of de diensten door gebruik te maken van het platform.
                  </p>
                </div>
              </section>

              {/* Aansprakelijkheid */}
              <section>
                <h2 className="mb-4 text-2xl font-semibold text-gray-900">
                  Aansprakelijkheid
                </h2>
                <div className="space-y-4 text-gray-700 leading-relaxed">
                  <p>
                    Domio is niet aansprakelijk voor indirecte schade, gevolgschade, winstderving of verlies van gegevens die voortvloeien uit het gebruik of het onvermogen om de diensten te gebruiken. Onze totale aansprakelijkheid is beperkt tot het bedrag dat u in het afgelopen jaar heeft betaald voor de diensten.
                  </p>
                </div>
              </section>

              {/* Wijzigingen in de Voorwaarden */}
              <section>
                <h2 className="mb-4 text-2xl font-semibold text-gray-900">
                  Wijzigingen in de Voorwaarden
                </h2>
                <div className="space-y-4 text-gray-700 leading-relaxed">
                  <p>
                    Wij behouden ons het recht voor om deze algemene voorwaarden op elk moment te wijzigen. Wijzigingen worden van kracht zodra ze op onze website worden gepubliceerd. Het is uw verantwoordelijkheid om regelmatig de voorwaarden te controleren op wijzigingen.
                  </p>
                  <p>
                    Als wij significante wijzigingen aanbrengen, zullen wij u hiervan op de hoogte stellen via email of via een melding op onze website.
                  </p>
                </div>
              </section>

              {/* Contact */}
              <section>
                <h2 className="mb-4 text-2xl font-semibold text-gray-900">
                  Contact
                </h2>
                <div className="space-y-4 text-gray-700 leading-relaxed">
                  <p>
                    Als u vragen heeft over deze algemene voorwaarden, kunt u contact met ons opnemen:
                  </p>
                  <p>
                    <strong>Email:</strong> contact@domiovastgoedbeheer.nl<br />
                    <strong>Telefoon:</strong> +31 6 46 23 16 96
                  </p>
                </div>
              </section>
            </div>
          </div>
        </main>

        {/* Footer */}
        <FooterSection />
      </div>
    </div>
  )
}
