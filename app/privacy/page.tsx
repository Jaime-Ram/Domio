'use client'

import Link from 'next/link'
import { Logo } from '@/components/Logo'
import { FooterSection } from '@/components/marketing/footer-section'
import { Button } from '@/components/ui/button'
import { Menu } from 'lucide-react'

export default function PrivacyPage() {
  return (
    <div className="relative flex min-h-screen w-full flex-col overflow-x-hidden bg-white">
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
            <div className="flex-1 flex justify-center md:justify-start md:flex-none md:flex-shrink-0 md:flex-1">
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
                Privacyverklaring
              </h1>
              <p className="text-lg font-medium text-pretty text-gray-600 sm:text-xl leading-8">
                Laatst bijgewerkt: {new Date().toLocaleDateString('nl-NL', { year: 'numeric', month: 'long', day: 'numeric' })}
              </p>
            </div>

            <div className="space-y-8 bg-white/90 backdrop-blur-sm rounded-xl border border-gray-200 p-8">
              {/* Inleiding */}
              <section>
                <h2 className="mb-4 text-2xl font-semibold text-gray-900">
                  Inleiding
                </h2>
                <div className="space-y-4 text-gray-700 leading-relaxed">
                  <p>
                    Domio Vastgoedbeheer ("wij", "ons", "onze") respecteert uw privacy en zet zich in om uw persoonlijke gegevens te beschermen. Deze privacyverklaring legt uit hoe wij uw persoonlijke gegevens verzamelen, gebruiken, delen en beschermen wanneer u onze diensten gebruikt.
                  </p>
                  <p>
                    Door gebruik te maken van onze diensten, stemt u in met de verzameling en het gebruik van informatie in overeenstemming met deze privacyverklaring.
                  </p>
                </div>
              </section>

              {/* Gegevens die wij verzamelen */}
              <section>
                <h2 className="mb-4 text-2xl font-semibold text-gray-900">
                  Gegevens die wij verzamelen
                </h2>
                <div className="space-y-4 text-gray-700 leading-relaxed">
                  <p>
                    Wij verzamelen verschillende soorten gegevens om onze diensten te kunnen leveren en te verbeteren:
                  </p>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li><strong>Accountgegevens:</strong> Naam, emailadres, telefoonnummer en andere contactgegevens</li>
                    <li><strong>Bedrijfsgegevens:</strong> Bedrijfsnaam, adres, KvK-nummer, BTW-nummer</li>
                    <li><strong>Vastgoedgegevens:</strong> Informatie over uw panden, huurders, contracten en financiën</li>
                    <li><strong>Technische gegevens:</strong> IP-adres, browsertype, apparaatinformatie en gebruikersstatistieken</li>
                    <li><strong>Communicatiegegevens:</strong> Correspondentie tussen u en ons, inclusief supportverzoeken</li>
                  </ul>
                </div>
              </section>

              {/* Hoe wij uw gegevens gebruiken */}
              <section>
                <h2 className="mb-4 text-2xl font-semibold text-gray-900">
                  Hoe wij uw gegevens gebruiken
                </h2>
                <div className="space-y-4 text-gray-700 leading-relaxed">
                  <p>
                    Wij gebruiken uw gegevens voor de volgende doeleinden:
                  </p>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li>Het leveren en verbeteren van onze diensten</li>
                    <li>Het verwerken van betalingen en het beheren van abonnementen</li>
                    <li>Het communiceren met u over uw account en onze diensten</li>
                    <li>Het verstrekken van klantensupport</li>
                    <li>Het voldoen aan wettelijke verplichtingen</li>
                    <li>Het voorkomen van fraude en misbruik</li>
                  </ul>
                </div>
              </section>

              {/* Bescherming van uw gegevens */}
              <section>
                <h2 className="mb-4 text-2xl font-semibold text-gray-900">
                  Bescherming van uw gegevens
                </h2>
                <div className="space-y-4 text-gray-700 leading-relaxed">
                  <p>
                    Wij nemen de beveiliging van uw gegevens zeer serieus. Wij gebruiken moderne encryptietechnologieën en beveiligingsmaatregelen om uw gegevens te beschermen tegen ongeautoriseerde toegang, wijziging, openbaarmaking of vernietiging.
                  </p>
                  <p>
                    Ondanks onze inspanningen kan geen enkele methode van verzending via internet of elektronische opslag 100% veilig zijn. Hoewel wij ernaar streven uw gegevens te beschermen, kunnen wij de absolute beveiliging niet garanderen.
                  </p>
                </div>
              </section>

              {/* Uw rechten */}
              <section>
                <h2 className="mb-4 text-2xl font-semibold text-gray-900">
                  Uw rechten
                </h2>
                <div className="space-y-4 text-gray-700 leading-relaxed">
                  <p>
                    U heeft het recht om:
                  </p>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li>Toegang te krijgen tot uw persoonlijke gegevens</li>
                    <li>Uw gegevens te corrigeren of te verwijderen</li>
                    <li>Bezwaar te maken tegen de verwerking van uw gegevens</li>
                    <li>Uw gegevens over te dragen aan een andere dienstverlener</li>
                    <li>Uw toestemming in te trekken voor gegevensverwerking</li>
                  </ul>
                  <p>
                    Om gebruik te maken van deze rechten, kunt u contact met ons opnemen via contact@domiovastgoedbeheer.nl.
                  </p>
                </div>
              </section>

              {/* Wijzigingen in deze privacyverklaring */}
              <section>
                <h2 className="mb-4 text-2xl font-semibold text-gray-900">
                  Wijzigingen in deze privacyverklaring
                </h2>
                <div className="space-y-4 text-gray-700 leading-relaxed">
                  <p>
                    Wij behouden ons het recht voor om deze privacyverklaring op elk moment te wijzigen. Wijzigingen worden van kracht zodra ze op onze website worden gepubliceerd. Wij raden u aan regelmatig deze privacyverklaring te controleren op wijzigingen.
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
                    Als u vragen heeft over deze privacyverklaring of over hoe wij uw gegevens verwerken, kunt u contact met ons opnemen:
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
